import express from 'express';
import {User} from '../../models/user.js';
import {Cart} from '../../models/usercart.js';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

const server_config = config(process.env.NODE_ENV)

const app = express()
app.use(bodyParser.json());

const router = express.Router();


router.post('/usersignup', (req,res)=>{
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
      const token = jwt.sign(user._id.toHexString(),server_config.SECRET)
      user.token = token
      user.save()
      res.cookie('resloginauth', token)  
      res.send({
          loginauth:true,
          email:user.email,
          id:user._id
      })
  })
});

export default router;
