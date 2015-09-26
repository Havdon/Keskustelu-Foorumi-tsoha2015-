/**
	Utility functions conserning user authentication.
	For the login process see the "Auth" controller in the "src/controllers/auth" folder.
*/
var shortid = require('shortid');
var session = require('express-session');
var Auth = {
	app: null,
	init: function(app) {
		app.express.use(session({
		  genid: function(req) {
		    return shortid()
		  },
		  resave: true,
		  saveUninitialized: true,
		  secret: 'supersecretstring'
		}));
		app.express.use(function (req, res, next) {
			if (app.config.autoAdminLogin === true) {
				req.session.auth = true;
				req.session.username = (app.config.autoLoginUsername ? app.config.autoLoginUsername : 'admin');
				req.session.save(function() {
					next();
				});
			}
			else {
				next();
			}
		});
		this.app = app;
	},
	// Route middleware function which redirects to login if the user is not autheticated.
	require: function() {
		return function (req, res, next) {
		  if (req.session.auth !== true) {
		  	req.session.forbiddenUrl = req.originalUrl;
		  	req.session.save(function() {
		  		res.redirect(Auth.app.config.url_prefix + '/auth');
		  	});
		  }
		  else {
		  	next();
		  }
		};
	},

	// Route middleware which redirects to the site root if the user is logged in.
	skipIfAuth: function() {
		return function (req, res, next) {
		  if (req.session.auth === true) {
		  	res.redirect(Auth.app.config.url_prefix + '/');
		  }
		  else {
		  	next();
		  }
		};
	}
};

module.exports = Auth;