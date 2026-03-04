/**
 * Forecast Scheduler
 * 
 * Runs forecasts automatically on a schedule using node-cron.
 * By default, runs daily at 2 AM.
 */

const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const User = require('../models/userModel');
const Forecast = require('../models/forecastModel');
const logger = require('../utils/logger').getLogger('ForecastScheduler');

const PYTHON_FORECASTING_PATH = path.join(
    __dirname,
    '..',
    '..',
    'forecasting'
);

class ForecastScheduler {
    constructor() {
        this.isRunning = false;
        this.lastRunTime = null;
    }

    /**
     * Start the forecast scheduler
     * @param {string} scheduleExpression - Cron expression (default: '0 2 * * *' = 2 AM daily)
     */
    start(scheduleExpression = '0 2 * * *') {
        try {
            logger.info(`Starting forecast scheduler with schedule: ${scheduleExpression}`);

            this.task = cron.schedule(scheduleExpression, async () => {
                await this.runForecasts();
            });

            this.isRunning = true;
            logger.info('Forecast scheduler started successfully');
        } catch (error) {
            logger.error(`Failed to start scheduler: ${error.message}`);
        }
    }

    /**
     * Stop the scheduler
     */
    stop() {
        if (this.task) {
            this.task.stop();
            this.isRunning = false;
            logger.info('Forecast scheduler stopped');
        }
    }

    /**
     * Run forecasts for all organisations
     */
    async runForecasts() {
        try {
            const startTime = Date.now();
            logger.info('Starting scheduled forecast run...');

            // Get all unique organisations
            const organisations = await User.distinct('_id', {
                role: { $in: ['org', 'hospital'] },
            });

            logger.info(`Found ${organisations.length} organisations to forecast for`);

            let successCount = 0;
            let failureCount = 0;

            // Run forecast for each organisation
            for (const orgId of organisations) {
                try {
                    await this.runForecastForOrganisation(orgId);
                    successCount++;
                } catch (error) {
                    logger.error(
                        `Failed to forecast for organisation ${orgId}: ${error.message}`
                    );
                    failureCount++;
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            logger.info(
                `Scheduled forecast run completed in ${duration}s. ` +
                `Success: ${successCount}, Failed: ${failureCount}`
            );

            this.lastRunTime = new Date();
        } catch (error) {
            logger.error(`Critical error in scheduled forecast run: ${error.message}`);
        }
    }

    /**
     * Run forecast for a specific organisation
     * @param {string} organisationId - Organisation ID
     * @returns {Promise<boolean>} - Success status
     */
    runForecastForOrganisation(organisationId) {
        return new Promise((resolve, reject) => {
            const pythonScript = path.join(PYTHON_FORECASTING_PATH, 'cli.py');
            const pythonCmd = `python "${pythonScript}" "${organisationId}" --days-back 180 --json`;

            exec(pythonCmd, { maxBuffer: 10 * 1024 * 1024 }, async (error, stdout, stderr) => {
                try {
                    if (error) {
                        logger.warn(
                            `Forecast failed for organisation ${organisationId}: ${stderr}`
                        );
                        reject(new Error(stderr));
                        return;
                    }

                    const result = JSON.parse(stdout);

                    // Save metadata to database
                    if (result.forecasts && result.forecasts.length > 0) {
                        const forecastRecord = new Forecast({
                            organisationId,
                            forecastDate: new Date(),
                            status: result.status,
                            totalForecasts: result.forecasts.length,
                            averageConfidence:
                                result.forecasts.reduce((sum, f) => sum + (f.confidence || 0.5), 0) /
                                result.forecasts.length,
                            modelTypes: [...new Set(result.forecasts.map((f) => f.model_type))],
                            metadata: {
                                daysBack: 180,
                                bloodGroupsCovered: [
                                    ...new Set(result.forecasts.map((f) => f.blood_group)),
                                ].length,
                                bloodGroupsWithErrors: result.errors ? result.errors.length : 0,
                            },
                        });

                        await forecastRecord.save();
                        logger.info(`Forecast completed for organisation ${organisationId}`);
                    }

                    resolve(true);
                } catch (parseError) {
                    logger.error(
                        `Failed to process forecast for organisation ${organisationId}: ${parseError.message}`
                    );
                    reject(parseError);
                }
            });
        });
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRunTime: this.lastRunTime,
        };
    }

    /**
     * Manually trigger forecast run
     */
    async triggerRun() {
        if (this.isRunning) {
            await this.runForecasts();
            return { success: true, message: 'Forecast run triggered' };
        }
        return { success: false, message: 'Scheduler is not running' };
    }
}

module.exports = ForecastScheduler;
