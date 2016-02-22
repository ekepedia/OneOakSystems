/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * /rooms routes
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
var Room            = require('../models/Room');
var RoomPlot        = require('../models/RoomPlot');
var RoomSchedule    = require('../models/RoomSchedule');
var RoomTemperature = require('../models/RoomTemperature');
var RoomAlerts      = require('../models/RoomAlerts');
var HouseUsers      = require('../models/HouseUsers');
 
// Update or create Room document
// @params
//   roomId       -> id of existing room
//   houseId      -> id of house
//   bundleId     -> name of the room
//   description  -> description of the room
//   size         -> size of the room
//   ventsCount   -> number of vents in the room
//   windowsCount -> number of windows in the room
//   schedule:    -> array of json objects with following fields:
//     startTime: -> start time of schedule
//     endTime:   -> end time of schedule
//     value:     -> the temperature value for this schedule
router.post('/rooms', function(req, res, next){
  if(req.body.roomId){

    var roomId = toObjectId(req.body.roomId);
    if(!roomId){
      res.json({
        success: false,
        message: "Invalid Object Id"
      });
      return;
    }

    validateRole(req, null, roomId, ['admin', 'user', 'operator'], function(err, message){
      if(err){
        res.json({
          success: false,
          message: message
        });
        return;
      }

      // Deep copy req.body into roomparams in a way that
      // will not effect the original req.body. 
      var roomparams = JSON.parse(JSON.stringify(req.body));
      var schedules  = null;
       // Check is schedules have been defined
      if(roomparams.schedule){
        // Deep copy schedules into schedules so that they will not
        // get deleted when removed from roomparams
        schedules  = JSON.parse(JSON.stringify(roomparams.schedule));
        // Removed the schedule key from the object
        delete roomparams.schedule;
      }

      Room.findByIdAndUpdate(roomId, {$set: roomparams},{}, function(err, room){
        if(err){
          res.json({
            success: false,
            message: err
          });
          return;
        }

        if(!room){
          res.json({
            success: false,
            message: "Room not found"
          });
          return;
        }

        if(schedules){
          addSchedules(roomId, schedules, room, res);
          return;
        }

        res.json({
          success: true,
          data: room
        });

      });

    });
    
  }
  else {
    validateRole(req, req.body.houseId, null, ['admin', 'user', 'operator'], function(err, message){
      if(err){
        res.json({
          success: false,
          message: message
        });
        return;
      }

      // Deep copy req.body into roomparams in a way that
      // will not effect the original req.body. 
      var roomparams = JSON.parse(JSON.stringify(req.body));
      var schedules  = null;
      // Check is schedules have been defined
      if(roomparams.schedule){
        // Deep copy schedules into schedules so that they will not
        // get deleted when removed from roomparams
        schedules  = JSON.parse(JSON.stringify(roomparams.schedule));
        // Removed the schedule key from the object
        delete roomparams.schedule;
      }

      var newRoom = new Room(roomparams);

      // Set name of newRoom
      newRoom.name = roomparams.bundleId;

      newRoom.save(function(err){
        if(err){
          res.json({
            success: false,
            message: err
          });
          return;
        }

        if(schedules){
          addSchedules(roomId, schedules, newRoom, res);
          return;
        }
        res.json({
          success: true,
          data: newRoom
        });

      });   
    });
  }
});

// Get plot data from rooms
// @params
//   ids -      > ids of the rooms
//   startDate -> start date for data
//   endDate   -> end date for data
// @returns
//   [
//     [currentTemperature], -> averages of current temperatures
//     [outsideTemperature], -> averages of outside temperatures
//     [desiredTemperature]  -> averages of desired temperatures
//   ]
router.get('/rooms/plot', function(req, res, next){
  var roomIds = req.query.ids.split(',');
  var endDate = new Date(Date.now());
  var startDate = new Date(Date.now());

  // Set start date 24 hours before
  startDate.setDate(startDate.getDate()-1);

  // Check if dates were passed in the query
  if(req.query.startDate && req.query.endDate){
    startDate = new Date(req.query.startDate);
    startDate = new Date(req.query.startDate);
  }

  async.map(roomIds, function(roomId, callback){
    var id = toObjectId(roomId);
    if(!id){
      res.json({
        success: false,
        message: "Invalid Object Id"
      });
      callback(1)
      return;
    }
    aggregateRoomPlot(id, startDate, endDate, callback);
  }, function(err, results){
    if(err){
      res.json({
        success: false,
        message: err
      });
      return;
    }
    res.json({
      success: true,
      data: results
    })
  });
  
});

// Get specific room
// @params
//   id -> id of the room
// @returns
//   {
//     room { 
//       roomSchedule     -> latest schedule
//       roomTemperature -> latest temperature
//       houseId          -> id of house
//       bundleId         -> name of the room
//       description      -> description of the room
//       size             -> size of the room
//       ventsCount       -> number of vents in the room
//       windowsCount     -> number of windows in the room
//     }           
//   }
router.get('/rooms/:id', function(req, res, next){
  var roomId = toObjectId(req.params.id);
  if(!roomId){
    res.json({
      success: false,
      message: "Invalid Object Id"
    });
    return;
  }

  Room.findOne({_id: roomId}, function(err, room){
    if(err){
      res.json({
        success: false,
        message: err
      });
      return;
    }

    if(!room){
      res.json({
        success: false,
        message: "Room not found"
      });
      return;
    }

    RoomTemperature.findOne({roomId: roomId}, {}, 
      { sort: { 'createDate' : -1 } },  function(err, roomTemperature){
        if(err){
          res.json({
            success: false,
            message: err
          });
          return;
        }

        if(!roomTemperature){
          res.json({
            success: false,
            message: "No room temperature found"
          });
          return;
        }

      RoomSchedule.findOne({roomId: roomId}, {}, 
        { sort: { 'createDate' : -1 } },  function(err, roomSchedule){
          if(err){
            res.json({
              success: false,
              message: err
            });
            return;
          }

          if(!roomSchedule){
            res.json({
              success: false,
              message: "Room schedule not found"
            });
            return;
          }

          room                 = room.toObject();
          room.roomTemperature = roomTemperature.toObject();
          room.roomSchedule    = roomSchedule.toObject();

          res.json({
            success: true,
            data: room
          });

          return;
        });
    });

    return;
  });
});

// Get room schedules
// @params
//   ids -> roomIds separated by commas
// @returns
//   [schedules] -> an array of the most current schedules
//                  for each room 
router.get('/schedules', function(req, res, next){
  var ids = req.query.ids.split(',');
  async.map(ids, function(id, callback) {
    var objId = toObjectId(id);
    if(!objId){
      res.json({
        success: false,
        message: "Invalid Object Id"
      });
      callback(1)
      return;
    }
    callback(null, objId);
  }, function(err, newIds){
    async.map(newIds, function(newId, callback){
      RoomSchedule.findOne({roomId: newId}, {}, 
        { sort: { 'createDate' : -1 } },  function(err, roomSchedule){
          if(err){
            res.json({
              success: false,
              message: err
            });
            callback(err);
            return;
          }

          if(!roomSchedule){
            res.json({
              success: false,
              message: "Room schedule not found"
            });
            callback(1);
            return;
          }

          callback(null, roomSchedule);
        });
    }, function(err, schedules){
      if(err){
        res.json({
          success: false,
          message: err
        });
        return;
      }

      res.json({
        success: true,
        data: schedules
      });
      return;
    });
  });
});

// Set multiple room schedules
// @params
//   [room schedules] -> an array of room schedules
//     {
//        roomId:    -> Id of the room
//        schedule:  -> an array of json objects with following fields :
//          startTime: -> Start time
//          endTime:   -> End time
//          value:     -> The temperature value
//     }
// @returns
//   [room schedules] -> an array of created room schedules
router.post('/schedules', function(req, res, next){
  async.map(req.body.roomSchedules, function(roomSchedule, callback){
    validateRole(req, null, roomSchedule.roomId, ['admin', 'user', 'operator'], function(err, message){
      if(err){
        res.json({
          success: false,
          message: message
        });
        callback(err);
      }
      addSchedules(
        roomSchedule.roomId,
        roomSchedule.schedule,
        null,
        null,
        callback
      );
    });
  }, function(err, schedules){
    if(err){
      return;
    }
    res.json({
      success: true,
      data: schedules
    });
    return;
  });
});

// Set Room Temperature
// @params
//   id (path parameter):    -> id of the room
//   userComfortLevel:       -> comfort level
//   targetTemperatureValue: -> target temperature value
// @returns
//   {room temperature} -> room temperature object
router.post('/rooms/:id/temperature', function(req, res, next){
  var roomId = toObjectId(req.params.id);
  if(!roomId){
    res.json({
      success: false,
      message: "Invalid Object Id"
    });
    return;
  }

  // Get houseId
  Room.find({_id: roomId}, function(err, room){
    if(err){
      res.json({
        success: false,
        message: err
      });
      return;
    }

    if(!room){
      res.json({
        success: false,
        message: "Room not found"
      });
      return;
    }

    var houseId = room.houseId;

    validateRole(req, null, roomId, ['admin', 'user'], function(err, message){

      if(err){
        res.json({
          success: false,
          message: message
        });
        return;
      }

      var newRoomTemperature = new RoomTemperature(req.body);

      newRoomTemperature.roomId = roomId;
      newRoomTemperature.createDate = Date.now();

      newRoomTemperature.save(function(err){
        if(err){
          res.json({
            success: false,
            message: err
          });
          return;
        }

        res.json({
          success: true,
          data: newRoomTemperature
        });
      });
    });
  });
  
});

// Get latest Room temperature
// @params
//   id -> id of the room
// @returns
//   {room temperature} -> latest room temperature document
router.get('/rooms/:id/temperature', function(req, res, next){
  var roomId = toObjectId(req.params.id);
  if(!roomId){
    res.json({
      success: false,
      messahe: "Invalid Object Id"
    });
    return;
  }
  
  RoomTemperature.findOne({roomId: roomId}, {}, 
    { sort: { 'createDate' : -1 } },  function(err, roomTemperature){
      if(err){
        res.json({
          success: false,
          message: err
        });
        return;
      }

      if(!roomTemperature){
        res.json({
          success: false,
          message: "No room temperature found"
        });
        return;
      }

      res.json({
        success: true,
        data: roomTemperature
      });
    });
});

// Get alerts
// @params
//   ids    -> roomIds separated by commas
//   status -> the status of the alert
// @returns
//   [alters] -> an array of the alerts for each room
router.get('/alerts', function(req, res, next){
  var ids = req.query.ids.split(',');

  async.map(ids, function(id, callback) {
    var objId = toObjectId(id);
    if(!objId){
      res.json({
        success: false,
        message: "Invalid Object Id"
      });
      callback(1);
      return;
    }
    callback(null, objId);
  }, function(err, newIds){
    async.map(newIds, function(newId, callback){
      var query = {roomId: newId};
      if(req.query.status){
        query.status = req.query.status;
      }
      RoomAlerts.find(query)
        .populate('roomId')
        .exec(function(err, roomAlerts){
          if(err){
            res.json({
              success: false,
              message: err
            });
            callback(err);
            return;
          }

          if(!roomAlerts){
            res.json({
              success: false,
              message: "Room alerts not found"
            });
            callback(1)
            return;

          }

          callback(null, roomAlerts);
        });
    }, function(err, alerts){
      if(err){
        res.json({
          success: false,
          message: err
        });
        return;
      }

      res.json({
        success: true,
        data: alerts
      });
      return;
    });
  });
});

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

// Creates a room schedule document
// @params
//   roomId    -> id of the room
//   schedules -> an array of schedule objects
//                {
//                   startTime: -> start time of schedule
//                   endTime:   -> end time of schedule
//                   value:     -> the temperature value for this schedule   
//                }
//   res       -> express response objects
//   callback  -> a callback(err, schedule) that can be used in place of
//                the response object
// @returns
//   {schedule document}
function addSchedules(roomId, schedules, room, res, callback){
  var newRoomSchedule = new RoomSchedule({
    roomId: roomId,
    items: schedules,
    createDate: Date.now()
  });
  // If the is in callback mode
  if(callback){
    newRoomSchedule.save(function(err){
      if(err){
        callback(err);
        return;
      }
      callback(null, newRoomSchedule);
    });
  }

  newRoomSchedule.save(function(err){
    if(err){
      res.json({
        success: false,
        message: err
      });
      return;
    }
    res.json({
      success: true,
      data: {
        room: room,
        schedule: newRoomSchedule
      }
    })
  })
}

// Calculate the average values of the temperatures betweens the dates
// @params
//   roomId    -> id of the room
//   startDate -> start date
//   endDate   -> end date
//   callback  -> a callback function: callback(err, roomplots)
// @returns
//   [room plots] -> an array of room plots
function aggregateRoomPlot(roomId, startDate, endDate, callback){

  if(!startDate || !endDate){
    endDate = new Date(Date.now());
    startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate()-1);
  }

  var grouping = getGrouping(startDate, endDate);

  var match = {
    roomId: roomId,
    timestamp: {
      $gte: startDate,
      $lt: endDate
    }
  };

  var project = {
    roomId: 1,
    timestamp: 1,
    currentTemp: 1,
    outsideTemp: 1,
    desiredTemp: 1,
    groupBy: grouping
  }

  var groupId = getGroupId(startDate, endDate);

  var group = {
    _id: groupId,
    currentTemp: {$avg: "$currentTemp"},
    outsideTemp: {$avg: "$outsideTemp"},
    desiredTemp: {$avg: "$desiredTemp"}
  }

  RoomPlot.aggregate([{$match: match}, {$project: project}, {$group: group}], function(err, results){
    if(err){
      callback(err);
    }
    var converted = convertArray(results);
    callback(null, {
      currentTemperature: converted[0],
      outsideTemperature: converted[1],
      desiredTemperature: converted[2]
    });
  });

}
  
// Determine how to group the room plot data
// <= 1 days is grouped by hour
// <= 3 days is grouped by every 6 hours
// <= 7 days is grouped by every 12 hours
// <= 30 days is grouped daily
// >  30 days is grouped weekly
// @params
//   startDate -> the start date
//   endDate   -> the end date
function getGrouping(startDate, endDate){
  var daysApart = Math.abs(Math.floor((endDate-startDate)/(1000*60*60*24)));

  var groupBy = {};

  // Determine how to group data based on how many days the
  // dates are apart.
  switch (true) {
    case (daysApart <= 1):
        groupBy = {$hour: "$timestamp"}
        break;
    case (daysApart > 1 && daysApart <= 3):
        groupBy = { $subtract: [
          {$hour: "$timestamp"}, {$mod: [{$hour: "$timestamp"}, 6]}
        ]}
        break;
    case (daysApart > 3 && daysApart <= 7):
        groupBy = { $subtract: [
          {$hour: "$timestamp"}, {$mod: [{$hour: "$timestamp"}, 12]}
        ]}
        break;
    case (daysApart > 7 && daysApart <= 30):
        groupBy = {$dayOfMonth: "$timestamp"}
        break;
    case (daysApart > 30):
        groupBy = {$week: "$timestamp"}
        break;
    default:
        groupBy = {$hour: "$timestamp"}
        break;
  }

  return groupBy
}

// Sets the _id for $group
// @params
//   startDate -> start date
//   endDate   -> end date
// @returns
//   _id 
//      {
//        year: {$year: "$timestamp"},     -> get year 
//        month: {$month: "$timestamp"},   -> get month
//        groupBy: "$groupBy"              -> how to group the plots
//        day: {$dayOfMonth: "$timestamp"} -> (optional) get day
//      }
function getGroupId (startDate, endDate) {
  var _id  = {
    year: {$year: "$timestamp"},
    month: {$month: "$timestamp"},
    groupBy: "$groupBy"
  }

  var daysApart = Math.abs(Math.floor((endDate-startDate)/(1000*60*60*24)));

  if(daysApart < 30){
    _id.day = {$dayOfMonth: "$timestamp"}
  }

  return _id;
}

// Converts n*3 to a 3*n
// [{1,2,3},{4,5,6},{7,8,9"] becomes [[1,4,7],[3,5,8],[3,6,9]]
// Used for aggregateRoomPlot()
// @params
//   [{},{},...] -> n*3 array of objects
// @return
//   [[....],[....],[....]] -> 3*n array
function convertArray(arr){
  var a1 = [];
  var a2 = [];
  var a3 = [];
  for(var i = 0; i < arr.length ; i++){
    a1.push(arr[i]['currentTemp']);
    a2.push(arr[i]['outsideTemp']);
    a3.push(arr[i]['desiredTemp']);
  }
  var result = [];
  result.push(a1);
  result.push(a2);
  result.push(a3);
  return result;
} 

// Validate the role of the current user
// @params
//   req      -> express request object
//   houseId  -> id of the house
//   roomId   -> id of the room
//   roles    -> array of authorized roles
//   callback -> callback function: callback(error, message)
function validateRole (req, houseId, roomId, roles, callback){
  if(!houseId){
    Room.findOne({_id: roomId}, function(err, room){
      if(err){
        callback(true, err);
        return;
      }

      if(!room){
        callback(true, "Room not found");
        return;
      }
      var houseId = room.houseId;

      // Verify the current User is a admin or user
      HouseUsers.findOne({userId: req.decoded._id, houseId: houseId}, function(err, houseuser){
        if(err){
          callback(true, err);
          return;
        }

        if(!houseuser){
          callback(true, "House User association not found. You are not authorized");
          return;
        }

        if(roles.indexOf(houseuser.role) == -1){
          var r = roles.toString()
          callback(true, "You must be a "+ r +" to use this endpoint"); 
          return;
        }

        callback(false, null);
      });
    });
  }
  else {
    // Verify the current User is a admin or user
    HouseUsers.findOne({userId: req.decoded._id, houseId: houseId}, function(err, houseuser){
      if(err){
        callback(true, err);
        return;
      }

      if(!houseuser){
        callback(true, "House User association not found. You are not authorized");
        return;
      }

      if(roles.indexOf(houseuser.role) == -1){
        var r = roles.toString()
        callback(true, "You must be a "+ r +" to set temperature"); 
        return;
      }

      callback(false, null);
    });
  }
}

module.exports = router;