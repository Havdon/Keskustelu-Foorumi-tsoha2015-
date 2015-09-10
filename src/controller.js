/**
	The base object which all controllers extend from.
	It adds util functionallity, to decrease the code needed in the controllers.
*/
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
		this.app.log('	' + this.name + ': ' + method.toUpperCase() + ' ' + args[0]);
		if(typeof(args[args.length - 1]) == 'function') { 
			args[args.length - 1] = args[args.length - 1].bind(this);
		}
		return this.app.express[method].apply(this.app.express, args);
	},
	render: function(res, view, data) {
		data.global = {};
		data.global.url_prefix = this.app.config.url_prefix;
		res.render(view, data);
	}
};