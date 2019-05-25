const express = require('express')
const router = express.Router()
const Site = require('../models/site')

// Get sites
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
    res.json(site)
  } catch (error) {
    res.json({ message: error })
  }
})

// Create a site
router.post('/', async (req, res) => {
  const site = new Site({
    title: req.body.title,
    description: req.body.description
  })

  try {
    const savedSite = await site.save()
    res.json(savedSite)
  } catch(error) {
    res.json({ message: error })
  }
})

// Update a site
router.patch('/:siteId', async (req, res) => {
  try {
    const updatedSite = await Site.updateOne(
      { _id: req.params.siteId },
      { $set: {
        title: req.body.title,
        description: req.body.description
      }}
    )
    res.json(updatedSite)
  } catch(error) {
    res.json({ message: error })
  }
})

// Delete a site
router.delete('/:siteId', async (req, res) => {
  try {
    const removedSite = await Site.deleteOne({ _id: req.params.siteId })
    res.json(removedSite)
  } catch(error) {
    res.json({ message: error })
  }
})

module.exports = router
