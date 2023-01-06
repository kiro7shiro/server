const cors = require('cors')
const express = require('express')
const ejsLayouts = require('express-ejs-layouts')
const fs = require('fs')
const flash = require('connect-flash')
const http = require('http')
const https = require('https')
const session = require('express-session')
const path = require('path')
const passport = require('passport')
const { promisify } = require('util')

const { ensureAuthenticated } = require('../config/authorize.js')
const { DatabaseConnection } = require('./DatabaseConnection.js')
const { Project } = require('./Project.js')

class Server {
    /**
     * Setup the server
     * @param {Object} logger a winston logger object
     * @param {Object} app the express js application object
     * @param {Object} [options]
     * @param {String} [options.projectsPath] path where the projects are stored
     * @param {Number} [options.httpPort] port number for the http server
     * @param {Number} [options.httpsPort] port number for the https server
     */
    constructor(logger, app, { projectsPath = './', httpPort = 80, httpsPort = 443 } = {}) {
        // instance
        this.logger = logger
        this.app = app
        this.ports = {
            http: httpPort,
            https: httpsPort,
        }
        this.projects = []
        // FIXME : projectsPath setting 
        this.projectsPath = path.resolve(process.env.PROJECTS)
        // mongodb
        const { DB_CLUSTER, DB_USER, DB_USER_PASSWORD } = process.env
        this.dbConnection = new DatabaseConnection(DB_USER, DB_USER_PASSWORD, DB_CLUSTER)
        // http
        this.running = false
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
        //passport config
        require('../config/passport.js')(passport)
        // express session
        app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: true,
                saveUninitialized: true,
            })
        )
        app.use(passport.initialize())
        app.use(passport.session())
        //use flash
        app.use(flash())
        app.use(function (req, res, next) {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            next()
        })
        // self reference
        app.locals.server = this
        // add basic routes
        app.use('/', require('../routes/index.js'))
        app.use('/dashboard', require('../routes/dashboard.js'))
        app.use('/users', require('../routes/users.js'))
    }
    /**
     * Add a project to host on the server.
     * @param {Project} project new project to be hosted
     */
    add(project) {
        this.app.use(`/${project.name}`, ensureAuthenticated, project.app)
        this.logger.log('info', `added route for: /${project.name}`)
    }
    /**
     * Initalize the server and startup listening.
     */
    async initalize() {
        try {
            // database
            await this.dbConnection.connect()
            this.logger.log('info', 'Database connected')
            // projects
            const projects = this.projects = await this.listProjects()
            for (let pCnt = 0; pCnt < projects.length; pCnt++) {
                const project = projects[pCnt]
                this.add(project)
            }
            // startup
            await this.listen({ httpPort: this.ports.http, httpsPort: this.ports.https })
        } catch (error) {
            return error
        }
    }
    /**
     * Start http and https server. Usually not called directly.
     * Call initalize() instead.
     * @param {Object} [options]
     * @param {Number} [options.httpPort] port number for the http server
     * @param {Number} [options.httpsPort] port number for the https server
     */
    async listen({ httpPort = 80, httpsPort = 443 } = {}) {
        try {
            const httpPromise = promisify(this.httpServer.listen.bind(this.httpServer))
            const httpsPromise = promisify(this.httpsServer.listen.bind(this.httpsServer))
            await httpPromise(httpPort)
            this.logger.log('info', `HTTP server listening on port: ${httpPort}`)
            await httpsPromise(httpsPort)
            this.logger.log('info', `HTTPS server listening on port: ${httpsPort}`)
            this.running = true
        } catch (error) {
            return error
        }
    }
    /**
     * List directories in the projects folder.
     */
    async listProjects() {
        try {
            const root = path.resolve(this.projectsPath)
            const self = path.resolve(__dirname, '../')
            const projects = (await fs.promises.readdir(root))
                .filter(function (item) {
                    const file = path.resolve(root, item)
                    return fs.statSync(file).isDirectory() && file !== self
                })
                .map(function (item) {
                    const file = path.resolve(root, item)
                    const project = new Project(file)
                    return project
                })
            return projects
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
            this.running = false
        } catch (error) {
            return error
        }
    }
}

module.exports = { Server }
