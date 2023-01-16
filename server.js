#!/usr/bin/env node

const server = require('./index.js')
const { logger } = server
/**
 * Main entry point
 * @returns {Error}
 */
async function main() {
    process.on('SIGINT', async function () {
        console.log(`\n`)
        await server.terminate()
        logger.log('info', 'Server terminated')
        process.exit(0)
    })
    try {
        logger.log('info', 'Initalizing...')
        await server.initalize()
        logger.log('info', '...done')
    } catch (error) {
        logger.error(error)
        return error
    }
}
// startup
main().catch(async function (error) {
    logger.error(error)
    if (server.running) {
        await server.terminate()
        logger.log('info', 'Server terminated')
        process.exit(1)
    }
})
