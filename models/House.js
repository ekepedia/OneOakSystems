/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * House Model
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

// Create the House schema
var houseSchema = new Schema({
  name: String,
  image: String,
});

// Add schema to the database
var House = mongoose.model('House', houseSchema);

// Make the model available to the rest of the application
module.exports = House;