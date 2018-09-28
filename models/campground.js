var mongoose = require("mongoose");
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

// 5b96cb0e46536812a9d205fa
// 5b96cb9d8a883812d63e89be

var Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;