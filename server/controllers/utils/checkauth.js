import express from 'express';
import {User} from '../../models/user.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import cors from 'cors';

const server_config = config(process.env.NODE_ENV)

const app = express()
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://onlinealimente.netlify.app',
    credentials: true,
}))

const router = express.Router();

router.get('/isauth',(req,res)=>{
  if(!req.cookies.resloginauth) return res.send({
      loginauth : false,
      message : 'Not authorized'
  })
  const token = req.cookies.resloginauth
  const userid = jwt.verify(token,server_config.SECRET)
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
export default router;

