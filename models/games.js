const mongoose = require ("mongoose")

const gamesSchema = mongoose.Schema({

    title : {
        type: String,
        required : true
    },



},{
    timestamp:true
})

const Games = mongoose.model("games" ,gamesSchema )
module.exports=Games