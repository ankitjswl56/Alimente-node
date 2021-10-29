const express  = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');

const config = require('../server/config/config').get(process.env.NODE_ENV)

app.use(express.static('client/build'))
app.use(cors({
    origin: ['https://onlinealimente.netlify.app', 'http://localhost:3000/'],
    credentials: true,
}))

const nodemailer = require('nodemailer')
let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, 
    auth:{
        user : 'alimente.restaurant@gmail.com',
        pass : process.env.EMAILPASS
    }
})

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect(config.DATABASE,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true,
    useFindAndModify : false
})

const mydata = mongoose.model('Allmenu',mongoose.Schema(),'allmenu')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
app.use(bodyParser.json())
app.use(cookieParser())

const bcrypt = require('bcrypt');

const { User } = require('./models/user');
const {Contactusinfo} = require('./models/contactusform');
const { Cart } = require('./models/usercart');
const { countReset } = require('console');



app.post('/api/usersignup',(req,res)=>{
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        phonenumber : req.body.phonenumber
    })
    user.save((err,doc)=>{
        if(err) return res.send({
            signupstatus : false,
            message: err
        })
        if(!doc) return res.send({
            signupstatus : false,
            message: 'Something went wrong'
        })
        const usercart = new Cart({
            userid : doc._id
        })
        usercart.save((err,doc)=>{
            if(err) return res.send({
                signupstatus : false,
                message : err
            })
        })
        const token = jwt.sign(user._id.toHexString(),config.SECRET)
        user.token = token
        user.save()
        res.cookie('resloginauth', token)  
        res.send({
            loginauth:true,
            email:user.email,
            id:user._id
        })
    })
})

app.post('/api/userlogin',(req,res)=>{
    const userdata = {
        email : req.body.email,
        password : req.body.password
    }
    User.findOne({"email" : userdata.email},(err,user)=>{
        if(err) return res.send(err)
        if(!user) return res.send({
            loginauth : false,
            message: 'User Not Registered'
        })
        if(user){
            bcrypt.compare(userdata.password,user.password,(err,doc)=>{
                if(err) return res.send(err)
                if(!doc) return res.send({
                    loginauth : false,
                    message: 'incorrect password'
                })
                const token = jwt.sign(user._id.toHexString(),config.SECRET)
                user.token = token
                user.save()
                res.cookie('resloginauth', token)  
                res.status(200).send({
                    loginauth:true,
                    email:user.email,
                    id:user._id
                })
            })
        }
    })
})

app.get('/api/isauth',(req,res)=>{
    if(!req.cookies.resloginauth) return res.send({
        loginauth : false,
        message : 'Not authorized'
    })
    const token = req.cookies.resloginauth
    const userid = jwt.verify(token,config.SECRET)
    User.findOne({'token' : token, '_id' : userid},(err,user)=>{
        if(err) return res.send(err)
        if(!user) return res.send({
            loginauth : false
        })
        res.send({
            loginauth : true,
            userid : user._id,
            name : user.name,
            email : user.email,
            phonenumber : user.phonenumber,
            address : user.address,
            message : 'authorized'
        })
    })
})

app.get('/api/logout',(req,res)=>{
    const token = req.cookies.resloginauth
    const userid = jwt.verify(token,config.SECRET)
    User.findOne({"_id" : userid, "token" : token },(err,user)=>{
        if(err) return res.send(err)    
        if(!user) return res.send('invalid token')
        user.update({$unset : { token : 1}},(err,user)=>{
            if(err) return res.send(err)
            return user
        })
        user.save()
    })
    res.send({
        loginauth:false,
        message : "Successfully logged out"
    })
    // res.send('logged out')
})



app.get('/api/menu',(req,res)=>{
    mydata.find((err,doc)=>{
        if(err) return res.send(err)
        res.send({
            menu : doc
        })
    })
})


app.post('/api/contactusform',(req,res)=>{
    const contactusinformation = new Contactusinfo({
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        phonenumber : req.body.phonenumber,
        message : req.body.message
    })
    contactusinformation.save((err,doc)=>{
        if(err) return res.send({
            messagesent : false,
            message : err
        })
        res.send({
            messagesent : true,
        })
    })
    
})

app.post('/api/usercart',(req,res)=>{
    Cart.findOne({'userid' : req.body.userid},(err,doc)=>{
        if(err) return res.send({
            orderconfirm : false,
            message : `Something went wrong: ${err}`
        })
        doc.orderedfoods.push({
            fooddetail : req.body.fooddetail,
            totalprice : req.body.totalprice
        })
        doc.save(async function(err,doc){
            if (err) return res.send({
                orderconfirm : false,
                message : `Something went wrong: ${err}`
            })
            await transporter.sendMail({
                from : 'Alimente Restaurant',
                to : req.body.useremail,
                subject : 'Order confirmed',
                html : `<div>
                <p>Your order is confirmed. </p>
                <p>Details : </p>
                <table>
                <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                </tr>
                ${req.body.fooddetail.map((each)=>{
                    return `<tr>
                    <td>${each.foodquantity}</td> 
                    <td>${each.foodname}</td>
                    <td>${each.foodprice}</td>
                    </tr>`
                }).join('')}
                </table>
                <p>Total Price: <h3> Rs. ${req.body.totalprice}</h3></p>
                </div>`
            })
            res.send({
                orderconfirm : true,
                doc : doc
            })
        })
    })
})


app.get('/api/cart',(req,res)=>{
    const token = req.cookies.resloginauth
    const userid = jwt.verify(token, config.SECRET)
    Cart.findOne({"userid" : userid},(err,doc)=>{
        if(err) return res.send({
            userorders : false,
            message : `Error ${err}`
        })
        res.send({
            userorders : true,
            details : doc
        })
    })
})
app.post('/api/changepassword',(req,res)=>{
    const token = req.cookies.resloginauth
    const userid = jwt.verify(token,config.SECRET)
    const oldpassword = req.body.oldpassword
    const newpassword = req.body.newpassword
    User.findOne({'_id' : userid},(err,userdoc)=>{
        if(err) return res.send(err)
        bcrypt.compare(oldpassword,userdoc.password,(err,doc)=>{
            if(err) return res.send(err)
            if(!doc) return res.send({
                passwordupdated : false,
                message: 'incorrect password'
            })
        })
        userdoc.password = newpassword
        userdoc.save((err,doc)=>{
            if(err) return res.send(err)
            res.send({
                passwordupdated : true,
                message : 'Password Successfully Changed. Please Login Again'
            })
        })
    })
})
app.post('/api/editdetails',(req,res)=>{
    const token = req.cookies.resloginauth
    const userid = jwt.verify(token,config.SECRET)
    const phone = req.body.phone
    const address = req.body.address
    User.findOne({'_id' : userid},(err,userdoc)=>{
        if(err) return res.send(err)
        userdoc.phonenumber = phone
        userdoc.address = address
        userdoc.save((err,doc)=>{
            if(err) res.send({
                detailsupdated : false,
                message : 'Something went wrong ' + err
            })
            res.send({
                detailsupdated : true,
                message : 'Details Successfully Updated'
            })
        })
    })
})

app.post('/api/resetpassword',(req,res)=>{
    const useremail = req.body.email
    const usercode = Math.floor(Math.random()*10000) 
    User.findOne({"email" : useremail},(err,doc)=>{
        if(err) return res.send('err: ' + err)
        if(!doc) return res.send({
            userfound : false,
            message : 'You are not a registered user.'
        })
        const useremail = doc.email
        doc.passresetcode = usercode
        doc.save(async function(err,doc){
            if(err) return res.send({
                codeadded : false,
                message: err
            })
            let info = await transporter.sendMail({
                from : 'alimente_restaurant@gmail.com',
                to : `${useremail}`,
                subject : 'Reset Password Alimente',
                html : `<div>
                    <p>Your code to reset the password is: </p>
                    <h1>${usercode}</h1>
                </div>`
            })
            res.send({
                codeadded : true,
                emailresponse : info.messageId
            })
        })
    })
})
app.post('/api/resetpasswordwithcode',(req,res)=>{
    const usercode = req.body.code
    const userpassword = req.body.password
    const useremail = req.body.email
    User.findOne({"email" : useremail},(err,doc)=>{
        if(err) return res.send(err)
        if(String(doc.passresetcode) === usercode){
            if(doc.password === userpassword){
                res.send({
                    passwordupdate : false,
                    message : 'Password cannot be old password'
                })
            }
            doc.password = userpassword
            doc.save((err,doc)=>{
                if(err) return res.send(err)
                User.updateOne({'email' : useremail},{$unset:{
                    passresetcode : 1
                }},(err,doc)=>{
                    if(err) return res.send(err)
                })
                res.send({
                    passwordupdate : true
                })
            })
        }
    })
})

if(process.env.NODE_ENV === 'production'){
    const path = require('path')
    app.get('/*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../client','build','index.html'))
    })
}

app.listen(process.env.PORT || 3001, () => {
    console.log('You are connected now')
})