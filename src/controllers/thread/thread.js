var Q = require('q');
module.exports = {
	name: 'thread',
	pathPrefix: 'f/:subforum_id/t',
	init: function() {
		this.get(':id', this.index);
		this.post(':id', this.app.auth.require(), this.addPost);
	},

	index: function(req, res) {
		var self = this;
		Q.all([
			this.app.models.Post.getList({ thread_id: req.params.id, loadById: true}),
			this.app.models.Thread.get({ thread_id: req.params.id})
		]).then(function(data) {
			var posts = data[0];
			var thread = data[1];
			self.render(req, res, 'thread_index', { thread: thread, posts: posts});
		}, function(err) {
			self.sendStatus(505);
		}).catch(function(err) {
			self.app.log(err);
			self.sendStatus(505);
		});
	},

	addPost: function(req, res) {
		var self = this;
		this.app.models.Post.create({
			body: req.body.body,
			username: req.session.username,
			thread_id: req.params.id
		}).then(function(post) {
			res.redirect(self.app.config.url_prefix + '/f/' + req.params.subforum_id + '/t/' + req.params.id);
		}, function(err) {
			self.app.log(err);
			self.sendStatus(505);
		}).catch(function(err) {
			self.app.log(err);
			self.sendStatus(505);
		});
	}
};