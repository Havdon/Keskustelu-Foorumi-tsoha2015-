module.exports = {
	name: 'subforum',
	pathPrefix: 'f',
	init: function() {

	},

	index: function(req, res) {
		res.render('subforum_index', { title: 'test', message: 'message' });
	}
};