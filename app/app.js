var app = angular.module('app', ['ngResource', 'ngRoute']);

app.run(function($rootScope) {
	$rootScope.user = {};
	$rootScope.config = {
		thumbAble: /\.(png|jpe?g|gif)$/i,
		thumbWidth: 150,
		thumbHeight: 150
	};
});
