"""
Command-line interface for the forecasting module.
"""
import sys
import json
import argparse
from forecast_engine import ForecastEngine
from utils import encode_result, validate_organisation_id
from logger import get_logger

logger = get_logger(__name__)

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Blood Demand Forecasting Module'
    )
    
    parser.add_argument(
        'organisation_id',
        type=str,
        help='Organisation ID to forecast for'
    )
    
    parser.add_argument(
        '--days-back',
        type=float,
        default=180,
        help='Number of days of historical data to use (default: 180, accepts decimals for partial days)'
    )
    
    parser.add_argument(
        '--no-save',
        action='store_true',
        help='Do not save forecast results to MongoDB'
    )
    
    parser.add_argument(
        '--json',
        action='store_true',
        default=True,
        help='Output results as JSON (default: True)'
    )
    
    args = parser.parse_args()
    
    # Validate organisation ID
    is_valid, org_id = validate_organisation_id(args.organisation_id)
    if not is_valid:
        logger.error(f"Invalid organisation ID: {args.organisation_id}")
        # Output valid JSON error
        print(json.dumps({
            'status': 'error',
            'message': f'Invalid organisation ID: {args.organisation_id}',
            'organisation_id': args.organisation_id,
            'forecasts': [],
            'errors': [f'Invalid organisation ID: {args.organisation_id}']
        }))
        sys.exit(0)
    
    try:
        # Run forecast
        engine = ForecastEngine()
        result = engine.forecast_organisation(
            org_id,
            days_back=args.days_back,
            save_to_db=not args.no_save
        )
        
        # Output result as JSON
        # Important: Only output JSON - no other text or logging to stdout
        print(encode_result(result))
        
        # Return appropriate exit code
        # We always exit with 0 if we successfully generated a result JSON
        sys.exit(0)
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Output valid JSON error
        print(json.dumps({
            'status': 'error',
            'message': str(e),
            'organisation_id': args.organisation_id,
            'forecasts': [],
            'errors': [str(e)]
        }))
        sys.exit(0)

if __name__ == '__main__':
    main()
