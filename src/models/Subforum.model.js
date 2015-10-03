var Q = require('q'),
	shortid = require('shortid');

var Model = require('../model');
var Subforum = Model({

	// Wraps raw database data and adds utility functions.
	wrap: function(subforum) {
		if (subforum instanceof Array) {
			for(var i in subforum) {
				subforum[i] = Subforum.wrap(subforum[i]);
			}
		}
		else {
			var self = this;
			subforum.getUrl = function() {
				return self.app.config.url_prefix + '/f/' + subforum.subforum_id;
			};
		}
		return subforum;
	},

	getList: function(data) {
		this.require(data, ['parent'], 'Subforum.getList');
		return this.app.db.execute('SELECT * FROM Subforum WHERE parent = \'%0\'', [data.parent])
			.then(function(result) {
				if (!result.rows) {
					return Q.reject([]);
				}
				return Q(Subforum.wrap(result.rows));
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
				return Q(Subforum.wrap(result.rows));
			});
	},
	getSingle: function(data) {
		this.require(data, ['subforum_id'], 'Subforum.getSingle');
		return this.app.db.execute('SELECT * FROM Subforum WHERE subforum_id = \'%0\'', [data.subforum_id + '']).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(Subforum.wrap(result.rows[0]));
		});
	},
	create: function(data) {
		this.require(data, ['name', 'parent', 'username'], 'Subforum.create');
		if (data.name.length < 1) {
			return Q.reject("Subforum name cannot be empty.");
		} 
		else if (data.username.length < 1 || data.parent.length < 1) {
			return Q.reject("Something went wrong.");
		} 
		var self = this;
		var subforum = {
			subforum_id: shortid.generate(),
			name: data.name,
			parent: data.parent
		};
		return this.app.db.execute('INSERT INTO Subforum (subforum_id, name, parent) VALUES (\'%subforum_id\', \'%name\', \'%parent\') RETURNING *', subforum)
			.then(function(result) {
				subforum = Subforum.wrap(result.rows[0]);
				return self.app.models.Admin.makeUserAdmin({
					username: data.username,
					subforum_id: subforum.subforum_id
				}).then(function() {
					return Q(subforum);
				});
			});
	}

});
module.exports = Subforum;