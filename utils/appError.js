class AppError extends Error {
    constructor(message,statusCode){
        super(message);

        this.statusCode = statusCode;
        this.status = `$(statuscode)`.startsWith('4')? 'fail' : "error";  // just like an if and else statement it is called ternary operator
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError;

//By default Error comes with the node package, 
// Our AppError is inheriting i.e tapping into the properties of the Error class
// we are using it to define our own error format 
// Read about JS class and Inheritance, You'll understand the constructor and super 
// AppError takes two parameters Message and statuscode. Check line 43 in wikiController