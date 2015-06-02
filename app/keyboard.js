app.run(function(hotkeys, $rootScope) {
	// Directory navigation {{{
	hotkeys.add({
		combo: ['ctrl+left', 'shift+left', 'alt+x'],
		callback: function() {
			$rootScope.$broadcast('treeMove', 'out');
		}
	});
	hotkeys.add({
		combo: ['ctrl+right', 'shift+right', 'alt+z'],
		callback: function() {
			$rootScope.$broadcast('treeMove', 'in');
		}
	});
	hotkeys.add({
		combo: ['ctrl+up', 'shift+up', 'alt+a'],
		callback: function() {
			$rootScope.$broadcast('treeMove', 'up');
		}
	});
	hotkeys.add({
		combo: ['ctrl+down', 'shift+down', 'alt+s'],
		callback: function() {
			$rootScope.$broadcast('treeMove', 'down');
		}
	});
	// }}}

	// Image zooming {{{
	hotkeys.add({
		combo: 'q, minus',
		callback: function() {
			$('#iviewer .iviewer_zoom_in').trigger('mousedown');
		}
	});
	hotkeys.add({
		combo: 'w, plus',
		callback: function() {
			$('#iviewer .iviewer_zoom_out').trigger('mousedown');
		}
	});
	hotkeys.add({
		combo: 'e',
		callback: function() {
			$('#iviewer').iviewer('fit');
		}
	});
	hotkeys.add({
		combo: 'r',
		callback: function() {
			$('#iviewer').iviewer('set_zoom', 100);
		}
	});
	// }}}

	// Mode toggles {{{
	hotkeys.add({
		combo: 'backspace',
		callback: function() {
			$rootScope.$broadcast('changeWheelMode');
		}
	});
	// }}}

	// Image sorting {{{
	hotkeys.add({
		combo: 't',
		callback: function() {
			$rootScope.$broadcast('changeSort', 'random');
		}
	});
	hotkeys.add({
		combo: 'shift+t',
		callback: function() {
			$rootScope.$broadcast('changeSort', 'name');
		}
	});
	hotkeys.add({
		combo: 'ctrl+t',
		callback: function() {
			$rootScope.$broadcast('changeSort', 'date');
		}
	});
	hotkeys.add({
		combo: 'alt+t',
		callback: function() {
			$rootScope.$broadcast('changeSort', 'size');
		}
	});
	// }}}

	// Image filtering {{{
	hotkeys.add({
		combo: '/',
		callback: function() {
			$rootScope.$broadcast('changeActiveEmblems', 'toggle', 'star');
		}
	});
	hotkeys.add({
		combo: 'shift+/, ctrl+/',
		callback: function() {
			$rootScope.$broadcast('changeFilter', 'stars', 'toggle');
		}
	});
	// }}}

	// Image selection {{{
	hotkeys.add({
		combo: 'a, left, pageup',
		callback: function() {
			$rootScope.$broadcast('changeActive', 'previous');
		}
	});
	hotkeys.add({
		combo: 'shift+a, ctrl+a',
		callback: function() {
			$rootScope.$broadcast('changeActive', 'previous', 10);
		}
	});
	hotkeys.add({
		combo: 's, right, pagedown',
		callback: function() {
			$rootScope.$broadcast('changeActive', 'next');
		}
	});
	hotkeys.add({
		combo: 'shift+s, ctrl+s',
		callback: function() {
			$rootScope.$broadcast('changeActive', 'next', 10);
		}
	});
	hotkeys.add({
		combo: 'z, home',
		callback: function() {
			$rootScope.$broadcast('changeActive', 'first');
		}
	});
	hotkeys.add({
		combo: 'x, end',
		callback: function() {
			$rootScope.$broadcast('changeActive', 'last');
		}
	});

	hotkeys.add({
		combo: 'f, space, escape',
		callback: function() {
			$rootScope.$broadcast('doInteract');
		}
	});

	hotkeys.add({
		combo: 'shift+f, shift+space',
		callback: function() {
			$rootScope.$broadcast('doInteract', {recursive: true});
		}
	});
	// }}}
});
