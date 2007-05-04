// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @description   Flickr Gmap Show user script for greasemonkey
// @include       http://www.flickr.com/photos/*
// ==/UserScript==

var loc = /^http:\/\/www\.flickr\.com\/photos\/(.*)\/sets\/(\d*)\/$/(window.location.href);
if(loc&&loc[1]&&loc[2]) {
    var paras = document.getElementsByTagName('p');
    for (var i=0; i< paras.length; i++) {
        if(paras[i].className == "Links") {
            if( paras[i].childNodes[0]==undefined) continue;
            var nobr = paras[i].childNodes[0];
            var cs = nobr.childNodes;
            var img;
            for(var j = 0; j<cs.length; j++) {
                if(cs[j].nodeType == 1 && cs[j].tagName=='IMG') {
                    img=cs[j];
                    break;
                }
            }
            
            var a = document.createElement('a');
            a.innerHTML='GMap';
            a.href='http://flickr-gmap-show.googlecode.com/svn/trunk/flickr-gmap-photoset.html?photoset_id='+loc[2];
            nobr.appendChild(img.cloneNode(true));
            nobr.appendChild(a);
        }
    }
}

