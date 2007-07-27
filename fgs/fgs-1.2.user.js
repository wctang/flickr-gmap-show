// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @author        wctang <wctang@gmail.com>
// @include       http://www*.flickr.com/*
// @description   Show Flickr geotagged photos with Google Map.
// @source        http://userscripts.org/scripts/show/9450
// @identifier    http://userscripts.org/scripts/source/9450.user.js
// @version       1.2
// ==/UserScript==

(function() {
var scriptname = 'Flickr Gmap Show';
var installurl = 'http://userscripts.org/scripts/source/9450.user.js';
var currVer = '1.2';
var FGSSCRIPT = 'http://flickr-gmap-show.googlecode.com/svn/tags/fgs/1.2/fgs.c.js';


var loc = /^http:\/\/www.*\.flickr\.com\/([a-zA-Z0-9]*)\/(.*)?$/(window.location.href);
if(loc&&loc[1]&&(loc[1]=='photos'||loc[1]=='groups')) {
}else{
    loc = /^http:\/\/www.*\.flickr\.com(\/)?$/(window.location.href);
    if(!loc) {
        return;
    }
}


if(unsafeWindow) w = unsafeWindow;
else w = window;

w.FGS_setValue = function(key, value) {
    if(GM_setValue) GM_setValue(key, value);
    else _set_cookie(key,value,1000);
};
w.FGS_getValue = function(key,defaultValue) {
    if(GM_getValue) return GM_getValue(key, defaultValue);
    else if( _get_cookie(key) == undefined ) return defaultValue;
    else {
        _set_cookie(key, _get_cookie(key),1000);
        return _get_cookie(key);
    }
};


var autoUpdateFromUserscriptsDotOrg = function (SCRIPT){
	try {
		if (!GM_getValue) return;
		var DoS_PREVENTION_TIME = 2 * 60 * 1000;
		var isSomeoneChecking = GM_getValue('CHECKING', null);
		var now = new Date().getTime();
		GM_setValue('CHECKING', now.toString());
		if (isSomeoneChecking && (now - isSomeoneChecking) < DoS_PREVENTION_TIME) return;
		
		// check daily
		var ONE_DAY = 24 * 60 * 60 * 1000;
		var lastChecked = GM_getValue('LAST_CHECKED', null);
		if (lastChecked && (now - lastChecked) < ONE_DAY) return;
		
		GM_xmlhttpRequest({
		method: 'GET',
		url: SCRIPT.url + '?source', // don't increase the 'installed' count just for update checks
		onload: function(result) {
			if (!result.responseText.match(/@version\s+([\d.]+)/)) return;     // did not find a suitable version header
			var theOtherVersion = parseFloat(RegExp.$1);
			if (theOtherVersion <= parseFloat(SCRIPT.version)) return;      // no updates or older version on userscripts.orge site
			if (window.confirm('A new version ' + theOtherVersion + ' of greasemonkey script "' + SCRIPT.name + '" is available.\nYour installed version is ' + SCRIPT.version + ' .\n\nUpdate now?\n')) {
				GM_openInTab(SCRIPT.url);   // better than location.replace as doing so might lose unsaved data
			}
		}
		});
		GM_setValue('LAST_CHECKED', now.toString());
	} catch (ex) { }
};


function loadscript() {
	autoUpdateFromUserscriptsDotOrg({
		name: scriptname,
		url: installurl,
		version: currVer,
	});
    
    var s = document.createElement('script');
    s.type='text/javascript';
    s.src=FGSSCRIPT;
    document.getElementsByTagName('head')[0].appendChild(s);
}


loc = /^http:\/\/www.*\.flickr\.com(\/)?$/(window.location.href);
if(loc) {
    loadscript();
    return;
}

loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)(\/.*)?$/(window.location.href);
if(loc&&loc[1]&&loc[2]) {
    loadscript();
    return;
}

loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(\/.*)?$/(window.location.href);
var maplink = document.getElementById('a_link_to_map');
var maplink2 = document.getElementById('a_place_on_map_old');
if(loc&&loc[1]&&loc[2]&&(maplink||maplink2)) {
    loadscript();
    return;
}

loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)(\/.*)?$/(window.location.href);
if(loc&&loc[1]) {
    loadscript();
    return;
}

loc = /^http:\/\/www.*\.flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)(\/)?$/(window.location.href);
if(loc&&loc[1]) {
    loadscript();
    return;
}

})();
