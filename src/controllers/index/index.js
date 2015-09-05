module.exports = {
	name: 'index',
	pathPrefix: '',
	init: function() {
		this.get('index', this.index);
	},

	index: function(req, res){
		res.render('index', { title: 'test', message: 'message' });
	}

};