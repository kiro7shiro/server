const { promisify } = require('util')
const fs = require('fs')
const { createLogger, format, transports } = require('winston')
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
    constructor(app) {
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
            console.log('Database connected')
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
            console.log(`HTTP server listening on port: ${httpPort}`)
            await httpsPromise(httpsPort)
            console.log(`HTTPS server listening on port: ${httpsPort}`)
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
            console.log('DbConnection closed')
            const httpPromise = promisify(this.httpServer.close.bind(this.httpServer))
            const httpsPromise = promisify(this.httpsServer.close.bind(this.httpsServer))
            await httpPromise()
            console.log('HTTP server closed')
            await httpsPromise()
            console.log('HTTPS server closed')
        } catch (error) {
            return error
        }
    }
}

module.exports = { Server }
