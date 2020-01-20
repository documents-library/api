const router = require('express').Router()
const googleDrive = require('../controllers/googleDrive')
const verifyToken = require('../middlewares/verifyToken')

// Get one file contects from Google Drive
router.get(
  '/:siteName/:googleFileId',
  [verifyToken.google],
  async (req, res) => {
    try {
      const file = await googleDrive.getFile({
        googleToken: req.googleToken,
        googleFileId: req.params.googleFileId
      })

      res.status(200).send(file)
    } catch (error) {
      res.status(404).json(error.message || 'File not found')
    }
  }
)

module.exports = router

