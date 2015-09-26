/**
	The base object all models extend.
	Adds utility functions for models.
*/
var extend = require('extend');
var Model = function() {
	this.app = null;
};

Model.prototype.__init = function(app) {
	this.app = app;
};
Model.prototype.require = function(data, values, methodName) {
	for(var i in values) {
		this.app.assert(typeof(data[values[i]]) !== 'undefined', 'The "' + values[i] + '" not defined when calling ' + methodName + ' Data : ' + JSON.stringify(data));
	}
};

var isArray = function(obj) {
	return (Object.prototype.toString.call(obj) === '[object Array]');
}

var isCorrectType = function(obj, type) {
	if (type === 'array') {
		return isArray(obj);
	}
	else {
		return (typeof(obj) === type);
	}
}

Model.prototype.validateWithSchema = function(data, schema) {
	this.app.assert((typeof(data) === 'object') && !isArray(data), 'Data is array, when it should be object!');
	for(var i in data) {
		this.app.assert(schema[i] !== null && typeof(schema[i]) !== 'undefined', i + ' does not exist in schema!');
		var type = typeof(schema[i]);
		if (type === 'string') {
			this.app.assert(isCorrectType(data[i], schema[i]), i + ' is not of type ' + schema[i] + ' it is of type ' + typeof(data[i]));
		}
		else {
			this.app.assert(!isArray(schema[i]), 'Schema can\'t contain arrays!');
			this.app.assert(!isArray(data[i]), 'Data is array, when it should be object!');
			this.validateWithSchema(data[i], schema[i]);
		}
	}
}

module.exports = function(impl) {
	var model = new Model();
	return extend(false, model, impl);
};

module.exports.Type = Model;