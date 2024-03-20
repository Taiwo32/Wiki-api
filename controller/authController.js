const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto')

const { promisify } = require('util')


// sign in token
// jwt token after signing up a token is generated on our browser 
// jwt takes in three parameters - header (it is generated automatically), payload is the user id from the DB and secret is jwt secret in the .env file
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
// sign up controller 
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        fName: req.body.fName,
        lName: req.body.lName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role, 
    });

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) check if email and password exist
    if (!email || !password) {
        return next(new AppError("please provide a valid email and password", 400))
    }
    //2) check if user exist && password is correct
    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401))
    }
    // console.log(User)

    //3) check if user exist && password is correct
    const token = signToken(user._id)
    res.status(200).json({
        status: "success",
        token
    })
})
exports.protect = catchAsync(async (req, res, next) => {
    // 1) getting token and check if it's there
    let token;
    if (req.headers.authorization &&  // headers as used in Postman and they are also in the browser 
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1]
    }
    console.log(token)
    if (!token) {
        return next(new AppError('your are not logged in! please log in to get access', 401))
    }
    // 2)Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // promisify is coming from utils package
    console.log(decoded); // returns id, time created at and time expired at.
    // 3) check if user still exist
    const freshUser = await User.findById(decoded.id)
    if(!freshUser){
        return next(new AppError("The user belonging to this token does not exist.",404))
    }
    // 4) check if the user changed the password after token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError("User recently changed password! please login again.",401))

    }
    //Grant access to protect route 
    req.user = freshUser
    next()
});
// this is used for roles and permission
exports.restrictTo = (...roles) =>{
    // roles - the enum that is in our model
    return (req,res,next)=>{
        //role ("admin", "user", "author")
        if(!roles.includes(req.user.role)){
            return next(new AppError('you do not have permission to perform this action', 403));
        }
        next()
    }
    
};
// --- follow by this ---//
exports.forgetPassword = catchAsync(async (req,res,next)=>{
    //1) get posted Email
    const user = await User.findOne({email: req.body.email});
    if (!user){
        return next(new AppError("There is no email that matches this", 404));
    }
    //2) generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

     //3) sent mail to user 
    const resetURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/resetPassword/${resetToken}`;

    const message = `forgot password ?? submit a patch request with your new password and passwordConfirm to:${resetURL}.\n if you didn't forget your password kindly ignore this message`;
    console.log(message);

    try{
        await sendEmail({
            email: user.email,
            subject: "Your Password Reset Token(valid for just 10 minutes",
            message,
        });    
        res.status(200).json({
            status: "success",
            message: "Token sent to the email",
        })
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('there was an error sending mail'),500);
    }
});
 // --- continue here 
exports.resetPassword = catchAsync(async (req,res,next)=>{
    //1 get user based token
    const hashedToken = crypto 
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()},
    });

    //2 if token hasn't expired
    if(!user){
        return next(new AppError("Token is invalid or has expired",404));
    }
    user.password = req.body.password; 
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;  // remove the password token and password expire from our document
    user.passwordResetExpires = undefined;

    //3 update change password 
    await user.save();
    //4 log user in, send jwt
    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token,
    });
});

exports.updatePassword = catchAsync(async (req,res, next) =>{
    //1) get the user from the collection
    const user = await User.findById(req.user.id).select("+password");
    //user.findByIdAndUpdate will not work and won't validate encryption

    //2) check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Your current password is wrong", 401));
    }
    //3) if so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) log user in, send jwt 
    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token,
    });
});

// exports.signup = catchAsync (async (req,res, next)=>{
//     const newUser = await user.create(req.body)

//     res.status(201).json({
//         status: 'success',
//         data:{
//             user: newUser
//         }
//     })
// })