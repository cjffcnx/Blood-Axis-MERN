"""
Database operations for MongoDB integration.
"""
from pymongo import MongoClient
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
            
            results = list(self.db.inventory.aggregate(pipeline))
            
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
