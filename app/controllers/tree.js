app.controller('treeController', function($scope) {
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
		console.log('PATH', $scope.path);
	};

	$scope.getDepthClass = function(branch) {
		return 'depth-' + (branch.path.split('/').length - 1);
	};
});
