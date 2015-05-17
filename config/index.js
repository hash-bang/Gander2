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
	gulp: {
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
	},
	package: require('../package.json'),

	path: path.join(__dirname, 'images'),
	thumbPath: '/tmp/gander',
	thumbAble: /\.(png|jpe?g|gif)$/i,
	thumbWidth: 150,
	thumbHeight: 150,

	serveAble: /\.(png|jpe?g|gif)$/i,
	ganderFile: '.gander.json'
};

module.exports = _.merge(
	defaults,
	fs.existsSync('./config/private.js') ? require('./private.js') : {},
	fs.existsSync('./config/' + defaults.env + '.js') ? require('./' + defaults.env + '.js') : {}
);
