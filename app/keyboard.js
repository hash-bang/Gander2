app.run(function($rootScope) {
	// Directory navigation {{{
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
	// }}}

	// Image zooming {{{
	key('q, minus', function() {
		$('#iviewer').iviewer('zoom_by', 1);
	});
	key('w, plus', function() {
		$('#iviewer').iviewer('zoom_by', -1);
	});
	key('e', function() {
		$('#iviewer').iviewer('fit');
	});
	key('r', function() {
		$('#iviewer').iviewer('set_zoom', 100);
	});
	// }}}
});
