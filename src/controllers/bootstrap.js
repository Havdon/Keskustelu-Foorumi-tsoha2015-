/**
	Bootstraps all controllers into the system.
*/
var fs = require('fs'),
	nodePath = require('path'),
	extend = require('extend'),
	Controller = require('../controller').Type;
module.exports = function(app) {

	
	var views = [];
	var parseController = function(name) {
		if (name === nodePath.basename(__filename)) return;
		app.log('\n Controller %s', name);
		var controller = require(__dirname + '/' + name + '/' + name);
		app.assert(controller instanceof Controller, "Controllers need to be wrapped in Controller");
		var name = controller.name || name;

		views.push(__dirname + '/' + name + '/views');
		controller.__init(app);
	};


	fs.readdirSync(__dirname).forEach(parseController);
	views.push('src/views');
	app.express.set('views', views);
};