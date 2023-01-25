const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Dublicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationFieldsDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

//jwt error
const handleJWTError = () =>
  new AppError('Invalid Token. Please Log in again!', 401);

//jwt token error
const handleJWTExpiredError = () =>
  new AppError('Your token is expired! Please log in again');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //operational trusted errors which can be send back to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } // unknown errors .
  else {
    //log error to hosting platform's console
    console.error('Error', err);

    //send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDublicateFieldsDB(error);

    if (error.name === 'ValidationError')
      error = handleValidationFieldsDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
