/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * /me routes
 * @version 0.0.0
 * @author 571555
 */
"use strict";

// Get required modules
var config  = require('../config/config');
var express = require('express');
var router  = express.Router();
var winston = require('winston');

// Get required Models
var User = require('../models/User');

// Get the logged in user
// @returns
//   {user} -> the current user document
router.get('/me', function(req, res, next){
  User.findOne({_id: req.decoded._id}, {password: 0},function(err, user){
    if(err){
      winston.error(err);
      res.json({
        success: false,
        message: err
      });
    }
    else {
      res.json({
        success: true,
        data: user
      });
    }
  });
});

module.exports = router;