var Q = require('q');
var Model = require('../model');

var Post = Model({
	wrap: function(post) {

		return post;
	},
	getList: function(data) {
		this.app.assert(typeof(data.thread_id) !== 'undefined', 'The "thread_id" not defined when calling Post.getList');
		var deffered = Q.defer();
		var self = this;
		var postsData = posts[data.thread_id];
		if (typeof(postsData) === 'undefined') postsData = [];
		if (data.loadById === true) {
			var ids = {};
			var promises = [];
			for(var i in postsData) {
				var post = postsData[i];
				if (typeof(ids[post.username]) === 'undefined') {
					ids[post.username] = [];
					promises.push(this.app.models.User.get({username: post.username }));
				}
				ids[post.username].push(post);
				
			}

			Q.all(promises).then(function(users) {
				for(var i in users) {
					var user = users[i];
					for(var j in ids[user.username]) {
						ids[user.username][j].user = user;
					}
				}
				deffered.resolve(postsData);
			}, function(err) {
				self.app.log(err);
				deffered.reject();
			}).catch(function(err) {
				self.app.log(err);
				deffered.reject();
			});
		}
		else {
			deffered.resolve(postsData);
		}
		return deffered.promise;
	},
	get: function(data) {
		this.app.assert(typeof(data.post_id) !== 'undefined', 'The "post_id" not defined when calling Post.get');
		var deffered = Q.defer();
		var data;
		for(var i in posts) {
			var found = false;
			for(var j in posts[i]) {
				if (posts[i][j].id === data.post_id) {
					data = posts[i][j];
					found = true;
					break;
				}
			}
			if(found) break;
		}
		deffered.resolve(data);
		return deffered.promise;
	},

	create: function(data) {
		this.require(data, ['body', 'thread_id', 'username'], 'Post.create');
		var deffered = Q.defer();
		if (!posts[data.thread_id]) posts[data.thread_id] = [];
		var post = Post.wrap({
			body: data.body,
			username: data.username,
			time: new Date()
		})
		posts[data.thread_id].push(post);
		deffered.resolve(post);
		return deffered.promise;
	}

});

// Dummy data
var posts = {
	'00': [ // Games > Call of Duty is best
		Post.wrap({
			id: '002',
			order: 1,
			body: 'Are you kidding me? Of course I\'m with you!\nBest thing ever!',
			username: 'billy',
			time: new Date()
		})
	]
};

module.exports = Post;