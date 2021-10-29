const mongoose = require('mongoose')

const contactusSchema = ({
    firstname : {
        type : String,
        required : true
    },
    lastname : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phonenumber : {
        type : String,
        required : true
    },
    message :{
        type : String,
        required : true
    }
})

const Contactusinfo = mongoose.model('Contactusinfo', contactusSchema)

module.exports = {Contactusinfo}