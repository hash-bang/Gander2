app.controller('treeController', function($scope, $rootScope, $q, $stateParams, Files, $timeout) {
	$scope.path = $stateParams.p || '/';
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
						(branch.path == '/') || // Always expand root
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
		$scope.setPath(branch.path);
	};

	$scope.getDepthClass = function(branch) {
		return 'depth-' + (branch.path.split('/').length - 1);
	};

	$scope.getByPath = function(path) {
		var bits = path.split('/');
		bits.shift();
		var tree = $scope.tree[0];
		console.log('Seek path', path, bits);
		if (!path || path == '/') return tree;
		for (offset in bits) {
			var dstPath = '/' + bits.splice(0, offset+1).join('/');
			var found = false;
			console.log('Find path', dstPath, 'in', tree);
			if (tree.children) {
				for (var childOffset in tree.children) {
					console.log('Child', tree.children[childOffset].path, '~=', dstPath);
					if (tree.children[childOffset].path == dstPath) {
						console.log('GO INTO', tree.children[childOffset].path);
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
		console.log('Move tree', direction);
		switch(direction) {
			case 'down':
				var parentTree = $scope.getPathParent($scope.path);
				var myOffset = _.findIndex(parentTree.children, {path: $scope.path});
				if (myOffset + 1 < parentTree.children.length) {
					console.log('PATH DOWN', parentTree.children[myOffset+1].path);
					$scope.path = parentTree.children[myOffset+1].path;
				}
				break;
			case 'up':
				var parentTree = $scope.getPathParent($scope.path);
				var myOffset = _.findIndex(parentTree.children, {path: $scope.path});
				if (myOffset - 1 >= 0) $scope.path = parentTree.children[myOffset-1].path;
				break;
			case 'in':
				var parentTree = $scope.getPath($scope.path);
				if (parentTree.children && parentTree.children.length) $scope.path = parentTree.children[0].path;
				break;
			case 'out':
				var parentTree = $scope.getPath($scope.path);
				$scope.path = parentTree.path;
				break;
			default:
				console.error('Unknown direction', direction);
		}
	});
});
