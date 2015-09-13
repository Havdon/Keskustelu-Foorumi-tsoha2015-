var fs = require('fs'),
	nodePath = require('path'),
	extend = require('extend');
module.exports = function(app) {
	var Model = require('../model');

	var parseModels = function(name) {
		if (name === nodePath.basename(__filename)) return;
		
		var model = require(__dirname + '/' + name);
		model = extend(false, model, Model);
		model.__init(app);
		name = name.replace('.model.js', '');
		app.log('\n Model %s', name);
		app.models[name] = model;
	};


	fs.readdirSync(__dirname).forEach(parseModels);
};