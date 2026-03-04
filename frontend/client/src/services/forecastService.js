import API from './API';

// Get latest 7-day forecast for organisation
export const getLatestForecast = async (organisationId) => {
    try {
        console.log('Fetching latest forecast for org:', organisationId);
        const { data } = await API.get(`/forecasting/latest/${organisationId}`);
        console.log('Latest forecast response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching forecast:', error.response?.data);
        throw error.response?.data?.message || 'Failed to fetch forecast';
    }
};

// Generate new forecast
// Default: use last 180 days for historical data analysis
export const generateForecast = async (organisationId, daysBack = 180, hoursBack = null) => {
    try {
        console.log('Generating forecast for org:', organisationId, 'daysBack:', daysBack);
        const { data } = await API.post('/forecasting/forecast', {
            organisationId,
            daysBack,
            hoursBack,
            saveToDb: true,
        });
        console.log('Generate forecast response:', data);
        return data;
    } catch (error) {
        console.error('Error generating forecast:', error.response?.data);
        throw error.response?.data?.message || 'Failed to generate forecast';
    }
};

// Get forecast history
export const getForecastHistory = async (organisationId, limit = 10, skip = 0) => {
    try {
        const { data } = await API.get(
            `/forecasting/history/${organisationId}?limit=${limit}&skip=${skip}`
        );
        return data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch history';
    }
};

// Get forecast statistics
export const getForecastStats = async (organisationId) => {
    try {
        const { data } = await API.get(`/forecasting/stats/${organisationId}`);
        return data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch statistics';
    }
};
