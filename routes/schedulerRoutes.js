/**
 * Scheduler Management Routes
 * 
 * Admin endpoints to control the forecast scheduler
 */

const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/adminMiddleware');
const ForecastScheduler = require('../utils/forecastScheduler');
const logger = require('../utils/logger').getLogger('SchedulerRoutes');

let scheduler = null;

/**
 * Initialize the scheduler
 * This should be called from the main server file
 */
function initializeScheduler(scheduleExpression = '0 2 * * *') {
    scheduler = new ForecastScheduler();
    scheduler.start(scheduleExpression);
    return scheduler;
}

/**
 * Get scheduler status
 * GET /api/v1/admin/scheduler/status
 */
router.get('/status', requireLogin, requireAdmin, (req, res) => {
    try {
        if (!scheduler) {
            return res.status(400).send({
                success: false,
                message: 'Scheduler not initialized',
            });
        }

        const status = scheduler.getStatus();
        return res.status(200).send({
            success: true,
            status,
        });
    } catch (error) {
        logger.error(`Scheduler status error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

/**
 * Start the scheduler
 * POST /api/v1/admin/scheduler/start
 */
router.post('/start', requireLogin, requireAdmin, (req, res) => {
    try {
        if (!scheduler) {
            scheduler = initializeScheduler();
            return res.status(200).send({
                success: true,
                message: 'Scheduler initialized and started',
            });
        }

        if (scheduler.isRunning) {
            return res.status(400).send({
                success: false,
                message: 'Scheduler is already running',
            });
        }

        scheduler.start();
        return res.status(200).send({
            success: true,
            message: 'Scheduler started successfully',
        });
    } catch (error) {
        logger.error(`Scheduler start error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

/**
 * Stop the scheduler
 * POST /api/v1/admin/scheduler/stop
 */
router.post('/stop', requireLogin, requireAdmin, (req, res) => {
    try {
        if (!scheduler || !scheduler.isRunning) {
            return res.status(400).send({
                success: false,
                message: 'Scheduler is not running',
            });
        }

        scheduler.stop();
        return res.status(200).send({
            success: true,
            message: 'Scheduler stopped successfully',
        });
    } catch (error) {
        logger.error(`Scheduler stop error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

/**
 * Trigger a manual forecast run
 * POST /api/v1/admin/scheduler/trigger
 */
router.post('/trigger', requireLogin, requireAdmin, async (req, res) => {
    try {
        if (!scheduler) {
            scheduler = initializeScheduler();
        }

        const result = await scheduler.triggerRun();
        return res.status(result.success ? 200 : 400).send(result);
    } catch (error) {
        logger.error(`Scheduler trigger error: ${error.message}`);
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

module.exports = {
    router,
    initializeScheduler,
};
