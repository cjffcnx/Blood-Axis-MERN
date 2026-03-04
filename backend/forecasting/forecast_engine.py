"""
Main forecast engine that orchestrates the entire forecasting pipeline.
"""
import json
from datetime import datetime, timedelta
from database import DatabaseManager
from data_processor import DataProcessor
from forecaster import BloodDemandForecaster
from config import BLOOD_GROUPS, FORECAST_DAYS
from logger import get_logger

logger = get_logger(__name__)

class ForecastEngine:
    """Main engine that orchestrates the forecasting pipeline."""
    
    def __init__(self):
        """Initialize the forecast engine."""
        self.db_manager = DatabaseManager()
        self.data_processor = DataProcessor()
    
    def generate_forecast(self, organisation_id, days_back=180, save_to_db=True):
        """
        Generate DEMAND-BASED forecasts for all blood groups based on inventory totalIn/totalOut.
        Higher out relative to in = higher future demand.
        
        Args:
            organisation_id: The organisation's MongoDB ObjectId or string ID
            days_back: (Ignored in demand-based approach, kept for compatibility)
            save_to_db: Whether to save forecast results to MongoDB
            
        Returns:
            dict: Forecast results with structure:
                {
                    'organisation_id': str,
                    'forecast_date': datetime,
                    'forecasts': [
                        {
                            'blood_group': str,
                            'date': datetime,
                            'forecast_units': int,
                            'lower_bound': int,
                            'upper_bound': int,
                            'model_type': str,
                            'confidence': float
                        },
                        ...
                    ],
                    'status': 'success' or 'failed',
                    'errors': [...]
                }
        """
        db_manager = None
        try:
            logger.info(f"Starting DEMAND-BASED forecast pipeline for organisation {organisation_id}")
            
            # Step 1: Get demand ratios from inventory data
            logger.info("Step 1: Calculating demand ratios from inventory totalIn/totalOut...")
            db_manager = DatabaseManager()
            demand_df = db_manager.get_blood_demand_ratios(organisation_id)
            
            if demand_df.empty:
                logger.warning(f"No inventory data found for organisation {organisation_id} - will use placeholder forecast")
                placeholder = self._generate_placeholder_forecast(organisation_id)
                if save_to_db and placeholder.get('forecasts') and db_manager:
                    db_records = []
                    for forecast in placeholder['forecasts']:
                        db_records.append({
                            'organisation_id': organisation_id,
                            'forecast_date': placeholder['forecast_date'],
                            **forecast
                        })
                    db_manager.save_forecast_results(organisation_id, db_records)
                return placeholder
            
            logger.info(f"Demand ratios calculated for {len(demand_df)} blood groups")
            logger.info(f"Demand ranking: {demand_df[['blood_group', 'total_out', 'total_in', 'demand_ratio']].to_dict('records')}")
            
            # Step 2: Generate demand-based forecasts
            logger.info("Step 2: Generating demand-based forecasts...")
            all_forecasts = []
            
            # Calculate proportional forecasts based on actual totalOut quantities
            total_out_sum = demand_df['total_out'].sum()
            
            # Calculate forecast for each blood group based on actual demand
            for _, row in demand_df.iterrows():
                blood_group = row['blood_group']
                total_in = row['total_in']
                total_out = row['total_out']
                demand_ratio = row['demand_ratio']
                
                # Calculate forecast units based on ACTUAL totalOut quantities
                # Estimate daily average demand assuming 90-day collection period
                if total_out > 0:
                    # Blood group has outgoing activity
                    # Calculate daily average: total_out / 90 days, then scale for forecast
                    estimated_daily_avg = total_out / 90.0
                    # Round and ensure reasonable minimum
                    forecast_units = max(50, int(estimated_daily_avg * 1.2))  # 20% buffer
                    confidence = 0.75
                    model_type = 'actual_demand_based'
                    
                    # Adjust confidence based on totalOut volume
                    if total_out > 5000:
                        confidence = 0.85  # High volume = high confidence
                    elif total_out > 1000:
                        confidence = 0.75
                    else:
                        confidence = 0.65
                        
                elif total_in > 0:
                    # Blood group has inventory but no demand yet - conservative forecast
                    forecast_units = 30
                    confidence = 0.4
                    model_type = 'low_demand_inventory_available'
                else:
                    # No activity at all - minimal forecast
                    forecast_units = 20
                    confidence = 0.3
                    model_type = 'no_historical_activity'
                
                # Generate 7-day forecast with same units each day
                forecast_date = datetime.utcnow()
                for day_offset in range(1, FORECAST_DAYS + 1):
                    future_date = forecast_date + timedelta(days=day_offset)
                    
                    all_forecasts.append({
                        'blood_group': blood_group,
                        'date': future_date,
                        'forecast_units': forecast_units,
                        'lower_bound': int(forecast_units * 0.7),
                        'upper_bound': int(forecast_units * 1.3),
                        'model_type': model_type,
                        'confidence': round(confidence, 3)
                    })
                
                logger.info(f"{blood_group}: out={total_out}, in={total_in}, ratio={demand_ratio:.3f}, forecast={forecast_units} units/day")
            
            # Step 3: Save to database if requested
            if save_to_db and db_manager:
                db_records = []
                forecast_date = datetime.utcnow()
                for forecast in all_forecasts:
                    db_records.append({
                        'organisation_id': organisation_id,
                        'forecast_date': forecast_date,
                        **forecast
                    })
                success = db_manager.save_forecast_results(organisation_id, db_records)
                if success:
                    logger.info(f"Saved {len(db_records)} forecast records to database")
            
            result = {
                'organisation_id': organisation_id,
                'forecast_date': datetime.utcnow(),
                'forecasts': all_forecasts,
                'status': 'success',
                'errors': []
            }
            
            logger.info(f"Demand-based forecast completed: {len(all_forecasts)} records generated")
            return result
            
        except Exception as e:
            logger.error(f"Critical error in demand-based forecast pipeline: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            
            return {
                'organisation_id': organisation_id,
                'forecast_date': datetime.utcnow(),
                'forecasts': [],
                'status': 'failed',
                'errors': [{'error': str(e)}]
            }
        finally:
            if db_manager:
                db_manager.close()
    
    def forecast_organisation(self, organisation_id, days_back=180, save_to_db=True):
        """
        ALIAS for generate_forecast - kept for backward compatibility.
        """
        return self.generate_forecast(organisation_id, days_back, save_to_db)
    
    def _generate_placeholder_forecast(self, organisation_id):
        """
        Generate placeholder forecasts when no historical data is available.
        This ensures the API still returns valid JSON.
        
        Args:
            organisation_id: The organisation's ID
            
        Returns:
            dict: Placeholder forecast result
        """
        logger.info(f"Generating placeholder forecasts for {organisation_id}")
        from datetime import datetime, timedelta
        
        all_forecasts = []
        now = datetime.utcnow()
        
        # Generate baseline forecasts for all blood groups
        for blood_group in BLOOD_GROUPS:
            for day in range(FORECAST_DAYS):
                forecast_date = now + timedelta(days=day+1)
                all_forecasts.append({
                    'blood_group': blood_group,
                    'date': forecast_date,
                    'forecast_units': 100,  # Default unit forecast
                    'lower_bound': 80,
                    'upper_bound': 120,
                    'model_type': 'placeholder_no_data',
                    'confidence': 0.3
                })
        
        return {
            'organisation_id': str(organisation_id),
            'forecast_date': datetime.utcnow(),
            'forecasts': all_forecasts,
            'status': 'partial_success',
            'errors': ['No historical data available - using placeholder forecasts']
        }

    def _generate_placeholder_group_forecast(self, blood_group):
        """Generate placeholder forecasts for a single blood group."""
        from datetime import datetime, timedelta

        now = datetime.utcnow()
        group_forecasts = []
        for day in range(FORECAST_DAYS):
            forecast_date = now + timedelta(days=day + 1)
            group_forecasts.append({
                'blood_group': blood_group,
                'date': forecast_date,
                'forecast_units': 100,
                'lower_bound': 80,
                'upper_bound': 120,
                'model_type': 'placeholder_no_data',
                'confidence': 0.3
            })

        return group_forecasts
    
    def to_json(self, result):
        """
        Convert forecast result to JSON-serializable format.
        
        Args:
            result: Forecast result dictionary
            
        Returns:
            str: JSON string
        """
        try:
            # Custom JSON encoder for datetime objects
            class DateTimeEncoder(json.JSONEncoder):
                def default(self, obj):
                    if hasattr(obj, 'isoformat'):
                        return obj.isoformat()
                    return super().default(obj)
            
            json_output = json.dumps(result, cls=DateTimeEncoder, indent=2)
            logger.info(f"Successfully generated JSON output of {len(json_output)} characters")
            return json_output
            
        except Exception as e:
            logger.error(f"Error converting result to JSON: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Return minimal valid JSON
            return json.dumps({
                'status': 'error',
                'message': str(e),
                'organisation_id': result.get('organisation_id', 'unknown'),
                'forecasts': [],
                'errors': [str(e)]
            })


if __name__ == '__main__':
    # Example usage
    engine = ForecastEngine()
    
    # Replace 'your_org_id' with an actual organisation ID from your database
    result = engine.forecast_organisation('your_org_id')
    
    print(engine.to_json(result))
