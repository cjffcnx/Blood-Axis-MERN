/**
 * Logger utility for Node.js backend
 * Provides consistent logging across the application
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

class Logger {
    constructor(name) {
        this.name = name;
        this.level = LOG_LEVELS[LOG_LEVEL] || LOG_LEVELS.INFO;
        this.logFile = path.join(LOG_DIR, 'application.log');
    }

    _formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `${timestamp} - ${this.name} - ${level} - ${message}`;
    }

    _writeLog(level, message) {
        const formatted = this._formatMessage(level, message);

        // Console output
        const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
        console[consoleMethod](formatted);

        // File output
        try {
            fs.appendFileSync(this.logFile, formatted + '\n');
        } catch (err) {
            console.error(`Failed to write to log file: ${err.message}`);
        }
    }

    error(message) {
        if (this.level >= LOG_LEVELS.ERROR) {
            this._writeLog('ERROR', message);
        }
    }

    warn(message) {
        if (this.level >= LOG_LEVELS.WARN) {
            this._writeLog('WARN', message);
        }
    }

    info(message) {
        if (this.level >= LOG_LEVELS.INFO) {
            this._writeLog('INFO', message);
        }
    }

    debug(message) {
        if (this.level >= LOG_LEVELS.DEBUG) {
            this._writeLog('DEBUG', message);
        }
    }
}

module.exports = {
    getLogger: (name) => new Logger(name),
    Logger,
};
