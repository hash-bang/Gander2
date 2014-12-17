var gulp = require('gulp');
var gutil = require('gulp-util');
var colors = require('colors');
var plugins = require('gulp-load-plugins')();

var paths = {
	scripts: [
		'public/js/**/*.js',
		'app/**/*.js'
	],
	build: 'build'
};


gulp.task('clean', function(cb) {
	return gulp.src(paths.build)
		.pipe(plugins.rimraf());
});


gulp.task('build', ['scripts']);


gulp.task('scripts', ['clean'], function() {
	return gulp.src(paths.scripts)
		// .pipe(plugins.uglify())
		.pipe(plugins.concatSourcemap('all.min.js'))
		.pipe(gulp.dest(paths.build));
});


/**
* Output the current environment config
*/
gulp.task('config', function() {
	var config = require('./config');
	gutil.log(config);
});


gulp.task('default', ['scripts'], function () {
	plugins.nodemon({script: 'server.js', ext: 'html js ejs'})
		.on('change', ['scripts'])
		.on('restart', function () {
			gutil.log('Restarted!'.red)
		});
});
