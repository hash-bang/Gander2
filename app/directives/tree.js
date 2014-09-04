app.directive('tree', function($filter) {
	// Form: <div tree="treeData"></div>
	return {
		scope: {
			tree: '='
		},
		restrict: 'A',
		link: function(scope) {
			scope.branchExpand = function(branch) {
				console.log('EXPAND', branch);
			};
		},
		template:
			'<ul class="nav nav-pills nav-stacked">' +
				'<li ng-repeat="branch in tree">' +
					'<a ng-click="branchExpand(branch)">' +
						'<i class="fa" ng-class="branch.expanded ? \'fa-minus\' : \'fa-plus\'">' +
						'{{branch.name}}' + 
					'</a>' +
				'</li>' +
			'</ul>'
	};
});
