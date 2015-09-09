/**
	Bootstraps all controllers into the system.
*/
var fs = require('fs'),
	nodePath = require('path'),
	extend = require('extend');
module.exports = function(app) {

	var Controller = require('../controller');
	Controller.app = app;
	var views = [];
	var parseController = function(name) {
		if (name === nodePath.basename(__filename)) return;
		app.log('\n Controller %s', name);
		var controller = require(__dirname + '/' + name + '/' + name);
		var name = controller.name || name;

		views.push(__dirname + '/' + name + '/views');

		controller = extend(false, controller, Controller);
		controller.__init();
	};


	fs.readdirSync(__dirname).forEach(parseController);
	views.push('src/views');
	app.express.set('views', views);
};