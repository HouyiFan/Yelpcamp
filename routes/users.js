var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
var middleware = require("../middleware");

// USER PROFILE
router.get("/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err || !foundUser) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }
    Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong");
        return res.redirect("/");
      }
    //   console.log(req.user);
    //   console.log(typeof req.user.avatar);
      res.render("users/show", {user: foundUser, campgrounds: campgrounds, currentUser: req.user});
    });
  });
});

// EDIT USER ROUTE
router.get("/:id/edit", middleware.checkUserOwnership, function(req, res) {
    // eval(require("locus"));
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "User not found");
            req.redirect("back");
        }else{
            res.render("users/edit", {user: foundUser});
        }
    });
});

// UPDATE USER PROFILE
router.put("/:id", middleware.checkUserOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
            console.log("error");
            req.flash("error", "User not found");
            return res.redirect("/users" + req.params.id);
        } else {
            // eval(require("locus"));
            console.log(foundUser);
            console.log(req.body.user);
            
            foundUser.firstName = req.body.user.firstName;
            foundUser.lastName = req.body.user.lastName;
            
            foundUser.email = req.body.user.email;
            foundUser.avatar = req.body.user.avatar;
            foundUser.save(function(err){
              if(err){
                req.flash("error", "Email already exists");
                res.redirect("back");
              }else{
                req.flash("success", "Successfully Updated!");
                res.redirect("/users/" + req.params.id);
              }
            });
            
        }
    });
});

module.exports = router;