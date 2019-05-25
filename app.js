const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')

app.use(bodyParser.json())

// import routes
const sitesRoute = require('./routes/sites')

app.use('/sites', sitesRoute)

// Routes
app.get('/', (req, res) => {
  res.send('We are on home')
})

mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true },
  () => {console.log('connected to DB')}
)

// Listening
app.listen('8080')
