app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: "/templates/browse.html",
			animateIn: 'zoomIn'
		})
		.when('/!/:path', {
			templateUrl: "/templates/browse.html",
			animateIn: 'fadeInRightBig'
		})
		.when('/settings', {
			templateUrl: "/templates/settings.html",
			animateIn: 'fadeInUpBig',
			animateIn: 'fadeOutDownBig'
		})
});
