var Q = require('q');
var Model = require('../model'),
	crypto = require('crypto');
var User = Model({
	// Hashes a password using a salt.
	hash: function(str, salt) {
		if (!salt) {
			return str;
		}
		// TODO: Change to slower encryption algorithm.
		return crypto.createHash('md5').update(str + salt).digest('hex');
	},
	// Wraps raw user data and adds utility functions.
	wrap: function(user) {
		user.password = User.hash(user.password);
		user.validPassword = function(password) {
			return (User.hash(password, user.salt) === user.password);
		};
		return user;
	},
	// Resolves the promise if a user exists in the database.
	exists: function(data) {
		this.require(data, ['username'], 'User.get');
		return this.app.db.execute('SELECT 1 as isuser FROM "User" WHERE username = \'%0\'', [data.username]).then(function(result) {
			console.log(result);
			return Q(result.rows && result.rows.length === 1 && result.rows[0].isuser == 1);
		});
	},
	// Retrives a user from the database.
	get: function(data) {
		this.require(data, ['username'], 'User.get');
		return this.app.db.execute('SELECT * FROM "User" WHERE username = \'%0\'', [data.username]).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.resolve(null);
			}
			return Q(User.wrap(result.rows[0]));
		});
	},
	// Creates a user.
	create: function(data) {
		var salt = crypto.randomBytes(128).toString('base64');
		this.require(data, ['username', 'password'], 'User.get');
		var self = this;
		return User.exists({username: data.username})
		.then(function(exists) {
			if (!exists) {
				return self.app.db.execute('INSERT INTO "User" (username, password, salt) VALUES (\'%0\', \'%1\', \'%2\') RETURNING username, password, salt', [data.username, User.hash(data.password, salt), salt]).then(function(result) {
					return Q(User.wrap(result.rows[0]));
				});
			}
			else {
				return Q.reject();
			}
		});
		
	}
});

module.exports = User;