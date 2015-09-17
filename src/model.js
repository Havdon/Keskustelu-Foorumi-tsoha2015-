var extend = require('extend');
var Model = function() {
	this.app = null;
};

Model.prototype.__init = function(app) {
	this.app = app;
};
Model.prototype.require = function(data, values, methodName) {
	for(var i in values) {
		this.app.assert(typeof(data[values[i]]) !== 'undefined', 'The "' + values[i] + '" not defined when calling ' + methodName);
	}
};

module.exports = function(impl) {
	var model = new Model();
	return extend(false, model, impl);
};

module.exports.Type = Model;