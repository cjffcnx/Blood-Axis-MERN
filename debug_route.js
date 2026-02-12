const { exec } = require('child_process');
const path = require('path');

const organisationId = '6922ae4a3dae846e73b5a839';

const forecastingPath = path.join(__dirname, 'forecasting').replace(/\\/g, '\\\\');

const pythonCmd = `python -c "
import sys
sys.path.append('${forecastingPath}')
from api import ForecastAPI
import json

api = ForecastAPI()
result = api.get_latest_forecast('${organisationId}')
print(json.dumps(result, default=str))
"`;

console.log("Running command from:", process.cwd());
console.log("Command:", pythonCmd);

exec(pythonCmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    console.log("--- ERROR ---");
    console.log(error);
    console.log("--- STDERR ---");
    console.log(stderr);
    console.log("--- STDOUT ---");
    console.log(stdout);
    console.log("----------------");

    try {
        JSON.parse(stdout);
        console.log("JSON Parse Success");
    } catch (e) {
        console.log("JSON Parse Failed:", e.message);
    }
});
