var Q = require('q');



var Admin = {
	wrap: function(admin) {

		return admin;
	},

	isUserAdmin: function(data) {
		this.require(data, ['subforum_id'], 'Admin.isUserAdmin');
		var deffered = Q.defer();
		var isAdmin = false;
		if (data.username) {
			for(var i in admins) {
				if (admins[i].username == data.username && admins[i].subforum_id == data.subforum_id) {
					isAdmin = true;
					break;
				}
			}
		}
		deffered.resolve(isAdmin);

		return deffered.promise;
	},

	makeUserAdmin: function(data) {
		this.require(data, ['subforum_id', 'username'], 'Admin.makeUserAdmin');
		var deffered = Q.defer();
		var admin = Admin.wrap(data);
		admins.push(admin);
		console.log(admin);
		deffered.resolve(admin);
		return deffered.promise;
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
};


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