
var Q = require('q');
var Model = require('../model');
var User = Model({
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
		return this.app.db.execute('SELECT * FROM "User" WHERE username = \'%0\'', [data.username]).then(function(result) {
			console.log(result.rows);
			return Q(User.wrap(result.rows[0]));
		});
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
});

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