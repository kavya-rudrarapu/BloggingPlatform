const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: {
        type: String,
    },
    content: {
        type: String, 
        default: "like2"
    },
    category: {
        type: String,
    },
    tags: {
        type: [String],
    },
    likes: {
        type: Number, 
        default: 0
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'comment',
        default: []
    },
    likedBy: {
        type: [String], 
        default: []
    },
    createdAt: {
        type: Date
    },
    image:{
        type:String
    } 
});

const postModel = mongoose.model('posts', postSchema);
module.exports = postModel;
