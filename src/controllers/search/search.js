var Q = require('q');
var Controller = require('../../controller');
module.exports = Controller({
	name: 'search',
	init: function() {
		this.get('search', this.search);
	},

	search: function(req, res) {
		var self = this;
		if (!req.query.q || req.query.q.length < 1) {
			self.render(req, res, 'search_index', { results: [] });
			return;
		}
		Q.all([
			this.app.models.Subforum.search(req.query.q),
			this.app.models.Thread.search(req.query.q),
			this.app.models.User.search(req.query.q)
			])
		.then(function(result) {
			var results = [];
			var subforums = result[0];
			var threads = result[1];
			var users = result[2];
			for (var i in subforums) {
				results.push({
					type: 'subforum',
					title: subforums[i].name,
					url: subforums[i].getUrl()
				});
			}
			for (var i in threads) {
				results.push({
					type: 'thread',
					title: threads[i].title,
					url: threads[i].getUrl()
				});
			}
			for (var i in users) {
				results.push({
					type: 'user',
					title: users[i].username,
					url: users[i].getUrl()
				});
			}
			self.render(req, res, 'search_index', { results: results });
		}).done();
	}
});