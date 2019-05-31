const passport = require('passport')
const User = require('../models/user')
const router = require('express').Router()
const GoogleStrategy = require('passport-google-oauth20')

module.exports = {
  set(app) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/auth/google/callback'
    }, async (accessToken, refreshToken, profile, cb) => {
      let user = await User.findOne({ googleID: profile.id })

      if (user === null) {
        user = new User({
          googleID: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        })

        await user.save()
      }

      cb(null, user.toObject())
    }))

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))
    
    app.use(passport.initialize())
    app.get('/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    )

    app.get('/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      (req, res) => {
        res.redirect('/')
      }
    )
  }
}