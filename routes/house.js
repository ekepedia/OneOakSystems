/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * /house routes
 * @version 0.0.0
 * @author 571555
 */
"use strict";

// Get required modules
var async   = require('async');
var config  = require('../config/config');
var express = require('express');
var router  = express.Router();
var winston = require('winston');

// Get required Models
var HouseInfo        = require('../models/HouseInfo');
var HouseStats       = require('../models/HouseStats');
var HouseUsers       = require('../models/HouseUsers');

// Get houses that correspond to the logged in user
// The user id was extracted from the token and stored
// in req.decoded._id
// @returns
//   [{house}...] -> an array of house documents
router.get('/houses', function(req, res, next){
  // Get user id
  var id = req.decoded._id;
  // Look in HouseUser database and generate the actual
  // houses from the references in the database
  HouseUsers.find({userId: id})
    .populate('houseId')
    .exec(function(err, houses){
      if(err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }
      // If not houses are found
      else if(!houses){
        res.json({
          success: false,
          message: "User does not have any houses"
        });
      } else {
        // Go through the array of houseusers documents 
        // and only extract the house document
        async.map(houses,
          function(house, callback){
            callback(null, house.houseId);
          }, function(err, results){
            res.json({
              success: true,
              data: results
            });
        });
      }
    });
});

// Get the stats and info of a specific house
// @params
//   id -> the id of the house
// @returns
//   {
//     house:      The original house document
//     houseStats: The stats for the house
//     houseInfo:  The information for the house
//   }
router.get('/houses/:id', function(req, res, next){
  // Get and covert--if necessary--the ids
  var userId  = req.decoded._id;
  var houseId = toObjectId(req.params.id);
  // Check to see if id was valid
  if(!houseId){
    res.send({
      success: false,
      message: "Invalid ObjectId"
    });
    return;
  }
  // Look if the HouseUsers model to find the houses
  // that belong to the users. This is done with the
  // HouseUsers model to make sure that the user can 
  // only access its own houses
  HouseUsers.findOne({userId: userId, houseId: houseId})
    .populate('houseId')
    .exec(function(err, foundHouse){
      if(err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }
      // If no house is found
      else if(!foundHouse){
        res.json({
          success: false,
          message: "Was not able to find specific house, or house does not belong to user"
        });
      } else {
        // Convert house document to object 
        var house = foundHouse.toObject().houseId;
        HouseInfo.findOne({houseId: houseId}, {_id:0 , houseId:0}, 
          function(err, houseInfo){
            if(err){
              winston.error(err);
              res.json({
                success: false,
                message: err
              });
            }
            // If not house info is found
            else if(!houseInfo){
              res.json({
                success: false,
                message: "House info not found"
              });
            } 
            else {
              // Add houseInfo to house object
              house.houseInfo = houseInfo.toObject();
              HouseStats.findOne({houseId: houseId}, {_id:0 , houseId:0}, 
                function(err, houseStats){
                  if(err){
                    winston.error(err);
                    res.json({
                      success: false,
                      message: err
                    });
                  }
                  // No house stats found
                  else if(!houseStats){
                    res.json({
                      success: false,
                      message: "House Stats not found"
                    });
                  }
                  else {
                    // Add house stats to house object
                    house.houseStats = houseStats.toObject();

                    // Send response
                    res.json({
                      success: true,
                      data: house
                    });
                  }
              });
            }
        });
      }
    });
});

// Get stats of a specific house
// @params
//   id -> id of the house
// @returns
//  {
//     houseStats       -> stats of the house
//     temperatureUnit  -> temperature unit of the house
//  }
router.get('/houses/:id/stats', function(req, res, next){
    // Get and covert--if necessary--the ids
  var userId  = req.decoded._id;
  var houseId = toObjectId(req.params.id);
  // Check to see if id was valid
  if(!houseId){
    res.json({
      success: false,
      message: "Invalid ObjectId"
    });
    return;
  }
  HouseStats.findOne({houseId: houseId}, function(err, houseStats){
    if(err){
      winston.error(err);
      res.json({
        success: false,
        message: err
      });
    }
    // If not house stats are found
    else if(!houseStats){
      res.json({
        success: false,
        message: "No house stats were found"
      });
    } else { 
      // Create empty house object
      var house = {};
      // Add houseStats to house object
      house.houseStats = houseStats.toObject();
      HouseInfo.findOne({houseId: houseId}, function(err, houseInfo){
        if(err){
          winston.error(err);
          res.json({
            success: false,
            message: err
          });
        }
        // If houser info is not found
        else if(!houseInfo){
          res.json({
            success: false,
            message: "House info not found"
          })
        } 
        else {
          // Add temperature unit to house object
          house.temperatureUnit = houseInfo.temperatureUnit;

          res.json({
            success: true,
            data: house
          });
        }
      });
    } 
  });
});

// Get the users that belong to a specific house
// @params
//   id -> id of the house
// @returns
//   [{user}] -> an array of users
router.get('/houses/:id/users', function(req, res, next){
  // Get and covert--if necessary--the ids
  var houseId = toObjectId(req.params.id);
  // Check to see if id was valid
  if(!houseId){
    res.json({
      success: false,
      message: "Invalid ObjectId"
    });
    return;
  }
  HouseUsers.find({houseId: houseId})
    .populate('userId')
    .exec(function(err, users){
      if(err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }
      // If no user is found
      else if(!users){
        res.json({
          success: false,
          message: "User not found"
        });
      }
      else {
        // Go through the array of users and only extract
        // user object and remove the password
        async.map(users,
          function(user, callback){
            var us = user.userId.toObject();
            delete us.password;
            callback(null, us);
          }, function(err, results){
            res.json({
              success: true,
              data: results
            });
        });
      }
    });
});

// Delete a user from a house
// @params
//   houseId -> id of the house
//   userId  -> id of the user
router.delete('/houses/:houseId/users/:userId', function(req, res, next){
  // Get and covert--if necessary--the ids
  var userId  = toObjectId(req.params.userId);
  var houseId = toObjectId(req.params.houseId);
  // Check to see if ids were valid
  if(!userId || !houseId){
    res.json({
      success: false,
      message: "Invalid ObjectId"
    });
    return;
  }

  HouseUsers.remove({userId: userId, houseId: houseId}, function(err){
    if(err){
      winston.error(err);
      res.json({
        success: false,
        message: err
      });
      return;
    }

    res.json({
      success: true,
      message: "User association has been removed from the house"
    });

  });

});
// Calculate the saving
// @params 
//   id -> id of the house
// @returns
//   {
//     savingsPercentage: -> the savings percentage
//     savingsPerDay:     -> the savings per day
//   }
router.get('/houses/:id/calculate', function(req, res, next){
    // Get and covert--if necessary--the ids
  var houseId = toObjectId(req.params.id);
  // Check to see if id was valid
  if(!houseId){
    res.json({
      success: false,
      message: "Invalid ObjectId"
    });
    return;
  }
  calculateSavings(res, houseId);
});

// Function to calculate the savings
// Used in GET /house/:id/calculate
// @params
//   res     -> express response object
//   houseId -> id of the house
function calculateSavings(res, houseId){
  // The docs said to hard code this, but I've implemented a function
  // that can be used to calculate the savings later
  /*
    Add functionality here
  */
  res.json({
    success: true,
    data: {
      savingsPercentage : 20,
      savingsPerDay: 100
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
    objectId = ObjectId(id);
  }
  
  return objectId;
}

module.exports = router;