const jwt = require('express-jwt')

module.exports = {
    authorize: function (roles) {
        if (typeof roles === 'string') {
            roles = [roles]
        }
        return [
            jwt({ secret: process.env.SESSION_SECRET, algorithms: ['HS256'] }),
            function (req, res, next) {
                if (roles.length && !roles.includes(req.user.role)) {
                    return res.status(401).json({ message: 'unauthorized'})
                }
                next()
            }
        ]
    },
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        req.flash('error_msg', 'please login to view this resource')
        res.redirect('/users/login')
    }
}