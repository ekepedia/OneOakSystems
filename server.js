/*
 * Copyright (c) 2015 TopCoder, Inc. All rights reserved.
 */
/**
 * server file
 * @version 0.0.0
 * @author 571555
 */
"use strict";

// Retrieve required modules
var app    = require('./app.js');
var config = require('./config/config.js')

// Get port from config
var port = config.web.port;

// Run server on port
app.listen(port);
