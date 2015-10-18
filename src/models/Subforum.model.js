var Q = require('q'),
	shortid = require('shortid');

var Model = require('../model');
var Subforum = Model({
	// Static functions

	getList: function(data) {
		this.require(data, ['parent'], 'Subforum.getList');
		return this.app.db.execute('SELECT * FROM Subforum WHERE parent = \'%0\'', [data.parent])
			.then(function(result) {
				if (!result.rows) {
					return Q.reject([]);
				}
				for (var i in result.rows) {
					result.rows[i] = new Subforum(result.rows[i]);
				}
				return Q(result.rows);
			});
	},

	get: function(data) {
		if(data.subforum_id) {
			return this.getSingle(data);
		}
		else {
			return this.getAll(data);
		}
	},
	getAll: function(data) {
		this.require(data, ['subforums'], 'Subforum.getAll');
		if (!data.subforums || data.subforums.length < 1)
			return Q([]);
		return this.app.db.execute('SELECT * FROM Subforum WHERE subforum_id IN %subforums', data)
			.then(function(result) {
				if (!result.rows) {
					return Q.reject([]);
				}
				for (var i in result.rows) {
					result.rows[i] = new Subforum(result.rows[i]);
				}
				return Q(result.rows);
			});
	},
	getSingle: function(data) {
		this.require(data, ['subforum_id'], 'Subforum.getSingle');
		return this.app.db.execute('SELECT * FROM Subforum WHERE subforum_id = \'%0\'', [data.subforum_id + '']).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(new Subforum(result.rows[0]));
		});
	},
	create: function(data) {
		var self = this;
		var subforum = new Subforum({
			name: data.name,
			parent: data.parent
		});
		return subforum.save()
				.then(function() {
					return self.app.models.Admin.makeUserAdmin({
						username: data.username,
						subforum_id: subforum.subforum_id
					}).then(function() {
						return Q(subforum);
					});
				});
	},

	search: function(query, limit) {
		if (!limit)
			limit = 10;
		return this.app.db.execute('SELECT * FROM Subforum WHERE name ~* \'%query\' LIMIT ' + limit, {query: query})
			.then(function(result) {
				for (var i in result.rows) {
					result.rows[i] = new Subforum(result.rows[i]);
				}
				return Q(result.rows);
			});
	}

},
{
	// Instance methods

	_constructor: function(data) {
		this.setProperty('name', data.name);
		this.setProperty('subforum_id', data.subforum_id);
		this.setProperty('parent', data.parent);
	},

	getUrl: function() {
		return this.app.config.url_prefix + '/f/' + this.subforum_id;
	},

	save: function() {
		if (!this.subforum_id) {
			return this.create();
		}
		else {
			return this.save();
		}
	},

	create: function() {
		var errors = this.getErrors();
		if (errors.length > 0)
			return Q.reject(errors);
		if (!this.thread_id)
			return Q.reject('Trying to update subforum that has not been created.');
		var set = '';
		var ix = 0;
		var data = this.getProperties();
		var attrCount = Object.keys(data).length;
		for (var i in data) {
			if (i === 'subforum_id') continue;
			var dataStr = data[i];
			if (typeof(dataStr) === 'string')
				dataStr = dataStr.replace(/\'/g,"''");
			set = set + i + ' = \'' + dataStr + '\'';
			if (ix < attrCount - 2) 
				set = set + ', ';
			ix++;
		}
		var self = this;
		// TODO: Fix SQL Injection danger.
		return this.app.db.execute('UPDATE Subforum SET ' + set + ' WHERE subforum_id = \'' + this.subforum_id + '\' RETURNING *')
			.then(function(result) {
				if (!result.rows || result.rows.length != 1) {
					return Q.reject(404);
				}
				return Q(self);
			});
	},

	save: function() {
		var errors = this.getErrors();
		if (errors.length > 0) {
			return Q.reject(errors);
		}
		if (typeof this.subforum_id === 'undefined')
			this.setProperty('subforum_id', shortid.generate());
		var self =  this;
		return this.app.db.execute('INSERT INTO Subforum (subforum_id, name, parent) VALUES (\'%subforum_id\', \'%name\', \'%parent\')', this.getProperties())
			.then(function(result) {
				return Q(self);
			});
	},

	delete: function() {
		var self = this;
		return this.app.db.execute('DELETE FROM Subforum WHERE subforum_id=\'%subforum_id\' RETURNING *', this.getProperties())
			.then(function(result) {
				console.log(result);
				if (!result.rows || result.rows.length != 1) {
					return Q.reject(404);
				}
				self.clearProperties();
				return Q();
			});
	},

	validators: {
		name: function() {
			if (!this.name || this.name.length < 1) {
				return 'Subforum name cannot be empty.';
			}
			if (this.name.replace(/ /g,'').length < 1) {
				return 'Subforum name cannot be only whitespaces.'
			}
		},
		parent: function() {
			if (!this.parent || this.parent.replace(/ /g,'').length < 1) {
				return 'Parent subforum id is empty.';
			}
		}
	}
});
module.exports = Subforum;