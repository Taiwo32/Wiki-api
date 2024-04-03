const mongoose = require ('mongoose');
const validator = require ('validator');
const bcrypt = require ('bcryptjs');
const crypto = require('crypto');
// const { login } = require('../controller/authController');

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required:[true, 'Please tell us your first name'],
        minlength: 3,
    },
    lName: {
        type: String,
        required:[true, 'Please provide your last name'],
    },
    userName: {
        type: String,
        required:[true, 'Please provide your username'],
        unique: true,
        minlength:5,
        maxlength:10,
    },
    email: {
        type: String,
        required:[true, 'please provide your email address'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email!']
    },
    password: {
        type: String,
        required:[true, 'please provide your password'],
        unique: true,
        minlength: 5,
        maxlength: 20,
        select: false, // don"t want to show on postman
    },
    

    passwordConfirm:{
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            // this is only works on create and save 
            validator: function(el) { // el means element 
                return el === this.password
            },
            message: 'Password does not match',
        },

    },
    role: {
        type: String,
        enum: ['user','admin', 'author' ],  // a validator to check if what you sent is part of the parameter in the line
        default: "user", // default role to user 
    },
    passwordChangedAt: Date, // this is used to verify when a user changes password

    passwordResetToken: String,  // the token that is sent to the user when they click on forget password

    passwordResetExpires: Date,  // the first 2 they get added automatically to the models 

    active: {
        type: Boolean,
        default: true,
        select: false,
    }, // user create acct is active, when deleted it is false user won't be able tp login or sign up again
    // photo:{
    //     type: String,
    //     default: 'default.jpg'
    // },
    // address: {
    //     type: String, Number,
    //     required:[true, 'please provide your full address'],
    // },
    // createdAt: {
    //     type: Date,
    //     default: Date.now(),
    //     select: false
    // }
});
userSchema.pre('save',async function (next){  // this is a middle ware before the password is being edited saved and encrypt 
    // run only when password is modified
    if(!this.isModified('password')) return next()

    //hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12) // 12 is a cost material
  
    //Deleted the passwordConfirm field 
    this.passwordConfirm = undefined

    next();
    
})
// -- just added this --//
userSchema.pre("save",function (next){
    if (!this.isModified('password')|| this.isNew) return next();  // checking if it is a new document do not run the middleware
    this.passwordChangedAt = Date.now() - 1000; 
    next();  
})
// it is used to compare inputted password on login and the password in the DB (when signing up) already
userSchema.methods.correctPassword = async function(   // this is called an instance  we use this to check if the password is correct
    candidatePassword,  // the password you inputted
    userPassword // and the password that is on the DB
){
    return await bcrypt.compare(candidatePassword,userPassword);  // it compares the password inputted and the password on our DB
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){  //iat in the token
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt( // changes the date to integer
            this.passwordChangedAt.getTime() / 1000,  // changes the time to microseconds
         10
        );
        console.log(this.passwordChangedAt, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;  // JWT timestamp which is the token was created 
    }

    // false means not changed
    // return false;
};
// --- then this after --//
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex") // crypto is used to create a random token and it is provided by node jS we don't need to install it just require it
    this.passwordResetToken = crypto 
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log({resetToken},this.passwordResetToken);
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // setting the token to expire after 10 minutes
    return resetToken;   // date. now is the exact time the password was change and 10 minute to the current time before the token expire
}

// userSchema.pre(/^find/,function (next){
//     // this print to the current query
//     this.find({active: {$ne: false }});

//     next()

// });
const user = mongoose.model('user',userSchema);
module.exports = user