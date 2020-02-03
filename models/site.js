const mongoose = require('mongoose')

const SiteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      min: 6,
      max: 140,
      required: true
    },
    // TODO: add requires and min and max lenght for longName and description
    longName: {
      type: String,
      required: false
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
  },
  { timestamps: true }
)

module.exports = mongoose.model('Sites', SiteSchema)
