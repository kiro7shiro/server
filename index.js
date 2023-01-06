// load env config
require('dotenv').config()
// setup express
const express = require('express')
const app = express()
// setup server
const logger = require('./logger.js')
const { Server } = require('./src/Server.js')
const server = new Server(logger, app, { projectsPath: process.env.PROJECTS })

module.exports = server
