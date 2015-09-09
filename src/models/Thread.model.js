var Q = require('q');

// Dummy data
var threads = {
	0: [ // Games
		{
			id: '00',
			title: 'Call of Duty is the best game ever!',
			user: 'u1'
		}
	]
};

module.exports = {
	getList: function(data) {
		this.app.assert(typeof(data.parent) !== 'undefined', 'The "parent" not defined when calling Thread.getList');
		var deffered = Q.defer();
		var data = threads[data.parent];
		if (typeof(data) === 'undefined') data = [];
		deffered.resolve(data);
		return deffered.promise;
	},
	get: function(data) {
		this.app.assert(typeof(data.thread_id) !== 'undefined', 'The "thread_id" not defined when calling Thread.get');
		var deffered = Q.defer();
		var data;
		for(var i in threads) {
			var found = false;
			for(var j in threads[i]) {
				if (threads[i][j].id === data.thread_id) {
					data = threads[i][j];
					found = true;
					break;
				}
			}
			if(found) break;
		}
		deffered.resolve(data);
		return deffered.promise;
	}

};