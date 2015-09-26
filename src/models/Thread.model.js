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

var Thread = Model({
	// Wraps raw thread data from database and adds utility functions.
	wrap: function(thread) {
		if (thread instanceof Array) {
			for(var i in thread) {
				thread[i] = Thread.wrap(thread[i]);
			}
		}
		else {
			if (thread.subforum_id)
				thread.subforum_id = thread.subforum_id.replace(/ /g,'');
			if (thread.thread_id)
				thread.thread_id = thread.thread_id.replace(/ /g,'');
			var self = this;
			thread.getUrl = function() {
				return self.app.config.url_prefix + '/f/' + thread.subforum_id + '/t/' + thread.thread_id;
			};
		}
		return thread;
	},
	getList: function(data) {
		this.require(data, ['subforum_id'], 'Thread.getList');
		return this.app.db.execute('SELECT * FROM Thread WHERE subforum_id = \'%0\'', [data.subforum_id]).then(function(result) {
			if (!result.rows || result.rows.length === 0) {
				return Q.resolve([]);
			}
			return Q(Thread.wrap(result.rows));
		});
	},
	get: function(data) {
		this.require(data, ['thread_id'], 'Thread.get');
		return this.app.db.execute('SELECT * FROM Thread WHERE thread_id = \'%0\'', [data.thread_id]).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(Thread.wrap(result.rows[0]));
		});
	},

	create: function(data) {
		this.require(data, ['title', 'body', 'subforum_id', 'username'], 'Thread.create');
		var thread = {
			thread_id: shortid.generate(),
			title: data.title,
			body: data.body,
			username: data.username,
			subforum_id: data.subforum_id
		};
		return this.app.db.execute('INSERT INTO Thread (thread_id, title, body, subforum_id, username) VALUES (\'%thread_id\', \'%title\', \'%body\', \'%subforum_id\', \'%username\') RETURNING *', thread)
		.then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(Thread.wrap(result.rows[0]));
		});
	},

	update: function(data) {
		this.require(data, ['thread_id'], 'Thread.update');
		this.validateWithSchema(data, ThreadSchema);
		var set = '';
		var ix = 0;
		var attrCount = Object.keys(data).length;
		for (var i in data) {
			if (i === 'thread_id') continue;
			var dataStr = data[i];
			dataStr = dataStr.replace(/\'/g,"''");
			set = set + i + ' = \'' + dataStr + '\'';
			if (ix < attrCount - 2) 
				set = set + ', ';
			ix++;
		}
		// TODO: Fix SQL Injection danger.
		return this.app.db.execute('UPDATE Thread SET ' + set + ' WHERE thread_id = \'' + data.thread_id + '\' RETURNING *')
			.then(function(result) {
				if (!result.rows || result.rows.length != 1) {
					return Q.reject(404);
				}
				return Q(Thread.wrap(result.rows[0]));
			});
	},

	delete: function(data) {
		this.require(data, ['thread_id'], 'Thread.delete');
		return this.app.db.execute('DELETE FROM Thread WHERE thread_id=\'%thread_id\'', data)
			.then(function() {
				return Q();
			});
	}

});

module.exports = Thread;