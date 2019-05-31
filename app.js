const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Authentication = require('./middlewares/auth')

const app = express()

dotenv.config()


// Root Level Middlewares
Authentication.set(app)
app.use(bodyParser.json())


// Route Middlewares
// app.use('/sites', sitesRoute)

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log('connected to DB')
  app.listen('8080')
})

