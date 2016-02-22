/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Room Schedule Model
 * @version 1.0
 * @author 571555
 */
'use strict';

// Get required modules
var bcrypt    = require('bcrypt-nodejs');
var config    = require('../config/config');
var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var winston   = require('winston');

// Create the Room Schedule schema
var roomScheduleSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  items: [{
    // Time in minutes from 00:00
    startTime: Number,
    // Time in minutes from 00:00
    endTime: {
      type: Number,
      // Validate the the end time is after the start time
      validate: {
        validator: function(v){
          return this.startTime < this.endTime;
        },
        message: 'End time must be after start time!'
      }
    },
    value: Number
  }],
  createDate: Date
});

// Add schema to the database
var RoomSchedule = mongoose.model('RoomSchedule', roomScheduleSchema);

// Make the model available to the rest of the application
module.exports = RoomSchedule;