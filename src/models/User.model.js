
var Q = require('q');
var Model = require('../model'),
	crypto = require('crypto');
var User = Model({
	hash: function(str, salt) {
		if (!salt) {
			return str; // TODO: Implement password hashing.
		}
		return crypto.createHash('md5').update(str + salt).digest('hex');
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
		var salt = crypto.randomBytes(128).toString('base64');
		this.require(data, ['username', 'password'], 'User.get');
		return this.app.db.execute('INSERT INTO "User" (username, password, salt) VALUES (\'%0\', \'%1\', \'%2\')', [data.username, User.hash(data.password, salt), salt]).then(function(result) {
			console.log(result.rows);
			return Q(User.wrap(result.rows[0]));
		});
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