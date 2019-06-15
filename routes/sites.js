const express = require('express')
const router = express.Router()

const Site = require('../models/site')
const verifyToken = require('../middlewares/verifyToken')
const {
  changeFolderPermissions,
  createFolder
} = require('../controllers/googleDrive')
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
router.post(
  '/',
  [verifyToken.privateUser, verifyToken.google],
  async (req, res) => {
    const { title, description } = req.body

    try {
      const user = req.user
      const googleToken = req.googleToken
      const appFolder = await getAppFoler({ user, googleToken })
      const siteFolder = await createFolder({
        googleToken: googleToken,
        name: title,
        parents: [appFolder]
      })
      // make the folder public
      await changeFolderPermissions({
        googleFolderId: siteFolder.id,
        googleToken
      })
      const site = new Site({
        title,
        description,
        owner: user._id,
        googleFolderId: siteFolder.id
      })
      const savedSite = await site.save()

      res.status(200).json(savedSite)
    } catch (error) {
      if (error.message === '403') {
        res.status(401).send('Google user needs accept all scopes')
      } else if (error.message === '401') {
        res.status(401).send('Google user not allowed')
      } else res.status(500).json(error.message || "Can't update a site")
    }
  }
)

// Update a site
router.patch('/:siteId', verifyToken.privateUser, async (req, res) => {
  const site = await Site.findOne({ _id: req.params.siteId })

  if (site && req.userId !== site.owner) {
    return res.status(401).send('You are not allowed to modify the site')
  }

  try {
    const updatedSite = await Site.updateOne(
      { _id: req.params.siteId },
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          googleFolderId: req.body.googleFolderId
        }
      }
    )

    res.status(200).json(updatedSite)
  } catch (error) {
    res.status(500).json(error.message || "Can't create a site")
  }
})

// Delete a site
router.delete('/:siteId', verifyToken.privateUser, async (req, res) => {
  const site = await Site.findOne({ _id: req.params.siteId })

  if (site && req.userId !== site.owner) {
    return res.status(401).send('You are not allowed to delete the site')
  }

  try {
    const removedSite = await Site.deleteOne({ _id: req.params.siteId })

    res.status(200).json(removedSite)
  } catch (error) {
    res.status(500).json(error.message || "Can't delete a site")
  }
})

module.exports = router
