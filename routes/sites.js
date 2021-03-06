const express = require('express')
const router = express.Router()

const Site = require('../models/site')
const verifyToken = require('../middlewares/verifyToken')
const {
  changeFolderPermissions,
  createFolder
} = require('../controllers/googleDrive')
const getAppFoler = require('../controllers/appFolder')
const { validateSite } = require('../helpers/validations')

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

// Get One site by name
router.get('/:siteName', async (req, res) => {
  try {
    const site = await Site.findOne({ name: req.params.siteName })

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
    const { name, longName, description } = req.body

    try {
      const { error } = await validateSite(req)
      if (error) {
        return res.status(409).send(error)
      } else {
        const user = req.user
        const googleToken = req.googleToken
        const appFolder = await getAppFoler({ user, googleToken })
        const siteFolder = await createFolder({
          googleToken: googleToken,
          name,
          parents: [appFolder]
        })
        // make the folder public
        await changeFolderPermissions({
          googleFolderId: siteFolder.id,
          googleToken
        })
        const site = new Site({
          name,
          longName,
          description,
          owner: user._id,
          googleFolderId: siteFolder.id
        })
        const savedSite = await site.save()

        res.status(200).json(savedSite)
      }
    } catch (error) {
      if (error.message === '403') {
        res.status(401).send('Google user needs accept all scopes')
      } else if (error.message === '401') {
        res.status(401).send('Google user not allowed')
      } else res.status(500).json(error.message || "Can't create a site")
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
          name: req.body.name,
          longName: req.body.longName,
          description: req.body.description,
          googleFolderId: req.body.googleFolderId
        }
      }
    )

    res.status(200).json(updatedSite)
  } catch (error) {
    res.status(500).json(error.message || "Can't update a site")
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

    res.status(200).json({
      __message:
        'This site has been removed from documents.li, but the folder remains on Gdrive',
      ...removedSite
    })
  } catch (error) {
    res.status(500).json(error.message || "Can't delete a site")
  }
})

router.post('/validate', verifyToken.privateUser, async (req, res) => {
  try {
    const { error } = await validateSite(req)
    if (error) {
      return res.status(409).send(error)
    } else return res.status(200).send('valid site')
  } catch (error) {
    res.status(404).json(error)
  }
})

module.exports = router
