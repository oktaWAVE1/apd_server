require('dotenv').config()
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const {User, Premium} = require('../models/models')
const mailService = require('../service/mail-service')
const tokenService = require('../service/token-service')
const UserDto = require('../dtos/user-dto')


class UserController {
    async registration (req, res, next) {
        try {
            const {email, password, name, telephone, role} = req.body
            if (!email || !password || !name) {

                return next(ApiError.badRequest('Не заполнены необходимые данные'))
            }
            const candidateEmail = await User.findOne({where: {email}})
            const candidatePhone = await User.findOne({where: {telephone}})

            if (candidateEmail) {
                return next(ApiError.badRequest('Такой email уже зарегистрирован'))
            }
            if (candidatePhone) {
                return next(ApiError.badRequest('Такой телефон уже зарегистрирован'))
            }
            const hashPassword = await bcrypt.hash(password, 5)
            const activationLink = uuid.v4()
            await User.create({email, password: hashPassword, name, telephone, role, activationLink}).then(async(user) => {
                const userDto = new UserDto(user);
                const tokens = tokenService.generateJwt({...userDto});
                await tokenService.saveToken(user.id, tokens.refreshToken)
                res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
                await mailService.sendActivationMail(email, process.env.API_URL+`/api/user/activate/${activationLink}`)
                const premium = await Premium.create({userId: user.id})
                return res.json(tokens)
            })

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }
    
    async login (req, res, next) {
        try {

            const {email, telephone, password} = req.body
            const user = await User.findOne({where: {email}}) || await User.findOne({where: {telephone}})

            if (!user) {
                return next(ApiError.badRequest("Такого пользователя не существует"))
            }
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.internal("Введен неверный пароль"))
            }
            if(!user.isActivated){
                return next(ApiError.internal("Подтвердите аккаунт по электронной почте"))
            }

            const userDto = new UserDto(user);
            const tokens = tokenService.generateJwt({...userDto});
            await tokenService.saveToken(user.id, tokens.refreshToken)
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
            return res.json(tokens)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async check (req, res, next) {
        try {
            const {refreshToken} = req.cookies;

            const user = await tokenService.refresh(refreshToken, next)
            if (!user) {
                res.clearCookie('refreshToken')
                return next(ApiError.internal("Не авторизован"))
            } else {
                const userDto = new UserDto(user)
                const tokens = tokenService.generateJwt({...userDto});
                await tokenService.saveToken(user.id, tokens.refreshToken)
                res.cookie('refreshToken', tokens.refreshToken, {maxAge: 60*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true})
                return res.json(tokens)
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getSelf (req, res, next) {
        try {
            const {id} = req.body
            const user = await User.findOne({
                where: {id}, attributes: ['name', 'email', 'telephone', 'id']
            })
            return res.json(user)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    

    async getAll (req, res, next) {
        try {
            const users = await User.findAll({
                include: [{model: Premium, as: 'premium'}]
            })
            return res.json(users)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getSelfPrem (req, res, next) {
        try {
            const {userId} = req.body
            const premium = await Premium.findOne({where: {userId}})
            return res.json(premium)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async updatePremium (req, res, next) {
        try {
            const {id, newDate} = req.body
            const premium = Premium.update({validUntil: newDate}, {where: {id}})
            return res.json("Премиум успешно обновлен")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async modify (req, res, next) {
        try {
            const {email, password, name, telephone, id, newPassword} = req.body
            const user = await User.findOne({where: {id}})
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.internal("Введен неверный пароль"))
            }
            if (newPassword.length>=8){
                const hashPassword = await bcrypt.hash(newPassword, 5)
                const updatedUser = User.update({email, name, telephone, password: hashPassword}, {where: {id}})
            } else if (newPassword.length===0){
                const updatedUser = User.update({email, name, telephone}, {where: {id}})
            } else {
                return next(ApiError.internal("Указан слишком короткий пароль"))
            }
            return res.json("Данные пользователя обновлены.")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async activate (req, res, next) {
        try {
            const activationLink = req.params.link

            const user = User.findOne({where: {activationLink}})
            if(!user){
                return next(ApiError.badRequest("Неверная ссылка активации"))
            }
            const updatedLink = uuid.v4()
            await User.update({isActivated: true, activationLink: updatedLink}, {where: {activationLink}})
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async sendResetPassMail (req, res, next) {
        try {

            const {email} = req.body
            const user = await User.findOne({where: {email}})

            if(!user){
                return next(ApiError.badRequest("Нет пользователя с таким email"))
            }
            mailService.sendResetPassMail(email, process.env.CLIENT_URL+`/reset_pass/${user.activationLink}`)
            return res.json('Ссылка для восстановления пароля отправлена на ваш email')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async resetPass (req, res, next) {
        try {
            const {password, activationLink} = req.body
            const user = await User.findOne({where: {activationLink}})
            if(!user){
                return next(ApiError.internal("Неверная ссылка сброса пароля. Проверьте почту или заново запросите ссылку для восстановления."))
            }
            const hashPassword = await bcrypt.hash(password, 5)
            const updatedLink = uuid.v4()
            await User.update({password: hashPassword, activationLink: updatedLink}, {where: {activationLink}})
            return res.json(user)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async logout (req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await tokenService.removeToken({refreshToken})
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}

module.exports = new UserController()