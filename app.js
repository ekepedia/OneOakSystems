/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Application file for nodeJs server
 * @version 0.0.0
 * @author 571555
 */
"use strict";

// Retrieve required modules
var bodyParser = require('body-parser');
var config     = require('./config/config');
var express    = require('express');
var jwt        = require('jsonwebtoken');
var mongoose   = require('mongoose');
var winston    = require('winston');

// Retrieve required routes
var auth  = require('./routes/auth');
var data  = require('./routes/data');
var house = require('./routes/house')
var me    = require('./routes/me');
var room  = require('./routes/room');
var user  = require('./routes/user');

// Connect database
mongoose.connect(config.database.getUri());

// Check for database connection errors
mongoose.connection.on('error', function (err) {
  winston.error(err);
});

// Start express
var app = express();

// Set up express to read request body's
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set /api routes to get authentication 
app.use('/api' , auth);
app.use('/data', data);

// Middleware for authentication
app.use('/api', authenticate);

// Set /api routes that require authentication
app.use('/api', house);
app.use('/api', me);
app.use('/api', room);
app.use('/api', user);

// Allow app.js to be accessed throughout program
module.exports = app;

// Function that validates the jwt token
function authenticate (req, res, next) {
  // Check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // Decode the token
  if (token) {

    // Verify the token
    jwt.verify(token, config.web.secret, function(err, decoded) {      
      if (err) {
        winston.error(err);
        res.json({ 
          success: false, 
          message: err});    
      } else {
        // Save decoded token to request
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token return an error
    res.status(403).send({ 
      success: false, 
      message: 'No token provided.' 
    });
  }
};