var Q = require('q');
var Controller = require('../../controller');
module.exports = Controller({
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
		}).done();
	}

});