# Blood Demand Forecasting - Integration Guide

This guide walks you through integrating the AI-based blood demand forecasting module into your existing Blood Bank Management System.

## Quick Start

### 1. Install Dependencies

**Option A: Automated (Recommended)**

On Windows:
```bash
setup-forecasting.bat
```

On macOS/Linux:
```bash
bash setup-forecasting.sh
```

**Option B: Manual Installation**

Python dependencies:
```bash
cd forecasting
pip install -r requirements.txt
```

Node.js dependencies:
```bash
npm install node-cron
```

### 2. Configure Environment

Add to your `.env` file in the project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=blood_bank

# Forecasting Configuration
FORECAST_SCHEDULE=0 2 * * *      # Daily at 2 AM
LOG_LEVEL=INFO                    # DEBUG, INFO, WARN, ERROR
```

### 3. Start the Application

```bash
npm start
```

The forecasting module will:
- Load automatically on server startup
- Initialize the MongoDB connection
- Start the daily scheduler
- Be ready to receive forecast requests

## File Structure

```
blood/
├── forecasting/                    # Python forecasting module
│   ├── __init__.py
│   ├── config.py                   # Configuration
│   ├── logger.py                   # Logging
│   ├── database.py                 # MongoDB operations
│   ├── data_processor.py           # Data preprocessing
│   ├── forecaster.py               # SARIMA model
│   ├── forecast_engine.py          # Main engine
│   ├── api.py                      # Python API wrapper
│   ├── cli.py                      # Command-line interface
│   ├── utils.py                    # Utilities
│   ├── examples.py                 # Usage examples
│   ├── requirements.txt            # Python dependencies
│   ├── README.md                   # Full documentation
│   └── logs/                       # Log files
│
├── routes/
│   ├── forecastingRoutes.js        # ✨ NEW: Forecasting API endpoints
│   ├── schedulerRoutes.js          # ✨ NEW: Scheduler control endpoints
│   └── ...
│
├── models/
│   ├── forecastModel.js            # ✨ NEW: Forecast metadata model
│   └── ...
│
├── utils/
│   ├── logger.js                   # ✨ NEW: Node.js logger
│   ├── forecastScheduler.js        # ✨ NEW: Scheduler implementation
│   └── ...
│
├── server.js                        # ✨ UPDATED: Added forecasting initialization
├── package.json                     # ✨ UPDATED: Added node-cron
├── setup-forecasting.sh             # ✨ NEW: Setup script (Unix)
├── setup-forecasting.bat            # ✨ NEW: Setup script (Windows)
├── INTEGRATION_GUIDE.md             # ✨ NEW: This file
└── ...
```

## API Reference

### For Organizations/Users

#### Get Latest 7-Day Forecast

```bash
GET /api/v1/forecasting/latest/:organisationId
Authorization: Bearer {token}
```

**Example Response:**
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
    "B+": [...],
    ...
  }
}
```

#### Get Forecast History

```bash
GET /api/v1/forecasting/history/:organisationId?limit=10&skip=0
Authorization: Bearer {token}
```

#### Get Forecast Statistics

```bash
GET /api/v1/forecasting/stats/:organisationId
Authorization: Bearer {token}
```

### For Administrators

#### Generate Forecast

```bash
POST /api/v1/forecasting/forecast
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "organisationId": "507f1f77bcf86cd799439011",
  "daysBack": 180,
  "saveToDb": true
}
```

#### Check Scheduler Status

```bash
GET /api/v1/admin/scheduler/status
Authorization: Bearer {admin_token}
```

#### Trigger Manual Forecast Run

```bash
POST /api/v1/admin/scheduler/trigger
Authorization: Bearer {admin_token}
```

#### Start/Stop Scheduler

```bash
POST /api/v1/admin/scheduler/start
POST /api/v1/admin/scheduler/stop
Authorization: Bearer {admin_token}
```

## Database Schema

### New Collections

#### Forecasts Collection
Stores individual forecast records:

```json
{
  "_id": ObjectId,
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

#### Forecast Metadata Collection
Stores forecast run metadata:

```json
{
  "_id": ObjectId,
  "organisationId": ObjectId,
  "forecastDate": Date,
  "status": "success",
  "totalForecasts": 56,
  "averageConfidence": 0.82,
  "modelTypes": ["SARIMA", "baseline_7day_average"],
  "metadata": {
    "daysBack": 180,
    "bloodGroupsCovered": 8,
    "bloodGroupsWithErrors": 0
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

### Required Indexes

Ensure your `inventory` collection has these indexes for optimal performance:

```javascript
// In MongoDB shell:
db.inventory.createIndex({ "organisation_id": 1 });
db.inventory.createIndex({ "transaction_type": 1 });
db.inventory.createIndex({ "date": 1 });
db.inventory.createIndex({ "blood_group": 1 });
db.inventory.createIndex({ "organisation_id": 1, "date": 1, "blood_group": 1 });
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│              (Forecast Charts & Tables)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP GET/POST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Node.js Express Backend                           │
│  ┌─────────────────────────────────────────────────────────┤
│  │ forecastingRoutes.js (REST API Endpoints)               │
│  │ schedulerRoutes.js (Admin Controls)                     │
│  │ forecastScheduler.js (Daily Scheduler)                  │
│  └─────────────────────────────────────────────────────────┤
│            exec(python script) or subprocess               │
└──────────────────────┬──────────────────────────────────────┘
                       │ Child Process
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Python Forecasting Module                       │
│  ┌─────────────────────────────────────────────────────────┤
│  │ forecast_engine.py (Main Orchestration)                 │
│  │  ├─ database.py (Extract data)                          │
│  │  ├─ data_processor.py (Clean & validate)                │
│  │  ├─ forecaster.py (SARIMA model)                        │
│  │  └─ utils.py (JSON conversion)                          │
│  └─────────────────────────────────────────────────────────┤
└──────────────────────┬──────────────────────────────────────┘
                       │ MongoDB Driver
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database                           │
│  ├─ inventory (existing: blood issue records)               │
│  ├─ forecasts (new: forecast records)                       │
│  └─ forecasts metadata (new: run statistics)                │
└─────────────────────────────────────────────────────────────┘
```

## Testing

### Test with curl

```bash
# Generate forecast
curl -X POST http://localhost:8080/api/v1/forecasting/forecast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "organisationId": "507f1f77bcf86cd799439011",
    "daysBack": 180,
    "saveToDb": true
  }'

# Get latest forecast
curl -X GET http://localhost:8080/api/v1/forecasting/latest/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check scheduler status
curl -X GET http://localhost:8080/api/v1/admin/scheduler/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test with Python

```python
# Direct Python module usage
import sys
sys.path.insert(0, 'forecasting')

from forecast_engine import ForecastEngine

engine = ForecastEngine()
result = engine.forecast_organisation('507f1f77bcf86cd799439011')
print(result)
```

### Command Line Testing

```bash
# Generate forecast via CLI
python forecasting/cli.py 507f1f77bcf86cd799439011

# With custom parameters
python forecasting/cli.py 507f1f77bcf86cd799439011 --days-back 90 --json
```

## Frontend Integration

### React Component Example

```javascript
// src/pages/Dashboard/ForecastDashboard.js
import React, { useState, useEffect } from 'react';
import API from '../../services/API';
import Chart from 'chart.js';

export default function ForecastDashboard({ organisationId }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadForecast();
  }, [organisationId]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/forecasting/latest/${organisationId}`);
      
      if (response.data.success) {
        setForecast(response.data.data);
      } else {
        setError('Failed to load forecast');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading forecast...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!forecast) return <div>No forecast available</div>;

  return (
    <div className="forecast-dashboard">
      <h1>7-Day Blood Demand Forecast</h1>
      
      <div className="forecast-cards">
        {Object.entries(forecast).map(([bloodGroup, days]) => (
          <ForecastCard 
            key={bloodGroup} 
            bloodGroup={bloodGroup} 
            data={days} 
          />
        ))}
      </div>

      <ForecastChart data={forecast} />
      <ForecastTable data={forecast} />
    </div>
  );
}

// Forecast Card Component
function ForecastCard({ bloodGroup, data }) {
  const total = data.reduce((sum, d) => sum + d.units, 0);
  const avgConfidence = (
    data.reduce((sum, d) => sum + d.confidence, 0) / data.length
  ).toFixed(2);

  return (
    <div className="forecast-card">
      <h3>{bloodGroup}</h3>
      <p>7-Day Total: <strong>{total}</strong> units</p>
      <p>Avg Confidence: <strong>{avgConfidence}</strong></p>
    </div>
  );
}

// Chart Component using Chart.js
function ForecastChart({ data }) {
  // Implementation for visualizing forecast
  return <canvas id="forecastChart"></canvas>;
}

// Table Component
function ForecastTable({ data }) {
  return (
    <table className="forecast-table">
      <thead>
        <tr>
          <th>Blood Group</th>
          <th>Date</th>
          <th>Forecast (units)</th>
          <th>Range</th>
          <th>Model</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([bg, days]) =>
          days.map((day, idx) => (
            <tr key={`${bg}-${idx}`}>
              <td>{bg}</td>
              <td>{new Date(day.date).toLocaleDateString()}</td>
              <td>{day.units}</td>
              <td>{day.lowerBound} - {day.upperBound}</td>
              <td>{day.modelType}</td>
              <td>{(day.confidence * 100).toFixed(1)}%</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
```

## Troubleshooting

### Issue: "Python not found"

**Solution:**
```bash
# Check Python is installed
python --version

# Or use python3
python3 --version

# Update PATH in .env if needed
export PATH=$PATH:/path/to/python/bin
```

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
cd forecasting
pip install -r requirements.txt

# Check installation
python -c "import statsmodels; print(statsmodels.__version__)"
```

### Issue: "MongoDB connection failed"

**Verify:**
```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
# Format: mongodb://localhost:27017 or mongodb+srv://user:pass@host/db
```

### Issue: "Forecast takes too long"

**Optimize:**
1. Index your `inventory` collection
2. Reduce `daysBack` parameter
3. Run during off-peak hours
4. Check MongoDB performance

## Performance Tuning

### Database Indexes

```javascript
// MongoDB indexes for optimal performance
db.inventory.createIndex({ 
  "organisation_id": 1, 
  "date": 1, 
  "blood_group": 1 
});

db.forecasts.createIndex({ 
  "organisation_id": 1, 
  "forecast_date": -1 
});
```

### Scheduler Timing

Adjust `FORECAST_SCHEDULE` in `.env`:

```env
# Default: 2 AM daily
FORECAST_SCHEDULE=0 2 * * *

# Custom examples:
# 3 AM daily: 0 3 * * *
# 2 AM every Monday: 0 2 * * 1
# Every 6 hours: 0 */6 * * *
```

### Memory Management

For large datasets:
1. Increase Node.js heap size:
```bash
node --max-old-space-size=4096 server.js
```

2. Batch process organizations in scheduler
3. Archive old forecast records

## Monitoring

### Log Files

Check logs for issues:

```bash
# Python logs
tail -f forecasting/logs/forecasting.log

# Node.js logs
tail -f logs/application.log
```

### Key Metrics to Monitor

1. **Forecast Execution Time**: Should be < 60 seconds per org
2. **Success Rate**: Should be > 95%
3. **Model Confidence**: Average should be > 0.7
4. **Data Freshness**: Last forecast should be recent

### Health Check Endpoint (Optional)

Add to your API:
```javascript
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    forecasting: scheduler.isRunning ? 'active' : 'inactive',
    lastForecast: scheduler.lastRunTime
  });
});
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor log files
- Check scheduler status
- Verify data quality

**Weekly:**
- Review forecast accuracy
- Check error rates
- Cleanup old logs

**Monthly:**
- Archive forecast records
- Review model performance
- Update dependencies

### Cleanup Old Forecasts

```javascript
// Remove forecasts older than 90 days
db.forecasts.deleteMany({
  createdAt: { 
    $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
  }
});
```

## Support & Troubleshooting

1. **Check Documentation**: See `forecasting/README.md`
2. **Review Logs**: Check `forecasting/logs/forecasting.log`
3. **Test CLI**: Run `python forecasting/cli.py <org_id>`
4. **Test Connection**: Verify MongoDB connectivity
5. **Check Data**: Verify transaction records in inventory collection

## Next Steps

1. ✅ Setup the module (see Quick Start)
2. ✅ Configure environment variables
3. ✅ Test API endpoints
4. ✅ Integrate React components
5. ✅ Deploy to production
6. ✅ Monitor and maintain

## Additional Resources

- **Full Documentation**: `forecasting/README.md`
- **Examples**: `forecasting/examples.py`
- **Configuration**: `forecasting/config.py`
- **Python Package Docs**: [statsmodels.tsa.statespace.sarimax](https://www.statsmodels.org/stable/generated/statsmodels.tsa.statespace.sarimax.SARIMAX.html)

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-21
