/**
	The base object all models extend.
	Adds utility functions for models.
*/
var extend = require('extend');


var isArray = function(obj) {
	return (Object.prototype.toString.call(obj) === '[object Array]');
}

var isFunction = function(obj) {
	return (typeof(obj) === "function");
}

var isCorrectType = function(obj, type) {
	if (type === 'array') {
		return isArray(obj);
	}
	else {
		return (typeof(obj) === type);
	}
}

// Adds static methods to object that are needed in all.
var addModelDefaultStatic = function(Model) {
	Model.__init = function(app) {
		this.app = app;
	};

	Model.require = function(data, values, methodName) {
		for(var i in values) {
			this.app.assert(typeof(data[values[i]]) !== 'undefined', 'The "' + values[i] + '" not defined when calling ' + methodName + ' Data : ' + JSON.stringify(data));
		}
	};

	Model.validateWithSchema = function(data, schema) {
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
}



module.exports = function(staticImpl, instanceImpl) {
	
	var Model = function(data) {
		this.app = Model.app;
		if (isFunction(this._constructor))
			this._constructor(data);
	};


	Model.prototype.getErrors = function() {
		this.validate();
		return this.__errors;
	};

	Model.prototype.validate = function() {
		this.__errors = [];
		if (this.validators) {
			for (var i in this.validators) {
				var result = this.validators[i].bind(this)();
				if (result)
					this.__errors.push(result);
			}
		}
	};

	Model.prototype.setProperty = function(name, value, isConst) {
		if (!this.__properites) {
			this.__properites = {};
			this.__consts = {}
		}
		if (isConst)
			this.__consts[name] = true;
		this.__properites[name] = value;
		this.__defineGetter__(name, function() {
			return this.__properites[name];
		});
		this.__defineSetter__(name, function(value) {
			if (this.__consts[name] && typeof(this.__properites[name]) !== 'undefined' && this.__properites[name] !== null) {
				console.warning('Trying to set constant model property ' + name);
				return;
			}
			this.__properites[name] = value;
		});
	};

	Model.prototype.getProperties = function() {
		return this.__properites;
	}

	Model.prototype.clearProperties = function() {
		if (!this.__properites) return;
		for (var i in this.__properites) {
			this.__defineGetter__(i, function() { return undefined; });
			this.__defineSetter__(i, function() {});
		}
		delete this.__properites;
	}


	addModelDefaultStatic(Model);

	for (var i in staticImpl) {
		var value = staticImpl[i];
		if (typeof Model[i] !== 'undefined')
			throw new Error("Trying to override default static function in Model: " + i);
		if (isFunction(value)) 
			value = value.bind(Model);
		Model[i] = value;
	}
	if (instanceImpl && typeof instanceImpl === 'object') {
		for (var i in instanceImpl) {
			var value = instanceImpl[i];
			if (typeof Model.prototype[i] !== 'undefined')
				throw new Error("Trying to override default instance function in Model: " + i);
			Model.prototype[i] = value;
		}
	}

	return Model;
};
