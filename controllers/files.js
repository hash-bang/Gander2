var _ = require('lodash');
var async = require('async');
var gm = require('gm');
var fs = require('fs');
var fspath = require('path');
var mkdirp = require('mkdirp');
var walk = require('walk');

app.all('/api/dir/*', function(req, res) {
	var path;
	if (req.params[0]) {
		path = fspath.join(config.path, req.params[0]);
		thumbPath = fspath.join(config.thumbPath, req.params[0]);
	} else {
		path = config.path;
		thrumbPath = config.thumbPath;
	}

	async.parallel({
		files: function(next) {
			fs.readdir(path, function(err, files) {
				if (err) return next('Cannot read directory');
				next(null, files);
			});
		},
		json: function(next) {
			fs.readFile(fspath.join(path, config.ganderFile), function(err, data) {
				if (err) return next(); // File probably doesn't exist - fail silently
				next(null, JSON.parse(data));
			});
		}
	}, function(err, results) {
		var tasks = [];
		var contents = [];

		if (err) return res.send(400, err);

		results.files.forEach(function(f, i) {
			if (f == config.ganderFile) 
				return;

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
					if (fileInfo.type == 'dir') { // Peek into dir and see if it has any grand-children {{{
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
					} // }}}
				});
			});
		});

		async.parallel(tasks, function(err, files) {
			res.send(files);
		});
	});
});

app.get('/api/thumb/*', function(req, res) {
	var path, thumbPath;
	if (req.params[0]) {
		path = fspath.join(config.path, req.params[0]);
		thumbPath = fspath.join(config.thumbPath, req.params[0]);
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
			gm(path)
				.setFormat('png')
				.resize(config.thumbWidth, config.thumbHeight)
				.toBuffer(function(err, buffer) {
					if (err) return next(err);
					next(null, buffer);
				});
		},
		function(buffer, next) {
			fs.writeFile(thumbPath, buffer, 'binary'); // Flush this to disk in the background
			res.set('Content-Type', 'image/png');
			res.send(200, buffer); // Meanwhile respond to the browser in the foreground, buwahaha Node.
			next();
		}
	], function(err) {
		if (err && err != 'Thumb already exists') return res.send(400, err);
	});
});


/**
* Returns an array of all directories found under the given path
*/
app.all('/api/tree/*', function(req, res) {
	var path;
	if (req.params[0]) {
		path = fspath.join(config.path, req.params[0]);
	} else {
		path = config.path;
	}

	var dirRoot = fspath.dirname(path);
	var paths = [];
	var walker = walk.walk(path, {followLinks: true});
	walker
		.on('directories', function(root, dirStatsArray, next) {
			dirStatsArray.forEach(function(p) {
				paths.push(fspath.join(root, p.name).substr(dirRoot.length));
			});
			next();
		})
		.on('end', function() {
			res.send(paths);
		});

});

app.get('/api/file/*', function(req, res) {
	var path, thumbPath;
	if (req.params[0]) {
		path = fspath.join(config.path, req.params[0]);
	} else {
		return res.send(400, 'No path specified');
	}

	if (!config.serveAble.exec(path)) return res.send(400, 'Unable to serve this path');

	fs.readFile(path, function(err, data) {
		if (err) return next(); // Couldn't read existing thumb - continue to generate one and serve that

		res.set('Content-Type', 'image/png');
		res.send(200, fs.readFileSync(path));
	});
});

app.put('/api/file/*', function(req, res) {
	var path, thumbPath;
	if (req.params[0]) {
		path = fspath.join(config.path, req.params[0]);
	} else {
		return res.send(400, 'No path specified');
	}

	var jsonPath = fspath.join(fspath.dirname(path), config.ganderFile);

	if (!config.serveAble.exec(path)) return res.send(400, 'Unable to serve this path');

	async.waterfall([
		function(next) {
			fs.readFile(jsonPath, function(err, data) {
				if (err) return next(null, '{}'); // File doesn't exist - fake content
				next(null, data);
			});
		},
		function(fileData, next) {
			var file = fspath.basename(req.body.path);
			var jsonData = JSON.parse(fileData);
			if (!jsonData) return next('Not valid JSON data');
			if (req.body.emblems && req.body.emblems.length > 0) {
				if (!jsonData[file])
					jsonData[file] = {};
				jsonData[file].emblems = req.body.emblems;
			} else if (jsonData[file] && jsonData[file].emblems) {
				delete jsonData[file].emblems;
			}
			next(null, jsonData);
		},
		function(jsonData, next) {
			if (_.isEmpty(jsonData)) { // Nothing to write - delete the file if it exists
				fs.unlink(jsonPath);
			} else {
				console.log('WRITE', jsonData);
				fs.writeFile(jsonPath, JSON.stringify(jsonData));
			}
			next();
		},
	], function(err, results) {
		if (err) return res.send(400, err);
		res.send(200);
	});
});
