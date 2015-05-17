#!/usr/bin/env node
// Initial / Config {{{
global.config = require('./config');
// }}}
// Requires {{{
var colors = require('colors');
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
// Settings / Basic Auth (DEBUGGING) {{{
// Enable this to temporarily lock down the server
// app.use(express.basicAuth('user', 'letmein'));
// }}}
// Settings / Parsing {{{
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('multer')());
// }}}
// }}}
// Settings / Logging {{{
var expressLog = require('express-log');
app.use(expressLog());
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
	res.send(500, 'Something broke!').end();
});
// }}}

// Init {{{
var server = app.listen(config.port, config.host, function() {
	console.log('Web interface listening on ' + ((config.host || 'localhost') + ':' + config.port).cyan);
});
// }}}
