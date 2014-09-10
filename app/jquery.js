$(function() {
	// Force all .row-vbox'es to set to window height
	$(window)
		.on('resize', function() {
			$('.row-vbox').css('height', $(window).height() - 30);
		})
		.trigger('resize');
	setTimeout(function() {
		$(window).trigger('resize');
	}, 100);
});
