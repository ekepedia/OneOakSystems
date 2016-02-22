/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * House Stats Model
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

// Create the House Stats schema
var houseStatsSchema = new Schema({
  houseId: {
    type: Schema.Types.ObjectId,
    ref: 'House'
  },
  timestamp: Date,
  predictedNextMonthSavings: {
    type: Number,
    min: 0,
    max: 100
  },
  lastMonthSavings: {
    type: Number,
    min: 0,
    max: 100
  },
  currentTemperature: Number,
  outsideTemperature: Number,
  currentHumidity: Number
});

// Add schema to the database
var HouseStats = mongoose.model('HouseStats', houseStatsSchema);

// Make the model available to the rest of the application
module.exports = HouseStats;