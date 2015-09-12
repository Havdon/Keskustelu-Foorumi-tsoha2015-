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
		var self = this;
		var prefix = '/' + this.pathPrefix;
		if (this.pathPrefix.length < 1) 
			prefix = '';
		args[0] = prefix + (args[0] !== 'index' ? '/' +  args[0] : '');
		this.app.log('	' + this.name + ': ' + method.toUpperCase() + ' ' + args[0]);
		if(typeof(args[args.length - 1]) == 'function') { 
			var fn = args[args.length - 1].bind(this);
			args[args.length - 1] = function() {
				self.__currentUrl = args[0];
				var req = arguments[0];
				console.log(req.params);
				for(var i in req.params) {
					self.__currentUrl = self.__currentUrl.replace(':' + i, req.params[i]);
				}
				fn.apply(self, arguments);
			}
		}
		return this.app.express[method].apply(this.app.express, args);
	},
	render: function(res, view, data) {
		data.global = {};
		data.global.url_prefix = this.app.config.url_prefix;
		data.global.url = this.__currentUrl;
		res.render(view, data);
	}
};