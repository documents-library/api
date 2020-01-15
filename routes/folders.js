const router = require('express').Router()
const googleDrive = require('../controllers/googleDrive')
const verifyToken = require('../middlewares/verifyToken')

// Get one folder contects from Google Drive
router.get(
  '/:siteName/:googleFolderId',
  [verifyToken.google],
  async (req, res) => {
    try {
      const folder = await googleDrive.getFolder({
        googleToken: req.googleToken,
        siteName: req.params.siteName,
        googleFolderId: req.params.googleFolderId,
        orderBy: req.query.orderBy,
        pageSize: req.query.pageSize,
        pageToken: req.query.pageToken,
        search: req.query.search
      })

      res.status(200).send(folder)
    } catch (error) {
      res.status(404).json(error.message || 'Folder not found')
    }
  }
)

module.exports = router
