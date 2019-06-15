const mongoose = require('mongoose')

const UserSchema = mongoose.Schema(
  {
    googleID: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      lastName: {
        type: String,
        required: true
      },
      firstName: {
        type: String,
        required: true
      }
    },
    displayName: {
      type: String,
      required: true
    },
    photo: {
      original: {
        type: String,
        required: false
      }
    },
    appFolder: {
      type: String
    }
  },
  { timestamps: true, virtuals: true }
)

// Avatar size 90px
UserSchema.virtual('photo.avatar').get(function () {
  if (this.photo && this.photo.original) {
    return this.photo.original + '?sz=90'
  } else return null
})

module.exports = mongoose.model('User', UserSchema)
