/**
	The database connection object.
	Used to connect to the PostgreSQL database and execute commands.
*/
var pg = require('pg'),
	fs = require('fs'),
	Q = require('q');
var db = {
	url: null,
	app: null,
	init: function(app) {
		db.url = "postgres://" + app.config.db.username + ":" + app.config.db.password + "@" + app.config.db.url + "/" + app.config.db.database;
		db.app = app;
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

	parseInsert: function(sql, insertName, insertValue) {
		var str = insertValue
		if (insertValue instanceof Array) {
			str = '(';
			for (var i = 0; i < insertValue.length; i++) {
				var value = insertValue[i];
				var isNum = (typeof(value) === 'number');
				if (!isNum)
					value = value.replace(/\'/g,"''");
				if (!isNum)
					str += '\'';
				str += value;
				if (!isNum)
					str += '\'';
				if (i < insertValue.length - 1)
					str += ', ';
			}
			str += ')';
		}
		else {
			if(typeof(str) === 'string')
				str = str.replace(/\'/g,"''");
		}
		var find = '%' + insertName;
		var re = new RegExp(find, 'g');
		sql = sql.replace(re, str);
		return sql;
	},

	parseInserts: function(sql, inserts) {
		if (inserts) {
			var isArray = (inserts instanceof Array);
			var ix = 0;
			for(var i in inserts) {
				if (isArray) {
					sql = db.parseInsert(sql, ix, inserts[i]);
				}
				else {
					sql = db.parseInsert(sql, i, inserts[i]);
				}
				ix++;
			}
		}
		return sql;
	},

	execute: function(sql, inserts) {
		sql = db.parseInserts(sql, inserts);
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
		  	done();
		  	deffered.reject();
		  });
		  query.on('end', function(result) {
		  	done();
		  	deffered.resolve(result);
		  });
		});
		return deffered.promise;
	}
};

module.exports = db;