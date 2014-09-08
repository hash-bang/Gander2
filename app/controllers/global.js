// App global controller (also $rootScope)
app.controller('globalController', function($scope, $rootScope) {
	// .user {{{
	$scope.user = {};
	// }}}

	$scope.setSort = function(method) {
		$rootScope.$broadcast('changeSort', method);
	};
});
