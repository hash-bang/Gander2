app.controller('treeController', function($scope, $rootScope) {
	$scope.tree = [
		{
			path:'/',
			name: '/',
			children: [
				{
					path: '/foo',
					name: 'foo',
					children: [
						{path: '/foo/foo-foo', name: 'foo-foo'},
						{path: '/foo/foo-bar', name: 'foo-bar'},
						{path: '/foo/foo-baz', name: 'foo-baz'}
					]
				},
				{path: '/bar', name: 'bar'},
				{path: '/baz', name: 'baz'}
			]
		}
	];

	$scope.path = '/foo/foo-foo';

	$scope.selectBranch = function(branch) {
		if (branch.children && branch.children.length > 0)
			branch.expanded = !branch.expanded;
		$scope.path = branch.path;
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
				console.log('PARENT IS', node);
				for (peerOffset in node.children) {
					if (node.children[peerOffset].path == $scope.path) {
						console.log('FOUND SELF AT', peerOffset, node.children.length, 'IN', node.children);
						peerOffset = parseInt(peerOffset) + 1;
						if (peerOffset < node.children.length) {
							console.log('DOWN BECOMES', peerOffset, node.children[peerOffset]);
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
