const router = require('express').Router()
const googleDrive = require('../controllers/googleDrive')

// Get one folder contects from Google Drive
router.get('/:googleFolderId', async (req, res) => {
  try {
    const folder = await googleDrive.getFolder({ googleFolderId: req.params.googleFolderId })

    res.status(200).send(folder)
  } catch (error) {
    res.status(404).json(error.message || 'Folder not found')
  }
})

module.exports = router
