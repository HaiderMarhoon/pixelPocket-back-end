const express = require("express")
const verifyToken = require('../middleware/verify-token')
const Games = require ('../models/games')
const router = express.Router()

router.get("/" , async(req,res) =>{
    try{
        const games = Games.find().populate('author')
    }
    catch(err){
        res.status(500).send(err)
    }
})



module.exports = router