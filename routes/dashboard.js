const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/authorize.js')

// locals
router.use(function (req, res, next) {
    res.locals.user = req.user
    res.locals.title = 'kiros-server'
    next()
})

// dashboard
router.get('/', ensureAuthenticated, function (req, res) {
    const { projects } = req.app.locals.server
    res.render('dashboard', { projects })
})

module.exports = router
