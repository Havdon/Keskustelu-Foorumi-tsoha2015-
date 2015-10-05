var fs = require('fs'),
	nodePath = require('path');
module.exports = function(app) {

	var parseModels = function(name) {
		if (name === nodePath.basename(__filename) || name.charAt(0) === '.') return;
		
		var model = require(__dirname + '/' + name);
		model.__init(app);
		name = name.replace('.model.js', '');
		app.log('\n Model %s', name);
		app.models[name] = model;
	};


	fs.readdirSync(__dirname).forEach(parseModels);
};