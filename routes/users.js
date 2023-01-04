const express = require('express')
const passport = require('passport')
const User = require('../models/User.js')
const router = express.Router()

// login
router.get('/login', (req, res) => {
    res.render('login')
})
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next)
})

// register
router.get('/register', (req, res) => {
    res.render('register')
})
router.post('/register', function (req, res) {
    const { logger } = req.app.locals.server
    const { name, email, password, password2 } = req.body
    const errors = []
    // check fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' })
    }
    // check if match
    if (password !== password2) {
        errors.push({ msg: `passwords don't match` })
    }
    // check if password is more than 6 characters
    if (password.length < 6) {
        errors.push({ msg: 'password at least 6 characters' })
    }
    // validate
    if (errors.length) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
        })
    } else {
        User.register(new User(req.body), req.body.password, function (err, user) {
            if (err) {
                logger.log('error', err)
                req.flash('error_msg', err.message)
                res.redirect('/users/register')
                return
            }
            passport.authenticate('local')(req, res, function () {
                req.flash('success_msg', 'You have now registered!')
                res.redirect('/users/login')
            })
            logger.log('info', `registered user: '${user.name}'`)
        })
    }
})

// logout
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) return next(err)
        req.flash('success_msg', 'You are now logged out!')
        res.redirect('/users/login')
    })
})

module.exports = router
