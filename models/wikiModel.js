const mongoose = require ('mongoose');

const wikiSchema = new mongoose.Schema({
    title: {
        type: String,
        required:[true, "Please provide a title"],
        unique: true,
        minlength: 3,
        maxlength: 50,
    },
    content: {
        type: String,
        required:[true, "Please provide a content"],
        minlength: 10,
    },
    author: {
        type: String,
        required:[true, "Please provide author name"],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
});
const wiki = mongoose.model('wiki', wikiSchema)
module.exports = wiki