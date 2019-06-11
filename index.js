const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const Authentication = require('./middlewares/auth')
const sitesRoute = require('./routes/sites')
const foldersRoute = require('./routes/folders')

const app = express()

dotenv.config()

// Root Level Middlewares
Authentication.set(app)
app.use(express.json())

// Routes
app.use('/sites', sitesRoute)
app.use('/folders', foldersRoute)

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log('connected to DB')
  app.listen('8080')
})
