/**
	Controller that handles user login, logout, registration and authetication.
*/
var Q = require('q');
var Controller = require('../../controller');
var Auth = Controller({
	name: 'auth',
	pathPrefix: 'auth',
	init: function() {
		this.post('index', this.authenticate);
		this.get('index', this.app.auth.skipIfAuth(), this.login);
		this.get('register', this.app.auth.skipIfAuth(), this.getRegister);
		this.post('register', this.app.auth.skipIfAuth(), this.postRegister);
		this.get('logout', this.logout);
	},

	login: function(req, res){
		this.render(req, res, 'login', {});
	},
	logout: function(req, res){
		var self = this;
		req.session.auth = false;
		req.session.username = null;
		req.session.save(function(err) {
			res.redirect(self.app.config.url_prefix + '/');
		});
	},

	getRegister: function(req, res){
		this.render(req, res, 'register', {});
	},

	postRegister: function(req, res){
		if (!req.body || !req.body.username || !req.body.password) {
			res.sendStatus(400);
			return;
		}
		var self = this;
		this.app.models.User.create(req.body).then(function(user) {
			req.session.auth = true;
			req.session.username = req.body.username;
			req.session.save(function(err) {
				res.redirect(self.app.config.url_prefix + '/');
			});
		}, function() {
			self.registerError(res, "exists");
		}).done();
	},

	authenticate: function(req, res){
		if (!req.body || !req.body.username || !req.body.password) {
			res.sendStatus(400);
			return;
		}
		if (req.session.auth === true) {
			res.redirect(self.app.config.url_prefix + '/');
		}
		var self = this;
		this.app.models.User.get({username: req.body.username}).then(function(user) {
			if (user && user.validPassword(req.body.password)) {
				req.session.auth = true;
				req.session.username = req.body.username;
				/*
				var url = self.app.config.url_prefix + '/';
				if (req.session.forbiddenUrl) {
					url = req.session.forbiddenUrl;
					req.session.forbiddenUrl = null;
				}
				*/
				var url = req.header('Referer') || self.app.config.url_prefix + '/';
				req.session.save(function(err) {
					res.redirect(url);
				});
			}
			else {
				self.app.log('authauthenticate: Invalid password ' + req.body.password + " for user " + req.body.username);
				Auth.loginError(res, 'invalid');
			}
		}, function() {
			self.app.log('Tried to login with invalid user.');
			Auth.loginError(res, 'invalid');
		}).done();
	},

	registerError: function(res, error) {
		res.redirect(this.app.config.url_prefix + '/auth/register?error=' + error);
	},

	loginError: function(res, error) {
		res.redirect(this.app.config.url_prefix + '/auth?error=' + error);
	}

});

module.exports = Auth;