var Q = require('q'),
	shortid = require('shortid');

var Model = require('../model');
var Subforum = Model({

	wrap: function(subforum) {
		var self = this;
		subforum.getUrl = function() {
			return self.app.config.url_prefix + '/f/' + subforum.id;
		};
		return subforum;
	},

	getList: function(data) {
		this.app.assert(typeof(data.parent) !== 'undefined', 'The "parent" not defined when calling Subforum.getList');
		var deffered = Q.defer();
		var data = forums[data.parent];
		if (typeof(data) === 'undefined') data = null;
		deffered.resolve(data);
		return deffered.promise;
	},

	get: function(data) {
		if(data.id) {
			return this.getSingle(data);
		}
		else {
			return this.getAll(data);
		}
	},
	getAll: function(data) {
		this.require(data, ['subforums'], 'Subforum.getAll');
		var promises = [];
		for(var i in data.subforums) {
			promises.push(this.getSingle({id: data.subforums[i] }));
		}
		return Q.all(promises);
	},
	getSingle: function(data) {
		this.require(data, ['id'], 'Subforum.getSingle');
		var deffered = Q.defer();
		var forum = null;
		for(var i in forums) {
			for(var j in forums[i]) {
				if (forums[i][j].id == data.id) {
					forum = forums[i][j];
					break;
				}
			}
			if (forum) break;
		}
		if (!forum) {
			deffered.reject('Subforum ' + data.id + ' was not found.');
		}
		else {
			deffered.resolve(forum);
		}
		return deffered.promise;
	},
	create: function(data) {
		this.require(data, ['name', 'parent', 'username'], 'Subforum.create');
		var deffered = Q.defer();
		var self = this;

		if (typeof(forums[data.parent]) === 'undefined') {
			forums[data.parent] = [];
		}
		var forum = Subforum.wrap({
			id: shortid.generate(),
			name: data.name
		});
		forums[data.parent].push(forum);
		this.app.models.Admin.makeUserAdmin({
			username: data.username,
			subforum_id: forum.id
		}).then(function() {
			deffered.resolve(forum);
		}, function(err) {
			self.app.log(err);
			deffered.reject();
		}).done();

		return deffered.promise;
	}

});

// Dummy data
var forums = {
	root: [

		Subforum.wrap({
			id: '0',
			name: 'Games',
			parent: 'root'
		}),
		Subforum.wrap({
			id: '1',
			name: 'News',
			parent: 'root'
		}),
		Subforum.wrap({
			id: '2',
			name: 'AskFoorumi',
			parent: 'root'
		})
	],
	0: [
		Subforum.wrap({
			id: '00',
			name: 'Call of Duty',
			parent: '0'
		})
	]
}

module.exports = Subforum;