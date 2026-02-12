"""
SARIMA-based forecasting engine for blood demand prediction.
"""
import pandas as pd
import numpy as np
import warnings
from datetime import timedelta
from statsmodels.tsa.statespace.sarimax import SARIMAX
from config import (
    FORECAST_DAYS, SARIMA_ORDER, SARIMA_SEASONAL_ORDER,
    MIN_DATA_POINTS, BASELINE_THRESHOLD
)
from logger import get_logger
from data_processor import DataProcessor

warnings.filterwarnings('ignore')
logger = get_logger(__name__)

class BloodDemandForecaster:
    """SARIMA-based forecaster for blood demand."""
    
    def __init__(self):
        """Initialize the forecaster."""
        self.model = None
        self.fitted = False
        self.model_type = None
        
    def fit_sarima(self, ts, order=SARIMA_ORDER, seasonal_order=SARIMA_SEASONAL_ORDER):
        """
        Fit SARIMA model to the time series.
        
        Args:
            ts: pd.Series time series data
            order: (p, d, q) parameters
            seasonal_order: (P, D, Q, s) parameters
            
        Returns:
            tuple: (success, error_message)
        """
        try:
            if len(ts) < MIN_DATA_POINTS:
                msg = f"Insufficient data: {len(ts)} points, need {MIN_DATA_POINTS}"
                logger.warning(msg)
                return False, msg
            
            logger.info(f"Fitting SARIMA{order}x{seasonal_order} model...")
            
            # Fit the model
            self.model = SARIMAX(
                ts,
                order=order,
                seasonal_order=seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False,
                disp=False
            )
            
            self.results = self.model.fit(disp=False)
            self.fitted = True
            self.model_type = 'SARIMA'
            
            logger.info("SARIMA model fitted successfully")
            logger.info(f"AIC: {self.results.aic:.2f}, BIC: {self.results.bic:.2f}")
            
            return True, "Success"
            
        except Exception as e:
            msg = f"SARIMA fitting failed: {str(e)}"
            logger.warning(msg)
            self.fitted = False
            return False, msg
    
    def forecast(self, ts, steps=FORECAST_DAYS):
        """
        Generate forecast for the next N days.
        
        Args:
            ts: pd.Series time series data
            steps: Number of steps to forecast
            
        Returns:
            tuple: (forecast_df, model_type, success)
        """
        try:
            if not self.fitted:
                msg = "Model not fitted. Cannot generate forecast."
                logger.error(msg)
                return None, None, msg
            
            logger.info(f"Generating {steps}-day forecast...")
            
            # Get forecast
            forecast_result = self.results.get_forecast(steps=steps)
            forecast_values = forecast_result.predicted_mean
            
            # Get confidence intervals (optional, for future reference)
            conf_int = forecast_result.conf_int(alpha=0.05)
            
            # Generate forecast dates
            last_date = ts.index[-1]
            forecast_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=steps,
                freq='D'
            )
            
            # Create forecast DataFrame
            forecast_df = pd.DataFrame({
                'date': forecast_dates,
                'forecast_units': forecast_values.values,
                'lower_bound': conf_int.iloc[:, 0].values,
                'upper_bound': conf_int.iloc[:, 1].values,
                'model_type': self.model_type
            })
            
            # Ensure non-negative values and round to integers
            forecast_df['forecast_units'] = (
                forecast_df['forecast_units']
                .clip(lower=0)
                .round()
                .astype(int)
            )
            
            forecast_df['lower_bound'] = (
                forecast_df['lower_bound']
                .clip(lower=0)
                .round()
                .astype(int)
            )
            
            forecast_df['upper_bound'] = (
                forecast_df['upper_bound']
                .clip(lower=0)
                .round()
                .astype(int)
            )
            
            logger.info(f"Forecast generated successfully. Mean value: {forecast_df['forecast_units'].mean():.2f}")
            
            return forecast_df, self.model_type, True
            
        except Exception as e:
            msg = f"Error generating forecast: {str(e)}"
            logger.error(msg)
            return None, None, msg
    
    def calculate_rmse(self, ts):
        """
        Calculate RMSE of the model on the training data.
        
        Args:
            ts: pd.Series time series data
            
        Returns:
            float: Root Mean Squared Error
        """
        try:
            if not self.fitted:
                return float('inf')
            
            predictions = self.results.fittedvalues
            rmse = np.sqrt(np.mean((ts - predictions) ** 2))
            
            logger.info(f"Model RMSE: {rmse:.4f}")
            return rmse
            
        except Exception as e:
            logger.error(f"Error calculating RMSE: {str(e)}")
            return float('inf')
    
    @staticmethod
    def auto_fit_sarima(ts, max_iterations=10):
        """
        Attempt to auto-fit SARIMA with different parameters.
        
        Args:
            ts: pd.Series time series data
            max_iterations: Maximum parameter combinations to try
            
        Returns:
            tuple: (forecaster object, success status)
        """
        try:
            logger.info("Attempting to auto-fit SARIMA model...")
            
            forecaster = BloodDemandForecaster()
            
            # Try the default parameters first
            success, msg = forecaster.fit_sarima(ts)
            
            if success:
                return forecaster, True
            
            logger.warning("Default SARIMA parameters failed, trying alternatives...")
            
            # Try alternative parameter sets
            param_combinations = [
                ((0, 1, 1), (0, 1, 1, 7)),
                ((1, 1, 0), (1, 1, 0, 7)),
                ((0, 1, 0), (0, 1, 1, 7)),
                ((1, 0, 0), (1, 0, 0, 7)),
                ((1, 1, 1), (0, 0, 0, 7)),
            ]
            
            for order, seasonal_order in param_combinations[:max_iterations]:
                try:
                    forecaster = BloodDemandForecaster()
                    success, msg = forecaster.fit_sarima(ts, order, seasonal_order)
                    if success:
                        logger.info(f"Successfully fitted with parameters: {order}x{seasonal_order}")
                        return forecaster, True
                except:
                    continue
            
            logger.warning("Auto-fit failed for all parameter combinations")
            return None, False
            
        except Exception as e:
            logger.error(f"Error in auto-fit: {str(e)}")
            return None, False
