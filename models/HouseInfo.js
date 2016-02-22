/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * House Info Model
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

// Create the House Info schema
var houseInfoSchema = new Schema({
  houseId: {
    type: Schema.Types.ObjectId,
    ref: 'House'
  },
  type: {
    type: String,
    enum: config.enums.houseInfoTypes,
    required: true
  },
  numberOfResidents: Number,
  residentType: {
    type: String,
    enum: config.enums.residentTypes
  },
  roomType: [{
    type: {
      type: String,
      enum: config.enums.roomTypes
    },
    quantity: Number
  }],
  buildingType: {
    type: String,
    enum: config.enums.buildingTypes
  },
  unitType: [{
    unityType: {
      type: String,
      enum: config.enums.unitTypes
    },
    numberofUnits: Number,
    people: Number
  }],
  temperatureUnit: {
    type: String,
    enum: config.enums.temperatureUnits,
    default: 'Fahrenheit'
  }
});

// Add schema to the database
var HouseInfo = mongoose.model('HouseInfo', houseInfoSchema);

// Make the model available to the rest of the application
module.exports = HouseInfo;