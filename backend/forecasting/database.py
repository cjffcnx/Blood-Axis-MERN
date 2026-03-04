"""
Database operations for MongoDB integration.
"""
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import pandas as pd
from config import MONGODB_URI, MONGODB_DB, BLOOD_GROUPS
from logger import get_logger

logger = get_logger(__name__)

class DatabaseManager:
    """Manages MongoDB connections and data extraction."""
    
    def __init__(self):
        """Initialize MongoDB connection."""
        try:
            self.client = MongoClient(MONGODB_URI)
            self.db = self.client[MONGODB_DB]
            # Test connection
            self.client.admin.command('ping')
            logger.info("MongoDB connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    def get_blood_issue_data(self, organisation_id, days_back=180):
        """
        Extract blood issue transactions from the database.
        
        Args:
            organisation_id: The organization's MongoDB ObjectId or string ID
            days_back: Number of days to look back (default: 180 days = ~6 months)
            
        Returns:
            pd.DataFrame: DataFrame with columns [date, blood_group, units_issued]
        """
        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days_back)
            
            logger.info(f"Fetching blood issue data for organisation {organisation_id} "
                       f"from {start_date} to {end_date}")
            
            # Query inventory collection for issued blood records
            # Assuming the collection has records with date, organisation_id, blood_group, units fields
            pipeline = [
                {
                    '$match': {
                        'organisation': organisation_id,
                        'inventoryType': 'out',  # issued blood
                        'createdAt': {
                            '$gte': start_date,
                            '$lte': end_date
                        }
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'date': {
                                '$dateToString': {
                                    'format': '%Y-%m-%d',
                                    'date': '$createdAt'
                                }
                            },
                            'blood_group': '$bloodGroup'
                        },
                        'units_issued': {'$sum': '$quantity'}
                    }
                },
                {
                    '$sort': {'_id.date': 1, '_id.blood_group': 1}
                }
            ]
            
            results = list(self.db.inventories.aggregate(pipeline))
            
            if not results:
                logger.warning(f"No blood issue data found for organisation {organisation_id}")
                return pd.DataFrame(columns=['date', 'blood_group', 'units_issued'])
            
            # Convert to DataFrame
            data = []
            for record in results:
                data.append({
                    'date': pd.to_datetime(record['_id']['date']),
                    'blood_group': record['_id']['blood_group'],
                    'units_issued': record['units_issued']
                })
            
            df = pd.DataFrame(data)
            logger.info(f"Successfully fetched {len(df)} records for organisation {organisation_id}")
            
            return df
            
        except Exception as e:
            logger.error(f"Error fetching blood issue data: {str(e)}")
            raise
    
    def get_blood_demand_ratios(self, organisation_id):
        """
        Calculate demand ratios for each blood group based on totalIn/totalOut.
        Higher out ratio = higher demand.
        
        Args:
            organisation_id: The organization's MongoDB ObjectId or string ID
            
        Returns:
            pd.DataFrame: DataFrame with columns [blood_group, total_in, total_out, demand_ratio]
        """
        try:
            # Convert to ObjectId if string
            if isinstance(organisation_id, str):
                try:
                    org_id = ObjectId(organisation_id)
                except:
                    org_id = organisation_id
            else:
                org_id = organisation_id
                
            logger.info(f"Calculating blood demand ratios for organisation {org_id}")
            
            # Query inventory collection for totalIn and totalOut per blood group
            pipeline = [
                {
                    '$match': {
                        'organisation': org_id,
                        'inventoryType': {'$in': ['in', 'out']}
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'blood_group': '$bloodGroup',
                            'type': '$inventoryType'
                        },
                        'total': {'$sum': '$quantity'}
                    }
                }
            ]
            
            results = list(self.db.inventories.aggregate(pipeline))
            
            logger.debug(f"Aggregation returned {len(results)} results from inventories collection")
            
            if not results:
                logger.warning(f"No inventory data found for organisation {org_id} in inventories collection")
                # Return empty DataFrame with all blood groups and zero demand
                return pd.DataFrame([
                    {'blood_group': bg, 'total_in': 0, 'total_out': 0, 'demand_ratio': 0.0}
                    for bg in BLOOD_GROUPS
                ])
            
            # Build demand data for all blood groups
            demand_data = []
            for blood_group in BLOOD_GROUPS:
                # Find in and out stats for this blood group
                in_stat = next((r for r in results if r['_id']['blood_group'] == blood_group and r['_id']['type'] == 'in'), None)
                out_stat = next((r for r in results if r['_id']['blood_group'] == blood_group and r['_id']['type'] == 'out'), None)
                
                total_in = in_stat['total'] if in_stat else 0
                total_out = out_stat['total'] if out_stat else 0
                
                # Calculate demand ratio: higher out relative to in = higher demand
                # Add 1 to denominator to avoid division by zero
                demand_ratio = total_out / (total_in + 1)
                
                demand_data.append({
                    'blood_group': blood_group,
                    'total_in': total_in,
                    'total_out': total_out,
                    'demand_ratio': demand_ratio
                })
            
            df = pd.DataFrame(demand_data)
            # Sort by demand ratio descending (highest demand first)
            df = df.sort_values('demand_ratio', ascending=False)
            
            logger.info(f"Demand ratios calculated: {df.to_dict('records')}")
            return df
            
        except Exception as e:
            logger.error(f"Error calculating blood demand ratios: {str(e)}")
            raise
    
    def save_forecast_results(self, organisation_id, forecast_data):
        """
        Save forecast results to MongoDB for future reference.
        
        Args:
            organisation_id: The organization's ID
            forecast_data: List of forecast records
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not forecast_data:
                logger.warning("No forecast data to save")
                return False
            
            # Ensure forecasts collection exists
            forecasts_collection = self.db.forecasts
            
            # Ensure organisation_id is consistent format (string or ObjectId)
            # Keep it in whatever format was passed to maintain consistency
            logger.info(f"Saving {len(forecast_data)} forecast records for organisation {organisation_id}")
            logger.debug(f"Sample record: {forecast_data[0] if forecast_data else 'none'}")
            
            # Insert forecast records
            result = forecasts_collection.insert_many(forecast_data)
            
            logger.info(f"Successfully saved {len(result.inserted_ids)} forecast records "
                       f"for organisation {organisation_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving forecast results: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False
    
    def get_latest_forecast(self, organisation_id):
        """
        Retrieve the latest forecast for an organisation.
        
        Args:
            organisation_id: The organization's ID
            
        Returns:
            list: List of latest forecast records
        """
        try:
            forecasts_collection = self.db.forecasts
            
            # First, find the latest forecast_date for this organisation
            latest_record = forecasts_collection.find_one(
                {'organisation_id': organisation_id},
                sort=[('forecast_date', -1)]
            )
            
            if not latest_record:
                logger.warning(f"No forecasts found for organisation {organisation_id}")
                return []
            
            latest_date = latest_record['forecast_date']
            logger.info(f"Latest forecast date for org {organisation_id}: {latest_date}")
            
            # Get all forecasts for that date (all blood groups, all days)
            latest_forecasts = list(forecasts_collection.find(
                {
                    'organisation_id': organisation_id,
                    'forecast_date': latest_date
                }
            ).sort('date', 1))
            
            logger.info(f"Retrieved {len(latest_forecasts)} forecast records for organisation {organisation_id}")
            return latest_forecasts
            
        except Exception as e:
            logger.error(f"Error retrieving forecast: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return []
