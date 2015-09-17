var Q = require('q');
var Controller = require('../../controller');
module.exports = Controller({
	name: 'thread',
	init: function() {
		this.get('f/:subforum_id/t', this.app.auth.require(), this.createView);
		this.post('f/:subforum_id/t', this.app.auth.require(), this.create);
		this.get('f/:subforum_id/t/:id', this.list);
	},

	list: function(req, res) {
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

	createView: function(req, res) {
		this.render(req, res, 'thread_create', { subforum_id: req.params.subforum_id });
	},

	create: function(req, res) {
		if (!req.body) return res.sendStatus(400);
		var self = this;
		this.app.models.Thread.create({
			parent: req.params.subforum_id,
			title: req.body.title,
			body: req.body.body,
			username: req.session.username
		}).then(function(thread) {
			res.redirect(thread.getUrl());
		});
	}
});