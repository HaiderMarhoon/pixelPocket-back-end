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
        req.body.author = req.user._id;
        const game = await Games.findById(req.params.gameId);
        
        if (!game) {
            return res.status(404).send("Game not found");
        }

        game.comment.push(req.body);
        await game.save();
        const newGameComment = game.comment[game.comment.length - 1];
        newGameComment._doc.author = req.user; 
        
        res.status(201).json(newGameComment);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/:gameId/comments/:commentId', async (req, res) => {
    try {
        const game = await Games.findById(req.params.gameId);
        
        if (!game) {
            return res.status(404).send('Game not found');
        }
        const commentIndex = game.comment.findIndex(comment => comment._id.toString() === req.params.commentId);
        
        if (commentIndex === -1) {
            return res.status(404).send('Comment not found');
        }
        game.comment[commentIndex].comment = req.body.comment; 
        await game.save();

        res.status(200).json(game.comment[commentIndex]); 
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/:gameId/comments/:commentId', async (req, res) => {
    try {
        const game = await Games.findById(req.params.gameId);
        
        if (!game) {
            return res.status(404).send('Game not found');
        }

        const commentIndex = game.comment.findIndex(comment => comment._id.toString() === req.params.commentId);
        
        if (commentIndex === -1) {
            return res.status(404).send('Comment not found');
        }

        game.comment.splice(commentIndex, 1); 
        await game.save();

        res.status(204).send(); 
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/:gameId/ratings', async (req, res) => {
    try {
        const { user, value } = req.body;

        if (!value || value < 1 || value > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const game = await Games.findById(req.params.gameId);
        if (!game) return res.status(404).json({ error: 'Game not found' });

        // Check if the user already rated
        const existingRating = game.ratings.find(r => r.user.toString() === user);
        if (existingRating) {
            existingRating.value = value; 
        } else {
            game.ratings.push({ user, value }); 
        }

        await game.save();
        const avg = game.ratings.reduce((acc, r) => acc + r.value, 0) / game.ratings.length;
        res.status(201).json({ average: avg }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add rating' });
    }
});



// Get average rating
router.get('/:gameId/ratings', async (req, res) => {
    try {
        const game = await Games.findById(req.params.gameId);
        if (!game || !Array.isArray(game.ratings) || game.ratings.length === 0) {
            return res.json(0); // Return 0 if no ratings
        }
        const average = game.ratings.reduce((acc, r) => acc + (r.value || 0), 0) / game.ratings.length;
        res.json(Number(average.toFixed(1))); // Return average rating
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch average rating' });
    }
});



module.exports = router