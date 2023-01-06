const server = require('./index.js')
const { logger } = server
/**
 * Main entry point
 * @returns {Error}
 */
async function main() {
    process.on('SIGINT', async function () {
        await server.terminate()
        logger.log('info', 'Server terminated')
    })
    try {
        logger.log('info', 'Initalize server')
        await server.initalize()
    } catch (error) {
        return error
    }
}
// startup
main().catch(async function (error) {
    logger.error(error)
    if (server.running) {
        await server.terminate()
        logger.log('info', 'Server terminated')
    }
})
