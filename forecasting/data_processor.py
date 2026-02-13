"""
Data preprocessing and validation for time series forecasting.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from config import BLOOD_GROUPS, MIN_DATA_POINTS, FORECAST_DAYS
from logger import get_logger

logger = get_logger(__name__)

class DataProcessor:
    """Handles data preprocessing and validation."""
    
    @staticmethod
    def prepare_time_series(df, blood_group):
        """
        Prepare a continuous time series for a specific blood group.
        
        Args:
            df: DataFrame with columns [date, blood_group, units_issued]
            blood_group: The blood group to filter for
            
        Returns:
            tuple: (pd.Series indexed by date, validation status, message)
        """
        try:
            # Filter data for the specific blood group
            bg_data = df[df['blood_group'] == blood_group].copy()
            
            if bg_data.empty:
                logger.warning(f"No data found for blood group {blood_group}")
                return None, False, f"No data available for {blood_group}"
            
            # Sort by date
            bg_data = bg_data.sort_values('date')
            
            # Create date range from first to last date
            date_range = pd.date_range(
                start=bg_data['date'].min(),
                end=bg_data['date'].max(),
                freq='D'
            )
            
            # Create complete time series with zeros for missing dates
            ts = pd.Series(
                index=date_range,
                dtype='float64',
                data=0.0
            )
            
            # Fill in the actual values
            for _, row in bg_data.iterrows():
                ts[row['date']] = row['units_issued']
            
            # Validate minimum data points
            if len(ts) < MIN_DATA_POINTS:
                msg = (f"Insufficient data for {blood_group}: {len(ts)} days available, "
                       f"minimum {MIN_DATA_POINTS} required")
                logger.warning(msg)
                return ts, False, msg
            
            logger.info(f"Prepared time series for {blood_group}: {len(ts)} data points")
            return ts, True, "Success"
            
        except Exception as e:
            msg = f"Error preparing time series for {blood_group}: {str(e)}"
            logger.error(msg)
            return None, False, msg
    
    @staticmethod
    def validate_data_quality(ts):
        """
        Validate the quality of the time series.
        
        Args:
            ts: pd.Series time series data
            
        Returns:
            dict: Validation metrics
        """
        try:
            metrics = {
                'total_points': len(ts),
                'non_zero_points': (ts > 0).sum(),
                'zero_days': (ts == 0).sum(),
                'mean': ts.mean(),
                'std': ts.std(),
                'min': ts.min(),
                'max': ts.max(),
                'zero_percentage': ((ts == 0).sum() / len(ts)) * 100
            }
            
            logger.info(f"Data quality metrics: {metrics}")
            return metrics
            
        except Exception as e:
            logger.error(f"Error validating data quality: {str(e)}")
            return {}
    
    @staticmethod
    def calculate_baseline_forecast(ts, forecast_days=FORECAST_DAYS):
        """
        Calculate baseline forecast using recent averages.
        
        This is a fallback method when SARIMA fails or when data is insufficient.
        Prioritizes the most recent 7 days to capture current demand trends.
        
        Args:
            ts: pd.Series time series data
            forecast_days: Number of days to forecast
            
        Returns:
            pd.DataFrame: Forecast results with columns [date, forecast_units]
        """
        try:
            # Use weighted average favoring recent data
            # If last 7 days have more activity, that's the new demand level
            recent_7 = ts.tail(7)
            recent_30 = ts.tail(30)
            
            # Weight recent 7 days heavily (80%) vs. older data (20%)
            if len(recent_7) > 0:
                recent_avg_7 = recent_7.mean()
            else:
                recent_avg_7 = 0
                
            if len(recent_30) > 0:
                recent_avg_30 = recent_30.mean()
            else:
                recent_avg_30 = 0
            
            # 80% weight to last 7 days, 20% to last 30 days
            recent_avg = (0.8 * recent_avg_7) + (0.2 * recent_avg_30)
            recent_avg = max(recent_avg, 0)  # Ensure non-negative
            
            # Generate forecast
            last_date = ts.index[-1]
            forecast_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=forecast_days,
                freq='D'
            )
            
            forecast_df = pd.DataFrame({
                'date': forecast_dates,
                'forecast_units': [round(recent_avg)] * forecast_days,
                'model_type': 'baseline_weighted_recent'
            })
            
            logger.info(f"Generated baseline forecast (7d={recent_avg_7:.1f}, 30d={recent_avg_30:.1f}, weighted={recent_avg:.2f} units)")
            return forecast_df
            
        except Exception as e:
            logger.error(f"Error generating baseline forecast: {str(e)}")
            # Return zero forecast as last resort
            last_date = ts.index[-1]
            forecast_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=forecast_days,
                freq='D'
            )
            return pd.DataFrame({
                'date': forecast_dates,
                'forecast_units': [0] * forecast_days,
                'model_type': 'zero_forecast'
            })
    
    @staticmethod
    def detect_outliers(ts, method='iqr'):
        """
        Detect outliers in the time series.
        
        Args:
            ts: pd.Series time series data
            method: 'iqr' or 'zscore'
            
        Returns:
            list: Indices of outlier points
        """
        try:
            if method == 'iqr':
                Q1 = ts.quantile(0.25)
                Q3 = ts.quantile(0.75)
                IQR = Q3 - Q1
                outliers = ts[(ts < (Q1 - 1.5 * IQR)) | (ts > (Q3 + 1.5 * IQR))].index
            else:  # zscore
                from scipy import stats
                z_scores = np.abs(stats.zscore(ts))
                outliers = ts[z_scores > 3].index
            
            if len(outliers) > 0:
                logger.info(f"Detected {len(outliers)} outliers in time series")
            
            return list(outliers)
            
        except Exception as e:
            logger.error(f"Error detecting outliers: {str(e)}")
            return []
    
    @staticmethod
    def smooth_series(ts, window=7):
        """
        Apply moving average smoothing to the time series.
        
        Args:
            ts: pd.Series time series data
            window: Window size for moving average
            
        Returns:
            pd.Series: Smoothed time series
        """
        try:
            smoothed = ts.rolling(window=window, center=True, min_periods=1).mean()
            logger.info(f"Applied {window}-day moving average smoothing")
            return smoothed
            
        except Exception as e:
            logger.error(f"Error smoothing series: {str(e)}")
            return ts
