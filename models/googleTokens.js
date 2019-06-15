const mongoose = require('mongoose')

const GoogleTokens = mongoose.Schema(
  {
    googleID: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('GoogleTokens', GoogleTokens)
