const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const userschema = mongoose.Schema({
    name : {
        type : String,
        maxlength : 100
    },
    email : {
        type : String,
        required : true,
        unique : 1
    },
    password : {
        type : String,
        required : true,
        minlength : 4
    },
    phonenumber : {
        type : Number,
        required : true,
        maxlength : 10,
        minlength : 10
    },
    address : {
        type : String,
        maxlength : 100
    },
    passresetcode : {
        type : Number,
        minlength : 4
    },
    token : {
        type : String
    }
})

userschema.pre('save',function (next){
    const user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            if(err) return next(err)
            bcrypt.hash(user.password, salt, (err,hash)=>{
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    }else{
        next()
    }
})

const User = mongoose.model('User',userschema)

module.exports = {User}
