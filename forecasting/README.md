# Blood Demand Forecasting Module

A comprehensive AI-powered blood demand forecasting system for blood bank management. This module uses SARIMA time series analysis to predict blood demand for the next 7 days for each blood group in an organization.

## Overview

The forecasting module consists of two main components:

1. **Python Forecasting Engine** - Core forecasting logic using SARIMA, data validation, and fallback mechanisms
2. **Node.js API Integration** - REST endpoints and scheduler integration for the existing MERN stack

## Features

- **SARIMA-Based Forecasting**: Uses Seasonal ARIMA model to capture weekly patterns in blood demand
- **Per-Blood-Group Forecasts**: Separate forecasts for all 8 blood groups (A+, A-, B+, B-, O+, O-, AB+, AB-)
- **Intelligent Fallbacks**: Automatically switches to 7-day average baseline when SARIMA fails
- **Flexible Data Windows**: Works with 3-6 months of historical data
- **Confidence Intervals**: Provides lower and upper bounds for each forecast
- **Daily Scheduling**: Automatic forecast generation using cron scheduler
- **Comprehensive Logging**: Detailed logs for monitoring and debugging
- **MongoDB Integration**: Direct integration with existing MongoDB database

## Directory Structure

```
blood/
├── forecasting/                 # Python forecasting module
│   ├── config.py               # Configuration settings
│   ├── logger.py               # Logging setup
│   ├── database.py             # MongoDB operations
│   ├── data_processor.py       # Data preprocessing & validation
│   ├── forecaster.py           # SARIMA forecasting engine
│   ├── forecast_engine.py      # Main orchestration engine
│   ├── api.py                  # API wrapper
│   ├── cli.py                  # Command-line interface
│   ├── utils.py                # Utility functions
│   ├── requirements.txt        # Python dependencies
│   └── logs/                   # Log files directory
├── routes/
│   ├── forecastingRoutes.js    # REST API endpoints
│   ├── schedulerRoutes.js      # Scheduler control endpoints
│   └── ...
├── models/
│   ├── forecastModel.js        # Forecast metadata model
│   └── ...
├── utils/
│   ├── logger.js               # Node.js logger
│   ├── forecastScheduler.js    # Scheduler implementation
│   └── ...
└── ...
```

## Installation & Setup

### 1. Install Python Dependencies

```bash
cd forecasting
pip install -r requirements.txt
```

Ensure you have:
- Python 3.7+
- MongoDB server running and accessible
- Proper `.env` configuration in the root project directory

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=blood_bank

# Forecasting Configuration
FORECAST_SCHEDULE=0 2 * * *      # Cron: 2 AM daily (default)
LOG_LEVEL=INFO                    # DEBUG, INFO, WARN, ERROR
```

### 3. Install Node Dependencies

The forecasting routes require `node-cron` for scheduling:

```bash
npm install node-cron
```

### 4. Database Collection Setup

The module uses two MongoDB collections:

**1. `inventory` Collection** (existing)
```json
{
  "date": "2024-01-15",
  "organisation_id": ObjectId,
  "blood_group": "A+",
  "transaction_type": "issue",
  "units": 5
}
```

**2. `forecasts` Collection** (created by module)
```json
{
  "organisation_id": ObjectId,
  "forecast_date": Date,
  "date": Date,
  "blood_group": "A+",
  "forecast_units": 8,
  "lower_bound": 6,
  "upper_bound": 10,
  "model_type": "SARIMA",
  "confidence": 0.85
}
```

## API Endpoints

### 1. Generate Forecast

```http
POST /api/v1/forecasting/forecast
Content-Type: application/json
Authorization: Bearer <token>

{
  "organisationId": "507f1f77bcf86cd799439011",
  "daysBack": 180,
  "saveToDb": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "status": "success",
  "message": "Forecast generated successfully",
  "data": [
    {
      "blood_group": "A+",
      "date": "2024-01-22",
      "forecast_units": 8,
      "lower_bound": 6,
      "upper_bound": 10,
      "model_type": "SARIMA",
      "confidence": 0.85
    },
    ...
  ],
  "errors": []
}
```

### 2. Get Latest Forecast

```http
GET /api/v1/forecasting/latest/:organisationId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "organisationId": "507f1f77bcf86cd799439011",
  "data": {
    "A+": [
      {
        "date": "2024-01-22",
        "units": 8,
        "lowerBound": 6,
        "upperBound": 10,
        "modelType": "SARIMA",
        "confidence": 0.85
      },
      ...
    ],
    ...
  }
}
```

### 3. Get Forecast History

```http
GET /api/v1/forecasting/history/:organisationId?limit=10&skip=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "organisationId": "507f1f77bcf86cd799439011",
      "forecastDate": "2024-01-21T14:30:00Z",
      "status": "success",
      "totalForecasts": 56,
      "averageConfidence": 0.82
    },
    ...
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "skip": 0
  }
}
```

### 4. Get Forecast Statistics

```http
GET /api/v1/forecasting/stats/:organisationId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalForecasts": 45,
    "avgConfidence": 0.823,
    "successRate": 95.56,
    "lastForecastDate": "2024-01-21T14:30:00Z"
  }
}
```

### 5. Scheduler Status (Admin)

```http
GET /api/v1/admin/scheduler/status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isRunning": true,
    "lastRunTime": "2024-01-21T02:00:00Z"
  }
}
```

### 6. Trigger Manual Forecast Run (Admin)

```http
POST /api/v1/admin/scheduler/trigger
Authorization: Bearer <admin_token>
```

## Command-Line Usage

### Generate Forecast for Specific Organization

```bash
python forecasting/cli.py <organisation_id>
```

### With Options

```bash
python forecasting/cli.py <organisation_id> \
  --days-back 180 \
  --no-save \
  --json
```

### Output

```json
{
  "organisation_id": "507f1f77bcf86cd799439011",
  "forecast_date": "2024-01-21T14:30:00",
  "status": "success",
  "forecasts": [
    {
      "blood_group": "A+",
      "date": "2024-01-22",
      "forecast_units": 8,
      "lower_bound": 6,
      "upper_bound": 10,
      "model_type": "SARIMA",
      "confidence": 0.85
    },
    ...
  ],
  "errors": []
}
```

## Algorithm Details

### SARIMA Model

**Parameters:**
- **Order (p, d, q)**: (1, 1, 1)
  - p=1: Auto-regressive component
  - d=1: Differencing for stationarity
  - q=1: Moving average component

- **Seasonal Order (P, D, Q, s)**: (1, 1, 1, 7)
  - P, D, Q: Seasonal equivalents
  - s=7: Weekly seasonality

### Data Preparation

1. **Aggregation**: Raw transactions aggregated by date and blood group
2. **Gap Filling**: Missing dates filled with 0 demand
3. **Validation**: Minimum 21 days (3 weeks) of data required
4. **Stationarity Check**: Implicit in differencing (d=1)

### Fallback Strategy

When SARIMA fails or insufficient data:

1. **Baseline Method**: 7-day rolling average
2. **Zero Forecast**: Last resort if all methods fail
3. **Confidence Scoring**: Lower confidence (0.5-0.6) for fallback methods

### Confidence Calculation

```
confidence = min(1.0, max(0.6, 1.0 - (RMSE / (mean + 1))))
```

- Higher when model fit is better
- Capped at 1.0, minimum 0.6 (except fallbacks)
- RMSE-based with normalization

## Error Handling

### Model Failures

The system handles:
- **Insufficient Data**: Falls back to baseline
- **Non-Stationary Series**: Auto-fit alternative parameters
- **Singular Matrix**: Uses robust fitting
- **All Methods Failed**: Zero forecast with warning

### Data Issues

- **Missing Records**: Filled with zero demand
- **Outliers**: Automatically detected and logged
- **Empty Blood Groups**: Baseline forecast provided
- **Invalid Dates**: Gracefully skipped

## Logging

### Log Levels

- **ERROR**: Critical issues that need attention
- **WARN**: Fallback methods used, partial failures
- **INFO**: Normal operations, successful forecasts
- **DEBUG**: Detailed diagnostics

### Log Files

- **Python**: `forecasting/logs/forecasting.log`
- **Node.js**: `logs/application.log`

### Example Log Entries

```
2024-01-21 02:00:15 - forecast_engine - INFO - Starting forecast pipeline for organisation 507f1f77bcf86cd799439011
2024-01-21 02:00:15 - database - INFO - MongoDB connection established successfully
2024-01-21 02:00:16 - database - INFO - Successfully fetched 180 records for organisation 507f1f77bcf86cd799439011
2024-01-21 02:00:16 - data_processor - INFO - Prepared time series for A+: 178 data points
2024-01-21 02:00:17 - forecaster - INFO - SARIMA model fitted successfully
2024-01-21 02:00:17 - forecaster - INFO - Model RMSE: 2.3456
2024-01-21 02:00:17 - forecast_engine - INFO - Generated SARIMA forecast for A+
2024-01-21 02:00:18 - database - INFO - Saved 56 forecast records for organisation 507f1f77bcf86cd799439011
2024-01-21 02:00:18 - forecast_engine - INFO - Forecast pipeline completed. Status: success, Generated 56 forecast records
```

## Performance Considerations

### Processing Time

- **Data Extraction**: 0.5-2 seconds (depends on data volume)
- **Preprocessing**: 0.5-1 second
- **SARIMA Training**: 1-5 seconds per blood group (8 groups = 8-40 seconds)
- **Total**: 10-50 seconds per organization

### Optimization Tips

1. **Index Database**: Ensure `inventory` collection has indexes on:
   - `organisation_id`
   - `transaction_type`
   - `date`
   - `blood_group`

2. **Batch Forecasting**: Run scheduler during off-peak hours
3. **Cleanup Old Forecasts**: Archive old forecast records monthly
4. **Monitor RMSE**: Track model performance over time

## Troubleshooting

### Issue: Python Module Not Found

**Solution:**
```bash
# Ensure forecasting directory is in Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)/forecasting"
```

### Issue: MongoDB Connection Failed

**Check:**
- MongoDB is running: `mongod --version`
- Connection string in `.env`: `MONGODB_URI`
- Network connectivity to database
- Database user credentials if using authentication

### Issue: Forecast Takes Too Long

**Solutions:**
1. Reduce `daysBack` parameter
2. Optimize MongoDB indexes
3. Run on machine with more CPU
4. Check MongoDB query performance

### Issue: High Forecast Errors

**Investigate:**
1. Check log files for detailed error messages
2. Verify data quality in MongoDB
3. Ensure sufficient historical data (minimum 21 days)
4. Review RMSE values in logs

## Integration with Frontend

### React Component Example

```javascript
// services/forecastService.js
export const getForecast = async (organisationId) => {
  try {
    const response = await API.get(
      `/forecasting/latest/${organisationId}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch forecast:', error);
    throw error;
  }
};

// pages/Dashboard/Forecast.js
import { useEffect, useState } from 'react';
import { getForecast } from '../../services/forecastService';
import ForecastChart from '../../components/ForecastChart';

export default function ForecastPage() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForecast = async () => {
      try {
        const data = await getForecast(organisationId);
        setForecast(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [organisationId]);

  if (loading) return <div>Loading forecast...</div>;
  if (!forecast) return <div>No forecast available</div>;

  return (
    <div>
      <h1>7-Day Blood Demand Forecast</h1>
      <ForecastChart data={forecast.data} />
      <ForecastTable data={forecast.data} />
    </div>
  );
}
```

## Future Enhancements

1. **Multiple Algorithms**: LSTM neural networks, Prophet
2. **Seasonal Decomposition**: Separate trend and seasonality
3. **External Variables**: Weather, holidays, events
4. **Anomaly Detection**: Real-time alert for unusual patterns
5. **Model Comparison**: A/B testing different approaches
6. **Forecast Accuracy Tracking**: Historical performance metrics
7. **UI Dashboard**: Interactive forecasting interface
8. **API Alerts**: Notification system for important forecasts

## Support & Maintenance

### Regular Tasks

- Monitor logs for errors or warnings
- Review forecast accuracy monthly
- Update dependencies quarterly
- Clean up old forecast records
- Test scheduler periodically

### Contact & Issues

For issues or improvements:
1. Check logs for detailed error messages
2. Review troubleshooting section
3. Test with CLI directly
4. Contact development team

## License

This module is part of the Blood Bank Management System and follows the same license terms.

## Version History

- **v1.0.0** (2024-01-21): Initial release
  - SARIMA forecasting
  - Baseline fallback
  - MongoDB integration
  - REST API endpoints
  - Scheduler implementation
