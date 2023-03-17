const Router = require('express')
const router = new Router()
const lessonController = require('../controllers/lessonController')
const checkRole = require('../middleware/CheckRoleMiddleware')

router.post('/', checkRole("ADMIN"), lessonController.create)
router.get('/', lessonController.getPublished)
router.post('/edit', checkRole("ADMIN"), lessonController.edit)
router.get('/all', checkRole("ADMIN"), lessonController.getAll)
router.post('/delete', checkRole("ADMIN"), lessonController.delete)

module.exports = router