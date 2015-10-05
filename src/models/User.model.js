var Q = require('q');
var Model = require('../model'),
	crypto = require('crypto');
var User = Model(
{ // Static methods

	// Hashes a password using a salt.
	hash: function(str, salt) {
		if (!salt) {
			return str;
		}
		// TODO: Change to slower encryption algorithm.
		return crypto.createHash('md5').update(str + salt).digest('hex');
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
			return Q(new User(result.rows[0]));
		});
	}
},
{	// Instance methods

	_constructor: function(data) {
		console.log(data);
		this.setProperty('username', data.username, true);
		this.setProperty('password', data.password);
		this.setProperty('salt', data.salt, true);
	},

	validPassword: function(password) {
		return (User.hash(password, this.salt) === this.password);
	},

	save: function() {
		if (!this.salt)
			return this.create();
	},

	create: function() {
		var errors = this.getErrors();
		if (errors.length > 0)
			return Q.reject(errors);
		if (this.salt)
			return Q.reject('Calling User.create for a User that has already a salt.');
		this.setProperty('salt', crypto.randomBytes(128).toString('base64'));
		this.setProperty('password', User.hash(this.password, this.salt));
		var self = this;
		return User.exists({username: this.username})
		.then(function(exists) {
			if (!exists) {
				return self.app.db.execute('INSERT INTO "User" (username, password, salt) VALUES (\'%username\', \'%password\', \'%salt\') RETURNING username, password, salt', self.getProperties()).then(function(result) {
					return Q(self);
				});
			}
			else {
				return Q.reject('User already exists.');
			}
		});
		
	},

	validators: {
		username: function() {
			if (!this.username || this.username.length < 1)
				return 'Username cannot be empty.';
			if (this.username.replace(/ /g,'').length < 1)
				return 'Username cannot be only whitespace.'
		},
		password: function() {
			if (!this.password || this.password.length < 1)
				return 'Password cannot be empty.';
			if (this.password.replace(/ /g,'').length < 1)
				return 'Password cannot be only whitespaces.'
			if (this.password.length < 5)
				return 'Password has to be at least 5 characters long.'
		}
	}
});

module.exports = User;