// load env config
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true })
// setup express
const express = require('express')
const app = express()
// setup server
const logger = require('./logger.js')
const { Server } = require('./src/Server.js')
const server = new Server(logger, app, { projectsPath: process.env.PROJECTS })

module.exports = server
