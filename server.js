#!/usr/bin/env node
// Initial / Config {{{
global.config = require('./config');
// }}}
// Requires {{{
var _ = require('lodash');
var colors = require('chalk');
var bodyParser = require('body-parser');
var express = require('express');
var layouts = require('express-ejs-layouts')
var fspath = require('path');
var fs = require('fs');
var requireDir = require('require-dir');
global.app = express();
// }}}
// Settings {{{
app.set('title', config.title);
app.set('view engine', "html");
app.set('layout', 'layouts/main');
app.engine('.html', require('ejs').renderFile);
app.enable('view cache');
app.use(layouts);
// }}}
// Settings / Basic Auth lockdown {{{
// Enable this to temporarily lock down the server quickly
// app.use(express.basicAuth('user', 'letmein'));

// Lookup auth details from config.access.users
if (config.access && config.access.lockdown) {
	var basicAuth = require('basic-auth-connect');
	app.use(basicAuth(function(user, pass) {
		var user = _.find(config.access.users, {user: user});
		return (user && pass == user.pass);
	}, config.title + ' - Private'));
}
// }}}
// Settings / Parsing {{{
app.use(require('cookie-parser')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('multer')());
// }}}
// }}}
// Settings / Logging {{{
app.use(require('express-log-url'));
// }}}
// Controllers {{{
requireDir('./controllers');
// }}}

// Static pages {{{
app.use(express.static(__dirname + '/public'));
app.use('/app', express.static(__dirname + '/app'));
app.use('/build', express.static(__dirname + '/build'));
app.use('/partials', express.static(__dirname + '/views/partials'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
// }}}

// Error catcher {{{
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send('Something broke!').status(500).end();
});
// }}}

// Init {{{
var server = app.listen(config.port, config.host, function() {
	console.log('Web interface listening at', colors.cyan('http://' + (config.host || 'localhost') + (config.port == 80 ? '' : ':' + config.port)));
});
// }}}
