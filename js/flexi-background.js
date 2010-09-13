/*
File: flexi-background.js

Author:
	Michael Bester <http://kimili.com>

About: Version
	2.0

Description:
	Javascript to set up full-screen flexible backgrounds in all widely used browsers.

Requires:
	- jQuery 1.3.2+ <jquery.js> <http://jquery.com>

License:
	Copyright 2010, Michael Bester.
	Released under the MIT license <http://opensource.org/licenses/mit-license.php>
*/

(function(){
	
	/**
		CONFIGURATION:
		Define the size of our background image
	*/
	var bgImageSize = {
		width	: 800,
		height	: 600
	};
	
	/*
		Are we using a touch device?
	*/
	if (typeof Touch === "object") {
		try {
			var html = document.getElementsByTagName('html')[0];
			html.className = html.className + " touch";
		} catch(e) {}
	};
	
	/**
		Detect support for CSS background-size. No need for anything else if background-size is supported.
		Property detection adapted from Modernizr <http://modernizr.com>
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
		Declare and define variables
	*/ 
	var $window,
		$body,
		imageID		= 'expando',
		tallClass	= 'tall',
		wideClass	= 'wide',
		$bgImage, $wrapper, img, url, imgAR,
		
		/**
			Are we dealing with ie6?
		*/
		ie6 = ($.browser.msie && parseInt($.browser.version, 10) <= 6),
	
	/**
		Set up the action that happens on resize
	*/
	resizeAction = function() {
		var win = {
			height : $window.height(),
			width : $window.width()
		};

		// The current aspect ratio of the window
		var winAR = win.width / win.height;

		// Determine if we need to show the image and whether it needs to stretch tall or wide
		if (win.width < bgImageSize.width && win.height < bgImageSize.height) {
			$body
				.removeClass(wideClass)
				.removeClass(tallClass);
		} else if ((win.w < bgImageSize.width && win.height >= bgImageSize.height) || (winAR < imgAR)) {
			$body
				.removeClass(wideClass)
				.addClass(tallClass);
			// Center the image
			$bgImage.css('left', Math.min(((win.width - bgImageSize.width) / 2), 0));
		} else if (win.width >= bgImageSize.width) {
			$body
				.addClass(wideClass)
				.removeClass(tallClass);
			$bgImage.css('left', 0);
		}
		
		// Need to fix the height of the wrapper for IE6
		if (ie6) {
			$wrapper.css('height', win.height);
		}
	},
	
	/*
		Sets up the basic functionality
	*/
	initialize = function() {
		
		// No need for any of this if the screen isn't bigger than the background image
		if (screen.availWidth <= bgImageSize.width && screen.availHeight <= bgImageSize.height) {
			return;
		}
		
		// Grab elements we'll reference throughout
		$window		= $(window);
		$body		= $('body');
		
		// Parse out the URL of the background image and drop out if we don't have one
		url = $body.css('background-image').replace(/^url\(("|')?|("|')?\);?$/g, '') || false;	
		if (!url || url === "none" || url === "") {
			return;
		}
		
		// Get the aspect ratio of the image
		imgAR = bgImageSize.width / bgImageSize.height;

		// Create a new image element
		$bgImage = $('<img />')
					.attr('src', url)
					.attr('id', imageID);
					
		// Create a wrapper and append the image to it.
		// The wrapper ensures we don't get scrollbars.
		$wrapper = $('<div></div>')
						.css({
							'overflow' : 'hidden',
							'width' : '100%',
							'height' : '100%',
							'z-index' : '-1'
						})
						.append($bgImage)
						.appendTo($body);
						
		// IE6 Doesn't do position: fixed, so let's fake it out.
		// We'll apply a class which gets used in the CSS to emulate position: fixed
		// Otherwise, we'll simply used position: fixed.
		if (ie6) {
			$wrapper.addClass('ie6fixed');
		} else {
			$wrapper.css({
				'position' : 'fixed',
				'top' : 0,
				'left' : 0
			});
		}
		
		// Set up a resize listener to add/remove classes from the body 
		$window.bind('resize', resizeAction);

		// Set it up by triggering a resize
		$window.trigger('resize');
		
	};
	
	// When the document is ready, run this thing.	
	$(document).ready(initialize);
	
})();