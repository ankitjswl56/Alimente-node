import express from 'express';
import {User} from '../../models/user.js';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import bcrypt from 'bcrypt';

const app = express()
app.use(bodyParser.json());

const server_config = config(process.env.NODE_ENV)
const router = express.Router()

router.post('/userlogin', (req,res)=>{
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
              const token = jwt.sign(user._id.toHexString(),server_config.SECRET)
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
export default router;