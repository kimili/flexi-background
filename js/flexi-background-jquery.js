/*
File: flexi-background.js

Author:
	Michael Bester <http://kimili.com>

About: Version
	2.0

Description:
	Javascript to set up full-screen flexible backgrounds in all widely used browsers.

Requirements:
	jQuery 1.3.2 or higher <http://jquery.com>
 
License:
	Copyright 2010, Michael Bester.
	Released under the MIT license <http://opensource.org/licenses/mit-license.php>
*/

(function($){
	
	/**
		CONFIGURATION:
		Define the size of our background image
	*/
	var bgImageSize = {
		width	: 640,
		height	: 426
	};
	
	/*	END CONFIGURATION */
	
	/**
		Detect support for CSS background-size. No need for any more javascript if background-size is supported.
		Property detection adapted from the most excellent Modernizr <http://modernizr.com>
	*/
	if ((function(){
		var el 		= document.createElement('div'),
			bs 		= 'backgroundSize',
			ubs		= bs.charAt(0).toUpperCase() + bs.substr(1),
			props	= [bs, 'Webkit' + ubs, 'Moz' + ubs, 'O' + ubs];
			
		for ( var i in props ) {
			if ( el.style[props[i]] !== undefined ) {
				return true;
			}
		}
		return false;
	}())) {
		return;
	};
	
	/**
		We also want to leave IE6 and below out in the cold with this
	*/
	if ( $.browser.msie && parseInt($.browser.version, 10) <= 6 ) {
		return;
	}
	
	/**
		If we've gotten here, we don't have background-size support,
		so we'll have to mimic it with Javascript.
		Let's set up some variables
	*/
	var $window		= $(window),
		imageID		= 'expando',
		tallClass	= 'tall',
		wideClass	= 'wide',
		$body, $bgImage, $wrapper, img, url, imgAR,

		/*
			Now we can move on with the core functionality of Flexibackground
		*/
		initialize = function() {
		
			// No need for any of this if the screen isn't bigger than the background image
			if (screen.availWidth <= bgImageSize.width && screen.availHeight <= bgImageSize.height) {
				return;
			}
		
			// Grab elements we'll reference throughout
			$body = $('body');
		
			// Parse out the URL of the background image and drop out if we don't have one
			url = $body.css('backgroundImage').replace(/^url\(("|')?|("|')?\);?$/g, '') || false;
			if (!url || url === "none" || url === "") {
				return;
			}
		
			// Get the aspect ratio of the image
			imgAR = bgImageSize.width / bgImageSize.height;

			// Create a new image element
			$bgImage = $(document.createElement('img'))
						.attr('src', url)
						.attr('id', imageID);
		
			// Create a wrapper and append the image to it.
			// The wrapper ensures we don't get scrollbars.
			$wrapper = $(document.createElement('div'))
						.css({
							'overflow'	: 'hidden',
							'position'	: 'fixed',
							'width'		: '100%',
							'height'	: '100%',
							'top'		: '0',
							'left'		: '0',
							'z-index'	: '-1'
						});
		
			$body.append(
				$wrapper.append($bgImage)
			);
		
			// Set up a resize listener to add/remove classes from the body 
			$(window)
				.resize(resizeAction)
				// roll it out by triggering a resize
				.trigger('resize');
		
		},
	
		/**
			Set up the action that happens on resize
		*/
		resizeAction = function() {
			var win = {
				height	: $window.height(),
				width	: $window.width()
			},

			// The current aspect ratio of the window
			winAR = win.width / win.height;

			// Determine if we need to show the image and whether it needs to stretch tall or wide
			if (win.width < bgImageSize.width && win.height < bgImageSize.height) {
				$body.removeClass(wideClass + ' ' + tallClass);
			} else if (winAR < imgAR) {
				$body
					.removeClass(wideClass)
					.addClass(tallClass);
				// Center the image
				$bgImage.css('left', Math.min(((win.width - bgImageSize.width) / 2), 0));
			} else if (winAR > imgAR) {
				$body
					.addClass(wideClass)
					.removeClass(tallClass);
				$bgImage.css('left', 0);
			}
		};
	
	// When the document is ready, run this thing.
	$(document).ready(initialize);
	
})(jQuery);