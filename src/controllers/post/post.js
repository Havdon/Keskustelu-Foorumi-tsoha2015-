var Q = require('q');
var Controller = require('../../controller');
module.exports = Controller({
	name: 'post',
	init: function() {
		this.post('f/:subforum_id/t/:thread_id', this.app.auth.require(), this.create);
		this.get('f/:subforum_id/t/:thread_id/delete/:post_id', this.app.auth.require(), this.deletePost);
	},
	create: function(req, res) {
		var self = this;
		this.app.models.Post.create({
			body: req.body.body,
			username: req.session.username,
			thread_id: req.params.thread_id
		}).then(function(post) {
			res.redirect(self.app.config.url_prefix + '/f/' + req.params.subforum_id + '/t/' + req.params.thread_id);
		}).done();
	},

	/**
	*	Deletes a post
	*/
	deletePost: function(req, res) {
		var self = this;
		this.app.models.Post.destroy({post_id: req.params.post_id, username: req.session.username})
		.then(function(post) {
			res.redirect(self.app.config.url_prefix + '/f/' + post.subforum_id + '/t/' + post.thread_id);
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
});