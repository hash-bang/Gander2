var _ = require('lodash');
var path = require('path');
var fs = require('fs');

// Determine 'ENV' {{{
var env = 'dev';
if (process.env.VCAP_SERVICES) {
	env = 'appfog';
} else if (process.env.OPENSHIFT_NODEJS_IP) {
	env = 'openshift';
} else if (process.env.MONGOLAB_URI) {
	env = 'heroku';
} else if (/-e\s*([a-z0-9\-]+)/i.test(process.argv.slice(1).join(' '))) { // exec with '-e env'
	var eargs = /-e\s*([a-z0-9\-]+)/i.exec(process.argv.slice(1).join(' '));
	env = eargs[1];
} else if (process.env.NODE_ENV) { // Inherit from NODE_ENV
	env = process.env.NODE_ENV;
}
// }}}

var defaults = {
	name: "gander",
	title: "Gander",
	env: env,
	root: path.normalize(__dirname + '/..'),
	host: null, // Listen to all host requests
	port: process.env.PORT || 80,
	url: 'http://localhost',
	secret: "9sA2B2or922Fvxa5+MHIsdA6KBhwvuiu70SuLDjewy6l3WDjQPgnDOJZvHx7HR9uZY4u/V21W7uT}", // A quick way to populate this is with `cat /dev/urandom | base64 | head -n10`
	access: {
		lockdown: false, // Set to true to lock the site with the below users
		users: [{user: 'user', pass: 'qwaszx'}],
	},
	contactEmail: 'matt@mfdc.biz',
	gulp: {
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
	},

	path: path.join(__dirname, 'images'),
	thumbPath: '/tmp/gander',
	thumbAble: /\.(png|jpe?g|gif)$/i,
	thumbWidth: 150,
	thumbHeight: 150,

	serveAble: /\.(png|jpe?g|gif)$/i,
	ganderFile: '.gander.json'
};

module.exports = _.merge(
	// Adopt defaults...
	defaults,

	// Which are overriden by private.js if its present
	fs.existsSync(__dirname + '/private.js') ? require(__dirname + '/private.js') : {},

	// Whish are overriden by the NODE_ENV.js file if its present
	fs.existsSync(__dirname + '/' + defaults.env + '.js') ? require(__dirname + '/' + defaults.env + '.js') : {}
);
