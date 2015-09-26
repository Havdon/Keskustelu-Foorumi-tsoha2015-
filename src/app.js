/**
	The application root object, which inits and bootstraps the system at start.
	A god object which contains references to most relevant objects in the system.
*/
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
		app.express.use(timeout(30000));
		db.init(app);
		app.db = db;
		app.auth = auth;
		app.auth.init(app);

		bootstrapModels(app);
		bootstrapControllers(app);

		app.server = app.express.listen(3000);


		app.express.get(app.config.url_prefix + '/clean', function(req, res) {
			db.executeFile('src/sql/drop_tables.sql')
			.then(function() { return db.executeFile('src/sql/create_tables.sql'); })
			.then(function() { return db.executeFile('src/sql/add_test_data.sql'); })
			.then(function() {
				res.send('Done.');
			})
			.done();
		});
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