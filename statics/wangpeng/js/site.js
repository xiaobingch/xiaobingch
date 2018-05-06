(function($) {
	var hasTouch = function() {
		return !!('ontouchstart' in window);
	};

	var jEvent = hasTouch() ? 'click' : 'click';

	var resizeByPercentage = function(value, percentage) {
		var newValue = parseInt(value * percentage, 10);
		return newValue;
	};

	var calculateAspectRatioFit = function(srcWidth, srcHeight, maxWidth, maxHeight) {

		var newWidth = maxWidth,
			newHeight = maxHeight,
			isLandscape = true,
			percentage = 0,
			oldWidth = srcWidth,
			oldHeight = srcHeight;

		if (srcWidth > srcHeight) {
			// landscape
			newWidth = parseInt(maxWidth, 10);
			percentage = newWidth / srcWidth;
			newHeight = resizeByPercentage(srcHeight, percentage);
		} else {
			// portrait
			newHeight = parseInt(maxHeight, 10);
			percentage = newHeight / srcHeight;
			newWidth = resizeByPercentage(srcWidth, percentage);
			isLandscape = false;
		}

		// now let check if height is more than our max height.
		if (newHeight > maxHeight) {
			srcHeight = newHeight;
			newHeight = parseInt(maxHeight, 10);
			percentage = newHeight / srcHeight;
			newWidth = resizeByPercentage(newWidth, percentage);
		}

		if (srcWidth < newWidth || srcHeight < newHeight) {
			newWidth = oldWidth;
			newHeight = oldHeight;
			isLandscape = true;
		}

		return { width: newWidth, height: newHeight, landscape: isLandscape };
	};

	var onScreenResize = function() {
		var windowWidth = $(window).innerWidth() - 270;
		var windowHeight = $(window).innerHeight() - 80;
		$('#gallery-start .gallery-photo img').each(function() {
			console.log($(this));
			var imageDimension = calculateAspectRatioFit($(this).data('width'), $(this).data('height'), windowWidth, windowHeight);
			$(this).css('width', imageDimension.width).css('height', imageDimension.height).css('max-width', 'none');

			if (imageDimension.landscape) {
				$(this).parent().css('height', imageDimension.height).css('margin-top', parseInt((windowHeight - imageDimension.height) / 4, 10));
			}
		});

		//resize overlays (prev, next and thumbnails)
		var imageWrapperWidth = $('#gallery-wrap').outerWidth();

		var overlayThumbWidth = (20 / 100) * imageWrapperWidth;
		var overlaySideWidth = (40 / 100) * imageWrapperWidth;

		var slideThumbsWidth = (overlayThumbWidth + (overlaySideWidth * 2) + (windowWidth - imageWrapperWidth)) - 11;

		var positionLoadingStatus = (slideThumbsWidth / 2) + 208;
		$('.loading-status').css('left', positionLoadingStatus);

		if ($('.responsive').is(':visible')) {
			$('.loading-status').css('display', 'none');
		}

		$('#slide-thumbs').css('width', slideThumbsWidth);
		$('#gallery-start').css('width', slideThumbsWidth);
		$('.slide-overlays').css('width', slideThumbsWidth);
	};

	var repositionControl = function() {
		var counter = 0;

		if ($('#slide-thumbs').is(':visible')) {
			$('#slide-controls').hide();
			return false;
		}

		if ($('.cycle-slide-active .caption').length) {
			$('.cycle-slide-active .caption').each(function() {
				var _self = $(this);
				if (_self.css('visibility') != 'hidden') {
					if (typeof _self.attr('data-control-top') === 'undefined') {
						var _captionOffset = _self.offset();
						var _controlTop = (_captionOffset.top + _self.outerHeight());

						_self.attr('data-control-top', _controlTop);

						$('#slide-controls').css({
							'top'            : _controlTop + 'px',
							'bottom'         : 'auto',
							'padding-bottom' : '45px'
						});
					} else {
						var _controlTop = _self.attr('data-control-top');
						$('#slide-controls').css({
							'top'            : _controlTop + 'px',
							'bottom'         : 'auto',
							'padding-bottom' : '45px'
						});
					}
				}
			});
		} else {
			$('#slide-controls').css({
				'top'            : 'auto',
				'bottom'         : '82px',
				'padding-bottom' : '0'
			});
		}
	};

	onScreenResize();

	$(function() {
		$(window).resize(function() {
			onScreenResize();
		});
		onScreenResize();

		$('.openclicked').hide();

		$('img.lazy').lazyload();

		if ($('#gallery-wrap').length) {
			$('body').addClass('loading');
		}

		$('.menu-item a').on(jEvent, function(e) {
			var _self = $(this);
			var _subMenu = _self.next('.sub-menu');
                          
			if (_subMenu.length) {
				e.preventDefault();
				if (_subMenu.is(':visible')) {
					_subMenu.slideUp(0);
                                

				} else {
					if (!_self.parent().is('.menu-item-has-children')) {
						$('.sub-menu:visible').slideUp(0);
                                           
					}
                          $('.sub-menu:visible').not($(this).parents()).slideUp(0);

					_subMenu.slideDown(0);

				}
				return false;
			}
		});

		$('.open').on(jEvent, function() {
			if ($("#main-mobile").is(':hidden')) {
				$("#main-mobile").slideDown().animate({
					queue: false,
					duration: 600,
					easing: ''
				});
				$('#linken').removeClass('open').addClass('openclicked');
			} else {
				$('#main-mobile').slideUp('fast');
				$('#linken').removeClass('openclicked').addClass('open');
			}
			return false;
		});

		$('#main-mobile').on(jEvent, function(e) {
			e.stopPropagation();
		});

		if ($('.open').is(':visible') && $('#main-mobile').is(':visible')) {
			$('body').on('click touchstart', function() {
				$('#main-mobile').fadeOut('fast');
				$('#linken').removeClass('openclicked').addClass('open');
			});
		}

		if ($('.show-thumbnails').length) {
			$('.show-thumbnails').on(jEvent, function(e) {
				e.preventDefault();
				$('#slide-controls').fadeOut('fast');
				$('.slide-overlays').hide();
				$('#gallery-start').fadeOut('fast', function() {
					$('#slide-thumbs').show().removeWhitespace().collagePlus({
						'fadeSpeed'           : 2000,
						'targetHeight'        : 280,
						'allowPartialLastRow' : true
					});
					$('#slide-thumbs').fadeIn('fast', function() {
						$(window).trigger('scroll');
					});
				});
			});

			$('#slide-thumbs img').on(jEvent, function() {
				repositionControl();
				$('#slide-thumbs').fadeOut('fast', function() {
					$('#gallery-start').fadeIn('fast');
					$('#slide-controls').fadeIn('fast');
					repositionControl();
					$('.slide-overlays').show();
				});
			});
		}

		if ($('#gallery-start .caption').length) {
			var elementTop = $('#top').height() + parseInt($('#top').css('top').replace('px', ''), 10) + 52;
			$('#gallery-start .caption').css('top', elementTop);
		}

		$('#gallery-start').on('cycle-next cycle-prev cycle-pager-activated cycle-after', function() {
			$('#cursor').hide();

			if ($('.cycle-slide-active img').data('src') != $('.cycle-slide-active img').attr('src')) {
				$('.cycle-slide-active img').attr('src', $('.cycle-slide-active img').data('src'));
				$('.cycle-slide-active img').data('loaded', true);
				$('.cycle-slide-active').addClass('loading');
			}
		});

		$('#gallery-start').on('cycle-after', function() {
			repositionControl();
		});

		if ($('#gallery-wrap').length) {
			$(document).on('keydown', null, 'left', function(e) {
				e.preventDefault();
				$('#slide-controls .prev').trigger('click');
			});

			$(document).on('keydown', null , 'right', function(e) {
				e.preventDefault();
				$('#slide-controls .next').trigger('click');
			});

			$(document).on('keydown', null, 'up down', function(e) {
				if ($('#slide-thumbs').is(':hidden')) {
					e.preventDefault();
					$('.show-thumbnails').trigger('click');
				}
			});
		}
	});

	var resizeTimer = null;
	$(window).resize(function() {
		if (resizeTimer) {
			clearTimeout(resizeTimer);
		}

		resizeTimer = setTimeout(function() {
			$('#slide-thumbs:visible').removeWhitespace().collagePlus({
				'fadeSpeed'           : 2000,
				'targetHeight'        : 280,
				'allowPartialLastRow' : true
			});

		}, 200);

		$(window).trigger('scroll');

		if ($('.responsive').is(':visible')) {
			$('.non-responsive').hide();
		} else {
			$('.non-responsive').show();
		}
	});

	if ($('#gallery-wrap').length) {
		$('#gallery-wrap').hide();
	}

	$(window).load(function() {
		$('body').removeClass('loading');
		$('.thumb-wrapper').css('background-color', '#fff');

		if ($('.responsive').is(':hidden')) {
			$('#slide-controls').show();
			if ($('#gallery-wrap').length) {
				$('#gallery-wrap').fadeIn('fast', function() {
					repositionControl();
				});
			}

			if ($('#slide-thumbs').is(':visible')) {
				$('#slide-thumbs').removeWhitespace().collagePlus({
					'fadeSpeed'           : 2000,
					'targetHeight'        : 280,
					'allowPartialLastRow' : true
				});

				$(window).trigger('scroll');
			}

			if ($('.slide-disabled').length) {
				$('#gallery-start').show();
				$('#gallery-start .gallery-photo').show();
			}
		}
	});

	return false;

})(window.jQuery);