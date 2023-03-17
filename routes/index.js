const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const typeRouter = require('./typeRouter')
const lessonRouter = require('./lessonRouter')
const commentRouter = require('./commentRouter')

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/lessons', lessonRouter)
router.use('/comments', commentRouter)


module.exports = router