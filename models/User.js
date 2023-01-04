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
module.exports = mongoose.model('User', UserSchema)