import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import {User} from '../../models/user.js';
import bcrypt from 'bcrypt';

const app = express()
app.use(bodyParser.json());
app.use(cookieParser());

const server_config = config(process.env.NODE_ENV)
const router = express.Router()

router.post('/api/changepassword',(req,res)=>{
  const token = req.cookies.resloginauth
  const userid = jwt.verify(token,server_config.SECRET)
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
router.post('/api/editdetails',(req,res)=>{
    const token = req.cookies.resloginauth
    const userid = jwt.verify(token,server_config.SECRET)
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

router.post('/api/resetpassword',(req,res)=>{
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
router.post('/api/resetpasswordwithcode',(req,res)=>{
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
export default router;
