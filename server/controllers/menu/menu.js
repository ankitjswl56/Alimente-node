import express from 'express';
const router = express.Router()

import Alimente_menu from '../../model/menu.model.js';

router.get('/api/menu', async (req,res) => {
  try {
    await Alimente_menu.find((err, doc) => {
      if(err){
        return res.send(`error found ${err}`)
      }
      res.send({
        menu: doc
      })
    })
  } catch(error) {
    console.log('error: ', error)
  }
})
export default router;