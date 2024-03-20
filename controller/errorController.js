const AppError = require("../utils/appError")
const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path}:${err.value}.`
    return new AppError(message, 400)
}
const handleJWTErrorDB = err => new AppError("Invalid token. Please log in again")

const  handleExpiredToken = err => new AppError("Your token as expired! Please login again.")

const handleDuplicateFileDB = err => {
    const value = err.keyValue.title
    const message = `Duplicate field value: ${value}.Please use another value`
    return new AppError(message, 404)
}
const handleValidationErrorDB = (err) =>{
    const errorMessages = Object.values(err.errors).map(el => el.message)
    console.log(errorMessages)
    const message = `Invalid input data.${errorMessages.join(". ")}`
    return new AppError(message, 400) 
}
const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });

}
const sendErrorProd = (err,res)=>{
// operational error, trusted error: send message to client 
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }else{
        // programming or other unknown error: send generic message
        res.status(500).json({
            status: 'error',
            message: 'something went really wrong!!!'
        });
    }
    
}

module.exports=(err,req,res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.statusCode = err.statusCode || 'error';

    // res.status(err.statusCode).json({
    //     status: err.statusCode,
    //     message: err
    // })

    if (process.env.NODE_ENV === "development"){
        sendErrorDev(err,res)

       
    } else if (process.env.NODE_ENV === "production"){
        let error = {...err}
        if(err.name === "CastError") error= handleCastErrorDB(error);
        if(err.code === 11000) error = handleDuplicateFileDB(error);
        if(err.name === "ValidationError") error = handleValidationErrorDB(error);  // is an error when trying to create a field and you did not input the content
        if (err.name === "JsonWebToken") error = handleJWTErrorDB(error);
        if (err.name === "TokenExpiredError") error = handleExpiredToken(error);
        sendErrorProd(error,res);
    }
    
}