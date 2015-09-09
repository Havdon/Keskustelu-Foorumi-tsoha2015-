var Q = require('q');

// Dummy data
var forums = {
	root: [

		{
			id: '0',
			name: 'Games'
		},
		{
			id: '1',
			name: 'News'
		},
		{
			id: '2',
			name: 'AskFoorumi'
		}
	],
	0: [
		{
			id: '00',
			name: 'Call of Duty'
		}
	]
}


module.exports = {

	getList: function(data) {
		this.app.assert(typeof(data.parent) !== 'undefined', 'The "parent" not defined when calling Subforum.getList');
		var deffered = Q.defer();
		var data = forums[data.parent];
		if (typeof(data) === 'undefined') data = [];
		deffered.resolve(data);
		return deffered.promise;
	}

};