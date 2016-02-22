/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Room Model
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

// Create the Room schema
var roomSchema = new Schema({
  houseId: {
    type: Schema.Types.ObjectId,
    ref: 'House'
  },
  name: String,
  image: String,
  description: String,
  size: {
    type: String,
    enum: config.enums.roomTypes
  },
  ventsCount: Number,
  windowsCount: Number,
  currentTemperature: Number
});

// Add schema to the database
var Room = mongoose.model('Room', roomSchema);

// Make the model available to the rest of the application
module.exports = Room;