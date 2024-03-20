module.exports = (fn) =>{
    return (req,res,next)=>{
        fn(req, res, next).catch(next);
    };
};


//replacing the try and catch in the controller 