/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * Config File
 * @version 0.0.0
 * @author 571555
 */
var config  = {};
var winston = require('winston');

config.database = {
  name: 'oneoaksystems',
  password: 'admin',
  username: 'admin',
  host: 'localhost',
  port: '27017',
  offsetDefault: 0,
  limitDefault: 10,
  uri: '',
  // Uses the information provided above to create MongoDB URI
  // @returns {MongoDB URI (String)}
  getUri: function () {
    winston.info('Entering config.getUri()');
    winston.info('Exiting config.getUri()');

    if (this.uri)
      return uri;
    
    return 'mongodb://' 
    + this.username 
    + ':' + this.password 
    + '@' + this.host 
    + ':' + this.port
    + '/' + this.name;
  }
};

// Contains all the enums used in the app
// enums are located in config so that they can easily be changed
config.enums = {
  alertStatuses:     ['current', 'resolved'],
  alertTypes:        ['warning', 'error'],
  buildingTypes:     ['Apartment', 'Dorm', 'Family Home'],
  houseInfoTypes:    ['homeowner', 'landlord', 'resident'],
  houseUserRoles:    ['admin', 'operator', 'user', 'viewer'],
  residentTypes:     ['student', 'family', 'senior', 'shared house'],
  roomTypes:         ['very small', 'small', 'medium', 'large', 'very large'],
  temperatureUnits:  ['Celsius', 'Fahrenheit'],
  unitType:          ['efficiency', '1br', '2br', '3br', '4br'],
  userComfortLevels: ['cold', 'cool', 'perfect', 'warm', 'hot', 'custom']
};

config.regex = {
  email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
};

config.logging = {
  level: 'error'
};

config.web = {
  host: 'localhost',
  port: process.env.WEB_PORT || 8080,
  secret: 'oneoaksystems',
  // Token Expiration in seconds
  // 84000 = 24 hours
  tokenExpiration: 84000,
};

// Set winston logging level
winston.level = config.logging.level;

module.exports = config;
