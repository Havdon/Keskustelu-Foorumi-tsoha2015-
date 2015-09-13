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
				req.session.username = 'admin';
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