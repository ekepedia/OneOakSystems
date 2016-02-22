/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Room Temperature Model
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

// Create the Room Temperature schema
var roomTemperatureSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  userComfortLevel: {
    type: String,
    enum: config.enums.userComfortLevels
  },
  targetTemperatureValue: Number,
  createDate: Date
});

// Add schema to the database
var RoomTemperature = mongoose.model('RoomTemperature', roomTemperatureSchema);

// Make the model available to the rest of the application
module.exports = RoomTemperature;