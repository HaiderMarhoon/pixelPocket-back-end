const mongoose = require ("mongoose")

const gamesSchema = mongoose.Schema({

    title : {
        type: String,
        required : true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId, ref:"User"
    },
    category:{
        type:String,
        enum:['action', 'sport', 'Fighting','Horror' ,'Puzzle' ,'MMO' ],
        required : true
    },
    body:{
        type: String,
        required : true
    },
    ageRate:{
        type: Number,
        required : true
    },
    image:{
        type:String,
        required : true
    },
    gameLink:{
        type: String,
        required : true
    },
    comments:{
        type: mongoose.Schema.Types.ObjectId, ref:"Comment"
    }
},{
    timestamp:true
})


const Games = mongoose.model("games" ,gamesSchema )

module.exports = Games