module.exports = {
	app: null,
	__init: function() {
		var required = ['name', 'pathPrefix', 'init'];
		for(var i in required) {
			var key = required[i];
			this.app.assert(typeof this[key] !== 'undefined', 'Controller did not define "' + key + '".');
		}
		this.init();
	},
	get: function() {
		return this.call("get", arguments);
	},
	post: function() {
		return this.call("post", arguments);
	},
	put: function() {
		return this.call("put", arguments);
	},
	call: function(method, args) {
		var prefix = '/' + this.pathPrefix;
		if (this.pathPrefix.length < 1) 
			prefix = '';
		args[0] = prefix + (args[0] !== 'index' ? '/' +  args[0] : '');
		this.app.log('	' + this.name + ': ' + method.toUpperCase() + ' /' + args[0]);
		return this.app.express[method].apply(this.app.express, args);
	}
};