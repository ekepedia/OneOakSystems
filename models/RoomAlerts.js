/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Room Alerts Model
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

// Create the Room Alerts schema
var roomAlertsSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  type: {
    type: String,
    enum: config.enums.alertTypes
  },
  timestamp: Date,
  details: String,
  status: {
    type: String,
    enum: config.enums.alertStatuses
  }
});

// Add schema to the database
var RoomAlerts = mongoose.model('RoomAlerts', roomAlertsSchema);

// Make the model available to the rest of the application
module.exports = RoomAlerts;