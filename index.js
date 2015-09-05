

try {
	require.resolve("./config")
} catch(e) {
	console.error("config.js file not found in project root! Clone config.temp.js and use it as a tempalte for the required data.");
	process.exit(e.code);
}

var config = require('./config');
var app = require('./src/app');

app.init(config);