const { promisify } = require('util')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const http = require('http')
const https = require('https')
const ejsLayouts = require('express-ejs-layouts')
const { DatabaseConnection } = require('./DatabaseConnection.js')

// load env config
require('dotenv').config()

class Server {
    /**
     * Setup the server
     * @param {Object} app the express js application object
     */
    constructor(logger, app) {
        this.logger = logger
        this.app = app
        // mongodb
        const { DB_CLUSTER, DB_USER, DB_USER_PASSWORD } = process.env
        this.dbConnection = new DatabaseConnection(DB_USER, DB_USER_PASSWORD, DB_CLUSTER)
        // http
        this.httpServer = http.createServer(app)
        this.httpsServer = https.createServer(
            {
                key: fs.readFileSync(process.env.HTTPS_KEY),
                cert: fs.readFileSync(process.env.HTTPS_CERT),
            },
            app
        )
        // bodyParser
        app.use(express.urlencoded({ extended: false }))
        // cors
        app.use(cors())
        // ejs
        app.set('view engine', 'ejs')
        app.use(ejsLayouts)
    }
    /**
     * Initalize the server and startup listening.
     */
    async initalize() {
        try {
            // mongoose
            await this.dbConnection.connect()
            this.logger.log('info', 'Database connected')
            // startup
            await this.listen()
        } catch (error) {
            return error
        }
    }
    /**
     * Start listening on ports 80 and 443. Usually not called directly.
     * Call initalize() insead.
     */
    async listen({ httpPort = 80, httpsPort = 443 } = {}) {
        try {
            const httpPromise = promisify(this.httpServer.listen.bind(this.httpServer))
            const httpsPromise = promisify(this.httpsServer.listen.bind(this.httpsServer))
            await httpPromise(httpPort)
            this.logger.log('info', `HTTP server listening on port: ${httpPort}`)
            await httpsPromise(httpsPort)
            this.logger.log('info', `HTTPS server listening on port: ${httpsPort}`)
        } catch (error) {
            return error
        }
    }
    /**
     * Terminate the server and cancel all operations.
     */
    async terminate() {
        try {
            await this.dbConnection.disconnect()
            this.logger.log('info', 'Database disconnected')
            const httpPromise = promisify(this.httpServer.close.bind(this.httpServer))
            const httpsPromise = promisify(this.httpsServer.close.bind(this.httpsServer))
            await httpPromise()
            this.logger.log('info', 'HTTP server closed')
            await httpsPromise()
            this.logger.log('info', 'HTTPS server closed')
        } catch (error) {
            return error
        }
    }
}

module.exports = { Server }
