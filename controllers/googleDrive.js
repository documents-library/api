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

    return await handleFetchErrors(folder)
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
 * changeFolderPermissions
 * role:  owner, organizer, fileOrganizer, writer, commenter, reader
 * type: user, group, domain, anyone
 * allowFileDiscovery: boolean
 * DEFAULT: public, not discoverable -> body: {
 *  role: reader, type: anyone, allowFileDiscovery: false
 * }
 **/

async function changeFolderPermissions({
  googleFolderId,
  googleToken,
  role = 'reader',
  type = 'anyone',
  allowFileDiscovery = false
}) {
  try {
    const folderPermissions = await fetch(`${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}/permissions`, {
      "method": "POST",
      "body": JSON.stringify({ role, type, allowFileDiscovery }),
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

async function createFolder ({ googleToken, name = 'Unnamed folder', parents = [], folderColorRgb = null }) {
  try {
    const folder = await fetch(`${GOOGLE_API_V3_BASE_PATH}/files`, {
      "method": "POST",
      "body": JSON.stringify({
        name,
        parents,
        folderColorRgb,
        "kind": "drive#file",
        "mimeType": "application/vnd.google-apps.folder",
      }),
      "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${googleToken}`
      }
    })

    return handleFetchErrors(folder)
  } catch (error) {
    throw new Error(error)
  }
}

async function handleFetchErrors(response) {
  const res = await response
  if (!response.ok) {
    throw new Error(response.statusText)
  } else {
    return response.json()
  }
}

module.exports = {
  getFolder,
  getFolderPermissions,
  changeFolderPermissions,
  createFolder
}
