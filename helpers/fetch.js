const URL = require('url').URL
const fetch = require('isomorphic-unfetch')
const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')

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
    throw new Error(response.statusText)
  } else {
    return response.json()
  }
}

module.exports = { fetchWrapper, handleFetchErrors }
