"""
Example usage and testing of the forecasting module.

This file demonstrates how to use the forecasting module
in various ways.
"""

import json
from forecast_engine import ForecastEngine
from database import DatabaseManager
from utils import encode_result, format_forecast_for_api
from logger import get_logger

logger = get_logger(__name__)

# Example 1: Basic forecasting for a single organisation
def example_basic_forecast():
    """Generate forecast for an organisation."""
    print("=" * 50)
    print("Example 1: Basic Forecast Generation")
    print("=" * 50)
    
    engine = ForecastEngine()
    
    # Replace with actual organisation ID from your database
    org_id = "507f1f77bcf86cd799439011"
    
    result = engine.forecast_organisation(org_id)
    
    print(f"Status: {result['status']}")
    print(f"Total Forecasts: {len(result['forecasts'])}")
    print(f"Errors: {len(result['errors'])}")
    
    # Print first forecast record
    if result['forecasts']:
        print(f"\nFirst forecast record:")
        print(json.dumps(result['forecasts'][0], indent=2, default=str))

# Example 2: Get forecast and convert to API format
def example_api_format():
    """Generate forecast and convert to API format."""
    print("\n" + "=" * 50)
    print("Example 2: API Format Output")
    print("=" * 50)
    
    engine = ForecastEngine()
    org_id = "507f1f77bcf86cd799439011"
    
    result = engine.forecast_organisation(org_id)
    api_result = format_forecast_for_api(result)
    
    print(json.dumps(api_result, indent=2, default=str))

# Example 3: Forecast without saving to database
def example_no_save():
    """Generate forecast without saving results."""
    print("\n" + "=" * 50)
    print("Example 3: Forecast Without Saving")
    print("=" * 50)
    
    engine = ForecastEngine()
    org_id = "507f1f77bcf86cd799439011"
    
    result = engine.forecast_organisation(org_id, save_to_db=False)
    
    print(f"Generated {len(result['forecasts'])} forecasts (not saved to DB)")

# Example 4: Retrieve latest forecast from database
def example_get_latest():
    """Retrieve the latest forecast from database."""
    print("\n" + "=" * 50)
    print("Example 4: Get Latest Forecast")
    print("=" * 50)
    
    db = DatabaseManager()
    org_id = "507f1f77bcf86cd799439011"
    
    forecasts = db.get_latest_forecast(org_id)
    
    if forecasts:
        print(f"Found {len(forecasts)} forecast records")
        # Group by blood group
        by_bg = {}
        for forecast in forecasts:
            bg = forecast.get('blood_group')
            if bg not in by_bg:
                by_bg[bg] = []
            by_bg[bg].append(forecast)
        
        print(f"\nForecasts by blood group:")
        for bg, records in by_bg.items():
            print(f"  {bg}: {len(records)} records")
    else:
        print("No forecasts found")
    
    db.close()

# Example 5: Analyze data quality before forecasting
def example_data_analysis():
    """Analyze data quality for an organisation."""
    print("\n" + "=" * 50)
    print("Example 5: Data Quality Analysis")
    print("=" * 50)
    
    from data_processor import DataProcessor
    
    db = DatabaseManager()
    dp = DataProcessor()
    
    org_id = "507f1f77bcf86cd799439011"
    df = db.get_blood_issue_data(org_id)
    
    print(f"Total records: {len(df)}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"\nRecords by blood group:")
    
    for bg in ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']:
        bg_df = df[df['blood_group'] == bg]
        if len(bg_df) > 0:
            ts, is_valid, msg = dp.prepare_time_series(df, bg)
            if ts is not None:
                metrics = dp.validate_data_quality(ts)
                print(f"\n{bg}:")
                print(f"  Valid: {is_valid}")
                print(f"  Data points: {metrics.get('total_points', 0)}")
                print(f"  Non-zero days: {metrics.get('non_zero_points', 0)}")
                print(f"  Average demand: {metrics.get('mean', 0):.2f} units")
                print(f"  Max demand: {metrics.get('max', 0):.2f} units")
    
    db.close()

# Example 6: Forecasting with custom parameters
def example_custom_parameters():
    """Generate forecast with custom historical data window."""
    print("\n" + "=" * 50)
    print("Example 6: Custom Parameters")
    print("=" * 50)
    
    engine = ForecastEngine()
    org_id = "507f1f77bcf86cd799439011"
    
    # Use only 90 days of historical data
    result = engine.forecast_organisation(org_id, days_back=90)
    
    print(f"Forecast using 90 days of data:")
    print(f"Status: {result['status']}")
    print(f"Total Forecasts: {len(result['forecasts'])}")

# Example 7: Batch forecasting for multiple organisations
def example_batch_forecast():
    """Generate forecasts for multiple organisations."""
    print("\n" + "=" * 50)
    print("Example 7: Batch Forecasting")
    print("=" * 50)
    
    from database import DatabaseManager
    
    db = DatabaseManager()
    engine = ForecastEngine()
    
    # Get all organisations
    try:
        organisations = db.db.users.distinct(
            '_id',
            {'role': {'$in': ['org', 'hospital']}}
        )
        
        print(f"Found {len(organisations)} organisations")
        
        for org_id in organisations[:5]:  # Limit to first 5
            print(f"\nForecasting for {org_id}...")
            result = engine.forecast_organisation(str(org_id))
            print(f"  Status: {result['status']}")
            print(f"  Forecasts: {len(result['forecasts'])}")
            
            if result['errors']:
                print(f"  Errors: {len(result['errors'])}")
    
    finally:
        db.close()

# Example 8: Error handling and recovery
def example_error_handling():
    """Demonstrate error handling."""
    print("\n" + "=" * 50)
    print("Example 8: Error Handling")
    print("=" * 50)
    
    engine = ForecastEngine()
    
    # Try with invalid organisation ID
    result = engine.forecast_organisation("invalid_id")
    
    print(f"Result with invalid ID:")
    print(f"Status: {result['status']}")
    print(f"Errors: {result['errors']}")
    
    # Try with empty result
    result = engine.forecast_organisation("000000000000000000000000")
    
    print(f"\nResult with non-existent ID:")
    print(f"Status: {result['status']}")
    print(f"Errors: {result['errors']}")

if __name__ == '__main__':
    # Run examples
    try:
        # Uncomment examples to run:
        
        # example_basic_forecast()
        # example_api_format()
        # example_no_save()
        # example_get_latest()
        # example_data_analysis()
        # example_custom_parameters()
        # example_batch_forecast()
        # example_error_handling()
        
        print("\n" + "=" * 50)
        print("Examples available - Uncomment to run")
        print("=" * 50)
        
    except Exception as e:
        logger.error(f"Example error: {str(e)}")
        print(f"Error: {str(e)}")
