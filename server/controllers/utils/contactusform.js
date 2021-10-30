import express from 'express';
import bodyParser from 'body-parser';
import {Contactusinfo} from '../../models/contactusform.js';

const app = express()
app.use(bodyParser.json());

const router = express.Router();

router.post('/contactusform',(req,res)=>{
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
export default router;
