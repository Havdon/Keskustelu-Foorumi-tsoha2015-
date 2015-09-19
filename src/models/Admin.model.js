var Q = require('q');

var Model = require('../model');


var Admin = Model({
	wrap: function(admin) {

		return admin;
	},

	exists: function(data) {
		this.require(data, ['username', 'subforum_id'], 'Admin.exists');
		return this.app.db.execute('SELECT 1 AS isAdmin FROM Admin WHERE username = \'%username\' AND subforum_id = \'%subforum_id\'', data).then(function(result) {
			return Q(result.rows && result.rows.length >= 1 && result.rows[0].isadmin == 1);
		});
	},

	create: function(data) {
		this.require(data, ['subforum_id', 'username'], 'Admin.create');
		return this.app.db.execute('INSERT INTO Admin (username, subforum_id) VALUES (\'%username\', \'%subforum_id\')', data)
			.then(function(result) {

			});
	},

	isUserAdmin: function(data) {
		this.require(data, ['subforum_id'], 'Admin.isUserAdmin');
		if (!data.username)
			return Q.resolve(false);
		return Admin.exists(data);
	},

	makeUserAdmin: function(data) {
		this.require(data, ['subforum_id', 'username'], 'Admin.makeUserAdmin');
		return Admin.create(data);
	},

	getSubforumsUserIsAdminIn: function(data) {
		
		var deffered = Q.defer();
		var subforums = [];
		var self = this;
		if (data.username) {
			for(var i in admins) {
				if (admins[i].username == data.username && subforums.indexOf(admins[i].subforum_id) == -1) {
					subforums.push(admins[i].subforum_id);
				}
			}

			if (data.loadById) {
				this.app.models.Subforum.get({
					subforums: subforums
				}).then(function(subforums) {
					deffered.resolve(subforums);
				}).done();
			}
			else {
				deffered.resolve(subforums);
			}
		}
		else {
			deffered.resolve(null);
		}

		
		return deffered.promise;
	}
});


var admins = [
	{
		username: 'admin',
		subforum_id: '0'
	},
	{
		username: 'admin',
		subforum_id: '00'
	},
	{
		username: 'admin',
		subforum_id: '1'
	},
	{
		username: 'admin',
		subforum_id: '2'
	}
];

module.exports = Admin;