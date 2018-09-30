var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
// Configure node-geocoder
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
// configure multer and cloudinary
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'ichuanfan', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - show all campgrounds
router.get("/", function(req, res){
   // get all campgrounds from DB
   Campground.find({}, function(err, allcampgrounds){
       if(err){
           console.log(err);
       }else{
           res.render("campgrounds/index", {campgrounds: allcampgrounds, currentUser: req.user, page: "campgrounds"});
       }
   });
});

//CREATE - add new campground to DB
// router.post("/", middleware.isLoggedIn, function(req, res){
//     var name = req.body.name;
//     var image = req.body.image;
//     var desc = req.body.description;
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     };
//     var price = req.body.price;
//     var newCampground = {name: name, price: price, image: image, description: desc, author: author};
//     // Create a new campground and save to DB
//     Campground.create(newCampground, function(err, newlyCreated){
//       if(err){
//           console.log(err);
//       } else {
//           console.log(newlyCreated);
//             // redirect back to campgrounds page, send a GET request by default
//             res.redirect("/campgrounds");
//       }
//     });
// });
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
      id: req.user._id,
      username: req.user.username
    };
    var price = req.body.price;
    var imageId = "";
    
    geocoder.geocode(req.body.location, async function (err, data) {
        await cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
            if(err){
                req.flash("error", err);
                return res.redirect("back");
            }
            // add cloudinary url for the image to the campground object under image property
            image = result.secure_url;
            imageId = result.public_id;
        });
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        // console.log(image);
        // console.log(imageId);
        var newCampground = {name: name, price: price, image: image, imageId: imageId, description: desc, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
          if(err){
              console.log(err);
              req.flash("error", err.message);
              return res.redirect("back");
          } else {
              //redirect back to campgrounds page
            //   console.log(newlyCreated);
              res.redirect("/campgrounds/" + newlyCreated.id);
          }
        });
    });
});

//NEW - show form to creaete new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        }else{
            // console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                console.log(err);
            }else{
                res.render("campgrounds/edit", {campground: foundCampground});
            }
        });
});

// UPDATE CAMPGROUND ROUTE
// router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
//   // find and update the correct campground
//   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
//       if(err){
//           res.redirect("/campgrounds");
//       }else{
//             // redirect somewhere(show page)
//           res.redirect("/campgrounds/" + req.params.id);
//       }
//   });
// });
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        // req.body.campground.lat = data[0].latitude;
        // req.body.campground.lng = data[0].longitude;
        // req.body.campground.location = data[0].formattedAddress;
        // console.log(data[0]);
        // console.log(foundCampground);
        // console.log("address updated");
        
        // console.log(foundCampground);
    
        // Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        //     if(err){
        //         req.flash("error", err.message);
        //         res.redirect("back");
        //     } else {
        //         req.flash("success","Successfully Updated!");
        //         res.redirect("/campgrounds/" + campground._id);
        //     }
        // });
        Campground.findById(req.params.id, async function(err, foundCampground) {
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }else{
                if(req.file){
                    try {
                        await cloudinary.v2.uploader.destroy(foundCampground.imageId);
                        var result = await cloudinary.v2.uploader.upload(req.file.path);
                        foundCampground.imageId = result.public_id;
                        foundCampground.image = result.secure_url;
                        console.log("image updated");
                    } catch(err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                }
                foundCampground.lat = data[0].latitude;
                foundCampground.lng = data[0].longitude;
                foundCampground.location = data[0].formattedAddress;
                foundCampground.name = req.body.campground.name;
                foundCampground.price = req.body.campground.price;
                foundCampground.description = req.body.campground.description;
                // console.log(foundCampground);
                foundCampground.save();
                // console.log(foundCampground);
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + foundCampground._id);
            }
        });
    });
});

// DESTORY CAMPGROUND ROUTE 
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // Campground.findByIdAndRemove(req.params.id, function(err){
    //     if(err){
    //         res.redirect("/campgrounds");
    //     }else{
    //         res.redirect("/campgrounds");
    //     }
    // });
    Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

module.exports = router;