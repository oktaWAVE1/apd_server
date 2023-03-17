const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', userController.check)
router.get('/', checkRole('ADMIN'), userController.getAll)
router.post('/update', checkRole('ADMIN'), userController.updatePremium)
router.post('/get/premium', authMiddleware, userController.getSelfPrem)
router.post('/modify', authMiddleware, userController.modify)
router.post('/self', authMiddleware, userController.getSelf)
router.post('/logout', authMiddleware, userController.logout)
router.get('/activate/:link', userController.activate)
router.post('/reset', userController.sendResetPassMail)
router.post('/reset/apply', userController.resetPass)



module.exports = router