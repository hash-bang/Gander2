var _ = require('lodash');
var async = require('async');
var im = require('imagemagick');
var fs = require('fs');
var fspath = require('path');
var mkdirp = require('mkdirp');

app.all('/api/dir', function(req, res) {
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

		if (err) return res.send(400, err);

		results.files.forEach(function(f, i) {
			tasks.push(function(next) {
				var filePath = fspath.join(path, f);
				fs.stat(filePath, function(err, stats) {
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
					if (results.json && results.json[f])
						_.extend(fileInfo, results.json[f]);
					if (fileInfo.type == 'dir') { // Peek into dir and see if it has any grand-children
						fs.readdir(filePath, function(err, files) {
							if (err) return next(err);
							async.detect(files, function(file, peekNext) {
								fs.stat(fspath.join(filePath, file), function(err, stat) {
									if (err) return peekNext(false);
									return peekNext(stat.isDirectory());
								});
							}, function(result) {
								if (result) // At least one child of this directory is also a directory
									fileInfo.peekDir = true;
								next(null, fileInfo);
							});
							/* if (files.length > 0)
								fileInfo.peekDir = files.length; */
						});
					} else { // Not a directory - no need to recurse into it
						next(null, fileInfo);
					}
				});
			});
		});

		async.parallel(tasks, function(err, files) {
			res.send(files);
		});
	});
});

app.all('/api/thumb/:path*?', function(req, res) {
	var path, thumbPath;
	if (req.param('path')) {
		path = fspath.join(config.path, req.param('path'));
		thumbPath = fspath.join(config.thumbPath, req.param('path'));
	} else {
		return res.send(400, 'No path specified');
	}

	console.log('REQUEST THUMB', path);

	if (!config.thumbAble.exec(path)) return res.send(400, 'Unable to thumb this path');

	async.waterfall([
		function(next) {
			fs.readFile(thumbPath, function(err, data) {
				if (err) return next(); // Couldn't read existing thumb - continue to generate one and serve that

				res.set('Content-Type', 'image/png');
				res.send(200, fs.readFileSync(thumbPath));
				next('Thumb already exists');
			});
		},
		function(next) {
			fs.exists(path, function(exists) {
				if (!exists) return next('File does not exist');
				next();
			});
		},
		function(next) {
			mkdirp(fspath.dirname(thumbPath), function(err) {
				if (err) return next(err);
				next();
			});
		},
		function(next) {
			fs.readFile(path, function(err, data) {
				if (err) return next(err);
				return next(null, data);
			});
		},
		function(fileBlob, next) {
			im.resize({
				srcData: fileBlob,
				format: 'png',
				width: config.thumbWidth,
				height: config.thumbHeight,
			}, function(err, stdout, stderr) {
				if (err) return next(err);
				var buffer = new Buffer(stdout, 'binary');
				fs.writeFile(thumbPath, stdout, 'binary'); // Flush this to disk in the background
				res.set('Content-Type', 'image/png');
				res.send(200, buffer); // Meanwhile respond to the browser in the foreground, buwahaha Node.
				next();
			});
		}
	], function(err) {
		if (err && err != 'Thumb already exists') return res.send(400, err);
	});
});
