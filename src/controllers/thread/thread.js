var Q = require('q');
module.exports = {
	name: 'thread',
	pathPrefix: 'f/:subforum_id/t',
	init: function() {
		this.get(':id', this.index);
	},

	index: function(req, res) {
		Q.all([
			this.app.models.Post.getList({ thread_id: req.params.id }),
			this.app.models.Thread.get({ thread_id: req.params.id })
		]).then(function(data) {
			var posts = data[0];
			var thread = data[1];
			res.render('thread_index', { thread: thread, posts: posts});
		});
	}
};