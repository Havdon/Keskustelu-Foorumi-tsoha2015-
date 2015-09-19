var Q = require('q'),
	shortid = require('shortid');
var Model = require('../model');

var Post = Model({
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

	create: function(data) {
		this.require(data, ['body', 'thread_id', 'username'], 'Post.create');
		var post = {
			post_id: shortid.generate(),
			body: data.body,
			username: data.username,
			time: new Date().getTime() / 1000,
			thread_id: data.thread_id
		};
		return this.app.db.execute('INSERT INTO Post (post_id, time, body, thread_id, username) VALUES (\'%post_id\', to_timestamp(%time), \'%body\', \'%thread_id\', \'%username\') RETURNING *', post).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.reject(404);
			}
			return Q(Post.wrap(result.rows[0]));
		});
	}

});

module.exports = Post;