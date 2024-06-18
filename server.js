const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');


dotenv.config({path: 'config.env' })
const ApiError = require("./utils/apiError");
const globalError = require("./middlwares/errorMiddleware");
const dbConnection = require('./config/database');
const categoryRoute = require('./routes/categoryRoute');

// connect with db
dbConnection();

 // exprees app
const app = express();

// middlwares
app.use(express.json());
if (process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
    console.log(`mode : ${process.env.NODE_ENV}`);
}






// mount routes
app.use('/api/v1/categories', categoryRoute);

app.all("*", ( req, res, next)=>{

  // create error and send it to error handling middlware
  //  const err = new Error(`can't find this route : ${req.originalUrl}`);
  // next(err.message);

    next(new ApiError(`can't find this route : ${req.originalUrl}`, 400));
});


// global error handling middlware for express
app.use(globalError);

const PORT = process.env.PORT || 8012;
    const server =  app.listen(PORT,() => {
    console.log(`app running On port ${PORT}`);
   
});

// handel rejection outside express

process.on('unhandledRejection', (err)=>{
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
    server.close(()=>{
        console.error(`shutting down .....`);
        process.exit(1);
    })
   
});