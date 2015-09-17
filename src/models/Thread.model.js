var Q = require('q'),
	shortid = require('shortid');
var Model = require('../model');

var Thread = Model({
	wrap: function(thread) {
		var self = this;
		thread.getUrl = function() {
			return self.app.config.url_prefix + '/f/' + thread.parent + '/t/' + thread.id;
		};

		return thread;
	},
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
	},

	create: function(data) {
		this.require(data, ['title', 'body', 'parent', 'username'], 'Thread.create');
		var deffered = Q.defer();
		if (typeof(threads[data.parent]) === 'undefined') {
			threads[data.parent] = [];
		}
		var thread = Thread.wrap({
			id: shortid.generate(),
			title: data.title,
			body: data.body,
			username: data.username
		});
		threads[data.parent].push(thread);

		deffered.resolve(thread);
		return deffered.promise;
	}

});

// Dummy data
var threads = {
	0: [ // Games
		Thread.wrap({
			id: '00',
			title: 'Call of Duty is the best game ever!',
			body: 'Whos with me?',
			username: 'admin'
		})
	]
};

module.exports = Thread;