var app = angular.module('app', [
	'cfp.hotkeys',
	'ngResource',
	'ui.router',
	'ng-context-menu',
]);

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

app.config(function($compileProvider) {
	if (!location.host.match(/^local/)) {
		// Disabled in production for performance boost
		$compileProvider.debugInfoEnabled(false);
	}
});

app.config(function($httpProvider) {
	// Enable async HTTP for performance boost
	$httpProvider.useApplyAsync(true);
});

// Router related bugfixes {{{
app.run(function($rootScope) {
	// BUGFIX: (multiple) Clean up Bootstrap detritus during transition {{{
	$rootScope.$on('$stateChangeStart', function() {
		// Destory any open Bootstrap modals
		$('body > .modal-backdrop').remove();

		// Destroy any open Bootstrap tooltips
		$('body > .tooltip').remove();

		// Destroy any open Bootstrap popovers
		$('body > .popover').remove();
	});
	// }}}
	// BUGFIX: Focus any input element with the 'autofocus' attribute on state change {{{
	$rootScope.$on('$stateChangeSuccess', function() {
		$('div[ui-view=main]').find('input[autofocus]').focus();
	});
	// }}}
});
// }}}
// jQuery related bugfixes {{{
// Focus items within a modal if they have the [autofocus] attrib {{{
$(document).on('shown.bs.modal', function() {
	var childFocus = $(this).find('.modal.in [autofocus]');
	if (childFocus.length) childFocus.first().focus();
});
// }}}
// }}}