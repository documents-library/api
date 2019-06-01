const fetch = require('isomorphic-unfetch')

const GOOGLE_API_V3_BASE_PATH = 'https://www.googleapis.com/drive/v3/files'

async function getFolder({ folderId }) {
  try {
    const folder = await fetch(
      `${GOOGLE_API_V3_BASE_PATH}?q='${
        folderId
      }'+in+parents&key=${
        process.env.GOOGLE_API_KEY
      }&fields=*`
    )

  return folder.json()
  } catch (error) {
    console.log(error)
  }
}

module.exports = { getFolder }
