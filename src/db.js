var pg = require('pg');

var db = {
	url: null,
	init: function(app) {
		db.url = "postgres://" + app.config.db.username + ":" + app.config.db.password + "@" + app.config.db.url + "/" + app.config.db.database;

		// db test
		/*
		pg.connect(db.url, function(err, client, done) {
		  if(err) {
		    return console.error('error fetching client from pool', err);
		  }
		  client.query('SELECT $1::int AS number', ['1'], function(err, result) {
		    //call `done()` to release the client back to the pool
		    done();

		    if(err) {
		      return console.error('error running query', err);
		    }
		    console.log(result.rows[0].number);
		    //output: 1
		  });
		});
		*/


	}
};

module.exports = db;