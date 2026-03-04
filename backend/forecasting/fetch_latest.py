"""
Script to fetch the latest forecast for an organisation.
Designed to be called from Node.js via child_process.exec.
IMPORTANT: Only prints JSON to stdout, all other output goes to stderr via logger.
"""
import sys
import os
import json

# Redirect any unexpected prints to stderr to keep stdout clean for JSON
class StdoutGuard:
    def write(self, text):
        if text.strip():
            sys.stderr.write(f"[STDOUT GUARD] {text}")
    def flush(self):
        sys.stderr.flush()

# Add current directory to sys.path to allow imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

def main():
    """Main entry point - outputs only JSON to stdout."""
    result = None
    
    try:
        if len(sys.argv) < 2:
            result = {
                "success": False,
                "status": "error",
                "message": "Organisation ID required"
            }
        else:
            organisation_id = sys.argv[1]
            
            # Import here to catch import errors
            from api import ForecastAPI
            
            api = ForecastAPI()
            result = api.get_latest_forecast(organisation_id)
        
        # Output ONLY JSON to stdout
        print(json.dumps(result, default=str), flush=True)
        
    except ImportError as e:
        result = {
            "success": False,
            "status": "error",
            "message": f"Import error: {str(e)}"
        }
        print(json.dumps(result), flush=True)
        
    except Exception as e:
        # Catch-all for any unhandled errors
        import traceback
        error_trace = traceback.format_exc()
        # Log to stderr
        sys.stderr.write(f"ERROR: {error_trace}\n")
        
        result = {
            "success": False,
            "status": "error",
            "message": str(e)
        }
        print(json.dumps(result), flush=True)
    
    sys.exit(0)

if __name__ == "__main__":
    main()
