const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  googleID: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true,  unique: true },
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
