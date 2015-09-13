var express = require('express');
var db = require('./db');
var bootstrapControllers = require('./controllers/bootstrap');
var bootstrapModels = require('./models/bootstrap');
var bodyParser = require('body-parser');
var timeout = require('connect-timeout');
var auth = require('./auth');
var app = {
	express: null,
	server: null,
	config: null,
	assert:  require('assert'),
	models: {},
	auth: null,
	init: function(config) {
		app.config = config;
		app.express = express();
		app.express.set('view engine', 'jade');
		app.express.use('/static', express.static('src/public'));
		app.express.use(bodyParser.json());
		app.express.use(bodyParser.urlencoded({
  			extended: true
		}));
		app.express.use(timeout(3000));
		db.init(app);

		app.auth = auth;
		app.auth.init(app);

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