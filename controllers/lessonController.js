const uuid = require('uuid')
const path = require('path')
const {Lesson, LessonType} = require('../models/models')
const ApiError = require('../error/ApiError')
const fs = require('fs');

class LessonController {
    async create (req, res, next) {
       try {
           let {name, description, lessonTypeId} = req.body

           const {file} = req.files
           let fileName = uuid.v4() + ".mp4"
           file.mv(path.resolve(__dirname, '..', 'static', fileName))

           const lesson = await Lesson.create({name, description, lessonTypeId, file: fileName})



           return res.json(lesson)


       } catch (e) {
            next(ApiError.badRequest(e.message))
       }
    }
    async getAll (req, res) {
        const lessons = await Lesson.findAll({include: LessonType})
        return res.json(lessons)
    }

    async getPublished (req, res) {
        const lessons = await Lesson.findAll({where: {published: true}, include: LessonType
                    })
        return res.json(lessons)
    }


    async edit (req, res) {
        const {id, name, description, published, lessonTypeId} = req.body
        const lesson = await Lesson.update({
            name, description, published, lessonTypeId
        },
            {
                where: {id},
            }
        )
        return res.json(lesson)
    }

    async delete (req, res, next) {
        const {id, fileName} = req.body
        await Lesson.destroy({
            where: {id},
        })

        try {
            console.log(path.resolve(__dirname, '..', 'static', fileName))
            fs.unlink(path.resolve(__dirname, '..', 'static', fileName), (err) => {
                if (err) {
                    res.status(500).send({
                        message: "Не удалось удалить файл. " + err,
                    });
                    res.status(200).send({
                        message: "Файл удален.",
                    });
                }
            });

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }



        return res.json('Удалено')
    }
}

module.exports = new LessonController()