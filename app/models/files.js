app.factory('Files', function($resource) {
	return $resource('/api/dir', {}, {
		dir: {
			url: '/api/dir/:path',
			method: 'get',
			isArray: true,
			cache: true
		},
		save: {
			url: '/api/file/:path',
			method: 'put'
		}
	});
});
