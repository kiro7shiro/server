// load env config
require('dotenv').config()
// setup express
const express = require('express')
const app = express()
// setup server
const logger = require('./logger.js')
const { Server } = require('./src/Server.js')
const server = new Server(logger, app, { projectsPath: process.env.PROJECTS })
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
main().catch(function (error) {
    logger.error(error)
})
