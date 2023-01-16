const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    }
})
UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' })
const connection = mongoose.createConnection(process.env.DB_URI, { dbName: process.env.DB_NAME })
module.exports = connection.model('User', UserSchema)
