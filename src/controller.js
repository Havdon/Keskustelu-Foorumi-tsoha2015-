/**
	The base object which all controllers extend from.
	It adds util functionallity, to decrease the code needed in the controllers.
*/
"use strict";

var extend = require('extend');
var Controller = function(app) {
	this.app = null;
};

	
Controller.prototype.__init = function(app) {
	this.app = app;
	var required = ['name', 'init'];
	for(var i in required) {
		var key = required[i];
		this.app.assert(typeof this[key] !== 'undefined', 'Controller did not define "' + key + '".');
	}
	this.init();
};

Controller.prototype.get = function() {
	return this.call("get", arguments);
};

Controller.prototype.post = function() {
	return this.call("post", arguments);
};

Controller.prototype.put = function() {
	return this.call("put", arguments);
};

Controller.prototype.call  = function(method, args) {
	var self = this;
	var prefix = '';
		
	if (this.pathPrefix) {
		prefix = '/' + this.pathPrefix;
		if (this.pathPrefix.length < 1) 
			prefix = '';
	}
	args[0] = prefix + (args[0] !== 'index' ? '/' +  args[0] : '');
	this.app.log('	' + this.name + ': ' + method.toUpperCase() + ' ' + args[0]);
	if(typeof(args[args.length - 1]) == 'function') { 
		var fn = args[args.length - 1].bind(this);
		args[args.length - 1] = function() {
			self.__currentUrl = args[0];
			var req = arguments[0];
			for(var i in req.params) {
				self.__currentUrl = self.__currentUrl.replace(':' + i, req.params[i]);
			}
			fn.apply(self, arguments);
		}
	}
	return this.app.express[method].apply(this.app.express, args);
};

Controller.prototype.render = function(req, res, view, data) {
	if(!data) data = {};
	data.global = {};
	data.global.url_prefix = this.app.config.url_prefix;
	data.global.url = this.app.config.url_prefix + this.__currentUrl;
	data.global.auth = (req.session.auth === true);
	data.global.query = req.query;
	res.render(view, data);
};



module.exports = function(impl) {
	var controller = new Controller();
	return extend(false, controller, impl);
};

module.exports.Type = Controller;