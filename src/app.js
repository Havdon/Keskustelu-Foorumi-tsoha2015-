var express = require('express');
var db = require('./db');
var bootstrapControllers = require('./controllers/bootstrap');
var bootstrapModels = require('./models/bootstrap');

var app = {
	express: null,
	server: null,
	config: null,
	assert:  require('assert'),
	models: {},
	init: function(config) {
		app.config = config;
		app.express = express();
		app.express.set('view engine', 'jade');
		app.express.use('/static', express.static('src/public'));
		
		db.init(app);

		bootstrapModels(app);
		bootstrapControllers(app);

		app.server = app.express.listen(3000);
	}
};


app.log = function() {
	if (app.config.verbose) {
		console.log.apply(console, arguments);
	}
};

app.error = function() {
	console.error.apply(console, arguments);
};

module.exports = app;