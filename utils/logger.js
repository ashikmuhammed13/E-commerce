const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info', // Default logging level
    format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        // Console transport for development
        new transports.Console(),
        
        // File transport for persistent logs
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

module.exports = logger;
