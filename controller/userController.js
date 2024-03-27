const User = require ('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync( async (req,res,next)=>{
    const users = await User.find()
    res.status(200).json({
        status: 'success',
        result: users.length,
        data: {
            users
        }
    })
})
// exports.createUser = async (req,res,next)=>{
//     res.send('create one user')
// }
exports.getOneUserById = catchAsync( async (req,res,next)=>{
    const users = await User.findById(req.params.id);
    if (!users){
        return next(new AppError("No User find with that ID",400));
    }
    res.status(200).json({
        status: 'success',
        data:{
            users,
        }
    })
})
exports.updateUser = catchAsync( async (req,res,next)=>{
    const users = await User.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators:true,
    });
    if(!users){
        return next(new AppError('No User found with that ID', 400));
    }
    res.status(200).json({
        status: "success",
        data:{
            users,
        },
    });
});
exports.deleteOneUser = catchAsync( async (req,res,next)=>{
    const users = await User.findByIdAndDelete(req.params.id);
    if(!users){
        return next(new AppError('No User found with that ID',404));
    }
    res.status(204).json({
        status: "success",
        data: null,
    });
});
// allowed field is to restrict what the user can update 
const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach((el)=>{
        if (allowedFields.includes(el)) newObj[el] = obj[el];
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