const {LessonType} = require('../models/models')
const ApiError = require('../error/ApiError')
const {where} = require("sequelize");

class TypeController {
    async create(req, res) {
        const {name} = req.body
        const type = await LessonType.create({name})
        return res.json(type)

    }
    async getAll (req, res) {
        const types = await LessonType.findAll()
        return res.json(types)
    }

    async modify (req, res) {
        const {id} = req.body
        const {name} = req.body
        const type = await LessonType.update({name}, {
            where: {id},
        })
        return res.json(type)
    }
    async delete (req, res) {
        const {id} = req.body
        await LessonType.destroy({
            where: {id},
        })
        return res.json('Удалено')
    }



}
module.exports = new TypeController()