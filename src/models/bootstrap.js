var fs = require('fs'),
	nodePath = require('path'),
	Model = require('../model').Type;
module.exports = function(app) {

	var parseModels = function(name) {
		if (name === nodePath.basename(__filename)) return;
		
		var model = require(__dirname + '/' + name);
		app.assert(model instanceof Model, "Models need to be wrapped in the Model funciton: " + name);
		model.__init(app);
		name = name.replace('.model.js', '');
		app.log('\n Model %s', name);
		app.models[name] = model;
	};


	fs.readdirSync(__dirname).forEach(parseModels);
};