const User = require("../models/User.js")

module.exports = function (passport) {
    passport.use(User.createStrategy())
    passport.serializeUser(User.serializeUser())
    passport.deserializeUser(User.deserializeUser())
} 