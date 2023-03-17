const {Comments, User} = require('../models/models')
const ApiError = require('../error/ApiError')

class CommentController {
    async create (req, res, next) {
        try {
            let {comment} = req.body

            const commentBody = await Comments.create({comment, userId: req.user.id})

            return res.json(commentBody)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll (req, res) {

        const comments = await Comments.findAll({include: [{model: User, as: 'user', attributes: ['name']}]})
        const unread = await Comments.findAll({where: {viewed: false}})
        const unreadComs = unread.length

        return res.json({comments, unreadComs})
    }

    async getPublished (req, res) {

        const comments = await Comments.findAll({where: {published: true}, include: [{model: User, as: 'user', attributes: ['name']}]})

        return res.json(comments)
    }


    async update (req, res) {
        const {id, viewed, published} = req.body

        const type = await Comments.update({viewed, published}, {
            where: {id},
        })
        return res.json(type)
    }
    async delete (req, res) {
        const {id} = req.body
        await Comments.destroy({
            where: {id},
        })
        return res.json('Удалено')
    }



}

module.exports = new CommentController()