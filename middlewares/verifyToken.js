const jwt = require('jsonwebtoken')

function privateUser (req, res, next) {
  const token = req.header('auth-token')

  if (!token) return res.status(401).send('Access denied')

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET)
    req.user = user
    next()
  } catch (err) {
    res.status(400).send('Invalid Token')
  }
}

function getUser (req, res, next) {
  const token = req.header('auth-token')
  let user = null

  if (token) {
    try {
      user = jwt.verify(token, process.env.TOKEN_SECRET)
    } catch (err) {
      res.status(400).send('Invalid Token')
    }
  }

  req.user = user
  next()
}

// TODO check google token
// https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=accessToken


module.exports = {
  privateUser,
  getUser
}
