/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * user routes
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
var User       = require('../models/User');
var HouseUsers = require('../models/HouseUsers');

// Get users
// @returns
//   [users] -> array of user documents
router.get('/users', function(req, res, next){
  User.find({},{password: 0}, function(err, users){
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
        data: users
      });
    }
  })
});

// Get specific user
// @returns
//   user -> User document
router.get('/users/:id', function(req, res, next){
  var id = require('mongoose').Types.ObjectId(req.params.id);
  User.findOne({_id: id},{password: 0}, function(err, user){
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
  })
});

// Add user or create new user to a house
// @params
//   houseId  -> id of the house
//   userId   -> id of the user
//   user     -> a user document if new user is created
//   role     -> role of the user
// @returns
router.post('/users', function(req, res, next){
  // Convert to ObjectId
  var houseId = toObjectId(req.body.houseId);
  // Check to see if id was valid
  if(!houseId){
    res.json({
      success: false,
      message: "Invalid Object Id"
    });
    return
  }
  // If existing user is provided
  if(req.body.userId){
    // Convert to ObjectId
    var userId = toObjectId(req.body.userId);
    // Check to see if id was valid
    if(!userId){
      res.json({
        success: false,
        message: "Invalid Object Id"
      });
      return
    }
    // Find User in model
    User.findOne({_id: userId},{password: 0}, function(err, user){
      if(err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }
      // Check if User exists
      else if(!user){
        res.json({
          success: false,
          message: "User not found"
        });
      }

      // Verify the current User is a admin
      HouseUsers.findOne({userId: req.decoded._id, houseId: houseId}, function(err, houseuser){
        if(err){
          res.json({
            success: false,
            message: err
          });
          return;
        }

        if(!houseuser){
          res.json({
            success: false,
            message: "House user association not found"
          });
          return;
        }

        if(houseuser.role != 'admin'){
          res.json({
            success: false,
            message: "You must be an admin to change roles"
          });
          return;
        }

        else {
          // Add user to the House User model
          addHouseUser(
            houseId,
            userId,
            req.body.role,
            res,
            user);
        }
      });
      
    });
  } else {
    var newUser = new User({
      fullname: req.body.fullname,
      email:    req.body.email,
      password: "changeme"
    });

    // Encrypted password
    newUser.password = newUser.generateHash(newUser.password);
  
    newUser.save(function(err){
      if(err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      } 
      else {
        addHouseUser(
          houseId, 
          newUser._id,
          req.body.role,
          res,
          newUser
        );
      }
    });
  }
});

// Adds a houseUser association
// @params
//   houseId -> id of the house
//   userId  -> id of the user
//   role    -> role of the user
//   res     -> Response object from express
//   user    -> the user document  
function addHouseUser(houseId, userId, role, res, user){

  var newHouseUser = new HouseUsers({
    houseId: houseId,
    userId:  userId,
    role:    role
  });

  newHouseUser.save(function(err){
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
        data:{
          user: user,
          houseId: houseId
        }
      });
    }
  });
}

// Checks to make sure that an id is valid
// If it is valid, then it converts it.
// Otherwise, it will return null
// @params
//   id -> id to be tested
// @returns
//   obejctId -> objectId version of id, or null
function toObjectId(id){
  var ObjectId = require('mongoose').Types.ObjectId;
  var objectId = null;
  // Only sets the objectId if the id is valid
  if(ObjectId.isValid(id)){
    var objectId = ObjectId(id);
  }
  
  return objectId;
}

module.exports = router;