var Q = require('q'),
	shortid = require('shortid');
var Model = require('../model');

var Post = Model(
{	// Static methods

	// Wraps raw database data and adds utility functions.
	wrap: function(post) {

		return post;
	},
	getList: function(data) {
		this.require(data, ['thread_id'], 'Post.getList');
		var self = this;
		return this.app.db.execute('SELECT * FROM Post WHERE thread_id = \'%0\'', [data.thread_id + '']).then(function(result) {
			if (!result.rows) {
				return Q.reject(404);
			}
			var postsData = Post.wrap(result.rows);
			if (data.loadById === true) {
				var ids = {};
				var promises = [];
				for(var i in postsData) {
					var post = postsData[i];
					if (typeof(ids[post.username]) === 'undefined') {
						ids[post.username] = [];
						promises.push(self.app.models.User.get({username: post.username }));
					}
					ids[post.username].push(post);
					
				}

				return Q.all(promises).then(function(users) {
					for(var i in users) {
						var user = users[i];
						for(var j in ids[user.username]) {
							ids[user.username][j].user = user;
						}
					}
					return Q(postsData);
				});
			}
			else {
				return Q(postsData);
			}
		});
	},
	get: function(data) {
		this.require(data, ['post_id'], 'Post.get');
		return this.app.db.execute('SELECT * FROM Post WHERE post_id = \'%0\'', [data.post_id + '']).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(Post.wrap(result.rows[0]));
		});
	},

	destroy: function(data) {
		this.require(data, ['post_id', 'username'], 'Thread.destroy');
		return this.app.db.execute('DELETE FROM Post WHERE post_id=\'%post_id\' AND username=\'%username\' RETURNING *', data)
			.then(function(result) {
				console.log(result);
				if (!result.rows || result.rows.length != 1) {
					return Q.reject(404);
				}
				return Q();
			});
	},
	destroyByThread: function(data) {
		this.require(data, ['thread_id'], 'Thread.destroy');
		return this.app.db.execute('DELETE FROM Post WHERE thread_id=\'%thread_id\'', data)
			.then(function() {
				return Q();
			});
	}

}, 
{	// Instance methods

	_constructor: function(data) {
		this.setProperty('post_id', data.post_id, true);
		this.setProperty('body', data.body);
		this.setProperty('username', data.username, true);
		this.setProperty('time', data.time, true);
		this.setProperty('thread_id', data.thread_id, true);
	},

	save: function() {
		if (!this.post_id)
			return this.create();
	},

	create: function() {
		var errors = this.getErrors();
		if (errors.length > 0)
			return Q.reject(errors);
		if (this.post_id || this.time)
			return Q.reject('Trying to create a post that has already been created.');
		this.setProperty('post_id', shortid.generate());
		this.setProperty('time', new Date().getTime() / 1000);
		var self = this;
		return this.app.db.execute('INSERT INTO Post (post_id, time, body, thread_id, username) VALUES (\'%post_id\', to_timestamp(%time), \'%body\', \'%thread_id\', \'%username\') RETURNING *', this.getProperties()).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(self);
		});
	},
	validators: {
		body: function() {
			if (!this.body || this.body.length < 1)
				return 'Post body cannot be empty.';
			if (this.body.replace(/ /g,'').length < 1)
				return 'Post body cannot be only whitespace.'
		},
		general: function() {
			if (!this.username || this.username.length < 1)
				return 'Post creator not defined.';
			if (!this.thread_id || this.thread_id.length < 1)
				return 'Post thread not defined.'
		}
	}

});

module.exports = Post;