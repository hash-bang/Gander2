app.controller('fileController', function($scope, $rootScope, Files) {
	$scope.paths = [];
	$scope.files = [];

	$rootScope.$on('changePath', function(e, path) {
		console.log('Path overwrite', path);
		$scope.paths = [path];
	});
	$scope.$watch('paths', function() {
		_.forEach($scope.paths, function(path) {
			Files.dir({path: path}).$promise
				.then(function(files) {
					_.forEach(files, function(file) {
						var filePath = (path == '/' ? '/' : path + '/') + file.name

						// Work out thumbnail {{{
						var thumbPath;
						if ($scope.config.thumbAble.exec(filePath)) { // Can thumb this
							thumbPath = '/api/thumb' + filePath;
						} else if (file.type == 'dir') {
							thumbPath = '/img/icons/dir.png';
						} else {
							thumbPath = '/img/icons/file.png';
						}
						// }}}

						$scope.files.push({
							path: filePath,
							thumbPath: thumbPath,
							name: file.name,
							type: file.type,
							size: file.size,
							mtime: file.mtime,
							ctime: file.ctime
						});
					});
				});
		});
	});
});
