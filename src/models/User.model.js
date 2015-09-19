
var Q = require('q');
var Model = require('../model'),
	crypto = require('crypto');
var User = Model({
	hash: function(str, salt) {
		if (!salt) {
			return str;
		}
		return crypto.createHash('md5').update(str + salt).digest('hex');
	},
	wrap: function(user) {
		user.password = User.hash(user.password);
		user.validPassword = function(password) {
			return (User.hash(password, user.salt) === user.password);
		};
		return user;
	},
	exists: function(data) {
		this.require(data, ['username'], 'User.get');
		return this.app.db.execute('SELECT 1 as isuser FROM "User" WHERE username = \'%0\'', [data.username]).then(function(result) {
			console.log(result);
			return Q(result.rows && result.rows.length === 1 && result.rows[0].isuser == 1);
		});
	},
	get: function(data) {
		this.require(data, ['username'], 'User.get');
		return this.app.db.execute('SELECT * FROM "User" WHERE username = \'%0\'', [data.username]).then(function(result) {
			if (!result.rows || result.rows.length != 1) {
				return Q.resolve(null);
			}
			return Q(User.wrap(result.rows[0]));
		});
	},
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