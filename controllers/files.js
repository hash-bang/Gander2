var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var fspath = require('path');

app.get('/api/files', function(req, res) {
	var path;
	if (req.param('path')) {
		path = fspath.join(config.path, req.param('path'));
	} else {
		path = config.path;
	}

	async.parallel({
		files: function(next) {
			fs.readdir(path, function(err, files) {
				if (err) return next('Cannot read directory');
				next(null, files);
			});
		},
		json: function(next) {
			fs.readFile(fspath.join(path, '.gander.json'), function(err, data) {
				if (err) return next(); // File probably doesn't exist - fail silently
				next(null, JSON.parse(data));
			});
		}
	}, function(err, results) {
		var tasks = [];
		var contents = [];

		results.files.forEach(function(f, i) {
			tasks.push(function(next) {
				fs.stat(fspath.join(path, f), function(err, stats) {
					var fileInfo = {
						name: f,
						type:
							stats.isFile() ? 'file' :
							stats.isDirectory() ? 'dir' :
							'unknown',
						size: stats.size,
						ctime: stats.ctime,
						mtime: stats.mtime,
					};
					if (results.json[f])
						_.extend(fileInfo, results.json[f]);
					next(null, fileInfo);
				});
			});
		});

		async.parallel(tasks, function(err, files) {
			res.send(files);
		});
	});
});
