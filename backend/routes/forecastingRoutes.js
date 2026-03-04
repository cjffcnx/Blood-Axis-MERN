/**
 * Blood Demand Forecasting Routes
 * 
 * This module handles API endpoints for blood demand forecasting.
 * It interfaces with the Python forecasting module via child processes.
 */

const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const router = express.Router();
const requireLogin = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/adminMiddleware');
const Forecast = require('../models/forecastModel');
const { getLogger } = require('../utils/logger');
const logger = getLogger('forecastingRoutes');

// Forecasting module lives at <project>/blood/forecasting
const PYTHON_FORECASTING_PATH = path.join(__dirname, '..', 'forecasting');

/**
 * Get blood demand forecast for an organisation
 * POST /api/forecasting/forecast
 * 
 * Body:
 * {
 *   organisationId: string,
 *   daysBack: number (optional, default: 180),
 *   saveToDb: boolean (optional, default: true)
 * }
 */
router.post('/forecast', requireLogin, async (req, res) => {
    try {
        const { organisationId, daysBack = 180, hoursBack, saveToDb = true } = req.body;

        // Fallback: if organisationId not provided, use the caller's userId (org users use their own id)
        const targetOrgId = organisationId || req.body.userId;

        const effectiveDaysBack = hoursBack ? Number(hoursBack) / 24 : Number(daysBack);
        if (Number.isNaN(effectiveDaysBack) || effectiveDaysBack <= 0) {
            return res.status(400).send({
                success: false,
                message: 'Invalid lookback window'
            });
        }

        if (!targetOrgId) {
            return res.status(400).send({
                success: false,
                message: 'organisationId is required',
            });
        }

        logger.info(`Forecast request for organisation ${targetOrgId}`);

        // Check if user has permission to access this organisation
        // (This should be customized based on your authentication logic)
        const userOrg = req.user?.organisationId;
        if (userOrg && userOrg !== targetOrgId) {
            return res.status(403).send({
                success: false,
                message: 'You do not have permission to access this organisation',
            });
        }

        // Call Python forecasting module
        const pythonScript = path.join(PYTHON_FORECASTING_PATH, 'cli.py');
        const pythonCmd = `python "${pythonScript}" "${targetOrgId}" --days-back ${effectiveDaysBack} ${!saveToDb ? '--no-save' : ''
            } --json`;

        exec(pythonCmd, { maxBuffer: 10 * 1024 * 1024, timeout: 60000 }, async (error, stdout, stderr) => {
            if (error) {
                logger.error(`Python forecasting error: ${stderr}`);
                // Check if it's a timeout
                if (error.code === 'ETIMEDOUT') {
                    return res.status(504).send({
                        success: false,
                        message: 'Forecasting request timed out',
                        error: 'The forecasting operation took too long',
                    });
                }
                return res.status(500).send({
                    success: false,
                    message: 'Forecasting failed',
                    error: stderr,
                });
            }

            try {
                // Log the raw output for debugging
                logger.info(`Python forecasting output length: ${stdout.length} characters`);
                logger.debug(`Python forecasting raw output: ${stdout.substring(0, 500)}...`);

                // Ensure stdout is not empty
                if (!stdout || stdout.trim().length === 0) {
                    logger.error('Python script produced empty output');
                    return res.status(500).send({
                        success: false,
                        message: 'Invalid forecast output',
                        error: 'Empty output from forecasting module',
                    });
                }

                const result = JSON.parse(stdout);

                // Save forecast metadata to MongoDB if requested
                if (saveToDb && result.forecasts && result.forecasts.length > 0) {
                    try {
                        const forecastRecord = new Forecast({
                            organisationId: targetOrgId,
                            forecastDate: new Date(),
                            status: result.status,
                            totalForecasts: result.forecasts.length,
                            averageConfidence:
                                result.forecasts.reduce((sum, f) => sum + (f.confidence || 0.5), 0) /
                                result.forecasts.length,
                            modelTypes: [...new Set(result.forecasts.map((f) => f.model_type))],
                        });

                        await forecastRecord.save();
                        logger.info(`Forecast metadata saved for organisation ${organisationId}`);
                    } catch (dbError) {
                        logger.warn(
                            `Could not save forecast metadata: ${dbError.message}`
                        );
                        // Don't fail the request if metadata save fails
                    }
                }

                return res.status(200).send({
                    success: result.status === 'success' || result.status === 'partial_success',
                    status: result.status,
                    data: result.forecasts,
                    errors: result.errors,
                    message:
                        result.status === 'success'
                            ? 'Forecast generated successfully'
                            : result.status === 'partial_success'
                                ? 'Forecast generated with some errors'
                                : 'Forecast generation failed',
                });
            } catch (parseError) {
                logger.error(`Failed to parse forecast output: ${parseError.message}`);
                logger.error(`Raw stdout was: ${stdout}`);
                logger.error(`Raw stderr was: ${stderr}`);
                return res.status(500).send({
                    success: false,
                    message: 'Invalid forecast output',
                    error: `JSON parse error: ${parseError.message}`,
                    details: `Output was ${stdout.length} characters`,
                });
            }
        });
    } catch (error) {
        logger.error(`Forecast endpoint error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

/**
 * Get latest forecast for an organisation
 * GET /api/forecasting/latest/:organisationId
 */
router.get('/latest/:organisationId', requireLogin, async (req, res) => {
    try {
        const { organisationId } = req.params;

        if (!organisationId || organisationId === 'undefined') {
            return res.status(400).send({
                success: false,
                message: 'organisationId is required',
            });
        }

        // Check permission
        const userOrg = req.user?.organisationId;
        if (userOrg && userOrg !== organisationId) {
            return res.status(403).send({
                success: false,
                message: 'You do not have permission to access this organisation',
            });
        }

        // Fetch from MongoDB forecasts collection
        logger.info(`Fetching latest forecast for organisation ${organisationId}`);
        const pythonScript = path.join(PYTHON_FORECASTING_PATH, 'fetch_latest.py');
        const pythonCmd = `python "${pythonScript}" "${organisationId}"`;

        logger.debug(`Executing: ${pythonCmd}`);
        logger.debug(`Working directory: ${path.join(__dirname, '..')}`);

        exec(pythonCmd, {
            maxBuffer: 10 * 1024 * 1024,
            timeout: 30000,
            cwd: path.join(__dirname, '..'),
            shell: process.platform === 'win32' ? 'powershell.exe' : undefined
        }, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error fetching forecast: ${stderr}`);
                logger.error(`Error details: ${error.message}`);
                return res.status(500).send({
                    success: false,
                    message: 'Failed to fetch forecast',
                    error: stderr || error.message,
                });
            }

            try {
                // Log raw output for debugging
                logger.debug(`Forecast fetch output length: ${stdout.length} characters`);
                logger.debug(`Forecast fetch stderr: ${stderr}`);

                // Check for empty output
                if (!stdout || stdout.trim().length === 0) {
                    logger.error('Python script produced empty output');
                    return res.status(500).send({
                        success: false,
                        message: 'No forecast data returned',
                        error: 'Empty output from Python script'
                    });
                }

                const result = JSON.parse(stdout.trim());
                logger.info(`Latest forecast fetch result: success=${result.success}, ` +
                    `data keys=${result.data ? Object.keys(result.data).join(',') : 'none'}`);

                return res.status(200).send(result);
            } catch (parseError) {
                logger.error(`Failed to parse forecast output: ${parseError.message}`);
                logger.error(`Raw stdout (first 1000 chars): ${stdout.substring(0, 1000)}`);
                logger.error(`Raw stderr: ${stderr}`);
                return res.status(500).send({
                    success: false,
                    message: 'Invalid forecast output',
                    error: `JSON parse error: ${parseError.message}`,
                    details: stderr || 'Check server logs for details'
                });
            }
        });
    } catch (error) {
        logger.error(`Get latest forecast error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

/**
 * Get forecast history for an organisation
 * GET /api/forecasting/history/:organisationId
 * 
 * Query params:
 * - limit: number of records to fetch (default: 10)
 * - skip: number of records to skip (default: 0)
 */
router.get('/history/:organisationId', requireLogin, async (req, res) => {
    try {
        const { organisationId } = req.params;
        const { limit = 10, skip = 0 } = req.query;

        // Check permission
        const userOrg = req.user.organisationId;
        if (userOrg && userOrg !== organisationId) {
            return res.status(403).send({
                success: false,
                message: 'You do not have permission to access this organisation',
            });
        }

        const forecasts = await Forecast.find({ organisationId })
            .sort({ forecastDate: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Forecast.countDocuments({ organisationId });

        return res.status(200).send({
            success: true,
            data: forecasts,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
            },
        });
    } catch (error) {
        logger.error(`Get forecast history error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

/**
 * Get forecast statistics for an organisation
 * GET /api/forecasting/stats/:organisationId
 */
router.get('/stats/:organisationId', requireLogin, async (req, res) => {
    try {
        const { organisationId } = req.params;

        // Check permission
        const userOrg = req.user.organisationId;
        if (userOrg && userOrg !== organisationId) {
            return res.status(403).send({
                success: false,
                message: 'You do not have permission to access this organisation',
            });
        }

        const stats = await Forecast.aggregate([
            { $match: { organisationId } },
            {
                $group: {
                    _id: null,
                    totalForecasts: { $sum: 1 },
                    avgConfidence: { $avg: '$averageConfidence' },
                    successRate: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
                        },
                    },
                    lastForecastDate: { $max: '$forecastDate' },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalForecasts: 1,
                    avgConfidence: { $round: ['$avgConfidence', 3] },
                    successRate: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ['$successRate', '$totalForecasts'] },
                                    100,
                                ],
                            },
                            2,
                        ],
                    },
                    lastForecastDate: 1,
                },
            },
        ]);

        return res.status(200).send({
            success: true,
            data: stats.length > 0 ? stats[0] : {},
        });
    } catch (error) {
        logger.error(`Get forecast stats error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

module.exports = router;
