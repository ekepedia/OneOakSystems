/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * House User Model
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

// Create the House User schema
var houseUserSchema = new Schema({
  houseId: {
    type: Schema.Types.ObjectId,
    ref: 'House'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String,
    enum: config.enums.houseUserRoles
  }
});

// Add schema to the database
var HouseUser = mongoose.model('HouseUser', houseUserSchema);

// Make the model available to the rest of the application
module.exports = HouseUser;