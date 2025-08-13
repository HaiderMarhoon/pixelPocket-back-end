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
        const game = await Games.findById(req.params.gameId).populate('author').populate({
            path: 'comment.author',
            model: 'User'
        });
        res.status(200).json(game);
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
        const game = await Games.findById(req.params.gameId);

        if (!game) {
            return res.status(404).send("Game not found");
        }

        if (!game.author.equals(req.user._id)) {
            return res.status(403).send("You cannot modify this game");
        }

        const updatedGame = await Games.findByIdAndUpdate(
            req.params.gameId,
            req.body,
            { new: true }
        );

        updatedGame._doc.author = req.user;
        res.status(200).json(updatedGame);
    }
    catch(err){
        res.status(500).send(err);
    }
});

router.delete("/:gameId", async (req, res) => {
    try {
        const game = await Games.findById(req.params.gameId);
        if (!game) {
            return res.status(404).send("Game not found");
        }

        if (!game.author.equals(req.user._id)) {
            return res.status(403).send("You cannot delete this game");
        }

        const deleteGame = await Games.findByIdAndDelete(req.params.gameId)
        res.status(204).send(deleteGame); 
    } catch (err) {
        console.error("Error in delete route:", err); 
        res.status(500).send('Internal Server Error');
    }
});


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

router.delete('/:gameId/comments/:commentId', async (req, res) => {
  try {
    const { gameId, commentId } = req.params;

    // Find the game
    const game = await Games.findById(gameId);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Find the index of the comment
    const commentIndex = game.comment.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

    // Optional: Only allow the author of the comment to delete it
    if (game.comment[commentIndex].author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    // Remove the comment
    game.comment.splice(commentIndex, 1);
    await game.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.put('/:gameId/comments/:commentId', async (req, res) => {
    try {
        const { gameId, commentId } = req.params;
        const { comment } = req.body; 
        const game = await Games.findById(gameId);

        if (!game) return res.status(404).json({ message: 'Game not exist' });

        const commentBox = game.comment.id(commentId);
        if (!commentBox) return res.status(404).json({ message: 'Comment not exist' });

        if (commentBox.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized error' });
        }

        commentBox.comment = comment; 
        await game.save();

        res.status(200).json(commentBox);
    } catch (err) {
        res.status(500).json(err);
    }
});




module.exports = router