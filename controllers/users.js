// controllers/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/verify-token')

router.get('/currentUser', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ err: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    // If the user is looking for the details of another user, block the request
    // Send a 403 status code to indicate that the user is unauthorized
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ err: 'Unauthorized' });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/:userId/favorites', verifyToken, async (req, res) => {
  if(req.user._id !== req.params.userId){
    return res.status(402).json({ err: 'Unauthorized'})
  }
  const user = await User.findById(req.params.userId).populate('favorites');
  res.json({ favorite: user.favorite })
})


router.post('/:userId/favorites', verifyToken , async (req, res) => {
  if(req.user._id !== req.params.userId) {
    return res.status(403).json({ err: 'Unauthorized' })
  }
  const user = await User.findById(req.params.userId);
  if(!user.favorite.includes(req.params.gameId)){
    user.favorite.push(req.params.gameId)
    await user.save();
  }
})

module.exports = router;
