app.factory('Files', function($resource) {
	return $resource('/api/dir', {}, {
		dir: {url: '/api/dir', method: 'post', isArray: true},
	});
});
