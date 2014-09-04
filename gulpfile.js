var gulp = require('gulp');
var gutil = require('gulp-util');
var colors = require('colors');
var plugins = require('gulp-load-plugins')();

var paths = {
	scripts: [
		'public/js/**/*.js',
		'app/**/*.js'
	],
	data: [
		'models/data/**/*.js'
	],
	build: 'build'
};

gulp.task('clean', function(cb) {
	return gulp.src(paths.build)
		.pipe(plugins.rimraf());
});

gulp.task('scripts', ['clean', 'lint'], function() {
	return gulp.src(paths.scripts)
		// .pipe(plugins.uglify())
		.pipe(plugins.concatSourcemap('all.min.js'))
		.pipe(gulp.dest(paths.build));
});

gulp.task('lint', function () {
	gulp.src(paths.scripts)
		.pipe(plugins.jshint());
})

gulp.task('db', function() {
	gulp.src(paths.data, {read: false})
		.pipe(plugins.shell('node <%=file.path%>'));
});

gulp.task('default', ['scripts'], function () {
	plugins.nodemon({script: 'server.js', ext: 'html js ejs'})
		.on('change', ['scripts'])
		.on('restart', function () {
			gutil.log('Restarted!'.red)
		});
});
