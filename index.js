require('dotenv').config()
const express = require('express')
const sequelise = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 5000

const app = express()
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)



// Обработка ошибок. Последний Middleware
app.use(errorHandler)


const start = async () => {
    try {
        await sequelise.authenticate()
        await sequelise.sync()
        app.listen(PORT, () => {console.log(`server started on PORT: ${PORT}`)})
    } catch (e) {
        console.log(e)
    }
}

start()
