app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider
		.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			views: {main: {templateUrl: '/partials/browse.html'}},
		})
		.state('browsing', {
			url: '/!',
			views: {main: {templateUrl: '/partials/browse.html'}},
			reloadOnSearch: false,
		})
});