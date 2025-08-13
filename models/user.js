const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,  
      trim: true,   
      minlength: 3   
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address']  
    },
    hashedPassword: {
      type: String,
      required: true,
      minlength: 8  
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'games'  
    }],
    age: {
      type: Number,      
    }
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
