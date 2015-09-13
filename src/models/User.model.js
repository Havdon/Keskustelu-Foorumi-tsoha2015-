
var Q = require('q');

var User = {
	hash: function(str) {
		return str; // TODO: Implement password hashing.
	},
	wrap: function(user) {
		user.password = User.hash(user.password);
		user.validPassword = function(password) {
			return (User.hash(password) === user.password);
		};
		return user;
	},
	get: function(data) {
		this.require(data, ['username'], 'User.get');
		var deffered = Q.defer();
		var user = null;
		for(var i in users) {
			if (users[i].username === data.username) {
				user = users[i];
				break;
			}
		}
		if (user) {
			deffered.resolve(user);
		}
		else {
			deffered.reject('User was not found.');
		}
		return deffered.promise;
	},
	create: function(data) {
		this.require(data, ['username', 'password'], 'User.get');
		var self = this;
		var deffered = Q.defer();
		User.get(data).then(function(user) {
			deffered.reject('User alredy exists.');
		}, function() {
			var user = User.wrap(data);
			users.push(user);
			deffered.resolve(user);
		}).catch(function(err) {
			self.app.log(err);
			deffered.reject();
		});
		return deffered.promise;
	}
};

var users = [
	User.wrap({
		username: 'admin',
		password: 'password'	
	}),
	User.wrap({
		username: 'billy',
		password: 'password'	
	})
];

module.exports = User;