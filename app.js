require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require("./models/user"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    seedDB = require("./seeds"),
    flash = require("connect-flash");

var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index"),
    userRoutes = require("./routes/user");
    
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";
mongoose.connect(url, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
// seedDB();    //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
   secret: "CYYY is the cutest woman in the world",
   resave: false,
   saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// SCHEMA SETUP

// Campground.create(
//     {
//         name: "Pic B", 
//         image:"https://www.photosforclass.com/download/pixabay-984020?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2Fe03db50f2af41c22d2524518b7444795ea76e5d004b0144293f2c87aa1e9b4_960.jpg&user=Free-Photos",
//         description: "Some people seems happy"
//     }, function(err, campground){
//         if(err){
//             console.log(err);
//         }else{
//             console.log("NEWLY CREATED CAMPGROUND: ");
//             console.log(campground);
//         }
//     });


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users", userRoutes);





app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Has started!!");
});
