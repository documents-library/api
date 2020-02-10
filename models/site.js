const mongoose = require('mongoose')

const SiteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      min: 6,
      max: 70,
      required: true
    },
    // TODO: New
    longName: {
      type: String,
      min: 6,
      max: 140,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      required: true
    },
    googleFolderId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Sites', SiteSchema)
