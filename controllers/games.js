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

router.get("/:gameId" , async(req,res)=>{
    try{
        const games =await Games.findById(req.params.gameId)
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

router.put('/:gameId', async(req,res) =>{
    try{
        const game = await Games.findById(req.params.gameId)

        if(!game.author.equals(req.user._id)){
            res.status(404).send("You can not modify anythings")
        }

        const updateGame = await Games.findByIdAndUpdate(
            req.params.gameId,
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


router.delete("/:gameId" , async(req,res) =>{
    try{
        const game = await Games.findById(req.params.gameId)

        if(!game.author.equals(req.user._id)){
            res.status(404).send("You can not delete game")
        }

        const deleteGame = await Games.findByIdAndDelete(req.params.gameId)
        res.status(201).json(deleteGame)
    }
    catch(err){
        res.status(500).send(err)
    }
})


// comments
router.post('/:gameId/comments', async (req, res) => {
	try {
		req.body.author = req.user._id
		const games = await Games.findById(req.params.gameId)
		games.comment.push(req.body)
		await games.save()

		// Find the newly created comment:
		const newGameComment = games.comment[games.comment.length - 1]

		newGameComment._doc.author = req.user

		// Respond with the newGameComment:
		res.status(201).json(newGameComment)
	} catch (error) {
		res.status(500).json(error)
	}
})


module.exports = router