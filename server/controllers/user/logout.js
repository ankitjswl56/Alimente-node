import express from 'express';
import {User} from '../../models/user.js';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

const server_config = config(process.env.NODE_ENV)

const app = express()
app.use(bodyParser.json());

const router = express.Router();

router.get('/logout',(req,res)=>{
  const token = req.cookies.resloginauth
  const userid = jwt.verify(token,server_config.SECRET)
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

export default router;
