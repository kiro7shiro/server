const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/authorize.js')

// dashboard
router.get('/', ensureAuthenticated, function (req, res) {
    
    res.render('dashboard', {
        user: req.user,
        projects: [],
    })
})

module.exports = router
