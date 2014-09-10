// App global controller (also $rootScope)
app.controller('globalController', function($scope, $rootScope, $location) {
	// .user {{{
	$scope.user = {};
	// }}}

	$scope.setPath = function(path) {
		$rootScope.$broadcast('changePath', path);
		$location.search('p', path);
	};

	$scope.setSort = function(method) {
		$rootScope.$broadcast('changeSort', method);
	};

	$scope.setFilter = function(method, value) {
		$rootScope.$broadcast('changeFilter', method, value);
	};

	// .breadcrumbs {{{
	$scope.path = null;
	$scope.$on('changePath', function(e, path) {
		$scope.path = path;
	});
	// }}}
});
