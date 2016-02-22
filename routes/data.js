/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Test data routes
 * @version 0.0.0
 * @author 571555
 */
"use strict";

// Get required modules
var async   = require('async');
var config  = require('../config/config');
var express = require('express');
var jwt     = require('jsonwebtoken');
var router  = express.Router();
var winston = require('winston');

// Get required Models
var User      = require('../models/User');
var House     = require('../models/House');
var HouseInfo = require('../models/HouseInfo');
var HouseStat = require('../models/HouseStats');
var HouseUser = require('../models/HouseUsers');
var RoomPlot  = require('../models/RoomPlot');

// Load users.json
router.get('/load/users', function(req, res, next){
  loadUserData(res);
});

// Load houses.json
router.get('/load/houses', function(req, res, next){
  loadHouseData(res);
});

// Load houseinfos.json
router.get('/load/houseInfos', function(req, res, next){
  loadHouseInfoData(res);
});

// Load housestats.json
router.get('/load/houseStats', function(req, res, next){
  loadHouseStatData(res);
});

// Load houseusers.json
router.get('/load/houseusers', function(req, res, next){
  loadHouseUserData(res);
});

// Generate random room plot data from now until a set amount of days
// @params
//   roomdId -> id of the room
//   days    -> amount of days
router.get('/load/generateRoomPlotData/:roomId/:days', function(req, res, next){
  var roomId = toObjectId(req.params.roomId);
  generateRoomPlot(roomId, req.params.days, res);
});

module.exports = router;

// Load User Data
// @params
//   res -> response object from express
function loadUserData (res){
  var users = require('../data/users');
  async.map(users, function(user, callback){

    // Check if user exists
    User.findOne({
      email: user.email
    }, function(err, foundUser) {
      if (err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }

      // If user is found, skip to next user
      if (foundUser) {
        callback();
      } else {
        // Get credentials
        var newUser = new User(user);

        // Encrypted password
        newUser.password = newUser.generateHash(user.password);

        // Set _id field
        newUser._id = require('mongoose').Types.ObjectId(user._id);

        // Save user into database
        newUser.save( function(err) {
          winston.info('Entering User.save()');

          if(err){
            winston.error(err);
            res.json({
              success: false,
              message: err,
            });
          }
          
          winston.info('Exiting User.save()');
          callback();
        });
      }
    })}, function(err, results){
      if(err){
        winston.error(err);
        res.json({
        success: false,
        message: err
      });
      }

      res.json({
        success: true,
        message: "Data loaded"
      });
    });
}

// Load House data
// @params
//   res -> response object from express
function loadHouseData (res){
  var houses = require('../data/houses');
  async.map(houses, function(house, callback){
    var id = require('mongoose').Types.ObjectId(house._id);
    // Check if house exists
    House.findOne({
      _id: id
    }, function(err, foundHouse) {
      if (err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }

      // If house is found, skip to next house
      if (foundHouse) {
        callback();
      } else {
        // Get credentials
        var newHouse = new House(house);

        // Set _id field
        newHouse._id = id

        // Save house into database
        newHouse.save( function(err) {
          winston.info('Entering House.save()');

          if(err){
            winston.error(err);
            res.json({
              success: false,
              message: err,
            });
          }
          
          winston.info('Exiting House.save()');
          callback();
        });
      }
    })}, function(err, results){
      if(err){
        winston.error(err);
        res.json({
        success: false,
        message: err
      });
      }

      res.json({
        success: true,
        message: "Data loaded"
      });
    });
}

// Load HouseInfo data
// @params
//   res -> response object from express
function loadHouseInfoData (res){
  var houseInfos = require('../data/houseinfos');
  async.map(houseInfos, function(houseInfo, callback){
    var id = require('mongoose').Types.ObjectId(houseInfo._id);
    // Check if house info exists
    HouseInfo.findOne({
      _id: id
    }, function(err, foundHouseInfo) {
      if (err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }

      // If house info is found, skip to next house
      if (foundHouseInfo) {
        callback();
      } else {
        // Get credentials
        var newHouseInfo = new HouseInfo(houseInfo);

        // Set _id field
        newHouseInfo._id = id

        // Save house info into database
        newHouseInfo.save( function(err) {
          winston.info('Entering HouseInfo.save()');

          if(err){
            winston.error(err);
            res.json({
              success: false,
              message: err,
            });
          }
          
          winston.info('Exiting HouseInfo.save()');
          callback();
        });
      }
    })}, function(err, results){
      if(err){
        winston.error(err);
        res.json({
        success: false,
        message: err
      });
      }

      res.json({
        success: true,
        message: "Data loaded"
      });
    });
}

// Load HouseStat data
// @params
//   res -> response object from express
function loadHouseStatData (res){
  var houseStats = require('../data/housestats');
  async.map(houseStats, function(houseStat, callback){
    var id = require('mongoose').Types.ObjectId(houseStat._id);
    // Check if house stat exists
    HouseStat.findOne({
      _id: id
    }, function(err, foundHouseStat) {
      if (err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }

      // If house stat is found, skip to next house
      if (foundHouseStat) {
        callback();
      } else {
        // Get credentials
        var newHouseStat = new HouseStat(houseStat);

        // Set _id field
        newHouseStat._id = id

        // Set timestamp field
        newHouseStat.timestamp = new Date(houseStat.timestamp)

        // Save house stat into database
        newHouseStat.save( function(err) {
          winston.info('Entering HouseStat.save()');

          if(err){
            winston.error(err);
            res.json({
              success: false,
              message: err,
            });
          }
          
          winston.info('Exiting HouseStat.save()');
          callback();
        });
      }
    })}, function(err, results){
      if(err){
        winston.error(err);
        res.json({
        success: false,
        message: err
      });
      }

      res.json({
        success: true,
        message: "Data loaded"
      });
    });
}

// Load HouseUser data
// @params
//   res -> response object from express
function loadHouseUserData (res){
  var houseUsers = require('../data/houseusers');
  async.map(houseUsers, function(houseUser, callback){
    var id = require('mongoose').Types.ObjectId(houseUser._id);
    // Check if house user exists
    HouseUser.findOne({
      _id: id
    }, function(err, foundhouseUser) {
      if (err){
        winston.error(err);
        res.json({
          success: false,
          message: err
        });
      }

      // If house user is found, skip to next house
      if (foundhouseUser) {
        callback();
      } else {
        // Get credentials
        var newhouseUser = new HouseUser(houseUser);

        // Set _id field
        newhouseUser._id = id

        // Save house user into database
        newhouseUser.save( function(err) {
          winston.info('Entering HouseUser.save()');

          if(err){
            winston.error(err);
            res.json({
              success: false,
              message: err,
            });
          }
          
          winston.info('Exiting HouseUser.save()');
          callback();
        });
      }
    })}, function(err, results){
      if(err){
        winston.error(err);
        res.json({
        success: false,
        message: err
      });
      }

      res.json({
        success: true,
        message: "Data loaded"
      });
    });
}

// Generate random plot data
// @params
//   roomId -> id of the room to make data for
// @returns
//   [roomPlot] -> an array of roomPlot documents
function generateRoomPlot (roomId, days, res) {
  var plot = {};
  for(var i = 0; i < days ; i++){
    for(var j = 0; j < 24 ; j++){
      var date = new Date(2015, 10, i, j, Math.floor(Math.random()*60), Math.floor(Math.random()*60), 0);
      
      plot = {
        roomId: roomId,
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        inDST: false,
        timestamp: date,
        // Ranges from “infinite” (99999999) to 0, “pitch black” to very bright
        light: Math.floor(Math.random()*99999999),
        tempAnalog: Math.floor(Math.random()*100),
        // 0 (no activity) to 3.34 (sensor tripped)
        IR: Math.random()*3.34,
        tempDigital: Math.floor(Math.random()*100),
        currentTemp: Math.floor(Math.random()*100),
        outsideTemp: Math.floor(Math.random()*100),
        desiredTemp: Math.floor(Math.random()*100),
        fastHumidity: Math.floor(Math.random()*100),
        slowHumidity: Math.floor(Math.random()*100)
      };

      (function(plot) {
        var newPlot = new RoomPlot(plot);
        newPlot.save();
      })(plot);

    }
  }
  res.json({
    success: true,
    message: "Data added"
  })
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