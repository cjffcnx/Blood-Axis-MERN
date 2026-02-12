"""
Main forecast engine that orchestrates the entire forecasting pipeline.
"""
import json
from datetime import datetime
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
    
    def forecast_organisation(self, organisation_id, days_back=180, save_to_db=True):
        """
        Generate forecasts for all blood groups of an organisation.
        
        Args:
            organisation_id: The organisation's MongoDB ObjectId or string ID
            days_back: Number of days of historical data to use
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
                    'status': 'success' or 'partial_success' or 'failed',
                    'errors': [...]
                }
        """
        db_manager = None
        try:
            logger.info(f"Starting forecast pipeline for organisation {organisation_id}")
            
            # Step 1: Extract data from MongoDB
            logger.info("Step 1: Extracting historical data from MongoDB...")
            db_manager = DatabaseManager()
            df = db_manager.get_blood_issue_data(organisation_id, days_back)
            
            if df.empty:
                logger.warning(f"No data found for organisation {organisation_id} - will use placeholder forecast")
                # Don't return immediately - generate placeholder forecasts
                # so the API can still return valid JSON
                return self._generate_placeholder_forecast(organisation_id)
            
            logger.info(f"Extracted {len(df)} records from {df['date'].min()} to {df['date'].max()}")
            
            # Step 2: Process data and generate forecasts for each blood group
            logger.info("Step 2: Processing data and generating forecasts...")
            all_forecasts = []
            errors = []
            
            for blood_group in BLOOD_GROUPS:
                logger.info(f"Processing blood group: {blood_group}")
                
                # Prepare time series
                ts, is_valid, msg = self.data_processor.prepare_time_series(df, blood_group)
                
                if not is_valid:
                    logger.warning(f"Validation failed for {blood_group}: {msg}")
                    errors.append({'blood_group': blood_group, 'error': msg})
                    
                    # Generate baseline forecast as fallback
                    if ts is not None and len(ts) > 0:
                        baseline_forecast = self.data_processor.calculate_baseline_forecast(ts)
                        for _, row in baseline_forecast.iterrows():
                            all_forecasts.append({
                                'blood_group': blood_group,
                                'date': row['date'],
                                'forecast_units': int(row['forecast_units']),
                                'lower_bound': int(row['forecast_units'] * 0.8),
                                'upper_bound': int(row['forecast_units'] * 1.2),
                                'model_type': 'baseline_insufficient_data',
                                'confidence': 0.5
                            })
                    continue
                
                # Validate data quality
                quality_metrics = self.data_processor.validate_data_quality(ts)
                
                # Attempt SARIMA forecasting
                forecaster = BloodDemandForecaster()
                success, fit_msg = forecaster.fit_sarima(ts)
                
                if success:
                    # Generate SARIMA forecast
                    forecast_df, model_type, forecast_success = forecaster.forecast(ts, FORECAST_DAYS)
                    
                    if forecast_success:
                        # Calculate RMSE for confidence assessment
                        rmse = forecaster.calculate_rmse(ts)
                        confidence = max(0.6, min(1.0, 1.0 - (rmse / (ts.mean() + 1))))
                        
                        for _, row in forecast_df.iterrows():
                            all_forecasts.append({
                                'blood_group': blood_group,
                                'date': row['date'],
                                'forecast_units': int(row['forecast_units']),
                                'lower_bound': int(row['lower_bound']),
                                'upper_bound': int(row['upper_bound']),
                                'model_type': model_type,
                                'confidence': round(confidence, 3)
                            })
                        logger.info(f"Generated SARIMA forecast for {blood_group}")
                    else:
                        # SARIMA forecast failed, fall back to baseline
                        logger.warning(f"SARIMA forecast failed for {blood_group}, using baseline")
                        baseline_forecast = self.data_processor.calculate_baseline_forecast(ts)
                        for _, row in baseline_forecast.iterrows():
                            all_forecasts.append({
                                'blood_group': blood_group,
                                'date': row['date'],
                                'forecast_units': int(row['forecast_units']),
                                'lower_bound': int(row['forecast_units'] * 0.8),
                                'upper_bound': int(row['forecast_units'] * 1.2),
                                'model_type': 'baseline_forecast_error',
                                'confidence': 0.6
                            })
                else:
                    # SARIMA fitting failed, try auto-fit
                    logger.info(f"Attempting auto-fit for {blood_group}...")
                    forecaster, auto_success = BloodDemandForecaster.auto_fit_sarima(ts)
                    
                    if auto_success:
                        forecast_df, model_type, forecast_success = forecaster.forecast(ts, FORECAST_DAYS)
                        if forecast_success:
                            rmse = forecaster.calculate_rmse(ts)
                            confidence = max(0.6, min(1.0, 1.0 - (rmse / (ts.mean() + 1))))
                            
                            for _, row in forecast_df.iterrows():
                                all_forecasts.append({
                                    'blood_group': blood_group,
                                    'date': row['date'],
                                    'forecast_units': int(row['forecast_units']),
                                    'lower_bound': int(row['lower_bound']),
                                    'upper_bound': int(row['upper_bound']),
                                    'model_type': model_type,
                                    'confidence': round(confidence, 3)
                                })
                            logger.info(f"Generated auto-fit forecast for {blood_group}")
                        else:
                            # Fall back to baseline
                            baseline_forecast = self.data_processor.calculate_baseline_forecast(ts)
                            for _, row in baseline_forecast.iterrows():
                                all_forecasts.append({
                                    'blood_group': blood_group,
                                    'date': row['date'],
                                    'forecast_units': int(row['forecast_units']),
                                    'lower_bound': int(row['forecast_units'] * 0.8),
                                    'upper_bound': int(row['forecast_units'] * 1.2),
                                    'model_type': 'baseline_autofit_error',
                                    'confidence': 0.6
                                })
                    else:
                        # All SARIMA attempts failed, use baseline
                        logger.warning(f"All SARIMA attempts failed for {blood_group}, using baseline")
                        baseline_forecast = self.data_processor.calculate_baseline_forecast(ts)
                        for _, row in baseline_forecast.iterrows():
                            all_forecasts.append({
                                'blood_group': blood_group,
                                'date': row['date'],
                                'forecast_units': int(row['forecast_units']),
                                'lower_bound': int(row['forecast_units'] * 0.8),
                                'upper_bound': int(row['forecast_units'] * 1.2),
                                'model_type': 'baseline_autofit_failed',
                                'confidence': 0.5
                            })
            
            # Step 3: Prepare output
            status = 'success' if not errors else 'partial_success' if len(errors) < len(BLOOD_GROUPS) else 'failed'
            
            result = {
                'organisation_id': str(organisation_id),
                'forecast_date': datetime.utcnow(),
                'forecasts': all_forecasts,
                'status': status,
                'errors': errors
            }
            
            logger.info(f"Forecast pipeline completed. Status: {status}, "
                       f"Generated {len(all_forecasts)} forecast records")
            
            # Step 4: Save to MongoDB if requested
            if save_to_db and all_forecasts and db_manager:
                # Prepare data for MongoDB
                db_records = []
                for forecast in all_forecasts:
                    db_record = {
                        'organisation_id': organisation_id,
                        'forecast_date': result['forecast_date'],
                        **forecast
                    }
                    db_records.append(db_record)
                
                db_manager.save_forecast_results(organisation_id, db_records)
            
            return result
            
        except Exception as e:
            logger.error(f"Critical error in forecast pipeline: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                'organisation_id': str(organisation_id),
                'forecast_date': datetime.utcnow(),
                'forecasts': [],
                'status': 'failed',
                'errors': [str(e)]
            }
        finally:
            # Close database connection
            if db_manager:
                db_manager.close()
    
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
