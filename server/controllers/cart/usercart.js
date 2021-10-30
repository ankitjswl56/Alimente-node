import express from 'express';
import {Cart} from '../../models/usercart.js';
import bodyParser from 'body-parser';

const app = express()
app.use(bodyParser.json());

const router = express.Router();

router.post('/usercart',(req,res)=>{
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
export default router;

