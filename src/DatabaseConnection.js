const mongoose = require('mongoose')

class DatabaseConnection {
    constructor(user, password, cluster) {
        this.connected = false
        this.uri = `mongodb+srv://${user}:${password}@${cluster}/?retryWrites=true&w=majority`
    }
    async connect() {
        try {
            await mongoose.connect(this.uri)
            this.connected = true
        } catch (error) {
            return error
        }
    }
    async disconnect() {
        try {
            await mongoose.disconnect()
            this.connected = false
        } catch (error) {
            return error
        }
    }
}

module.exports = { DatabaseConnection }