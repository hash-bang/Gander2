app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: "/templates/browse.html",
			reloadOnSearch: false
		})
		.when('/!', {
			templateUrl: "/templates/browse.html",
			reloadOnSearch: false
		})
		.when('/settings', {
			templateUrl: "/templates/settings.html"
		})
});
