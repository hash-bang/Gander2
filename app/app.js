var app = angular.module('app', ['ngResource', 'ngRoute', 'ng-context-menu']);

app.run(function($rootScope) {
	$rootScope.user = {};
	$rootScope.config = {
		thumbAble: /\.(png|jpe?g|gif)$/i,
		thumbWidth: 150,
		thumbHeight: 150,
		sortDirFirst: true,
		sortStarFirst: true,

		cacheBackwards: 3,
		cacheForewards: 3,

		viewerSrcPrefix: '/api/file'
	};
});
