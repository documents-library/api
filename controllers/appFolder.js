const User = require('../models/user')
const { changeFolderPermissions, createFolder, getFolder } = require('../controllers/googleDrive')

async function getAppFolder ({ user, googleTokens }) {
  // Check if is the first site created by the user
  if (user.appFolder) {
    // Check if the folder exists currently on the google drive of the user
    const googleAppFolder = await getFolder({ googleFolderId: user.appFolder })
    if (googleAppFolder.kind) {

      return user.appFolder
    } else {
      const appFolder = await createAppFolder({ user, googleTokens })

      return appFolder.id
    }
  } else {
      const appFolder = await createAppFolder({ user, googleTokens })

      return appFolder.id
  }
}

async function createAppFolder ({ user, googleTokens }) {
  // create folder on google drive
  const appFolder = await createFolder({
    googleToken: googleTokens.accessToken,
    name: 'documents.li',
    folderColorRgb: '#333333'
  })

  const updateUser = await User.updateOne(
    { _id: user._id },
    { $set: {
      appFolder: appFolder.id
    }}
  )
  return appFolder
}

// async function googleAppFolder ({ googleFolderId }) {
//   const googleAppFolder = await getFolder({ googleFolderId: user.appFolder })
//
//   return googleAppFolder
// }

module.exports = getAppFolder
