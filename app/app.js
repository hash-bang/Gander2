var app = angular.module('app', ['ngResource', 'ngRoute']);

app.run(function($rootScope) {
	$rootScope.user = {};
});
