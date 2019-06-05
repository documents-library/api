const router = require('express').Router()
const googleDrive = require('../controllers/googleDrive')

// Get one folder from Google Drive
router.get('/:googleFolderId', async (req, res) => {
  try {
    const folder = await googleDrive.getFolder({ googleFolderId: req.params.googleFolderId })

    res.status(200).json(folder)
  } catch (error) {
    res.status(400).json(error)
  }
})

module.exports = router
