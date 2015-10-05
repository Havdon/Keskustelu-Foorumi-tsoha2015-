var Q = require('q');
var Controller = require('../../controller');
var ThreadController = Controller({
	name: 'thread',
	init: function() {
		this.get('f/:subforum_id/t', this.app.auth.require(), this.createView);
		this.post('f/:subforum_id/t', this.app.auth.require(), this.create);
		this.get('f/:subforum_id/t/:thread_id', this.index);
		this.get('f/:subforum_id/t/:thread_id/edit', this.app.auth.require(), this.editView);
		this.post('f/:subforum_id/t/:thread_id/edit', this.app.auth.require(), this.update);
		this.get('f/:subforum_id/t/:thread_id/delete', this.app.auth.require(), this.deleteThread);
	},

	index: function(req, res) {
		var self = this;
		Q.all([
			this.app.models.Post.getList({ thread_id: req.params.thread_id, loadById: true}),
			this.app.models.Thread.get({ thread_id: req.params.thread_id})
		]).then(function(data) {
			var posts = data[0];
			var thread = data[1];
			self.render(req, res, 'thread_index', { thread: thread, posts: posts});
		}, function(err) {
			if (err === 404) {
				res.sendStatus(404);
			}
			else {
				console.error(err);
				res.sendStatus(505);
			}
		}).done();
	},

	editView: function(req, res) {
		var self = this;
		if (req.updateFail) {
			console.log(req.body);
			self.render(req, res, 'thread_edit', { thread: req.body, errors: req.updateError });
		}
		else {
			this.app.models.Thread.get({ thread_id: req.params.thread_id})
			.then(function(thread) {
				if (req.session.auth !== true || thread.username !== req.session.username) {
					res.sendStatus(401);
					return;
				}
				self.render(req, res, 'thread_edit', { thread: thread });
			}, function(err) {
				if (err === 404) {
					res.sendStatus(404);
				}
				else {
					console.error(err);
					res.sendStatus(505);
				}
			}).done();
		}
		
		
	},

	deleteThread: function(req, res) {
		var self = this;
		this.app.models.Thread.get({ thread_id: req.params.thread_id})
		.then(function(thread) {
			if (req.session.auth !== true || thread.username !== req.session.username) {
				res.sendStatus(401);
				return;
			}
			return thread.delete()
				.then(function() {
					res.redirect(self.app.config.url_prefix + '/f/' + req.params.subforum_id);
				});
		}, function(err) {
			if (err === 404) {
				res.sendStatus(404);
			}
			else {
				console.error(err);
				res.sendStatus(505);
			}
		}).done();
	},

	/**
	*	Updates a thread.
	*/
	update: function(req, res) {
		var self = this;
		this.app.models.Thread.get({thread_id: req.params.thread_id})
		.then(function(thread) {
			if (req.session.auth !== true || thread.username !== req.session.username) {
				res.redirect(self.app.config.url_prefix + '/auth');
				return;
			}
			thread.title = req.body.title;
			thread.body = req.body.body;
			return thread.save()
					.then(function() {
						res.redirect(thread.getUrl());
					}, function(err) {
						req.updateFail = true;
						req.updateError = err;
						ThreadController.editView(req, res, req.body);
					}).done();
		}, function(err) {
			if (err === 404) {
				res.sendStatus(404);
			}
			else {
				console.error(err);
				res.sendStatus(505);
			}
		}).done();
		
	},

	createView: function(req, res) {
		this.render(req, res, 'thread_create', { subforum_id: req.params.subforum_id });
	},

	create: function(req, res) {
		if (!req.body) return res.sendStatus(400);
		var self = this;
		this.app.models.Thread.create({
			subforum_id: req.params.subforum_id,
			title: req.body.title,
			body: req.body.body,
			username: req.session.username
		}).then(function(thread) {
			res.redirect(thread.getUrl());
		}, function(err) {
			res.redirect(self.app.config.url_prefix + '/f/' + req.params.subforum_id + '/t?error=' + encodeURIComponent(err));
		}).done();
	}
});

module.exports = ThreadController;