var Q = require('q');

// Dummy data
var posts = {
	'00': [ // Games > Call of Duty is best
		{
			id: '001',
			order: 1,
			body: 'WHO IS WITH ME?',
			user: 'u1'
		},
		{
			id: '002',
			order: 2,
			body: 'Are you kidding me? Of course I\'m with you!\nBest thing ever!',
			user: 'u1'
		}
	]
};

module.exports = {
	getList: function(data) {
		this.app.assert(typeof(data.thread_id) !== 'undefined', 'The "thread_id" not defined when calling Post.getList');
		var deffered = Q.defer();
		var data = posts[data.thread_id];
		if (typeof(data) === 'undefined') data = [];
		deffered.resolve(data);
		return deffered.promise;
	},
	get: function(data) {
		this.app.assert(typeof(data.post_id) !== 'undefined', 'The "post_id" not defined when calling Post.get');
		var deffered = Q.defer();
		var data;
		for(var i in posts) {
			var found = false;
			for(var j in posts[i]) {
				if (posts[i][j].id === data.post_id) {
					data = posts[i][j];
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