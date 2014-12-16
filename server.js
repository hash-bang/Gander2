// Requires {{{
var bodyParser = require('body-parser')
var express = require('express');
var layouts = require('express-ejs-layouts')
var path = require('path');
var fs = require('fs');
global.app = express();
// }}}
// Global functions {{{
var requireTree = function(dir) {
	dir = path.join(__dirname, dir);
	fs.readdirSync(dir).forEach(function (file) {
		if (/(.*)\.(js$|coffee$)/.test(file))
			require(path.join(dir, file));
	});
}
// }}}
// Settings {{{
global.config = require('./config/global');
app.set('title', 'Gander');
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.enable('view cache');
app.use(layouts);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// }}}
// Controllers {{{
requireTree('controllers');
// }}}

// Static pages {{{
app.use(express.static(__dirname + '/public'));
app.use('/build', express.static(__dirname + '/build'));
app.use('/templates', express.static(__dirname + '/views/templates'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
// }}}

// Error catcher {{{
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke!');
});
// }}}

// Init {{{
var server = app.listen(config.port, config.host, function() {
	console.log('Listening on ' + config.host + ':' + config.port);
});
// }}}
