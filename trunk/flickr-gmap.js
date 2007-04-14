

var FLICKR_API_KEY = 'ebed0eef1b25b738b1903ef93b8f25ee';

function runFlickrAPI(apimethod, callback, parms) {
    var urlSrc = "http://www.flickr.com/services/rest/?api_key="+FLICKR_API_KEY+"&format=json&method="+apimethod+"&jsoncallback="+callback+"&tick="+(new Date()).getTime()+"&"+parms;
    var script = document.createElement("script");
    script.src = urlSrc;
    script.id = "flickrapiscript";
    script.type = 'text/javascript';
    document.title = parms;
    document.getElementsByTagName('body').item(0).appendChild(script);
}
function clearFlickrScript() {
    // remove all flickrapiscript element
    var flickrapiscript;
    while(flickrapiscript = document.getElementById('flickrapiscript')) {
        document.getElementsByTagName('body').item(0).removeChild(flickrapiscript);
    }
}
function clearLightBox() {
    var lightbox;
    while(lightbox = document.getElementById('overlay')) {
        document.getElementsByTagName('body').item(0).removeChild(lightbox);
    }
    while(lightbox = document.getElementById('lightbox')) {
        document.getElementsByTagName('body').item(0).removeChild(lightbox);
    }
}
function beginWait(map) {
    document.body.style.cursor='wait';
    map.disableDragging();
}
function endWait(map) {
    document.body.style.cursor='auto';
    map.enableDragging();
}


// Create our "tiny" marker icon
var markerIcon = new GIcon();
//icon.image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
//icon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
//icon.shadowSize = new GSize(22, 20);
markerIcon.image = "http://l.yimg.com/www.flickr.com/images/dot1_p.png";
markerIcon.iconSize = new GSize(18, 19);
markerIcon.iconAnchor = new GPoint(9, 9);
markerIcon.infoWindowAnchor = new GPoint(9, 9);




function FlickrGmapMarker(icon, photos) {
    var position;
    if( photos.length == 1) {
        position = new GLatLng(photos[0].latitude, photos[0].longitude);
    } else {
        var bounds = new GLatLngBounds();
        for(var i=0, len=photos.length; i<len; ++i) {
            bounds.extend(new GLatLng(photos[i].latitude, photos[i].longitude));
        }
        position = bounds.getCenter();
    }
    GMarker.call(this, position, icon);

    this.photos = photos;
    this.currpos = 0;

    GEvent.addListener(this, "click", this.onClick);
}
FlickrGmapMarker.prototype = new GMarker(new GLatLng(0, 0));
FlickrGmapMarker.prototype.initialize = function(map) {
	GMarker.prototype.initialize.call(this, map);

	var div = document.createElement("div");
	div.className = "markerLabel";
	div.innerHTML = this.photos.length;
	div.style.position = "absolute";
	div.style.cursor = "pointer";
	if( this.photos.length > 99) {
	    div.style.fontSize = "xx-small";
	} else {
    	div.style.fontSize = "x-small";
	}
	div.style.textAlign = "center";
	div.marker = this;
	div.onclick = function() {
	    GEvent.trigger(this.marker, "click");
	}
	map.getPane(G_MAP_MARKER_PANE).appendChild(div);
	
	this.map = map;
	this.div = div;
}
FlickrGmapMarker.prototype.redraw = function(force) {
	GMarker.prototype.redraw.call(this, this.map);

	// We only need to do anything if the coordinate system has changed
	if (!force) return;

	// Calculate the DIV coordinates of two opposite corners of our bounds to
	// get the size and position of our rectangle
	var p = this.map.fromLatLngToDivPixel(this.getPoint());
	var z = GOverlay.getZIndex(this.getPoint().lat());

	// Now position our DIV based on the DIV coordinates of our bounds
	var iconsize = this.getIcon().iconSize;
	this.div.style.left = (p.x - iconsize.width/2) + "px";
	this.div.style.top = (p.y - iconsize.height/2)+2 + "px";
	this.div.style.width = iconsize.width-2 + "px";
	this.div.style.height = iconsize.height-3 + "px";
	this.div.style.zIndex = z + 1; // in front of the marker
}
FlickrGmapMarker.prototype.remove = function() {
    this.div.parentNode.removeChild(this.div);
    this.div = null;
    GMarker.prototype.remove.call(this);
}
FlickrGmapMarker.prototype.refreshImgList = function(imagesDiv, currpos, info) {
    if( currpos == 0) {
        var to = imagesDiv.childNodes.length > 5 ? 5 : imagesDiv.childNodes.length;
        for(var i = 0; i< to; ++i) {
            var a = imagesDiv.childNodes[i].childNodes[0];
            var img = a.childNodes[0];
            if( !img.getAttribute("src")) {
                var url = a.getAttribute("href");
                img.setAttribute("src", url+"_s.jpg");
                a.setAttribute("href", url+".jpg");
            }
        }
    } else {
        var span = imagesDiv.childNodes[currpos+4];
        if(span) {
            var a = span.childNodes[0];
            var img = a.childNodes[0];
            if( !img.getAttribute("src")) {
                var url = a.getAttribute("href");
                img.setAttribute("src", url+"_s.jpg");
                a.setAttribute("href", url+".jpg");
            }
        }
    }
    
    for( var i = 0; i < imagesDiv.childNodes.length; i++ ) {
        var node = imagesDiv.childNodes[i];
        if(i == currpos) {
            node.style.display = "inline";
            node.childNodes[0].childNodes[0].style.width = node.childNodes[0].childNodes[0].style.height = "75px";
            node.style.top =  "0px";
            node.style.left = "80px";
        } else if(i == currpos-1) {
            node.style.display = "inline";
            node.childNodes[0].childNodes[0].style.width = node.childNodes[0].childNodes[0].style.height = "45px";
            node.style.top =  "15px";
            node.style.left = "15px";
        } else if(i == currpos+1) {
            node.style.display = "inline";
            node.childNodes[0].childNodes[0].style.width = node.childNodes[0].childNodes[0].style.height = "45px";
            node.style.top =  "15px";
            node.style.left = "175px";
        } else {
            node.style.display = "none";
        }
    }
    info.innerHTML = " " + (currpos+1) + " of " + imagesDiv.childNodes.length + " ";
}
FlickrGmapMarker.prototype.onClick = function() {
    clearLightBox();

    if(!this.imagesDiv) {
        this.imagesDiv = document.createElement("div");
        for(var i = 0, len = this.photos.length; i < len; ++i) {
            var photo = this.photos[i];
            p_url = "http://farm"+photo.farm+".static.flickr.com/"+photo.server+"/"+photo.id+"_"+photo.secret;

            var imgspan = document.createElement("span");
            var imglink = document.createElement("a");
            var img = document.createElement("img");

            img.setAttribute("alt", photo.title);
            img.setAttribute("width", 75);
            img.setAttribute("height", 75);
            imglink.setAttribute("rel", "lightbox[photo]");
            imglink.setAttribute("title", photo.title);
            imglink.setAttribute("href", p_url);
            imgspan.id="pic"+i;
            imgspan.style.position = "absolute";
            imgspan.style.display = "none";

            imglink.appendChild(img);
            imgspan.appendChild(imglink);
            this.imagesDiv.appendChild(imgspan);
        }
    	this.info = document.createElement("span");
    }


    var imgl = document.createElement("img");
    imgl.setAttribute("src", "http://l.yimg.com/www.flickr.com/images/simple_prev_default.gif");
    imgl.marker = this;
    imgl.style.cursor = "pointer";
	imgl.onmousedown = function() {
	    if( this.marker.currpos <= 0) {
	        return;
	    }
        this.marker.currpos--;
	    this.marker.refreshImgList(this.marker.imagesDiv, this.marker.currpos, this.marker.info);
	}
    var imgr = document.createElement("img");
    imgr.setAttribute("src", "http://l.yimg.com/www.flickr.com/images/simple_next_default.gif");
    imgr.marker = this;
    imgr.style.cursor = "pointer";
	imgr.onmousedown = function() {
	    if( this.marker.currpos >= this.marker.imagesDiv.childNodes.length-1) {
	        return;
	    }
        this.marker.currpos++;
	    this.marker.refreshImgList(this.marker.imagesDiv, this.marker.currpos, this.marker.info);
	}
    var controlDiv = document.createElement("div");
    controlDiv.appendChild(imgl);
    controlDiv.appendChild(imgr);
    controlDiv.appendChild(this.info);

    this.refreshImgList(this.imagesDiv, this.currpos, this.info);

    var infoWindow = document.createElement("div");
    infoWindow.appendChild(this.imagesDiv);
    infoWindow.appendChild(controlDiv);
    infoWindow.style.width = "250px";
    infoWindow.style.height = "100px";
    this.imagesDiv.style.height = "80px"
    controlDiv.style.position = "absolute";
    controlDiv.style.top = "80px";
    controlDiv.style.height = "20px";
    this.imagesDiv.style.width = controlDiv.style.width = infoWindow.style.height;

    this.openInfoWindow(infoWindow);

    initLightbox();
}







var deltas =   [
3.8, //0
3.8, //1
2,  //2
1.5, //3
0.6,//4 
0.4, //5
0.23, //6
0.13, //7
0.065, //8
0.035, //9
0.019, //10
0.0095, //11
0.005, //12
0.0024, //13
0.0012, //14
0.0007, //15
0.0003, //16
0.00009, //17
0.000025,//18
0.000017,//19
0.000001]; //20




function FlickrGmapShow_PhotoSet(elemMap, photosetid, cbfunError) {

    var _cbfunErrorShowPhotoSet = cbfunError;

    if (!GBrowserIsCompatible()) { return; }
    
    var map = new GMap2(document.getElementById(elemMap));
    map.addControl(new GLargeMapControl());
    map.addControl(new GMapTypeControl());
    map.enableDoubleClickZoom();
    map.enableContinuousZoom();
    map.total_photos = new Array();
    this.map = map;

    FlickrGmapShow_PhotoSet_cbShowPhotoSet.fgs = this;
    beginWait(this.map);
    runFlickrAPI("flickr.photosets.getPhotos", "FlickrGmapShow_PhotoSet_cbShowPhotoSet", "extras=geo&photoset_id="+photosetid);
}
FlickrGmapShow_PhotoSet.prototype.showPhotoSet_onzoom = function (oldLevel, newLevel) {
    beginWait(this);

    this.clearOverlays();

    delta = deltas[newLevel];

    var temp_bounds = new Array();
    var temp_photos = new Array();
    for (var i=0,len=this.total_photos.length; i<len; i++) {
        var photo = this.total_photos[i];
        var pos = new GLatLng(photo.latitude, photo.longitude);
        
        var isMerged = false;
        for (var j=0,len2=temp_bounds.length; j<len2; j++) {
            var bb = temp_bounds[j];
            if( bb.contains(pos)) {
                isMerged = true;
                var ps = temp_photos[j];
                ps[ps.length] = photo;
                break;
            }
        }
        
        if(!isMerged) {
            var ps = new Array();
            ps[0] = photo;
            
            var gbounds = new GLatLngBounds(new GLatLng(pos.lat()-delta, pos.lng()-delta), new GLatLng(pos.lat()+delta, pos.lng()+delta));
            temp_bounds[temp_bounds.length] = gbounds;
            temp_photos[temp_photos.length] = ps;
        }
    }

    for (var i=0,len=temp_photos.length; i<len ; i++) {
        if(temp_photos[i].length == 0) { continue; }
        this.addOverlay(new FlickrGmapMarker(markerIcon, temp_photos[i]));
    }

    clearFlickrScript();
    endWait(this);
}

function FlickrGmapShow_PhotoSet_cbShowPhotoSet(rsp) {
var fgs = FlickrGmapShow_PhotoSet_cbShowPhotoSet.fgs;
var map = fgs.map;
try {
    if( rsp.stat == "fail") {
        if( typeof _cbfunErrorShowPhotoSet == 'function') {
            _cbfunErrorShowPhotoSet(rsp.message);
        }
        return;
    }

    var totalphotos = map.total_photos;
    for (var i=0,len=rsp.photoset.photo.length; i<len; i++) {
        photo = rsp.photoset.photo[i];

        if(photo.latitude == 0 && photo.longitude == 0) {
            continue;
        }

        totalphotos[totalphotos.length] = photo;
    }


    var bounds = new GLatLngBounds();
    for (var i=0,len=totalphotos.length; i<len; i++) {
        bounds.extend(new GLatLng(totalphotos[i].latitude, totalphotos[i].longitude));
    }

    GEvent.addListener(map, "zoomend", fgs.showPhotoSet_onzoom);
    var zoom = map.getBoundsZoomLevel(bounds);
    map.setCenter(bounds.getCenter(), zoom, G_SATELLITE_MAP);
} finally {
    endWait(map);
}
}

















function PageControl() {}
PageControl.prototype = new GControl();
PageControl.prototype.currpage = 1;
PageControl.prototype.totalpages = 1;
PageControl.prototype.initialize = function(map) {
    this.fgs = map.fgs;
    var container = document.createElement("div");

    this.spanPgup = document.createElement("span");
    this.spanPgup.pagectrl = this;
    this.setButtonStyle_(this.spanPgup);
    container.appendChild(this.spanPgup);
    this.spanPgup.appendChild(document.createTextNode("Page UP"));
    GEvent.addDomListener(this.spanPgup, "click", this.pgup);

    this.spanInfo = document.createElement("span");
    this.setButtonStyle_(this.spanInfo);
    container.appendChild(this.spanInfo);

    this.spanPgdn = document.createElement("span");
    this.spanPgdn.pagectrl = this;
    this.setButtonStyle_(this.spanPgdn);
    container.appendChild(this.spanPgdn);
    this.spanPgdn.appendChild(document.createTextNode("Page Down"));
    GEvent.addDomListener(this.spanPgdn, "click", this.pgdn);

    map.getContainer().appendChild(container);
    return container;
}
PageControl.prototype.getDefaultPosition = function() {
    return new GControlPosition(G_ANCHOR_BOTTOM_RIGHT, new GSize(10, 25));
}
PageControl.prototype.setButtonStyle_ = function(button) {
    //button.style.textDecoration = "underline";
    button.style.color = "#0000cc";
    button.style.backgroundColor = "white";
    button.style.font = "small Arial";
    button.style.border = "1px solid black";
    button.style.padding = "2px";
    button.style.marginBottom = "3px";
    button.style.textAlign = "center";
    button.style.width = "6em";
    button.style.cursor = "pointer";
}
PageControl.prototype.setPageInfo = function(curr, total) {
    this.currpage = curr;
    this.totalpages = total;
    if( this.totalpages < 2) {
        this.spanPgup.style.backgroundColor = "gray";
        this.spanPgdn.style.backgroundColor = "gray";
    } else {
        this.spanPgup.style.backgroundColor = "white";
        this.spanPgdn.style.backgroundColor = "white";
    }
    this.spanPgup.style.cursor = "pointer";
    this.spanPgdn.style.cursor = "pointer";
    this.spanInfo.style.cursor = "pointer";
    this.spanInfo.innerHTML = this.currpage + " of " + this.totalpages;
}
PageControl.prototype.pgup = function() {
    if( this.pagectrl.currpage == 1) return;
    this.pagectrl.currpage --;
    this.pagectrl.spanPgup.style.cursor = "wait";
    this.pagectrl.spanInfo.style.cursor = "wait";
    this.pagectrl.spanPgdn.style.cursor = "wait";
    this.pagectrl.fgs.browsePhotos_refresh();
}
PageControl.prototype.pgdn = function() {
    if( this.pagectrl.currpage == this.pagectrl.totalpages) return;
    this.pagectrl.currpage ++;
    this.pagectrl.spanPgup.style.cursor = "wait";
    this.pagectrl.spanInfo.style.cursor = "wait";
    this.pagectrl.spanPgdn.style.cursor = "wait";
    this.pagectrl.fgs.browsePhotos_refresh();
}




function FlickrGmapShow_BrowsePhotos(mapName, latitude, longitude, zoom, searchparams, cbfunError) {
    var _cbfunErrorBrowsePhotos = cbfunError;
    
    if (!GBrowserIsCompatible()) { return; }

    this.searchparams = searchparams;
        
    var map = new GMap2(document.getElementById(mapName));
    map.fgs = this;
    this.map = map;
    GEvent.addListener(map, "dragend", this.browsePhotos_ondrag);
    GEvent.addListener(map, "zoomend", this.browsePhotos_onzoom);
    map.addControl(new GLargeMapControl());
    map.addControl(new GMapTypeControl());
    this.pagectrl = new PageControl();
    map.addControl(this.pagectrl);
    map.enableDoubleClickZoom();
    map.enableContinuousZoom();
    map.lastCenter = new GLatLng(0, 0);
    map.setCenter(new GLatLng(latitude, longitude), zoom, G_SATELLITE_MAP);
}
FlickrGmapShow_BrowsePhotos.prototype.browsePhotos_ondrag = function() {
    var center = this.getCenter();
    var dist = 3*deltas[this.getZoom()];
    if(Math.abs(center.lat()-this.lastCenter.lat())<dist && Math.abs(center.lng()-this.lastCenter.lng())<dist ) {
        return;
    }
    this.fgs.pagectrl.currpage = 1;
    this.fgs.browsePhotos_refresh();
}
FlickrGmapShow_BrowsePhotos.prototype.browsePhotos_onzoom = function() {
    this.fgs.pagectrl.currpage = 1;
    this.fgs.browsePhotos_refresh();
}
FlickrGmapShow_BrowsePhotos.prototype.browsePhotos_refresh = function() {
    this.map.lastCenter = this.map.getCenter();

    beginWait(this.map);
    var bound = this.map.getBounds();
    var sw = bound.getSouthWest();
    var ne = bound.getNorthEast();
    var w = sw.lng();
    var e = ne.lng();
    var n = ne.lat();
    var s = sw.lat();
    var wid;
    if( e < w) {
        wid = 360+e-w;
    } else {
        wid = e - w;
    }
    var hig = n - s;
    
    w += wid/5;
    if( w > 180) w -= 360;
    e -= wid/5;
    if( e <= -180) e += 360;

    if( e < w) {
        if( (180+e) > (180-w)) {
            w = -180;
        } else {
            e = 180;
        }
    }
    
    
    n -= hig/5;
    s += hig/5;

    FlickrGmapShow_BrowsePhotos_cbBrowsePhotos.map = this.map;
    var params = "extras=geo&";
    if(this.searchparams) {
        params += this.searchparams;
    }
    runFlickrAPI("flickr.photos.search", "FlickrGmapShow_BrowsePhotos_cbBrowsePhotos", params + "&page="+this.pagectrl.currpage+"&bbox="+w+","+s+","+e+","+n);
}

function FlickrGmapShow_BrowsePhotos_cbBrowsePhotos(rsp) {
    var map = FlickrGmapShow_BrowsePhotos_cbBrowsePhotos.map;
try {
    if( rsp.stat == "fail") {
        alert(rsp.message);
        if( typeof _cbfunErrorBrowsePhotos == 'function') {
            _cbfunErrorBrowsePhotos(rsp.message);
        }
        return;
    }
    map.clearOverlays();
    
    map.fgs.pagectrl.setPageInfo(rsp.photos.page, rsp.photos.pages);
    
    delta = deltas[map.getZoom()];

    var temp_bounds = new Array();
    var temp_photos = new Array();
    for (var i=0,len=rsp.photos.photo.length; i<len; i++) {
        var photo = rsp.photos.photo[i];

        if(photo.latitude == 0 && photo.longitude == 0) {
            continue;
        }

        var pos = new GLatLng(photo.latitude, photo.longitude);
        
        var isMerged = false;
        for (var j=0,len2=temp_bounds.length; j<len2; j++) {
            var bb = temp_bounds[j];
            if( bb.contains(pos)) {
                isMerged = true;
                var ps = temp_photos[j];
                ps[ps.length] = photo;
                break;
            }
        }
        
        if(!isMerged) {
            var ps = new Array();
            ps[0] = photo;
            
            var gbounds = new GLatLngBounds(new GLatLng(pos.lat()-delta, pos.lng()-delta), new GLatLng(pos.lat()+delta, pos.lng()+delta));
            temp_bounds[temp_bounds.length] = gbounds;
            temp_photos[temp_photos.length] = ps;
        }
    }

    for (var i=0,len=temp_photos.length; i<len ; i++) {
        if(temp_photos[i].length == 0) { continue; }
        map.addOverlay(new FlickrGmapMarker(markerIcon, temp_photos[i]));
    }
} finally {    
    clearFlickrScript();
    endWait(map);
}
}

