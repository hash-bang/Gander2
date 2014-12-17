app.run(function($rootScope) {
	// Directory navigation {{{
	key('ctrl+left, shift+left, alt+x', function() {
		ngBroadcast('treeMove', 'out');
	});
	key('ctrl+right, shift+right, alt+z', function() {
		ngBroadcast('treeMove', 'in');
	});
	key('ctrl+up, shift+up, alt+a', function() {
		ngBroadcast('treeMove', 'up');
	});
	key('ctrl+down, shift+down, alt+s', function() {
		ngBroadcast('treeMove', 'down');
	});
	// }}}

	// Image zooming {{{
	key('q, minus', function() {
		$('#iviewer .iviewer_zoom_in').trigger('mousedown');
	});
	key('w, plus', function() {
		$('#iviewer .iviewer_zoom_out').trigger('mousedown');
	});
	key('e', function() {
		$('#iviewer').iviewer('fit');
	});
	key('r', function() {
		$('#iviewer').iviewer('set_zoom', 100);
	});
	// }}}

	// Mode toggles {{{
	key('backspace', function() {
		ngBroadcast('changeWheelMode');
	});
	// }}}

	// Image sorting {{{
	key('t', function() {
		ngBroadcast('changeSort', 'random');
	});
	key('shift+t', function() {
		ngBroadcast('changeSort', 'name');
	});
	key('ctrl+t', function() {
		ngBroadcast('changeSort', 'date');
	});
	key('alt+t', function() {
		ngBroadcast('changeSort', 'size');
	});
	// }}}

	// Image filtering {{{
	key('/', function() {
		ngBroadcast('changeActiveEmblems', 'toggle', 'star');
	});
	key('shift+/, ctrl+/', function() {
		ngBroadcast('changeFilter', 'stars', 'toggle');
	});
	// }}}

	// Image selection {{{
	key('a, left, pageup', function() {
		ngBroadcast('changeActive', 'previous');
	});
	key('shift+a, ctrl+a', function() {
		ngBroadcast('changeActive', 'previous', 10);
	});
	key('s, right, pagedown', function() {
		ngBroadcast('changeActive', 'next');
	});
	key('shift+s, ctrl+s', function() {
		ngBroadcast('changeActive', 'next', 10);
	});
	key('z, home', function() {
		ngBroadcast('changeActive', 'first');
	});
	key('x, end', function() {
		ngBroadcast('changeActive', 'last');
	});

	key('f, space, escape', function() {
		ngBroadcast('doInteract');
	});

	key('shift+f, shift+space', function() {
		ngBroadcast('doInteract', {recursive: true});
	});
	// }}}
});
