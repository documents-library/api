const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// import routes
const sitesRoute = require('./routes/sites')
const authRoute = require('./routes/auth')

dotenv.config()

// Middlewares
app.use(bodyParser.json())

// Route Middlewares
app.use('/sites', sitesRoute)
app.use('/auth', authRoute)

mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true },
  () => {console.log('connected to DB')}
)

app.listen('8080')
