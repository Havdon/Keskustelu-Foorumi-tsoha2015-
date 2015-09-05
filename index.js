

try {
	require.resolve("./config")
} catch(e) {
	console.error("Config file not found! See config.temp.js for the required config data.");
	process.exit(e.code);
}

var config = require('./config');
var app = require('./src/app');

app.init(config);