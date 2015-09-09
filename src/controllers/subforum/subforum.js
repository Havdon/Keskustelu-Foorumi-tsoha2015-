var Q = require('q');
module.exports = {
	name: 'subforum',
	pathPrefix: 'f',
	init: function() {
		this.get(':id', this.index);
	},

	index: function(req, res) {
		Q.all([
			this.app.models.Subforum.getList({ parent: req.params.id }),
			this.app.models.Thread.getList({ parent: req.params.id })
		]).then(function(data) {
			var forums = data[0];
			var threads = data[1];
			res.render('subforum_index', { subforum_id: req.params.id, forums: forums , threads: threads});
		});
	}
};