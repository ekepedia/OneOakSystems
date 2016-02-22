/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Authorization Routes
 * @version 0.0.0
 * @author 571555
 */
// Get required modules
"use strict";
var config  = require('../config/config');
var express = require('express');
var jwt     = require('jsonwebtoken');
var router  = express.Router();
var winston = require('winston');

// Get required Models
var User = require('../models/User');

// Sign up
// @params
//   fullname
//   email
//   password
router.post('/signup', function(req, res, next) {
  winston.info('POST /api/signup');

  // Check if user exists
  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err)
      winston.error(err);

    // If user is found
    if (user) {
      res.json({ 
        success: false, 
        message: 'Sign up failed. User already exists.'
      });
    } else {
      // Get credentials from request body
      var user = new User( req.body );

      // Encrypted password
      user.password = user.generateHash(req.body.password);

      if(req.body._id){
        user._id = require('mongoose').Types.ObjectId(req.body._id);
      }
      // Save user into database
      user.save( function(err) {
        winston.info('Entering User.save()');

        if(err){
          winston.error(err);
          res.json({
            success: false,
            message: err
          });
        }

        winston.info('Exiting User.save()');

        res.json({
          success: true,
          data: user
        });
      });
    }
  });
});

// Sign in
// @params
//   email
//   password
router.post('/signin', function(req, res, next) {
  winston.info('POST /api/signin');

  // Check in database for user
  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err)
      winston.error(err);

    // If user is not found
    if (!user) {
      res.json({ 
        success: false,
        message: 'Authentication failed. User not found.' });
    } else {

      // Check if password is valid
      if (!user.validPassword(req.body.password)) {
        res.json({ 
          success: false, 
          message: 'Authentication failed. Wrong password.' });
      } else {

        // Create Token
        var token = jwt.sign({_id: user._id}, config.web.secret, {
          expiresIn: config.web.tokenExpiration
        });

        res.json({
          success: true,
          token: token
        });
      }   

    }

  });
});

module.exports = router