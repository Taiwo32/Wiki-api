const express = require ('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// swagger 
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

const rateLimit = require('express-rate-limit'); // it use to reduce the amount of request a user can make to a certain end point
const helmet = require('helmet'); // 
const mongoSanitize = require('express-mongo-sanitize'); // it is used to prevent No SQL injection
const xss = require('xss-clean');  //npm i  xss-clean@^0.1.1 
//
const hpp = require('hpp'); // hpp is a middleware to protect against http params attacks 
const cookieParser =require('cookie-parser');
const cors = require('cors');

const wikiRouter = require('./routes/wikiRoute'); 
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController')

const app = express()
app.use(bodyParser.json());
app.enable('trust proxy');

// set security http headers
app.use(helmet())

// implement CORS 
app.use(cors());
// access-control-allow-origin * 
app.options("*",cors());


app.use(morgan("dev")); // it shows our request and response 

// Limit request from same ip 
const limiter = rateLimit({
    max: 100,  // amount of request you can makes is 100 in 60 minute
    windowMs: 60 * 60 * 1000,
    message: "Too many request from thus IP, please try again in an hour",
});
app.use('/api', limiter) // use this end pointer 

//data sanitization against NoSQL query injection
app.use(mongoSanitize());


// routes 
app.get("/",(req,res)=>{
    res.send("<h1> Welcome to article api </h1> <a href='/api-docs'>Documentation");
});
// if you have html file 
// app.get("/",(req,res)=>{
//     res.sendFile(__dirname + "/index.html")
// })
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use('/api/v1/wiki',wikiRouter)
app.use('/api/v1/user',userRouter)

// handling unhandled routes 
// for all http method

app.all('*',(req,res, next)=>{  //* means get all 
    next(new AppError(`Can't find ${req.originalUrl}on this server`,404));
});
// error handling middleware  
app.use(globalErrorHandler); 
//server //
module.exports = app;