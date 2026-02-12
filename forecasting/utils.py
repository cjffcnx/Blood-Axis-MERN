"""
Utility functions for the forecasting module.
"""
import json
from datetime import datetime
from bson import ObjectId
from logger import get_logger

logger = get_logger(__name__)

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for MongoDB ObjectId and datetime objects."""
    
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def encode_result(result):
    """
    Encode forecast result to JSON string.
    
    Args:
        result: Forecast result dictionary
        
    Returns:
        str: JSON string
    """
    try:
        return json.dumps(result, cls=JSONEncoder, indent=2)
    except Exception as e:
        logger.error(f"Error encoding result to JSON: {str(e)}")
        return json.dumps({
            'status': 'error',
            'message': str(e)
        })

def parse_result(json_str):
    """
    Parse JSON string to forecast result dictionary.
    
    Args:
        json_str: JSON string
        
    Returns:
        dict: Parsed result
    """
    try:
        result = json.loads(json_str)
        # Convert ISO datetime strings back to datetime objects
        if 'forecast_date' in result and isinstance(result['forecast_date'], str):
            result['forecast_date'] = datetime.fromisoformat(result['forecast_date'])
        
        if 'forecasts' in result:
            for forecast in result['forecasts']:
                if 'date' in forecast and isinstance(forecast['date'], str):
                    forecast['date'] = datetime.fromisoformat(forecast['date'])
        
        return result
    except Exception as e:
        logger.error(f"Error parsing JSON result: {str(e)}")
        return {}

def format_forecast_for_api(result):
    """
    Format forecast result for API consumption.
    
    Args:
        result: Raw forecast result
        
    Returns:
        dict: API-formatted result
    """
    try:
        formatted = {
            'success': result['status'] == 'success',
            'status': result['status'],
            'organisationId': result['organisation_id'],
            'forecastDate': result['forecast_date'].isoformat() if isinstance(result['forecast_date'], datetime) else result['forecast_date'],
            'data': {}
        }
        
        # Group forecasts by blood group
        for forecast in result['forecasts']:
            bg = forecast['blood_group']
            if bg not in formatted['data']:
                formatted['data'][bg] = []
            
            formatted['data'][bg].append({
                'date': forecast['date'].isoformat() if isinstance(forecast['date'], datetime) else forecast['date'],
                'units': forecast['forecast_units'],
                'lowerBound': forecast['lower_bound'],
                'upperBound': forecast['upper_bound'],
                'modelType': forecast['model_type'],
                'confidence': forecast['confidence']
            })
        
        if result['errors']:
            formatted['errors'] = result['errors']
        
        return formatted
        
    except Exception as e:
        logger.error(f"Error formatting result for API: {str(e)}")
        return {
            'success': False,
            'status': 'error',
            'message': str(e)
        }

def validate_organisation_id(org_id):
    """
    Validate organisation ID format.
    
    Args:
        org_id: Organisation ID (string or ObjectId)
        
    Returns:
        tuple: (is_valid, processed_id)
    """
    try:
        if isinstance(org_id, ObjectId):
            return True, org_id
        
        # Try to convert string to ObjectId
        if isinstance(org_id, str) and len(org_id) == 24:
            try:
                return True, ObjectId(org_id)
            except:
                return True, org_id  # Accept as string ID
        
        return True, org_id
        
    except Exception as e:
        logger.error(f"Error validating organisation ID: {str(e)}")
        return False, None
