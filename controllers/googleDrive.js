const fetch = require('isomorphic-unfetch')

const GOOGLE_API_V3_BASE_PATH = 'https://www.googleapis.com/drive/v3'

async function getFolder({ googleFolderId }) {
  try {
    const folder = await fetch(
      `${GOOGLE_API_V3_BASE_PATH}/files?q='${
        googleFolderId
      }'+in+parents&key=${
        process.env.GOOGLE_API_KEY
      }&fields=*`
    )

    return handleFetchErrors(folder)
  } catch (error) {
    throw new Error(error)
  }
}

async function getFolderPermissions({ googleFolderId, googleToken }) {
  try {
    const folderPermissions = await fetch(`${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}/permissions`, {
      "method": "GET",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${googleToken}`,
      }
    })

    return handleFetchErrors(folderPermissions)
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * role:  owner, organizer, fileOrganizer, writer, commenter, reader
 * type: user, group, domain, anyone
 * to be public folder -> body: { role: reader, type: anyone }
 **/
async function changeFolderPermissions({ googleFolderId, googleToken, role = 'reader', type = 'anyone' }) {
  try {
    const folderPermissions = await fetch(`${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}/permissions`, {
      "method": "POST",
      "body": JSON.stringify({ "role": "reader", "type": "anyone" }),
      "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${googleToken}`
      }
    })

    return handleFetchErrors(folderPermissions)
  } catch (error) {
    throw new Error(error)
  }
}

async function handleFetchErrors(response) {
  const res = await response
  if (!response.ok) {
      throw new Error(response.statusText);
  }
  return response.json()
}

module.exports = { getFolder, getFolderPermissions, changeFolderPermissions }
