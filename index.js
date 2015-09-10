

try {
	require.resolve("./config")
} catch(e) {
	console.error("config.js file not found in project root! Clone config.temp.js and use it as a tempalte for the required data.");
	process.exit(e.code);
}
var extend = require('extend'),
	config = require('./config'),
	config_temp = require('./config.temp'),
	app = require('./src/app');

// Default to config template values if they are not found in config.
config = extend(true, config_temp, config);

app.init(config);