const express = require('express')
const { Server } = require('./src/Server.js')

const app = express()
const server = new Server(app)

async function main() {
    await server.initalize()
    await server.terminate()    
}

main()
    .catch(function (error) {
        console.error(error)
    })
