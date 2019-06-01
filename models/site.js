const mongoose = require('mongoose')

const SiteSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  owner: {
    type: String,
    required: true
  },
  googleFolderId: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Sites', SiteSchema)
