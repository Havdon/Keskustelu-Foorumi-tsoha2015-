var Q = require('q');
module.exports = {
	name: 'index',
	pathPrefix: '',
	init: function() {
		this.get('index', this.index);
	},

	index: function(req, res){
		Q.all([
			this.app.models.Subforum.getList({ parent: 'root' })
		]).then(function(data) {
			var forums = data[0];
			res.render('index', { forums: forums });
		});
	}

};