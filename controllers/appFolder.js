const User = require('../models/user')
const { createFolder, getFolder } = require('../controllers/googleDrive')

async function getAppFolder ({ user, googleToken }) {
  // Check if is the first site created by the user
  if (user.appFolder) {
    // Check if the folder exists currently on the google drive of the user
    const googleAppFolder = await getFolder({ googleFolderId: user.appFolder })
    if (googleAppFolder.kind) {
      return user.appFolder
    } else {
      const appFolder = await createAppFolder({ user, googleToken })

      return appFolder.id
    }
  } else {
    const appFolder = await createAppFolder({ user, googleToken })

    return appFolder.id
  }
}

async function createAppFolder ({ user, googleToken }) {
  // create folder on google drive
  const appFolder = await createFolder({
    googleToken,
    name: 'documents.li',
    folderColorRgb: '#333333'
  })

  await User.updateOne(
    { _id: user._id },
    { $set: {
      appFolder: appFolder.id
    } }
  )

  return appFolder
}

module.exports = getAppFolder
