// App global controller (also $rootScope)
app.controller('globalController', function($scope, $rootScope, $location) {
	// .user {{{
	$scope.user = {};
	// }}}

	/**
	* Set the currently viewed path
	* @param string path The path to set
	* @param object options The options to use when setting
	*/
	$scope.setPath = function(path, options) {
		$scope.$broadcast('changePath', path, options);
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
