var Q = require('q');
module.exports = {
	name: 'index',
	pathPrefix: '',
	init: function() {
		this.get('index', this.index);
	},

	index: function(req, res){
		var self = this;
		Q.all([
			this.app.models.Subforum.getList({ parent: 'root' })
		]).then(function(data) {
			var forums = data[0];
			self.render(req, res, 'index', { forums: forums });
		}).catch(function(err) {
			self.app.log(err);
			res.sendStatus(500);
		})
	}

};