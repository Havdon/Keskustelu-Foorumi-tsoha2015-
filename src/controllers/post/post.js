var Q = require('q');
var Controller = require('../../controller');
module.exports = Controller({
	name: 'post',
	init: function() {
		this.post('f/:subforum_id/t/:thread_id', this.app.auth.require(), this.create);

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
});