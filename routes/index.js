var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");
var Campground = require("../models/campground");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

//  ===========
// AUTH ROUTES
//  ===========
//show register form
router.get("/register", function(req, res) {
   res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, firstName: req.body.firstname, lastName: req.body.lastname, email: req.body.email, avatar: req.body.avatar});
    if(req.body.adminCode === process.env.ADMINCODE) {
      newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", function(req, res) {
   res.render("login", {message: req.flash("error"), page: "login"});
});

//handling login logic
// app.post("/login", middleware, callback);
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req, res){
});

//logout logic route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

module.exports = router;