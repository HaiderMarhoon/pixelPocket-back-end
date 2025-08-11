const mongoose = require("mongoose")

const commentsSchema =mongoose.Schema ({
    comment:{
        type: String,
    },
    author:{
        type: mongoose.Schema.Types.ObjectId , ref:"User"
    },
},{
    timestamps:true,
})

const Comment = mongoose.model("comment", commentsSchema)

module.exports = Comment