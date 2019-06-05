const express = require('express')
const router = express.Router()

const Site = require('../models/site')
const User = require('../models/user')
const verifyToken = require('../middlewares/verifyToken')
const { getFolderPermissions, changeFolderPermissions } = require('../controllers/googleDrive')
const GoogleTokens = require('../models/googleTokens')

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
router.post('/', verifyToken.private, async (req, res) => {
  const { title, description, googleFolderId }  = req.body
  const site = new Site({
    title,
    description,
    owner: req.user._id,
    googleFolderId
  })

  try {
    const user = await User.findById(req.user._id)
    const googleTokens = await GoogleTokens.findOne({ googleID: user.googleID })
    const folderPermissions = await getFolderPermissions({
      googleFolderId,
      googleToken: googleTokens.accessToken
    })
    const isPublicFolder = await folderPermissions.permissions[0].role == 'reader'

    if (isPublicFolder) {
      const savedSite = await site.save()
      res.status(200).json(savedSite)
    } else {
      const makePublicFolder = await changeFolderPermissions({
        googleFolderId,
        googleToken: googleTokens.accessToken
      })

      if (makePublicFolder) {
        const savedSite = await site.save()
        res.status(200).json(savedSite)
      } else res.status(401).json({ message: 'Cant make the folder public' })
    }
  } catch(error) {
    res.status(401).json(error)
  }
})

// Update a site
router.patch('/:siteId', verifyToken.private, async (req, res) => {
  const site = await Site.findOne({ _id: req.params.siteId })

  if (site && req.user._id != site.owner)
    return res.status(401).send('You are not allowed to modify the site')

  try {
    const updatedSite = await Site.updateOne(
      { _id: req.params.siteId },
      { $set: {
        title: req.body.title,
        description: req.body.description,
        googleFolderId: req.body.googleFolderId
      }}
    )
    res.status(200).json(updatedSite)
  } catch(error) {
    res.status(401).json(error)
  }
})

// Delete a site
router.delete('/:siteId', verifyToken.private, async (req, res) => {
  const site = await Site.findOne({ _id: req.params.siteId })

  if (site && req.user._id != site.owner)
    return res.status(401).send('You are not allowed to delete the site')

  try {
    const removedSite = await Site.deleteOne({ _id: req.params.siteId })
    res.status(200).json(removedSite)
  } catch(error) {
    res.status(404).json(error)
  }
})

module.exports = router
