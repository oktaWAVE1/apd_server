const Router = require('express')
const router = new Router()
const commentController = require('../controllers/commentController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')


router.post('/', authMiddleware, commentController.create)
router.get('/published', commentController.getPublished)
router.get('/', checkRole('ADMIN'), commentController.getAll)
router.post('/update', checkRole('ADMIN'), commentController.update)
router.post('/delete', checkRole('ADMIN'), commentController.delete)

module.exports = router