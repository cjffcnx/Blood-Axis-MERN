"""
Logging configuration for the forecasting module.
"""
import logging
import os
from config import LOG_DIR, LOG_LEVEL

# Create logs directory if it doesn't exist
os.makedirs(LOG_DIR, exist_ok=True)

def get_logger(name):
    """
    Get a configured logger instance.
    
    Args:
        name: Logger name, typically __name__
        
    Returns:
        logging.Logger: Configured logger instance
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        # Set logging level
        logger.setLevel(getattr(logging, LOG_LEVEL))
        
        # Create console handler - ensuring it goes to stderr to keep stdout clean for JSON
        import sys
        console_handler = logging.StreamHandler(sys.stderr)
        console_handler.setLevel(getattr(logging, LOG_LEVEL))
        
        # Create file handler
        log_file = os.path.join(LOG_DIR, 'forecasting.log')
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, LOG_LEVEL))
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
    
    return logger
