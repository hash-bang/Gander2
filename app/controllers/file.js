app.controller('fileController', function($scope, $rootScope, Files) {
	$scope.paths = [];
	$scope.files = [];
	$scope.active = null;

	// Utility functions {{{
	$scope.hasStar = function(item) {
		return item.emblems && _.contains(item.emblems, 'star');
	};
	// }}}

	// Path changing {{{
	$rootScope.$on('changePath', function(e, path) {
		console.log('Path overwrite', path);
		$scope.active = null;
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

						var fileInfo = {
							path: filePath,
							thumbPath: thumbPath,
							name: file.name,
							type: file.type,
							size: file.size,
							mtime: file.mtime,
							ctime: file.ctime
						};

						if (file.emblems)
							fileInfo.emblems = file.emblems;

						$scope.files.push(fileInfo);
					});
					$scope.setSort();
					$scope.setFilters();
					if ($scope.active === null)
						$scope.setActive('first');
				});
		});
	});
	// }}}

	// Sorting {{{
	$scope.sortMethod = 'name';
	$scope.$on('changeSort', function(e, method) {
		$scope.setSort(method);
	});
	$scope.setSort = function(method) {
		var aval, bval, afol, bfol;
		if (!method)
			method = $scope.sortMethod;
		switch (method) {
			case 'date': // Simple sorts
			case 'size':
			case 'name':
				$scope.files.sort(function(a, b) {
					if (method == 'name') {
						aval = a.path.toLowerCase(); // Case insensitive
						bval = b.path.toLowerCase();
					} else { // Sort by raw data
						aval = a[method];
						bval = b[method];
					}

					if ($scope.config.sortDirFirst) {
						afol = (a.type == 'dir');
						bfol = (b.type == 'dir');
						if (afol && !bfol) {
							return -1;
						} else if (!afol && bfol) {
							return 1;
						}
					}
					if ($scope.config.sortStarFirst) {
						astar = (a.emblems && _.contains(a.emblems, 'star'));
						bstar = (b.emblems && _.contains(b.emblems, 'star'));
						if (astar && !bstar) {
							return -1;
						} else if (!astar && bstar) {
							return 1;
						}
					}
					return (aval < bval) ? -1 : (aval > bval) ? 1 : 0;
				});
				break;
			case 'random':
				$scope.files.sort(function(a, b) {
					if ($scope.config.sortDirFirst) {
						afol = (a.type == 'dir');
						bfol = (b.type == 'dir');
						if (afol && !bfol) {
							return -1;
						} else if (!afol && bfol) {
							return 1;
						}
					}
					return (Math.random() > 0.5) ? -1 : 1;
				});
				break;
			default:
				console.error('Unsupported sort method', method);
		}
	};
	// }}}

	// Filtering {{{
	$scope.filters = {
		// Filter by any of the following if they are true
		dirs: null,
		files: null,
		stars: null
	};
	$scope.$on('changeFilter', function(e, property, value) {
		$scope.setFilters(property, value);
	});
	$scope.getVisibility = function(item) {
		if ($scope.filters.dirs === true && item.type != 'dir')
			return false;

		if ($scope.filters.files === true && item.type != 'file')
			return false;

		if ($scope.filters.stars === true && ( !item.emblems || !_.contains(item.emblems, 'star') ) )
			return false;
		return true;
	};
	$scope.setFilters = function(property, value) {
		// Deal with filter toggling {{{
		if (value == 'toggle') {
			$scope.filters[property] = !$scope.filters[property];
		} else {
			$scope.filters[property] = value;
		}
		// Mutually exclusive options {{{
		if (property == 'dirs') {
			$scope.filters['files'] = ! $scope.filters['dirs'];
		} else if (property == 'files') {
			$scope.filters['dirs'] = ! $scope.filters['files'];
		} else if (property == 'stars') {
			$scope.filters['files'] = false;
			$scope.filters['dirs'] = false;
		}
		// }}}
		// }}}

		$scope.files.forEach(function(file) {
			file.visible = $scope.getVisibility(file);
		});
	};
	// }}}

	// Iteraction {{{
	$scope.itemClick = function(item) {
		if (item.type == 'dir') {
			$scope.setPath(item.path);
		} else {
			$scope.setActive(item);
			$rootScope.$broadcast('changeFocus', item, true);
		}
	};
	// }}}

	// Selection {{{
	$scope.$on('changeActive', function(e, method, offset) {
		$scope.setActive(method, offset);
	});
	$scope.setActive = function(item, offset) {
		var myOffset;

		if (_.isObject(item)) {
			$scope.active = item;
		} else if (item == 'index') { // $scope.setActive('index', 2); // Select the second item
			if (offset < 0) {
				$scope.setActive('first');
			} else if (offset > $scope.files.length) {
				$scope.setActive('last');
			} else 
				$scope.active = $scope.files[offset];
		} else if (item == 'first') { // Select first file in dir
			myOffset = _.findIndex($scope.files, {type: 'file'});
			$scope.setActive('index', myOffset);
		} else if (item == 'last') {
			if ($scope.files.length > 0)
				$scope.active = $scope.files[$scope.files.length - 1];
		} else if (item == 'next') {
			if ($scope.active) {
				myOffset = _.findIndex($scope.files, {'$$hashKey': $scope.active['$$hashKey']})
				$scope.setActive('index', myOffset + (offset || 1));
			} else {
				$scope.setActive('last');
			}
		} else if (item == 'previous') {
			if ($scope.active) {
				myOffset = _.findIndex($scope.files, {'$$hashKey': $scope.active['$$hashKey']})
				$scope.setActive('index', myOffset - (offset || 1));
			} else {
				$scope.setActive('first');
			}
		}
	};
	$scope.$watch('active', function() {
		$rootScope.$broadcast('changeFocus', $scope.active, 'set');
	});
	// }}}
});
