app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: "/partials/browse.html",
			reloadOnSearch: false
		})
		.when('/!', {
			templateUrl: "/partials/browse.html",
			reloadOnSearch: false
		})
		.when('/settings', {
			templateUrl: "/partials/settings.html"
		})
});