/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * User Model
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

// Create the User schema
var userSchema = new Schema({
  fullname: { 
    type: String, 
    required: true, 
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        var emailRegex = config.regex.email
        return emailRegex.test(v);
      },
      message: '{VALUE} is not a valid email!'
    }
  },
  password: {
    type: String, 
    required: true 
  }
});

// encrypt password
// @params password -> the given password to encrypt
// @returns {hash}  -> an encrypted version of the password
userSchema.methods.generateHash = function(password) {
  winston.info('Entering User.generateHash()');
  winston.log('debug','User.generateHash() @params password: %s', password);
  
  var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

  winston.log('debug','User.generateHash() @returns hash: %s',hash);
  winston.info('Exiting User.generateHash()');
  
  return hash
};

// validate password
// @params password -> given unencrypted password to compare
//                     to encrypted password in database
// @returns {boolean} -> whether or not the passwords sync
userSchema.methods.validPassword = function(password) {
  winston.info('Entering User.validPassword()');
  winston.log('debug','User.validPassword() @params password: %s', password);
  console.log(password);
  console.log(this.password);
  var result = bcrypt.compareSync(password, this.password);
  
  winston.log('debug','User.validPassword() @returns boolean: %s', result);
  winston.info('Exiting User.validPassword()');
  
  return result;
};

// Add schema to the database
var User = mongoose.model('User', userSchema);

// Make the model available to the rest of the application
module.exports = User;