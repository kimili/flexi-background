/*
File: flexi-background.js

Author:
	Michael Bester <http://kimili.com>

About: Version
	2.0

Description:
	Javascript to set up full-screen flexible backgrounds in all widely used browsers.

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
	if ( false /*@cc_on || @_jscript_version < 5.7 @*/ ) {
		return;
	}
	
	/**
		If we've gotten here, we don't have background-size support,
		so we'll have to mimic it with Javascript.
		Let's set up some variables
	*/
	var elBody,
		imageID		= 'expando',
		tallClass	= 'tall',
		wideClass	= 'wide',
		elBgImage, elWrapper, img, url, imgAR,
	
		/**
			Since we're not relying on a library, we'll need some utility functions
			First, basic cross browser event adders
		*/
		addEvent = function(el, evnt, func) {
			if (el.addEventListener) {
				el.addEventListener(evnt, func, false);
			} else if (el.attachEvent) {
				return el.attachEvent("on" + evnt, func);
			} else {
				el['on' + evnt] = func;
			}
		},
	
		domLoaded = function(callback) {
			/* Internet Explorer */
			/*@cc_on
			@if (@_win32 || @_win64)
			document.write('<script id="ieScriptLoad" defer src="//:"><\/script>');
			document.getElementById('ieScriptLoad').onreadystatechange = function() {
				if (this.readyState == 'complete') {
					callback();
				}
			};
			@end @*/
			/* Mozilla, Chrome, Opera */
			if (document.addEventListener) {
				document.addEventListener('DOMContentLoaded', callback, false);
			}
			/* Safari, iCab, Konqueror */
			if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
				var DOMLoadTimer = setInterval(function () {
					if (/loaded|complete/i.test(document.readyState)) {
						callback();
						clearInterval(DOMLoadTimer);
					}
				}, 10);
			}
		},
	
		/**
		 	Next, a way to properly get the computed style of an element
			Courtesy of Robert Nyman - http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
		*/
		getStyle = function(el, css){
			var strValue = "";
			if (document.defaultView && document.defaultView.getComputedStyle){
				strValue = document.defaultView.getComputedStyle(el, "").getPropertyValue(css);
			}
			else if (el.currentStyle){
				css = css.replace(/\-(\w)/g, function (strMatch, p1){
					return p1.toUpperCase();
				});
				strValue = el.currentStyle[css];
			}
			return strValue;
		},
	
		/**
			Finally, some element class manipulation functions
		*/
		classRegex = function(cls) {
			return new RegExp('(\\s|^)'+cls+'(\\s|$)');
		},
	
		hasClass = function(el, cls) {
			return el.className.match(classRegex(cls));
		},
	
		addClass = function(el, cls) {
			if ( ! hasClass(el, cls)) {
				el.className += ' ' + cls;
			}
		},
	
		removeClass = function(el, cls) {
			if (hasClass(el, cls)) {
				el.className = el.className.replace(classRegex(cls), '');
			}
		},
	
		/*
			Now we can move on with the core functionality of Flexibackground
		*/
		initialize = function() {
		
			// No need for any of this if the screen isn't bigger than the background image
			if (screen.availWidth <= bgImageSize.width && screen.availHeight <= bgImageSize.height) {
				return;
			}
		
			// Grab elements we'll reference throughout
			elBody		= document.getElementsByTagName('body')[0];
		
			// Parse out the URL of the background image and drop out if we don't have one
			url = getStyle(elBody, 'backgroundImage').replace(/^url\(("|')?|("|')?\);?$/g, '') || false;
			if (!url || url === "none" || url === "") {
				return;
			}
		
			// Get the aspect ratio of the image
			imgAR = bgImageSize.width / bgImageSize.height;

			// Create a new image element
			elBgImage 		= document.createElement('img');
			elBgImage.src 	= url;
			elBgImage.id 	= imageID;
		
			// Create a wrapper and append the image to it.
			// The wrapper ensures we don't get scrollbars.
			elWrapper = document.createElement('div');
			elWrapper.style.overflow	= 'hidden';
			elWrapper.style.width	= '100%';
			elWrapper.style.height	= '100%';
			elWrapper.style.zIndex	= '-1';
		
			elWrapper.appendChild(elBgImage);
			elBody.appendChild(elWrapper);
		
			// Fix the wrapper into position
			elWrapper.style.position	= 'fixed';
			elWrapper.style.top		= 0;
			elWrapper.style.left		= 0;
		
			// Set up a resize listener to add/remove classes from the body 
			addEvent(window, 'resize', resizeAction);

			// Set it up by triggering a resize
			resizeAction();
		
		},
	
		/**
			Set up the action that happens on resize
		*/
		resizeAction = function() {
			var win = {
				height	: window.innerHeight || document.documentElement.clientHeight,
				width	: window.innerWidth || document.documentElement.clientWidth
			},

			// The current aspect ratio of the window
			winAR = win.width / win.height;

			// Determine if we need to show the image and whether it needs to stretch tall or wide
			if (win.width < bgImageSize.width && win.height < bgImageSize.height) {
				removeClass(elBody, wideClass);
				removeClass(elBody, tallClass);
			} else if (winAR < imgAR) {
				removeClass(elBody, wideClass);
				addClass(elBody, tallClass);
				// Center the image
				elBgImage.style.left = Math.min(((win.width - bgImageSize.width) / 2), 0);
			} else if (winAR > imgAR) {
				addClass(elBody, wideClass);
				removeClass(elBody, tallClass);
				elBgImage.style.left = 0;
			}
		};
	
	// When the document is ready, run this thing.
	domLoaded(initialize);
	
})();