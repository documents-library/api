const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')

const Authentication = require('./middlewares/auth')
const sitesRoute = require('./routes/sites')
const foldersRoute = require('./routes/folders')
const filesRoute = require('./routes/files')

const app = express()
app.use(cors())

dotenv.config()

// Root Level Middlewares
Authentication.set(app)
app.use(express.json())

// Routes
app.use('/sites', sitesRoute)
app.use('/folders', foldersRoute)
app.use('/files', filesRoute)

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log('✓ connected to DB')
  app.listen('8080')
  console.log('✓ listen port 8080')
})
