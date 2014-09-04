var _ = require('lodash');
var path = require('path');
var fs = require('fs');

var defaults = {
	env: process.env.NODE_ENV ? process.env.NODE_ENV : 'dev',
	root: path.normalize(__dirname + '/..'),
	port: process.env.PORT || 9000,
	mongo: {
		name: 'hipsterBingo',
		uri: 'mongodb://localhost/hipsterBingo',
		options: {
			db: {
				safe: true
			}
		}
	}
};

// console.log('ENV is', defaults.env);

module.exports = _.merge(
	defaults,
	fs.existsSync('./config/' + defaults.env + '.js') ? require('./' + process.env.NODE_ENV + '.js') : {}
);

global.mongoose = require('mongoose');
mongoose.connect(module.exports.mongo.uri);
global.db = global.mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error:'));
