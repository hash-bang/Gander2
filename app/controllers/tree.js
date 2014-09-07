app.controller('treeController', function($scope, $rootScope, $location, $q, $routeParams, Files, $timeout) {
	$scope.path = $routeParams.p || '/';
	$scope.tree = [
		{
			path:'/',
			name: '/',
			status: 'unloaded',
			children: []
		}
	];

	/**
	* Load a branch into an object
	*/
	$scope.loadBranch = function(branch) {
		var defered = $q.defer();
		if (branch.status == 'unloaded') {
			branch.status = 'loading';
			Files.dir({path: branch.path}).$promise
				.then(function(files) {
					var children = [];
					_.forEach(files, function(file) {
						if (file.type == 'dir') {
							file.path = (branch.path == '/' ? '/' : branch.path + '/') + file.name;
							file.status = 'unloaded';
							children.push(file);
						}
					});
					branch.children = children;
					branch.status = 'loaded';
					if (
						(branch.path = '/') || // Always expand root
						(branch.path.substr(0, $scope.path.length) == branch.path) // The loaded dir is in the path (i.e. we should expand it)
					) {
						branch.expanded = true;
						var nextBranches = $scope.path.substr(branch.path.length).split('/');
						if (nextBranches.length > 0) { // Load more branches based on the path
							var nextBranchObject = _.find(branch.children, {name: nextBranches[0]});
							if (nextBranchObject)
								$scope.loadBranch(nextBranchObject);
						}
					}
					defered.resolve();
				});
		} else {
			defered.resolve();
		}
		return defered.promise;
	};

	$scope.refresh = function() {
		$scope.loadBranch($scope.tree[0]);
	};
	$scope.$on('refresh', $scope.refresh);
	$scope.refresh();

	$timeout(function() {
		$rootScope.$broadcast('changePath', $scope.path);
	});

	$scope.selectBranch = function(branch) {
		if (branch.children && branch.children.length > 0)
			branch.expanded = !branch.expanded;
		$scope.loadBranch(branch).then(function() {
			branch.expanded = true;
		});
		$scope.path = branch.path;
		$rootScope.$broadcast('changePath', $scope.path);
		$location.search('p', $scope.path);
	};

	$scope.getDepthClass = function(branch) {
		return 'depth-' + (branch.path.split('/').length - 1);
	};

	$scope.getByPath = function(path) {
		var bits = path.split('/');
		bits.shift();
		var tree = $scope.tree[0];
		if (path == '/')
			return tree;
		// console.log('Seek path', path, bits);
		for (offset in bits) {
			var dstPath = '/' + bits.splice(0, offset+1).join('/');
			var found = false;
			// console.log('Find path', dstPath, 'in', tree);
			if (tree.children) {
				for (childOffset in tree.children) {
					// console.log('Child', tree.children[childOffset]);
					if (tree.children[childOffset].path == dstPath) {
						tree = tree.children[childOffset];
						found = true;
					}
				}
			}
			if (!found) {
				console.error('PATH NOT FOUND', path);
				return;
			}
		}
		return tree;
	};

	$scope.getPathParent = function(path) {
		return $scope.getByPath(path.split('/').slice(0, -1).join('/'));
	};


	$scope.$on('treeMove', function(e, direction) {
		var node;
		var peerOffset;

		console.log('Move tree', direction);
		switch(direction) {
			case 'out':
				node = $scope.getPathParent($scope.path);
				if (node)
					$scope.path = node.path;
				break;
			case 'up':
				node = $scope.getPathParent($scope.path);
				for (peerOffset in node.children) {
					if (node.children[peerOffset].path == $scope.path) {
						if (peerOffset > 0)
							$scope.path = node.children[peerOffset - 1].path;
						return;
					}
				}
				break;
			case 'down':
				node = $scope.getPathParent($scope.path);
				for (peerOffset in node.children) {
					if (node.children[peerOffset].path == $scope.path) {
						peerOffset = parseInt(peerOffset) + 1;
						if (peerOffset < node.children.length) {
							$scope.path = node.children[peerOffset].path;
						}
						return;
					}
				}
				break;
			default:
				console.error('Unknown direction', direction);
		}
	});
});
