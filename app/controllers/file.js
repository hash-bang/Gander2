app.controller('fileController', function($scope, $rootScope, $timeout, Files) {
	$scope.paths = [];
	$scope.files = [];
	$scope.active = null;
	$scope.activeIndex = 0; // Calculated on $scope.active change automatically

	// Utility functions {{{
	$scope.hasStar = function(item) {
		return item.emblems && _.contains(item.emblems, 'star');
	};
	// }}}

	// Path changing {{{
	$scope.$on('changePath', function(e, path, options) {
		if (!options)
			options = {};
		_.defaults(options, {
			pathMethod: 'set', // ENUM: set,add
			recursive: false
		});
		$scope.active = null;

		switch(options.pathMethod) {
			case 'array':
				$scope.paths = path;
				$scope.files = [];
				$scope.reload();
				break;
			case 'set':
				$scope.paths = [path];
				$scope.files = [];
				break;
			case 'add':
				$scope.paths.push(path);
				break;
		}
		if (options.recursive) {
			console.log('Open recursive');
			Files.tree({path: path}).$promise
				.then(function(paths) {
					// No idea why this promise resolver exists in its own scope
					// Use ngBroadcast to rebroadcast back to the correct fileController to update the paths array
					// - MC 2014-09-18
					ngBroadcast('changePath', paths, {pathMethod: 'array'});
				});
		}
	});
	$scope.reload = function() {
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
	};
	$scope.$watch('paths', function() {
		console.log('Path change detect', $scope.paths);
		$scope.reload();
	});
	$scope.$watch('files', function() {
		$(window).trigger('resize');
	});

	// Set $scope.activeIndex
	$scope.$watch('active', function() {
		if ($scope.active && $scope.active['$$hashKey']) {
			$scope.activeIndex = _.findIndex($scope.files, {'$$hashKey': $scope.active['$$hashKey']});
		} else {
			$scope.activeIndex = false;
		}
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
	$scope.$on('doInteract', function(e, options) {
		if ($scope.active)
			$scope.itemInteract($scope.active, options);
	});
	/**
	* Interact with a given item
	* If its an image it means open them, if its a folder it will be opened
	* @param object|null item Either the item to interact with or null for the active item
	* @param object options Options object
	*/
	$scope.itemInteract = function(item, options) {
		if (!item)
			item = $scope.active;

		if (item.type == 'dir') {
			$scope.setPath(item.path, options);
		} else {
			$scope.setActive(item);
			$rootScope.$broadcast('changeFocus', item, 'toggle');
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
			if (myOffset > -1)
				$scope.active = $scope.files[myOffset];
		} else if (item == 'last') {
			myOffset = _.findLastIndex($scope.files, {type: 'file'});
			if (myOffset > -1)
				$scope.active = $scope.files[myOffset];
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
		if ($scope.active) {
			var activeItem = $('#f' + $scope.active.$$hashKey);
			if (activeItem.length)
				$('#fileArea').scrollTo(activeItem);
		}
	});
	// }}}

	// Manipulation {{{
	$scope.$on('changeActiveEmblems', function(e, method, parameter) {
		if (!$scope.active)
			return;
		$scope.setEmblem($scope.active, method, parameter);
	});

	/**
	* Changes the emblem of a given item
	* @param object item The object to change
	* @param string operation The operation to perform. ENUM: 'toggle' (value is name of item), 'clear'
	* @param mixed value The value to set if operation requires one
	*/
	$scope.setEmblem = function(item, operation, value) {
		switch (operation) {
			case 'clear':
				delete item.emblems;
				break;
			case 'toggle':
				if (!item.emblems || !_.contains(item.emblems, value)) { // No emblems exist
					item.emblems = [value];
				} else if (!_.contains(item.emblems, value)) { // Some emblems exist - this is not present
					item.emblems.push(value);
				} else { // Some emblems exist - this is one
					item.emblems = _.without(item.emblems, value);
					if (!item.emblems.length)
						delete item.emblems;
				}
				break;
		}

		Files.save({path: item.path}, item);
	};
	// }}}
});
