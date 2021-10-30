import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

// routes
import Menu from './controllers/menu/menu.js';
import SignUpUser from './controllers/user/signup.js';
import SignInUser from './controllers/user/singin.js';
import LogoutUser from './controllers/user/logout.js';
import checkauth from './controllers/utils/checkauth.js';
import Contactusinform from './controllers/utils/contactusform.js';
import usercart from './controllers/cart/usercart.js';
import cart from './controllers/cart/cart.js';
import account from './controllers/Account/account.js';

const server_config = config(process.env.NODE_ENV)
const app = express()
// app.use(express.static('client/build'))
app.use(cors({
    origin: ['https://onlinealimente.netlify.app', 'http://localhost:3000'],
    credentials: true,
}))

let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, 
    auth:{
        user : 'alimente.restaurant@gmail.com',
        pass : process.env.EMAILPASS
    }
})

mongoose.Promise = global.Promise
mongoose.connect(server_config.DATABASE,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true,
    useFindAndModify : false
})

app.use(bodyParser.json())
app.use(cookieParser())

// routes
app.use(Menu)
app.use('/api', checkauth);
app.use('/api', SignUpUser);
app.use('/api', SignInUser)
app.use('/api', Contactusinform)
app.use('/api', usercart)
app.use('/api', cart)
app.use(account);
app.use('/api', LogoutUser)

if(process.env.NODE_ENV === 'production'){
    const path = require('path')
    app.get('/*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../client','build','index.html'))
    })
}

app.listen(
    process.env.PORT || 3001, () => {
    console.log('You are connected now')
})