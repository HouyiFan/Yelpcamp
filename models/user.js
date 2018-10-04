var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
   firstName: String,
   lastName: String,
   username: {type: String, unique: true, required: true},
   password: String,
   avatar: String,
   email: {type: String, unique: true, required: true,
      validate: {
            isAsync: true,
            validator: function(value, isValid) {
                const self = this;
                return self.constructor.findOne({ email: value })
                .exec(function(err, user){
                    if(err){
                        throw err;
                    }
                    else if(user) {
                        if(self.id === user.id) {  // if finding and saving then it's valid even for existing email
                            return isValid(true);
                        }
                        return isValid(false);  
                    }
                    else{
                        return isValid(true);
                    }

                });
            },
            message: "Email already exists"
        },
 
   },
   resetPasswordToken: String,
   resetPasswordExpires: Date,
   isAdmin: {type: Boolean, default: false}
});


UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);
module.exports = User;