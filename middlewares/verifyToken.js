const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Site = require('../models/site')
const GoogleTokens = require('../models/googleTokens')
const { fetchWrapper } = require('../helpers/fetch')

const GOOGLE_AUTHORIZATION_SERVER = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_TOKENINFO = 'https://www.googleapis.com/oauth2/v1/tokeninfo'

function privateUser(req, res, next) {
  const token = req.header('auth-token')

  if (!token) return res.status(401).send('Access denied')

  try {
    const userVerified = jwt.verify(token, process.env.TOKEN_SECRET)
    req.userId = userVerified._id
    next()
  } catch (err) {
    res.status(401).send('Invalid Token')
  }
}

function getUser(req, res, next) {
  const token = req.header('auth-token')
  let userVerified = null

  if (token) {
    try {
      userVerified = jwt.verify(token, process.env.TOKEN_SECRET)
    } catch (err) {
      res.status(401).send('Invalid Token')
    }
  }

  req.userId = userVerified._id
  next()
}

async function getUserFromData({ userId, params }) {
  let user = null

  if (userId) {
    user = await User.findById(userId)
  } else if (params.siteName) {
    const site = await Site.findOne({ name: params.siteName })
    user = await User.findById(site.owner)
  }

  return user
}

// TODO check google token
async function google(req, res, next) {
  const user = await getUserFromData(req)
  const googleTokens = await GoogleTokens.findOne({ googleID: user.googleID })

  try {
    const isTokenValid = await fetchWrapper({
      url: GOOGLE_TOKENINFO,
      params: { access_token: googleTokens.accessToken }
    })

    if (isTokenValid.ok) {
      req.user = user
      req.googleToken = googleTokens.accessToken
      next()
    } else {
      const getNewToken = await fetchWrapper({
        url: GOOGLE_AUTHORIZATION_SERVER,
        params: {
          refresh_token: googleTokens.refreshToken,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          grant_type: 'refresh_token'
        },
        headers: {
          method: 'POST'
        }
      })

      if (getNewToken.ok) {
        const newToken = await getNewToken.json()
        await GoogleTokens.updateOne(
          { _id: googleTokens.id },
          { $set: { accessToken: newToken.access_token } }
        )

        req.user = user
        req.googleToken = newToken.access_token
        next()
      } else {
        // if fails logout the app to create new tokens
        res.status(401).send('GoogleTokens invalid')
      }
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

module.exports = {
  privateUser,
  getUser,
  google
}
