const { fetchWrapper, handleFetchErrors } = require('../helpers/fetch')

const GOOGLE_API_V3_BASE_PATH = 'https://www.googleapis.com/drive/v3'
const fileItemData = [
  'createdTime',
  'explicitlyTrashed',
  'fileExtension',
  'iconLink',
  'id',
  'kind',
  'mimeType',
  'modifiedTime',
  'name',
  'size',
  'starred',
  'thumbnailLink',
  'trashed',
  'webContentLink',
  'webViewLink'
]

async function getFolder ({
  googleFolderId,
  orderBy = 'folder,starred,name',
  pageSize = 50,
  pageToken,
  search
}) {
  let query = `'${googleFolderId}' in parents`
  // TODO do search in sub-folders
  if (search) {
    orderBy = null
    query = `'${googleFolderId}' in parents and fullText contains '${search}'`
  }

  try {
    const folder = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files`,
      params: {
        q: query,
        pageToken,
        pageSize,
        orderBy,
        fields: `kind, nextPageToken, files(${fileItemData.toString()})`,
        key: process.env.GOOGLE_API_KEY
      }
    })

    return await handleFetchErrors(folder)
  } catch (error) {
    throw new Error(error)
  }
}

async function getFolderPermissions ({ googleFolderId, googleToken }) {
  try {
    const folderPermissions = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}/permissions`,
      headers: {
        'method': 'GET',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${googleToken}`
        }
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

async function changeFolderPermissions ({
  googleFolderId,
  googleToken,
  role = 'reader',
  type = 'anyone',
  allowFileDiscovery = false
}) {
  try {
    const folderPermissions = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}/permissions`,
      headers: {
        'method': 'POST',
        'body': JSON.stringify({ role, type, allowFileDiscovery }),
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${googleToken}`
        }
      }
    })

    return handleFetchErrors(folderPermissions)
  } catch (error) {
    throw new Error(error)
  }
}

async function createFolder ({
  googleToken,
  name = 'Unnamed folder',
  parents = [],
  folderColorRgb = null
}) {
  try {
    const folder = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files`,
      headers: {
        'method': 'POST',
        'body': JSON.stringify({
          name,
          parents,
          folderColorRgb,
          'kind': 'drive#file',
          'mimeType': 'application/vnd.google-apps.folder'
        }),
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${googleToken}`
        }
      }
    })

    return handleFetchErrors(folder)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  getFolder,
  getFolderPermissions,
  changeFolderPermissions,
  createFolder
}
