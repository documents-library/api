const router = require('express').Router()
const googleDrive = require('../controllers/googleDrive')

// Get one folder from Google Drive
router.get('/:folderId', async (req, res) => {
  try {
    const folder = await googleDrive.getFolder({ folderId: req.params.folderId })

    res.json(folder)
  } catch (error) {
    res.json({ message: error })
  }
})

module.exports = router
