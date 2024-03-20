const User = require ('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = async (req,res,next)=>{
    res.send('get all user')
}
exports.createUser = async (req,res,next)=>{
    res.send('create one user')
}
exports.getOneUser = async (req,res,next)=>{
    res.send('get one user')
}
exports.updateUser = async (req,res,next)=>{
    res.send('update  one user')
}
exports.deleteOneUser = async (req,res,next)=>{
    res.send('delete  one user')
}
// allowed field is to restrict what the user can update 
const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach((el)=>{
        if (allowedFields.include(el)) newObj[el] = obj[el];
    });
    return newObj;
};
exports.updateMe = catchAsync(async (req,res,next)=>{
    // 1) create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm){
        return next(
            new AppError(
                "This route is not for password updates. Please use /updateMyPassword",
                400
            )
        );
    }
    // 2) Filtered out unwanted field names that are not allowed to be update
    const filteredBody = filterObj(req.body, "fName", "lName", "userName", "email",);

    // 3) update document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody,{
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: "success",
        data:{
            user: updatedUser,
        },
    });
});

exports.deleteMe = catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: "success",
        data: "null",
    });
});