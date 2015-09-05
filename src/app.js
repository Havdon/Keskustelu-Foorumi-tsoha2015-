var express = require('express');
var db = require('./db');
var bootstrapControllers = require('./controllers/bootstrap');

var app = {
	express: null,
	server: null,
	config: null,
	assert:  require('assert'),
	init: function(config) {
		app.config = config;
		app.express = express();
		app.express.set('view engine', 'jade');

		app.express.set('views', 'src/views');

		db.init(app);

		bootstrapControllers(app);

		app.server = app.express.listen(3000, function () {
		  var host = app.server.address().address;
		  var port = app.server.address().port;

		  console.log('Example app listening at http://%s:%s', host, port);
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