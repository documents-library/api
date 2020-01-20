const URL = require('url').URL
const fetch = require('isomorphic-unfetch')
const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')

async function fetchWrapper({ url, params, headers }) {
  const newUrl = new URL(url)

  if (params) {
    const newParams = omitBy(params, isNil)
    Object.keys(newParams).forEach(key =>
      newUrl.searchParams.append(key, params[key])
    )
  }

  return fetch(newUrl.href, headers)
}

async function handleFetchResponse(response, format) {
  const res = await response

  if (!res.ok) {
    let err
    if (res.status === 401) err = '401'
    else if (res.status === 403) err = '403'
    else err = res.statusText

    throw new Error(err)
  } else {
    if (format === 'html') {
      return response.text()
    }
    return response.json()
  }
}

module.exports = { fetchWrapper, handleFetchResponse }
