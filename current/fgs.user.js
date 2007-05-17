// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @description   Flickr Gmap Show user script for greasemonkey
// @include       http://www*.flickr.com/photos/*
// ==/UserScript==

(function() {

var FGSSCRIPT = 'http://flickr-gmap-show.googlecode.com/svn/tags/fgs/current/fgs.c.js';
    
var loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)(\/.*)?$/(window.location.href);
if(loc&&loc[1]&&loc[2]) {
    var s = document.createElement('script');
    s.type='text/javascript';
    s.src=FGSSCRIPT;
    document.getElementsByTagName('head')[0].appendChild(s);
} else {
    loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(\/.*)?$/(window.location.href);
    if(loc&&loc[1]&&loc[2]) {
        var locdiv = document.getElementById('li_location');
        var geospan = document.getElementById('div_pre_geo_block');
        if( locdiv && geospan) {
            var s = document.createElement('script');
            s.type='text/javascript';
            s.src=FGSSCRIPT;
            document.getElementsByTagName('head')[0].appendChild(s);
        }
    }
}


})();
