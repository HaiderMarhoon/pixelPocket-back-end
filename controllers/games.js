const express = require("express")
const verifyToken = require('../middleware/verify-token')
const Games = require ('../models/games')
const { create } = require("../models/user")
const router = express.Router()



router.get("/" , async(req,res) =>{
    try{
        const games = await Games.find().populate('author').sort({createdAt : 'desc'})
        res.status(200).json(games)
    }
    catch(err){
        res.status(500).send(err)
    }
})
router.get("/:gamesId" , async(req,res)=>{
    try{
        const games =await Games.findById().populate('author')
    }catch(err){
        res.status(500).send(err)
    }
})


router.use(verifyToken)


router.post('/', async(req,res)=>{
    try{    
        req.body.author = req.user._id
        const game = await Games.create(req.body)
        game._doc.author =req.user
        res.status(201).json(game)
    }
    catch(err){
        res.status(500).send(err)
    }
})

router.put('/:gamesId', async(req,res) =>{
    try{
        const game = await Games.findById(req.params.gamesId)

        if(!game.author.equals(req.user._id)){
            res.status(404).send("You can not modify anythings")
        }

        const updateGame = await Games.findByIdAndUpdate(
            req.params.gamesId,
            req.body,
            { new: true}
        )

        updateGame._doc.author =req.user
        res.status(201).json(updateGame)
    }
    catch(err){
        res.status(500).send(err)
    }
})


router.delete("/:gamesId" , async(req,res) =>{
    try{
        const game = await Games.findById(req.params.gamesId)

        if(!game.author.equals(req.user._id)){
            res.status(404).send("You can not delete game")
        }

        const deleteGame = await Games.findByIdAndDelete(req.params.gamesId)
        res.status(201).json(deleteGame)
    }
    catch(err){
        res.status(500).send(err)
    }
})


// comments



module.exports = router