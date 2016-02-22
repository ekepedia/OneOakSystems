/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Room Plot Model
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

// Create the Room Plot schema
var roomPlotSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  year: Number,
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  day: {
    type: Number,
    min: 1,
    max: 31
  },
  hour: {
    type: Number,
    min: 0,
    max: 24
  },
  minute: {
    type: Number,
    min: 0,
    max: 59
  },
  second: {
    type: Number,
    min: 0,
    max: 59
  },
  // Daylight Savings Time flag.
  // true (data collected in DST), 
  // false (data collected not in DST)
  inDST: Boolean,
  timestamp: Date,
  // Ranges from “infinite” (99999999) to 0, “pitch black” to very bright
  light: {
    type: Number,
    min: 0,
    max: 99999999
  },
  tempAnalog: Number,
  // 0 (no activity) to 3.34 (sensor tripped)
  IR: {
    type: Number,
    min: 0,
    max: 3.34
  },
  tempDigital: Number,
  currentTemp: Number,
  outsideTemp: Number,
  desiredTemp: Number,
  fastHumidity: Number,
  slowHumidity: Number
});

// Add schema to the database
var RoomPlot = mongoose.model('RoomPlot', roomPlotSchema);

// Make the model available to the rest of the application
module.exports = RoomPlot;