var pg = require('pg'),
	fs = require('fs'),
	Q = require('q');
var db = {
	url: null,
	app: null,
	init: function(app) {
		db.url = "postgres://" + app.config.db.username + ":" + app.config.db.password + "@" + app.config.db.url + "/" + app.config.db.database;
		db.app = app;
		/*
		db.executeFile('src/sql/drop_tables.sql')
		.then(function() { return db.executeFile('src/sql/create_tables.sql'); })
		.then(function() { return db.executeFile('src/sql/add_test_data.sql'); })
		.done();
		*/
	},

	executeFile: function(file) {
		var deffered = Q.defer();
		fs.readFile(file, 'utf8', function (err,data) {
		  if (err) {
		    deffered.reject(err);
		  }
		  if (typeof data === 'undefined') {
		  	console.error('The file ' + file + ' was not found.');
		  	deffered.reject();
		  	return;
		  }

		  deffered.resolve(db.execute(data));
		});
		return deffered.promise;
	},

	execute: function(sql, inserts) {
		if (inserts) {
			var ix = 0;
			for(var i in inserts) {
				sql = sql.replace('%' + ix, inserts[i]);
				ix++;
			}
		}
		console.log(sql);
		var deffered = Q.defer();
		pg.connect(db.url, function(err, client, done) {
		  if(err) {
		    console.error('error fetching client from pool', err);
		    deffered.reject();
		    return;
		  }
		 
		  var query = client.query(sql);
		  query.on('row', function(row, result) {
		  	result.addRow(row);
		  	deffered.notify(row);
		  });
		  query.on('error', function(err) {
		  	console.error(err);
		  	deffered.reject();
		  });
		  query.on('end', function(result) {
		  	deffered.resolve(result);
		  });
		});
		return deffered.promise;
	}
};

module.exports = db;