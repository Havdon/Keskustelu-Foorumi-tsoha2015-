var Q = require('q');
var Controller = require('../../controller');
var ThreadController = Controller({
	name: 'thread',
	init: function() {
		this.get('f/:subforum_id/t', this.app.auth.require(), this.createView);
		this.post('f/:subforum_id/t', this.app.auth.require(), this.create);
		this.get('f/:subforum_id/t/:id', this.index);
		this.get('f/:subforum_id/t/:id/edit', this.app.auth.require(), this.editView);
		this.post('f/:subforum_id/t/:id/edit', this.app.auth.require(), this.update);
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
			self.render(req, res, 'thread_edit', { thread: req.body, error: req.updateError });
		}
		else {
			this.app.models.Thread.get({ thread_id: req.params.id})
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

	/**
	*	Updates a thread.
	*/
	update: function(req, res) {
		// If title is not present, render edit view with an error instead.
		if (!req.body.title || req.body.title.length < 1 || req.body.title.replace(/ /g,'').length < 1) {
			req.updateFail = true;
			req.updateError = 'Title cannot be empty.';
			ThreadController.editView(req, res, req.body);
			return;
		}
		var self = this;
		this.app.models.Thread.get({thread_id: req.params.id})
		.then(function(thread) {
			if (req.session.auth !== true || thread.username !== req.session.username) {
				res.redirect(self.app.config.url_prefix + '/auth');
				return;
			}
			return self.app.models.Thread.update(req.body)
					.then(function(thread) {
						res.redirect(thread.getUrl());
					}, function(err) {
						res.redirect(self.app.config.url_prefix + '/f/' + req.params.subforum_id + '/t/' + req.params.id + '/edit?error=' + encodeURIComponent(err));
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