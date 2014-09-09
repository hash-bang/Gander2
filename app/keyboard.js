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

	// Image sorting {{{
	key('t', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeSort', 'random');
		});
	});
	key('shift+t', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeSort', 'name');
		});
	});
	key('ctrl+t', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeSort', 'date');
		});
	});
	key('alt+t', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeSort', 'size');
		});
	});
	// }}}

	// Image filtering {{{
	key('/', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeActiveEmblems', 'toggle', 'star');
		});
	});
	key('shift+/, ctrl+/', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeFilter', 'stars', 'toggle');
		});
	});
	// }}}

	// Image selection {{{
	key('a, left, pageup', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeActive', 'previous');
		});
	});
	key('shift+a, ctrl+a', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeActive', 'previous', 10);
		});
	});
	key('s, right, pagedown', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeActive', 'next');
		});
	});
	key('shift+s, ctrl+s', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeActive', 'next', 10);
		});
	});
	key('z, home', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeActive', 'first');
		});
	});
	key('x, end', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeActive', 'last');
		});
	});

	key('f, space, escape', function() {
		$rootScope.$apply(function() {
			$rootScope.$broadcast('changeFocus', null, 'toggle');
		});
	});
	// }}}
});
