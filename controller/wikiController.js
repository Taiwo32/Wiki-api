// the controller is where we add all our logic

const Article = require ('../models/wikiModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllArticles = catchAsync (async (req, res, next)=>{ 
    const articles = await Article.find()
        res.status(200).json({
            status: 'success',
            result: articles.length,
            data: {
                articles
            }

        })
    
})

exports.createArticle = catchAsync (async (req,res,next)=>{
    
        const{title, content,author} = req.body

        // if (!title || !content || !author){
        //     return res 
        //     .status(400)
        //     .json({status: 'fail', message: 'missing required fields'});
        // }
        const newArticle = await Article.create({title, content,author});
        res.status(201).json({
            status: 'success',
            data:{
                article: newArticle,
            },
        });

    
});

exports.getOneArticle = catchAsync (async (req,res, next)=>{
    const article = await Article.findOne({title: req.params.title});
    if(!article){
        return next(new AppError('No article found with that title', 400));
    }
    res.status(200).json({
        status: 'success',
        data:{
            article,
        },
    });

    
});
exports.updateArticle = catchAsync (async (req,res,next)=>{
    const article = await Article.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators:true,
    });
    if(!article){
        return next(new AppError('No article found with that ID'));
    }
    res.status(200).json({
        status: "success",
        data:{
            article,
        },
    });
});
exports.deleteArticle = catchAsync (async (req,res, next)=>{
    const article = await Article.findByIdAndDelete(req.params.id);
        if(!article){
            return next(new AppError('No article found with that ID'));
        }
        res.status(204).json({
            status: "success",
            data: null,
        });
});