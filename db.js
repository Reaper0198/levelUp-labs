const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId

const User = new Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
    },
    role : {
        type : String,
        required : true
    }
})

const Course = new Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true,
    },
    author : {
        type : String,
        required : true
    }
})

const Purchase = new Schema({
    courseId : {
        type : ObjectId,
        required : true
    },
    userId : {
        type : ObjectId,
        require : true
    }
})

const UserModel = mongoose.model('users', User)
const CourseModel = mongoose.model('courses', Course)
const PurchaseModel = mongoose.model('purhases', Purchase)

module.exports = {UserModel, CourseModel, PurchaseModel}