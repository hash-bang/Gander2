#!/usr/bin/env node

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var config = require('./config');
var fs = require('fs');
var fileEmitter = require('file-emitter');
var fspath = require('path');
var gm = require('gm');
var mkdirp = require('mkdirp');
var program = require('commander');

program
	.version(require('./package.json').version)
	.usage('[dir...]')
	.option('-d, --dry-run', 'Dont actually make thumbnails. Just say where they would be made')
	.option('-v, --verbose', 'Be verbose. Specify multiple times for increasing verbosity', function(i, v) { return v + 1 }, 0)
	.parse(process.argv);

	async()
		.set('fileCount', 0)
		.set('thumbsMade', 0)
		.set('nonThumbable', 0)
		.then(function(next) {
			// Sanity checks {{{
			if (!program.args.length) return next('No directories specified');
			if (!config.path) return next('No path specified in config');
			if (!config.thumbPath) return next('No thumbPath specified in config');
			next();
			// }}}
		})
		.forEach(program.args, function(next, rawPath) {
			var self = this;
			var path = fspath.resolve(rawPath);
			if (!_.startsWith(path, config.path)) return next('Path "' + rawPath + '" must be within "' + config.path + '"');
			if (program.verbose) console.log('Scan', colors.cyan(path));

			var fe = fileEmitter(path, {
				incremental: true,
			})
				.on('file', function(file) {
					self.fileCount++;

					// Check to see if we can thumb this first
					if (!config.thumbAble.test(file.name)) {
						self.nonThumbable++;
						return fe.next();
					}

					async()
						.set('filePath', fspath.join(path, file.name))
						.set('thumbPath', fspath.join(config.thumbPath, path, file.name))
						.then('thumbStat', function(next) {
							fs.stat(this.thumbPath, function(err, stat) {
								if (err) return next(); // Try to gen thumbnail if not already found
								next('SKIP'); // Skip otherwise
							});
						})
						.then(function(next) {
							mkdirp(fspath.dirname(this.thumbPath), next);
						})
						.then('buffer', function(next) {
							if (program.dryRun) return next();
							if (program.verbose) console.log(colors.blue('MkThumb'), colors.cyan(this.filePath));
							gm(this.filePath)
								.setFormat('png')
								.resize(config.thumbWidth, config.thumbHeight)
								.toBuffer(function(err, buffer) {
									if (err) return next(err);
									next(null, buffer);
								});
						})
						.then(function(next) {
							if (program.dryRun) {
								console.log('Would thumbnail', colors.cyan(this.filePath), '=>', colors.cyan(this.thumbPath));
								return next();
							}
							fs.writeFile(this.thumbPath, this.buffer, 'binary', next);
							self.thumbsMade++;
						})
						.end(function(err) {
							if (err == 'SKIP') return fe.next();
							if (err) console.log(colors.red('ERROR'), this.filePath, err.toString());
							return fe.next()
						});
				})
				.on('end', function() {
					next();
				});
		})
		.end(function(err) {
			if (err) {
				console.log(colors.red('ERROR'), this.filePath, err.toString());
				process.exit(1);
			}

			console.log('Files seen', colors.cyan(this.fileCount));
			console.log('Non-thumbable files seen', colors.cyan(this.nonThumbable));
			console.log('Thumbs made', colors.cyan(this.thumbsMade));
			process.exit(0);
		});
