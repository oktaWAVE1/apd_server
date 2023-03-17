const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    telephone: {type: DataTypes.STRING, unique: true},
    name: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING},
    isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
    activationLink: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: 'USER'},
})

const UserRefreshToken = sequelize.define('UserRefreshToken', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING},

})

const Premium = sequelize.define('premium', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    type: {type: DataTypes.STRING, defaultValue: 'STANDARD'},
    validUntil: {type: DataTypes.DATE, defaultValue: 0}

})


const Lesson = sequelize.define('lesson', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    file: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: true},
    published: {type: DataTypes.BOOLEAN, defaultValue: false}
})

const LessonType = sequelize.define('lessonType', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false}
})


const Comments = sequelize.define('comments', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    comment: {type: DataTypes.STRING(1024), allowNull: false},
    viewed: {type: DataTypes.BOOLEAN, defaultValue: false},
    published: {type: DataTypes.BOOLEAN, defaultValue: false}
})


User.hasOne(Premium)
Premium.belongsTo(User)

User.hasOne(UserRefreshToken)
UserRefreshToken.belongsTo(User)

User.hasMany(Comments)
Comments.belongsTo(User)

LessonType.hasMany(Lesson)
Lesson.belongsTo(LessonType)



module.exports = {
    User,
    Premium,
    Comments,
    Lesson,
    LessonType,
    UserRefreshToken
}