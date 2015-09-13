var Q = require('q');
module.exports = {
	name: 'subforum',
	pathPrefix: 'f',
	init: function() {
		this.get(':id', this.index);
		this.get(':id/create/subforum', this.app.auth.require(), this.createSubforum);
		this.post(':id/create/subforum/post', this.app.auth.require(), this.postSubforum);
		this.get(':id/create/thread', this.app.auth.require(), this.createThread);
		this.post(':id/create/thread/post', this.app.auth.require(), this.postThread);
	},

	index: function(req, res) {
		var self = this;
		Q.all([
			this.app.models.Subforum.get({ id: req.params.id }),
			this.app.models.Subforum.getList({ parent: req.params.id }),
			this.app.models.Thread.getList({ parent: req.params.id }),
			this.app.models.Admin.isUserAdmin({ username: req.session.username, subforum_id: req.params.id })
		]).then(function(data) {
			var current = data[0];
			if (current === null) {
				res.sendStatus(400);
			}
			else {
				var forums = data[1];
				var threads = data[2];
				var isAdmin = data[3];
				self.render(req, res, 'subforum_index', { subforum_id: req.params.id, forums: forums , threads: threads, isAdmin: isAdmin});
			}
		}, function(err) {
			self.app.log(err);
			res.sendStatus(404);
		});
	},

	createSubforum: function(req, res) {
		this.render(req, res, 'subforum_create', {});
	},

	postSubforum: function(req, res) {
		if (!req.body) return res.sendStatus(400);
		console.log(1);
		var self = this;
		this.app.models.Subforum.create({
			parent: req.params.id,
			name: req.body.name,
			username: req.session.username
		}).then(function(subforum) {
			console.log(2);
			var url = subforum.getUrl();
			console.log(5 + " :" + url)
			res.redirect(url);
		}).catch(function(err) {
			console.error(err);
			res.sendStatus(500);
		})		
		console.log(4);
	},

	createThread: function(req, res) {
		this.render(req, res, 'subforum_create_thread', { subforum_id: req.params.id });
	},

	postThread: function(req, res) {
		if (!req.body) return res.sendStatus(400);
		var self = this;
		this.app.models.Thread.create({
			parent: req.params.id,
			title: req.body.title,
			body: req.body.body,
			username: req.session.username
		}).then(function(thread) {
			res.redirect(thread.getUrl());
		});
	}
};