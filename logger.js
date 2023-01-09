const path = require('path')
const { createLogger, format, transports } = require('winston')

const logPath = path.resolve(__dirname, 'logs')
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'HH:mm:ss YYYY-MM-DD'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'kiros-server' },
    transports: [
        new transports.File({ filename: `${logPath}/kiros-server-error.log`, level: 'error' }),
        new transports.File({ filename: `${logPath}/kiros-server-combined.log`, options: { flags: 'w' } })
    ]
})
// If we're not in production then **ALSO** log to the `console`.
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(function (info) {
                    const { level, timestamp, message, service } = info
                    return `[${service}][${level}] ${timestamp}: ${message}`
                })
            )
        })
    )
}

module.exports = logger
