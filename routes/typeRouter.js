const Router = require('express')
const router = new Router()
const typeController = require('../controllers/typeController')
const checkRole = require('../middleware/CheckRoleMiddleware')

router.post('/', checkRole("ADMIN"), typeController.create)
router.get('/', typeController.getAll)
router.post('/modify', checkRole("ADMIN"), typeController.modify)
router.post('/delete', checkRole("ADMIN"), typeController.delete)

module.exports = router