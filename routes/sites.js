const express = require('express')
const router = express.Router()
const Site = require('../models/site')
const googleDrive = require('../controllers/googleDrive')
const verifyToken = require('../middlewares/verifyToken')

// PUBLIC routes
// Get sites
// TODO: add filter by owner
router.get('/', async (req, res) => {
  try {
    const sites = await Site.find()
    res.json(sites)
  } catch (error) {
    res.json({ message: error })
  }
})

// Get One site
router.get('/:siteId', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId)

    res.json({ site })
  } catch (error) {
    res.json({ message: error })
  }
})

// PRIVATE Routes
// Create a site
router.post('/', verifyToken.private, async (req, res) => {
  const site = new Site({
    title: req.body.title,
    description: req.body.description,
    owner: req.user._id,
    googleFolderId: req.body.googleFolderId
  })

  try {
    const savedSite = await site.save()
    res.json(savedSite)
  } catch(error) {
    res.json({ message: error })
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
    res.json(updatedSite)
  } catch(error) {
    res.json({ message: error })
  }
})

// Delete a site
// TODO: user is owner of the site
router.delete('/:siteId', verifyToken.private, async (req, res) => {
  const site = await Site.findOne({ _id: req.params.siteId })

  if (site && req.user._id != site.owner)
    return res.status(401).send('You are not allowed to delete the site')

  try {
    const removedSite = await Site.deleteOne({ _id: req.params.siteId })
    res.json(removedSite)
  } catch(error) {
    res.json({ message: error })
  }
})

module.exports = router
