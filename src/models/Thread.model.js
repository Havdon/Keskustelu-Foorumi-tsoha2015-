var Q = require('q'),
	shortid = require('shortid');
var Model = require('../model');

var ThreadSchema = {
	thread_id: 'string',
	subforum_id: 'string',
	title: 'string',
	body: 'string',
	username: 'string',
};

var Thread = Model(
{	// Static methods
	
	getList: function(data) {
		this.require(data, ['subforum_id'], 'Thread.getList');
		return this.app.db.execute('SELECT * FROM Thread WHERE subforum_id = \'%0\'', [data.subforum_id]).then(function(result) {
			if (!result.rows || result.rows.length === 0) {
				return Q.resolve([]);
			}
			for (var i in result.rows)
				result.rows[i] = new Thread(result.rows[i]);
			return Q(result.rows);
		});
	},
	get: function(data) {
		this.require(data, ['thread_id'], 'Thread.get');
		return this.app.db.execute('SELECT * FROM Thread WHERE thread_id = \'%0\'', [data.thread_id]).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(new Thread(result.rows[0]));
		});
	},

	create: function(data) {
		var thread = new Thread({
			title: data.title,
			body: data.body,
			username: data.username,
			subforum_id: data.subforum_id
		});
		return thread.save();
	},

	search: function(query, limit) {
		if (!limit)
			limit = 10;
		return this.app.db.execute('SELECT * FROM Thread WHERE title ~* \'%query\' OR body ~* \'%query\' LIMIT ' + limit, {query: query})
			.then(function(result) {
				for (var i in result.rows) {
					result.rows[i] = new Thread(result.rows[i]);
				}
				return Q(result.rows);
			});
	}

}, 
{	// Instance methods

	_constructor: function(data) {
		if (data.subforum_id)
			data.subforum_id = data.subforum_id.replace(/ /g,'');
		if (data.thread_id)
			data.thread_id = data.thread_id.replace(/ /g,'');
		this.setProperty('title', data.title);
		this.setProperty('body', data.body);
		this.setProperty('username', data.username);
		this.setProperty('subforum_id', data.subforum_id);
		this.setProperty('thread_id', data.thread_id, true);
	},
	getUrl: function() {
		return this.app.config.url_prefix + '/f/' + this.subforum_id + '/t/' + this.thread_id;
	},

	save: function() {
		if (this.thread_id) 
			return this.update();
		else
			return this.create();
	},

	update: function() {
		var errors = this.getErrors();
		if (errors.length > 0)
			return Q.reject(errors);
		if (!this.thread_id)
			return Q.reject('Trying to update thread that has not been created.');
		var set = '';
		var ix = 0;
		var data = this.getProperties();
		var attrCount = Object.keys(data).length;
		for (var i in data) {
			if (i === 'thread_id') continue;
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
		return this.app.db.execute('UPDATE Thread SET ' + set + ' WHERE thread_id = \'' + this.thread_id + '\' RETURNING *')
			.then(function(result) {
				if (!result.rows || result.rows.length != 1) {
					return Q.reject(404);
				}
				return Q(self);
			});
	},

	create: function() {
		var errors = this.getErrors();
		if (errors.length > 0)
			return Q.reject(errors);
		if (this.thread_id)
			return Q.reject('Trying to create thead that already has an id!');
		this.setProperty('thread_id', shortid.generate());
		var self = this;
		return this.app.db.execute('INSERT INTO Thread (thread_id, title, body, subforum_id, username) VALUES (\'%thread_id\', \'%title\', \'%body\', \'%subforum_id\', \'%username\') RETURNING *', this.getProperties())
		.then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(self);
		});
	},

	delete: function() {
		var errors = this.getErrors();
		if (errors.length > 0)
			return Q.reject(errors);
		if (!this.thread_id)
			return Q.reject('Trying to delete thread that has not been created.');
		var self = this;
		return this.app.models.Post.destroyByThread(self.getProperties())
			.then(function() {
				return self.app.db.execute('DELETE FROM Thread WHERE thread_id=\'%thread_id\'', self.getProperties())
					.then(function() {
						self.clearProperties();
						return Q();
					});
			});
		
	},

	validators: {
		title: function() {
			if (!this.title || this.title.length < 1)
				return 'Thread title cannot be empty.';
			if (this.title.replace(/ /g,'').length < 1)
				return 'Thread title cannot be only whitespace.'
		},
		body: function() {
			if (!this.body || this.body.length < 1)
				return 'Thread body cannot be empty.';
			if (this.body.replace(/ /g,'').length < 1)
				return 'Thread body cannot be only whitespace.'
		},
		general: function() {
			if (!this.username || !this.subforum_id 
				|| this.username.replace(/ /g,'').length < 1 || this.subforum_id.replace(/ /g,'').length < 1)
				return 'Something went wrong.';
		} 
	}
});

module.exports = Thread;