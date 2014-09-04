app.run(function($rootScope) {
	key('ctrl+left, shift+left, alt+x', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('treeMove', 'out');
		})
	});
	key('ctrl+right, shift+right, alt+z', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('treeMove', 'in');
		});
	});
	key('ctrl+up, shift+up, alt+a', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('treeMove', 'up')
		});
	});
	key('ctrl+down, shift+down, alt+s', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('treeMove', 'down');
		});
	});
});
