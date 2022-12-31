const { createLogger, format, transports } = require('winston')
const express = require('express')
const { Server } = require('./src/Server.js')

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'HH:mm:ss YYYY-MM-DD',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'kiros-server' },
    transports: [
        /* Write to all logs with level `info` and below to `kiros-dev-server-combined.log`.
        Write all logs error (and below) to `kiros-dev-server-error`. */
        new transports.File({ filename: 'kiros-server-error.log', level: 'error' }),
        new transports.File({ filename: 'kiros-server-combined.log' }),
    ],
})
/* If we're not in production then **ALSO** log to the `console`
with the colorized simple format. */
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(function (info) {
                    return `[${info.level}] ${info.timestamp}: ${info.message}`
                })
            ),
        })
    )
}
const app = express()
const server = new Server(logger, app)

async function main() {
    await server.initalize()
    await server.terminate()
}

main().catch(function (error) {
    console.error(error)
})
