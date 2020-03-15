const { fetchWrapper, handleFetchResponse } = require('../helpers/fetch')
const {
  isFileType,
  fileCanBeExportedToHtml,
  sanitizeFile
} = require('../helpers/files')

const GOOGLE_API_V3_BASE_PATH = 'https://www.googleapis.com/drive/v3'
const FILE_ITEM_DATA = [
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
  'exportLinks'
]

async function getFolder({
  googleToken,
  googleFolderId,
  orderBy = 'folder,starred,modifiedTime desc',
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
    const getFiles = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files`,
      params: {
        q: query,
        pageToken,
        pageSize,
        orderBy,
        fields: `kind, nextPageToken, incompleteSearch, files(${FILE_ITEM_DATA.toString()})`,
        // fields: '*',
        key: process.env.GOOGLE_API_KEY
      }
    })

    const getCurrentFolder = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}`,
      params: {
        fields: ['id', 'name', 'parents'],
        key: process.env.GOOGLE_API_KEY
      },
      headers: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleToken}`
        }
      }
    })

    const files = await handleFetchResponse(getFiles)
    const currentFolder = await handleFetchResponse(getCurrentFolder)

    return { ...files, currentFolder }
  } catch (error) {
    throw new Error(error)
  }
}

async function getFile({ googleFileId }) {
  try {
    const getFileData = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files/${googleFileId}`,
      params: {
        fields: '*',
        key: process.env.GOOGLE_API_KEY
      },
      headers: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    })

    const file = await handleFetchResponse(getFileData)
    let html = null

    // get html
    if (isFileType({ file, ...fileCanBeExportedToHtml })) {
      const getHtml = await fetchWrapper({
        url: `https://docs.google.com/feeds/download/documents/export/Export?id=${googleFileId}&exportFormat=html`,
        // url: `docs.google.com/document/${googleFileId}/export?format=html`,
        params: {
          key: process.env.GOOGLE_API_KEY
        }
      })
      const roughHtml = await handleFetchResponse(getHtml, 'html')
      html = sanitizeFile(roughHtml)
    }

    return { ...file, html }
  } catch (error) {
    throw new Error(error)
  }
}

async function getFolderPermissions({ googleFolderId, googleToken }) {
  try {
    const folderPermissions = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}/permissions`,
      headers: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleToken}`
        }
      }
    })

    return handleFetchResponse(folderPermissions)
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
    const folderPermissions = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files/${googleFolderId}/permissions`,
      headers: {
        method: 'POST',
        body: JSON.stringify({ role, type, allowFileDiscovery }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleToken}`
        }
      }
    })

    return handleFetchResponse(folderPermissions)
  } catch (error) {
    throw new Error(error)
  }
}

async function createFolder({
  googleToken,
  name = 'Unnamed folder',
  parents = [],
  folderColorRgb = null
}) {
  try {
    const folder = await fetchWrapper({
      url: `${GOOGLE_API_V3_BASE_PATH}/files`,
      headers: {
        method: 'POST',
        body: JSON.stringify({
          name,
          parents,
          folderColorRgb,
          kind: 'drive#file',
          mimeType: 'application/vnd.google-apps.folder'
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleToken}`
        }
      }
    })

    return handleFetchResponse(folder)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  getFolder,
  getFile,
  getFolderPermissions,
  changeFolderPermissions,
  createFolder
}
