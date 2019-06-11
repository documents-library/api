const express = require('express')
const router = express.Router()

const Site = require('../models/site')
const User = require('../models/user')
const verifyToken = require('../middlewares/verifyToken')
const { changeFolderPermissions, createFolder } = require('../controllers/googleDrive')
const GoogleTokens = require('../models/googleTokens')
const getAppFoler = require('../controllers/appFolder')

/*******************************************************************************
 * PUBLIC routes
 ******************************************************************************/

// Get sites
// TODO: add filter by owner
router.get('/', async (req, res) => {
  try {
    const sites = await Site.find()

    res.status(200).json(sites)
  } catch (error) {
    res.status(404).json(error)
  }
})

// Get One site
router.get('/:siteId', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId)

    res.status(200).json({ site })
  } catch (error) {
    res.status(404).json(error)
  }
})

/*******************************************************************************
 * PRIVATE Routes
 ******************************************************************************/

// Create a site
router.post('/', verifyToken.privateUser, async (req, res) => {
  const { title, description } = req.body

  try {
    const user = await User.findById(req.user._id)
    const googleTokens = await GoogleTokens.findOne({ googleID: user.googleID })
    const appFolder = await getAppFoler({ user, googleTokens })
    const siteFolder = await createFolder({
      googleToken: googleTokens.accessToken,
      name: title,
      parents: [appFolder]
    })
    // make the folder public
    await changeFolderPermissions({
      googleFolderId: siteFolder.id,
      googleToken: googleTokens.accessToken
    })
    const site = new Site({
      title,
      description,
      owner: req.user._id,
      googleFolderId: siteFolder.id
    })

    const savedSite = await site.save()
    res.status(200).json(savedSite)
  } catch (error) {
    res.status(401).json(error.message || 'Can\'t create a site')
  }
})

// Update a site
router.patch('/:siteId', verifyToken.privateUser, async (req, res) => {
  const site = await Site.findOne({ _id: req.params.siteId })

  if (site && req.user._id !== site.owner) {
    return res.status(401).send('You are not allowed to modify the site')
  }

  try {
    const updatedSite = await Site.updateOne(
      { _id: req.params.siteId },
      { $set: {
        title: req.body.title,
        description: req.body.description,
        googleFolderId: req.body.googleFolderId
      } }
    )
    res.status(200).json(updatedSite)
  } catch (error) {
    res.status(401).json(error)
  }
})

// Delete a site
router.delete('/:siteId', verifyToken.privateUser, async (req, res) => {
  const site = await Site.findOne({ _id: req.params.siteId })

  if (site && req.user._id !== site.owner) {
    return res.status(401).send('You are not allowed to delete the site')
  }

  try {
    const removedSite = await Site.deleteOne({ _id: req.params.siteId })
    res.status(200).json(removedSite)
  } catch (error) {
    res.status(404).json(error)
  }
})

module.exports = router
