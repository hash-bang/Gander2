var _ = require('lodash');
var async = require('async-chainable');
var gm = require('gm');
var fs = require('fs');
var fspath = require('path');
var mkdirp = require('mkdirp');
var walk = require('walk');

app.all('/api/dir/*', function(req, res) {
	var output = [];

	async()
		.set('path', req.params[0] ? fspath.join(config.path, req.params[0]) : config.path)
		.set('thumbPath', req.params[0] ? fspath.join(config.thumbPath, req.params[0]) : config.thumbPath)
		.parallel({
			files: function(next) {
				fs.readdir(this.path, next);
			},
			json: function(next) {
				fs.readFile(fspath.join(this.path, config.ganderFile), function(err, data) {
					if (err) return next(); // File probably doesn't exist - fail silently
					next(null, JSON.parse(data));
				});
			}
		})
		.forEach('files', function(nextFile, file) {
			if (file == config.ganderFile) return nextFile(); // Skip gander info file
			var filePath = fspath.join(this.path, file);

			async()
				.set('json', this.json)
				.then('stats', function(next) {
					fs.stat(filePath, next);
				})
				.then('fileInfo', function(next) {
					var fileInfo = {
						name: file,
						type:
							this.stats.isFile() ? 'file' :
							this.stats.isDirectory() ? 'dir' :
							'unknown',
						size: this.stats.size,
						ctime: this.stats.ctime,
						mtime: this.stats.mtime,
					};

					if (this.json && this.json[file]) _.merge(fileInfo, this.json[file]); // If the info file has extra info, merge it
					next(null, fileInfo);
				})
				.then(function(next) {
					var self = this;
					if (self.fileInfo.type != 'dir') return next();
					fs.readdir(filePath, function(err, contents) {
						if (err) return next(err);
						if (!contents) return next();
						if (contents.some(function(file) {
							return fs.statSync(fspath.join(filePath, file)).isDirectory();
						}))
							self.fileInfo.peekDir = true;
						next();
					});
				})
				.then(function(next) {
					output.push(this.fileInfo);
					next();
				})
				.end(nextFile);
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send(output);
		});
});

app.get('/api/thumb/*', function(req, res) {
	async()
		.set('path', req.params[0] ? fspath.join(config.path, req.params[0]) : null)
		.set('thumbPath', req.params[0] ? fspath.join(config.thumbPath, req.params[0]) : null)
		.then(function(next) {
			// Sanity checks {{{
			if (!this.path) return next('No path specified');
			if (!config.thumbAble.exec(this.path)) return next('Unable to thumb this path');
			next();
			// }}}
		})
		.then(function(next) {
			var self = this;
			fs.readFile(self.thumbPath, function(err, data) {
				if (err) return next(); // Couldn't read existing thumb - continue to generate one and serve that
				next('END');
			});
		})
		.then(function(next) {
			fs.exists(this.path, function(exists) {
				if (!exists) return next('File does not exist');
				next();
			});
		})
		.then(function(next) {
			mkdirp(fspath.dirname(this.thumbPath), next);
		})
		.then('buffer', function(next) {
			gm(this.path)
				.setFormat('png')
				.resize(config.thumbWidth, config.thumbHeight)
				.toBuffer(function(err, buffer) {
					if (err) return next(err);
					next(null, buffer);
				});
		})
		.then(function(next) {
			fs.writeFile(this.thumbPath, this.buffer, 'binary', next);
		})
		.end(function(err) {
			if (err && err != 'END') return res.status(400).send(err);
			console.log('SF', this.thumbPath);
			res.sendFile(this.thumbPath);
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
		return res.status(400).send('No path specified');
	}

	if (!config.serveAble.exec(path)) return res.status(400).send('Unable to serve this path');

	res.sendFile(path);
});

app.put('/api/file/*', function(req, res) {
	async()
		.set('path', req.params[0] ? fspath.join(config.path, req.params[0]) : config.path)
		.set('thumbPath', req.params[0] ? fspath.join(config.thumbPath, req.params[0]) : config.thumbPath)
		.then(function(next) {
			// Sanity checks {{{
			if (!this.path) return next('No path specified');
			if (!config.serveAble.exec(this.path)) return next('Unable to serve this path');
			next();
			// }}}
		})
		.then('jsonPath', function(next) {
			next(null, fspath.join(fspath.dirname(this.path), config.ganderFile))
		})
		.then('rawData', function(next) {
			fs.readFile(jsonPath, function(err, data) {
				if (err) return next(null, '{}'); // File doesn't exist - fake content
				next(null, data);
			});
		})
		.then('json', function(next) {
			var file = fspath.basename(req.body.path);
			var jsonData = JSON.parse(this.rawData);
			if (!jsonData) return next('Not valid JSON data');
			if (req.body.emblems && req.body.emblems.length > 0) {
				if (!jsonData[file])
					jsonData[file] = {};
				jsonData[file].emblems = req.body.emblems;
			} else if (jsonData[file] && jsonData[file].emblems) {
				delete jsonData[file].emblems;
			}
			next(null, jsonData);
		})
		.then(function(next) {
			if (_.isEmpty(this.json)) { // Nothing to write - delete the file if it exists
				fs.unlink(jsonPath);
			} else {
				fs.writeFile(jsonPath, JSON.stringify(this.json));
			}
			next();
		})
		.end(function(err) {
			if (err) return res.status(400).send(err);
			res.send(200);
		});
});
