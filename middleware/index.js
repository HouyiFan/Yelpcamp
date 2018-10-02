var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");

// all the middlewares goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    // if user logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){  //if camground == null, !null == true
                req.flash("error", "Campground not found");
                res.redirect("back");
            }else{
                //does user own the campground? (foundCampground.author.id is object)
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    // if user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            }else{
                //does user own the comment? (foundComment.author.id is object)
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkUserOwnership = function(req, res, next){
    // if user logged in
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
            if(err || !foundUser){  //if user == null, !null == true
                console.log("this is error");
                req.flash("error", "User not found");
                res.redirect("back");
            }else{
                //does editor is the user him/herself or is the user an admin role? (foundUser._id is object)
                if(foundUser._id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;