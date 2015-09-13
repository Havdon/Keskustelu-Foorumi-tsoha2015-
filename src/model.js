module.exports = {
	app: null,
	__init: function(app) {
		this.app = app;
	},
	require: function(data, values, methodName) {
		for(var i in values) {
			this.app.assert(typeof(data[values[i]]) !== 'undefined', 'The "' + values[i] + '" not defined when calling ' + methodName);
		}
	}
};