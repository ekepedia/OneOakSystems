/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Room Energy Savings Model
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

// Create the Room Energy Savings schema
var roomEnergySavingsSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  preSystemEnergyExpenditure: Number,
  postSystemEnergyExpenditure: Number,
  energySavings: Number,
  timestamp: Date
});

// Add schema to the database
var RoomEnergySavings = mongoose.model('RoomEnergySavings', roomEnergySavingsSchema);

// Make the model available to the rest of the application
module.exports = RoomEnergySavings;