var express = require('express');
var db = require('./db');

var app = {
	express: null,
	server: null,
	config: null,
	init: function(config) {
		app.config = config;
		app.express = express();
		app.express.set('view engine', 'jade');

		

		app.express.set('views', 'src/views');


		db.init(app);

		app.server = app.express.listen(3000, function () {
		  var host = app.server.address().address;
		  var port = app.server.address().port;

		  console.log('Example app listening at http://%s:%s', host, port);
		});
	}

};

module.exports = app;