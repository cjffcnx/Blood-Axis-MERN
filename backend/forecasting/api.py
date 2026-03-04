"""
HTTP API wrapper for the forecasting module.

This module can be used with Flask or FastAPI to expose
the forecasting functionality via HTTP endpoints.
"""
from forecast_engine import ForecastEngine
from utils import format_forecast_for_api, validate_organisation_id
from logger import get_logger

logger = get_logger(__name__)

class ForecastAPI:
    """API wrapper for forecasting functionality."""
    
    def __init__(self):
        """Initialize the API."""
        self.engine = ForecastEngine()
    
    def forecast(self, organisation_id, days_back=180, save_to_db=True):
        """
        Get forecast for an organisation.
        
        Args:
            organisation_id: Organisation ID
            days_back: Number of days of historical data
            save_to_db: Whether to save to MongoDB
            
        Returns:
            dict: API-formatted forecast result
        """
        try:
            is_valid, org_id = validate_organisation_id(organisation_id)
            if not is_valid:
                return {
                    'success': False,
                    'status': 'error',
                    'message': f'Invalid organisation ID: {organisation_id}'
                }
            
            result = self.engine.forecast_organisation(org_id, days_back, save_to_db)
            return format_forecast_for_api(result)
            
        except Exception as e:
            logger.error(f"Error in forecast API: {str(e)}")
            return {
                'success': False,
                'status': 'error',
                'message': str(e)
            }
    
    def get_latest_forecast(self, organisation_id):
        """
        Get the latest forecast for an organisation.
        
        Args:
            organisation_id: Organisation ID
            
        Returns:
            dict: Latest forecast data
        """
        db = None
        try:
            is_valid, org_id = validate_organisation_id(organisation_id)
            if not is_valid:
                return {
                    'success': False,
                    'status': 'error',
                    'message': f'Invalid organisation ID: {organisation_id}'
                }
            
            from database import DatabaseManager
            db = DatabaseManager()
            forecasts = db.get_latest_forecast(org_id)
            
            if not forecasts:
                logger.warning(f"No forecast found for organisation {org_id}")
                return {
                    'success': False,
                    'status': 'not_found',
                    'message': 'No forecast found for this organisation'
                }
            
            logger.info(f"Retrieved {len(forecasts)} forecast records")
            
            # Group by blood group
            grouped = {}
            for forecast in forecasts:
                bg = forecast.get('blood_group')
                if not bg:
                    continue
                    
                if bg not in grouped:
                    grouped[bg] = []
                
                grouped[bg].append({
                    'date': forecast.get('date'),
                    'units': forecast.get('forecast_units'),
                    'lowerBound': forecast.get('lower_bound'),
                    'upperBound': forecast.get('upper_bound'),
                    'modelType': forecast.get('model_type'),
                    'confidence': forecast.get('confidence')
                })
            
            logger.info(f"Grouped into {len(grouped)} blood groups")
            
            return {
                'success': True,
                'status': 'success',
                'organisationId': str(org_id),
                'data': grouped
            }
            
        except Exception as e:
            logger.error(f"Error getting latest forecast: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                'success': False,
                'status': 'error',
                'message': str(e)
            }
        finally:
            if db:
                try:
                    db.close()
                except:
                    pass
