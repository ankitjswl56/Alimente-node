import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import {Cart} from '../../models/usercart.js';

const app = express()
app.use(bodyParser.json());
app.use(cookieParser());

const server_config = config(process.env.NODE_ENV)
const router = express.Router()

router.get('/cart',(req,res)=>{
  const token = req.cookies.resloginauth
  const userid = jwt.verify(token, server_config.SECRET)
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
export default router;
