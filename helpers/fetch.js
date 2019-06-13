const URL = require('url').URL
const fetch = require('isomorphic-unfetch')
const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')

const GoogleTokens = require('../models/googleTokens')

const GOOGLE_AUTHORIZATION_SERVER = 'https://www.googleapis.com/oauth2/v4/token'

async function fetchWrapper ({ url, params, headers }) {
  const newUrl = new URL(url)

  if (params) {
    const newParams = omitBy(params, isNil)
    Object.keys(newParams).forEach(key => newUrl.searchParams.append(key, params[key]))
  }

  return fetch(newUrl.href, headers)
}

async function handleFetchErrors (response) {
  const res = await response

  if (!res.ok) {
    throw new Error(res.statusText)
  } else {
    return response.json()
  }
}

async function handleGoogleResponse ({ response, callback, params }) {
  const res = await response

  if (res.status === 401) { // invalid token
    try {
      const googleTokens = await GoogleTokens.findOne({ accessToken: params.googleToken })
      const getNewToken = await fetchWrapper({
        url: GOOGLE_AUTHORIZATION_SERVER,
        params: {
          refresh_token: googleTokens.refreshToken,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          grant_type: 'refresh_token'
        },
        headers: {
          'method': 'POST'
        }
      })

      // if fails logout the app to create new tokens
      if (getNewToken.ok) {
        const newToken = await getNewToken.json()
        await GoogleTokens.updateOne(
          { _id: googleTokens.id },
          { $set: { accessToken: newToken.access_token } }
        )
        const newParams = {
          ...params,
          googleToken: newToken.access_token
        }

        return callback(newParams)
      } else {
        throw new Error('googleRefreshTokenInvalid')
      }
    } catch (error) {
      throw new Error(error)
    }
  } else if (res.status === 403) { // insufficent_scope
    // logout the app to allow user accept all scopes(FE)
    throw new Error('insufficientGoogleScopes')
  } else if (res.ok) {
    return response.json()
  } else {
    throw new Error(response.statusText)
  }
}

module.exports = { fetchWrapper, handleFetchErrors, handleGoogleResponse }
