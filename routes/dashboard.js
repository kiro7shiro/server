const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/authorize.js')

// dashboard
router.get('/', ensureAuthenticated, function (req, res) {
    const { projects } = req.app.locals.server
    res.render('dashboard', {
        user: req.user,
        projects: projects.map(function (project) {
            return project.name
        })
    })
})

module.exports = router
