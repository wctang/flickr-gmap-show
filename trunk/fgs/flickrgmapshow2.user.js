// Flickr GMap Show 2
// v0.1
// Copyright (c) 2008, wctang (Tang Wei-Ching).
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
// 
// Change Log:
// v0.1  08/09/04  Create.
//
// ==UserScript==
// @name          FlickrGMapShow2
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @description   Use Google Maps with Flickr.
// @version       0.1
// @author        wctang <wctang@gmail.com>
// @source        http://code.google.com/p/flickr-gmap-show/
// @identifier    http://code.google.com/p/flickr-gmap-show/source/browse/trunk/fgs/fgs2.user.js
// @include       http://www*.flickr.com/*
// @include       http://flickr.com/*
// ==/UserScript==

(function() {

var SCRIPT = {
	name: 'FlickrGMapShow2',
	author: 'wctang <wctang@gmail.com>',
	namespace: 'http://code.google.com/p/flickr-gmap-show/',
	description: 'Use Google Maps with Flickr.',
	source: 'http://code.google.com/p/flickr-gmap-show/',
	identifier: 'http://code.google.com/p/flickr-gmap-show/source/browse/trunk/fgs/fgs2.user.js',
	version: '0.1',
	date: (new Date(2008, 9, 4)).valueOf() // update date
};

var unsafewin = (typeof unsafeWindow !== undefined) ? unsafeWindow : window;
var unsafedoc=unsafewin.document;
var $;
var $gfs;
var google;
var console = unsafewin.console;
function log() { return console.log.apply(console, arguments); }


var flickr={
	_api_key: '',
	name:'flickr',
	check: function(rsp) { return (rsp && rsp.stat === 'ok'); },
	parseCurrPage: function(rsp) { var photos=rsp.photos?rsp.photos:rsp.photoset; return parseInt(photos.page,10); },
	parseTotalPage: function(rsp) { var photos=rsp.photos?rsp.photos:rsp.photoset; return parseInt(photos.pages,10); },
	parse: function(photos,rsp,ismustgeo,owner,ownername,buddy_url) {
		var phs=rsp.photos||rsp.photoset;
		for (var i=0,len=phs.photo.length; i<len; i++) {
			var p=phs.photo[i];
			var lat=parseFloat(p.latitude);
			var lng=parseFloat(p.longitude);
			if(ismustgeo && !lat && !lng) { continue; }

			var latlng= ( (lat || lng) ? new google.maps.LatLng(lat, lng) : null);

			photos.push({id:p.id, secret:p.secret, title:p.title, pos:latlng, accuracy:parseInt(p.accuracy,10), api:flickr, dateupload:parseInt(p.dateupload,10), datetaken:p.datetaken, owner:p.owner?p.owner:owner, ownername:p.ownername?p.ownername:ownername, farm:p.farm, server:p.server, iconfarm:p.iconfarm, iconserver:p.iconserver, buddy_url:buddy_url, license:parseInt(p.license,10)});
		}
	},
	gettitle: function(photo) {return photo.title;},
	smalliconurl: function(photo) { return this.iconurl(photo); },
	iconurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_s.jpg';}, //75x75
	thumburl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_t.jpg';}, //max100
	smallurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_m.jpg';}, //max240
	mediumurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';}, //max500
	largeurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_b.jpg';}, //max1024
	pageurl: function(photo) {return 'http://www.flickr.com/photo.gne?id='+photo.id;},
	placeurl: function(placeid) { return 'http://www.flickr.com/places/'+placeid; },
	owner: function(photo) {return photo.ownername || photo.owner;},
	ownerurl: function(photo) {return 'http://www.flickr.com/photos/'+photo.owner+'/';},
	datetaken: function(photo) { return photo.datetaken.substr(0,10); },
	datetakenurl: function(photo) { return 'http://www.flickr.com/photos/'+photo.owner+'/archives/date-taken/'+(flickr.datetaken(photo).replace(/\-/g,'/'))+'/'; },
	dateupload: function(photo) {
		var t=new Date(photo.dateupload*1000), y=t.getFullYear(), m=t.getMonth()+1, d=t.getDate();
		return ''+y+'-'+(m>9?'':'0')+m+'-'+(d>9?'':'0')+d;
	},
	dateuploadurl: function(photo) { return 'http://www.flickr.com/photos/'+photo.owner+'/archives/date-posted/'+(flickr.dateupload(photo).replace(/\-/g,'/'))+'/'; },
	buddyurl: function(photo) {
		if(photo.buddy_url) { return photo.buddy_url; }
		if(photo.iconserver&parseInt(photo.iconserver,10)>0) { return 'http://farm'+photo.iconfarm+'.static.flickr.com/'+photo.iconserver+'/buddyicons/'+photo.owner+'.jpg'; }
		else { return 'http://www.flickr.com/images/buddyicon.jpg'; }
	},
	licensestr: function(photo) {
		switch(photo.license) {
			case 1: return '<a href="http://creativecommons.org/licenses/by-nc-sa/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noncomm_small.gif" alt="Noncommercial" title="Noncommercial"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_sharealike_small.gif" alt="Share Alike" title="Share Alike"></span> Some rights reserved.</a>';
			case 2: return '<a href="http://creativecommons.org/licenses/by-nc/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noncomm_small.gif" alt="Noncommercial" title="Noncommercial"></span> Some rights reserved.</a>';
			case 3: return '<a href="http://creativecommons.org/licenses/by-nc-nd/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noncomm_small.gif" alt="Noncommercial" title="Noncommercial"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noderivs_small.gif" alt="No Derivative Works" title="No Derivative Works"></span> Some rights reserved.</a>';
			case 4: return '<a href="http://creativecommons.org/licenses/by/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"></span> Some rights reserved.</a>';
			case 5: return '<a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_sharealike_small.gif" alt="Share Alike" title="Share Alike"></span> Some rights reserved.</a>';
			case 6: return '<a href="http://creativecommons.org/licenses/by-nd/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noderivs_small.gif" alt="No Derivative Works" title="No Derivative Works"></span> Some rights reserved.</a>';
			default: return '<span style="font-size: 12pt;">&copy;</span> All rights reserved';
		}
	},
	_url: function(args, sign) {
		var url = 'http://api.flickr.com/services/rest/?';
		var keys = [];
		for (var arg in args) { if(args.hasOwnProperty(arg)) {
			if(arg.charAt(0)==='_') continue;
			keys.push(arg);
		}}
		keys.sort();

	//	var signature = flickr._secret_key;
		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			var v = args[k];
	//		signature = signature + k + v;
			url = url + (i>0?'&':'') + escape(k) + '=' + escape(v);
		}
	//	if(sign) {
	//    signature = Utilities.MD5(signature);
	//    url = url + '&api_sig='+signature;
	//	}
		return url;
	},
	isGMScript:undefined,
	callapi: function(methodname, searchopts, obj) {
		if(this.isGMScript===undefined) {
			if(window.wrappedJSObject && unsafewin && unsafewin.F && unsafewin.F.API && unsafewin.F.API.callMethod) { this.isGMScript=true;
			} else { this.isGMScript=false; }
		}
		searchopts._api=flickr;
		searchopts.format='json';
		if(this.isGMScript) {
			searchopts.nojsoncallback = '1';
			if(typeof(obj) === 'function') {
				var tmp={};
				tmp[methodname.replace(/\./g,'_')+'_onLoad']=obj;
				obj=tmp;
			}
			unsafewin.F.API.callMethod(methodname, searchopts, obj);
		} else {
			var cb_id='cb'+this.name+(new Date()).getTime();
			searchopts.api_key = flickr._api_key;
			searchopts.method=methodname;
			searchopts.jsoncallback=cb_id;
			window[cb_id]=function(rsp){obj[methodname.replace(/\./g,'_')+'_onLoad'].call(obj,true,null,rsp,searchopts); window[cb_id]=null; $('script#'+cb_id).remove();};
			loadscript(this._url(searchopts), cb_id);
		}
	}
};


var map_key = {
	"www.flickr.com":"ABQIAAAA5iyLqLpUbk1qBe2volmsqxSJH83gQrDVSdV8r9NArjCP9aOWERRU1og-N0K74gHhNgzjBwOD_qJqMA",
	"flickr.com"    :"ABQIAAAA5iyLqLpUbk1qBe2volmsqxSGM0_bDfGWz8SC2GLcx2eGJvE10BTGjbXI0oN8Qn9JZDhW_LeBOkw_sA"
};
var js_gmap = "http://www.google.com/jsapi?key=";

var libs_loading = "data:image/gif;base64,R0lGODlhCgAKAJEDAMzMzP9mZv8AAP%2F%2F%2FyH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQFAAADACwAAAAACgAKAAACF5wncgaAGgJzJ647cWua4sOBFEd62VEAACH5BAUAAAMALAEAAAAIAAMAAAIKnBM2IoMDAFMQFAAh%2BQQFAAADACwAAAAABgAGAAACDJwHMBGofKIRItJYAAAh%2BQQFAAADACwAAAEAAwAIAAACChxgOBPBvpYQYxYAIfkEBQAAAwAsAAAEAAYABgAAAgoEhmPJHOGgEGwWACH5BAUAAAMALAEABwAIAAMAAAIKBIYjYhOhRHqpAAAh%2BQQFAAADACwEAAQABgAGAAACDJwncqi7EQYAA0p6CgAh%2BQQJAAADACwHAAEAAwAIAAACCpRmoxoxvQAYchQAOw%3D%3D";
var imgdir = 'http://flickr-gmap-show.googlecode.com/svn/trunk/pics/';
var pics = {
	flickr_loading  : imgdir+'flickr_loading.gif',
	marker_img      : imgdir+'marker_image.png',
	marker_shw      : imgdir+'marker_shadow.png',
	marker_trans    : imgdir+'marker_transparent.png',
	marker_mov      : imgdir+'marker_image_moved.png',
	loading         : imgdir+'loading.gif',
	icons           : imgdir+'icons2.png',
	icon1           : imgdir+'pic1.png',
	icon2           : imgdir+'pic2.png',
	icon3           : imgdir+'pic3.png',
	bar_loading     : imgdir+'bar_loading.gif',
	infobg_flickr   : imgdir+'infobg_flickr.jpg'
};

function loadscript(jspath,loaded) {
	var s=document.createElement("script");
	s.setAttribute("type","text/javascript");
	s.setAttribute("src",jspath);
	if(loaded) {
		s.addEventListener("readystatechange", function(){if(this.readyState==="complete") { loaded(); }}, false);
		s.addEventListener("load", loaded, false);
	}
	document.getElementsByTagName("head")[0].appendChild(s);
}

var document_write_old = unsafedoc.write;
unsafedoc.write = function(str) {
	if(str.indexOf("<script ")>=0){
		var f = str.indexOf('src="')+5;
		var src = str.substring(f,str.indexOf('"',f));
		loadscript(src);
	} else if(str.indexOf("<style ")>=0) {
		var sty = document.createElement("style");
		sty.setAttribute("type", "text/css");
		var s = str.indexOf('media="');
		if(s>0) { sty.setAttribute("media", str.substring(s+7,str.indexOf('"',s+7))); }
		str=str.replace(/<style."*>/,"").replace(/<\/style>/,"");
		if(sty.styleSheet) { sty.styleSheet.cssText = str;  // ie
		} else { sty.appendChild(document.createTextNode(str)); }
		document.getElementsByTagName("head")[0].appendChild(sty);
	} else {
		document_write_old(str);
	}
};

function extend(Constructor,Parent) {
	var Inh=function(){}; Inh.prototype=Parent.prototype; Constructor.prototype=new Inh();
	Constructor.prototype.constructor=Constructor; Constructor.superconstructor=Parent;
}



function init_libs() {
	var CSS_STYLE='';

	CSS_STYLE+=
'div.gfs_win div.markerlabel {text-align:center; vertical-align:middle; font-size:8pt; cursor:pointer;} '+
'div.gfs_win div.markerlabel:hover {color:white; font-weight:bold;} '+
'';

var PhotoGroupMarker=function(latlng,opts){ // called when created
	arguments.callee.superconstructor.apply(this, arguments);
	this.photos=this.showpanel=null;
	this.iconsize = this.getIcon().iconSize;

	google.maps.Event.addListener(this, 'click', this.onClick);
	this.$div=$('<div class="markerlabel" style="position:absolute;"></div>').width(this.iconsize.width).height(this.iconsize.height).click(this.onClick);
	this.$div.get(0).marker=this;
};
extend(PhotoGroupMarker, google.maps.Marker);
PhotoGroupMarker.ic=function(img,w1,h1,w2,h2,w3,h3) {
	var icon=new google.maps.Icon();
	icon.image=img;
	icon.iconSize=new google.maps.Size(w1,h1);
	icon.iconAnchor=new google.maps.Point(w2,h2);
	icon.infoWindowAnchor=new google.maps.Point(w3,w3);
	return icon;
};
PhotoGroupMarker.generateIcon=function(n) {
	if(!arguments.callee.init) {
		arguments.callee.init=true;
		arguments.callee.i1=PhotoGroupMarker.ic(pics.icon1, 12,12, 7, 7, 7, 7);
		arguments.callee.i2=PhotoGroupMarker.ic(pics.icon2, 18,18,10,10,10,10);
		arguments.callee.i3=PhotoGroupMarker.ic(pics.icon3, 24,24,13,13,13,13);
	}
	if(n < 10) { return arguments.callee.i1; }
	else if(n < 100) { return arguments.callee.i2; }
	else { return arguments.callee.i3; }
};
PhotoGroupMarker.instances=[[],[],[]];
PhotoGroupMarker.getInstance=function(photogroup) {
	var n = photogroup.photos.length;
	var idx = (n < 10) ? 0 : ((n < 100) ? 1 : 2);

	var marker;
	if(PhotoGroupMarker.instances[idx].length === 0) {
		marker = new PhotoGroupMarker(new google.maps.LatLng(0,0), {icon:PhotoGroupMarker.generateIcon(n)});
		marker.num = n;
	} else {
		marker = PhotoGroupMarker.instances[idx].pop();
	}

	marker.photos=photogroup.photos;
	marker.showpanel=null;
	marker.$div.text(marker.photos.length);
	return marker;
};
PhotoGroupMarker.prototype.initialize=function(map){ // called when add to map
	google.maps.Marker.prototype.initialize.apply(this,arguments);
	this.$div.appendTo(map.getPane(google.maps.MAP_MARKER_PANE));
	var posi = this.getLatLng();
	this.pos = map.fromLatLngToDivPixel(posi);
	this.zidx = google.maps.Overlay.getZIndex(posi.lat());
	this.gmap=map; // may be change to other map
};
PhotoGroupMarker.prototype.remove=function(){
	google.maps.Marker.prototype.remove.apply(this,arguments);
	this.photos=null;
	var cf = this.$div.get(0);
	cf.parentNode.removeChild(cf);

	var n = this.num;
	var idx = (n < 10) ? 0 : ((n < 100) ? 1 : 2);
	PhotoGroupMarker.instances[idx].push(this);
};
PhotoGroupMarker.prototype.redraw=function(force){
	google.maps.Marker.prototype.redraw.apply(this, arguments);
	if (!force || !this.pos) { return; }
	this.$div.css({left:(this.pos.x-this.iconsize.width/2-1), top:(this.pos.y-this.iconsize.height/2-1), lineHeight:this.iconsize.height+"px", zIndex:this.zidx+1});
};
PhotoGroupMarker.prototype.onClick=function(){
	var marker=this.marker||this;

	var photos = marker.photos;

	var $res = $gfs.find('div.gfs_res');
	$res.empty();
	for(var i = 0, n = photos.length; i < n; ++i) {
		var photo = photos[i];
		$res.append('<a class="photores" href="'+photo.api.pageurl(photo)+'" target="_blank"><img src="'+photo.api.iconurl(photo)+'" title="'+photo.api.gettitle(photo)+'"></img></a>');
	}
};


var PhotoCtl=function(){};
PhotoCtl.prototype.deltas = [
0,0,
6.0471013966887784,
3.0235506983443892,
1.5117753491721946,
0.7558876745860973,
0.4381797339583715,
0.2166893459120705,
0.1054534198706207,
0.0517575120441158,
0.0256017451528869,
0.012732042885645,
0.00634837196261628,
0.003169749786363714,
0.001583755663266591,
0.0007915970919446143,
0.0003957279865313504,
0.0001978462849822430,
0.0000989186817588934,
0.0000494593408794467,
0.0000247296704397233];
PhotoCtl.prototype.init=function() {
	this.marker = null;
	this.photos = [];
	$gfs.data("map").disableDoubleClickZoom();

	$gfs.data("map").clearOverlays();
	$gfs.data("ctlMsg").init();
	$gfs.data("ctlSearch").init();
};
PhotoCtl.prototype.loadLocation=function(opt) {
	this.user_id = null;
	this.photo_id = opt.photo_id;
	this.readonly = opt.readonly;

	flickr.callapi('flickr.photos.getInfo', {photo_id:this.photo_id}, this);
	$gfs.data("ctlMsg").showLoading();
};
PhotoCtl.prototype.flickr_photos_getInfo_onLoad=function(success, responseXML, responseText, params){
	var rsp = eval('(' + responseText + ')');
	if(!rsp || rsp.stat != 'ok') return;

	$gfs.data("ctlMsg").clearLoading();

	var photo = rsp.photo;

	var ischangeable = false;
	if(photo.permissions && !this.readonly) {
		ischangeable = true;
	}
	
	this.user_id = photo.owner.nsid;

	var center;
	var zoom = 12;
	if(photo.location) {
		if(photo.location.accuracy)
			zoom=parseInt(photo.location.accuracy,10);
		center = new google.maps.LatLng(photo.location.latitude,photo.location.longitude);
	} else if(unsafewin._use_4real_location) {
		var _lo = unsafewin._use_4real_location.split(", ");
		center = new google.maps.LatLng(parseFloat(_lo[0]), parseFloat(_lo[1]));
		zoom=parseInt(_lo[2],10);
		if(ischangeable) {
			$gfs.data("ctlMsg").showSave();
		}
	}

	$gfs.data("map").setCenter(center, zoom);

	var icon = new google.maps.Icon();
	icon.image = pics.marker_img;
	icon.shadow = pics.marker_shw;
	icon.iconSize = new google.maps.Size(79, 89);
	icon.shadowSize = new google.maps.Size(109, 89);
	icon.iconAnchor = new google.maps.Point(40, 89);
	icon.infoWindowAnchor = new google.maps.Point(79, 50);
	icon.imageMap=[0,0,78,0,78,78,49,78,39,88,39,78,0,78];
	icon.transparent=pics.marker_trans;
	icon.label = {url:flickr.iconurl(photo), anchor:new google.maps.LatLng(2,2), size:new google.maps.Size(75,75)};
	this.marker=new google.maps.Marker(center, {icon:icon, zIndexProcess:function(){return 0;}, draggable:ischangeable});
	if(ischangeable) { 
		google.maps.Event.addListener(this.marker, 'drag', this.onMarkerDrag);
		google.maps.Event.addListener(this.marker, 'dragend', this.onMarkerDragend);
	}
	$gfs.data("map").addOverlay(this.marker);
	
	$gfs.data("ctlMsg").setTitle(photo.title._content);
	if(photo.location) {
		$gfs.data("ctlMsg").updateLocationInfo(photo.location, center);
	} else {
		$gfs.data("ctlMsg").updateLocationInfo(center, center);
	}

	this.refreshMap(true);
};
PhotoCtl.prototype.onMapDblclick=function(overlay, latlng) {
	if(!this.marker) return;

	this.marker.setLatLng(latlng);
	this.onMarkerChanged();
};
PhotoCtl.prototype.onMapZoomend=function() {
	if(!this.marker) return;
	$gfs.data("map").clearOverlays();
	$gfs.data("map").addOverlay(this.marker);
	this.refreshMap();
};
PhotoCtl.prototype.onMapDragend=function() {
	if(!this.marker) return;
	var bound=$gfs.data("map").getBounds();
	var center=bound.getCenter();
	var span=bound.toSpan();
	if(this.lastcenter) {
		var dx  = Math.abs(center.lng() - this.lastcenter.lng());
		var dy  = Math.abs(center.lat() - this.lastcenter.lat());
		if ((dx < 0.15*span.lng()) && (dy < 0.15*span.lat())) { return; }
	}
	this.refreshMap();
};
PhotoCtl.prototype.refreshMap=function(nodelay, timestamp) {
	if(!timestamp) {
		this.search_timestamp = new Date().getTime();
		timestamp = this.search_timestamp;
	}
	if(this.search_timestamp !== timestamp) { return; }

	if(!nodelay) {
		setTimeout( function() { $gfs.data("ctlPhoto").refreshMap(true, timestamp); }, 2000);
		return;
	}
	
	this.lastcenter = $gfs.data("map").getCenter();
	
	var bound = $gfs.data("map").getBounds();
	var sw = bound.getSouthWest();
	var ne = bound.getNorthEast();
	var w = sw.lng();
	var e = ne.lng();
	var n = ne.lat();
	var s = sw.lat();
	//if(!this.fullrange) {
		var span = bound.toSpan();
		var wid = span.lng();
		var hig = span.lat();
		w+=wid/5;
		e-=wid/5;
		n-=hig/5;
		s+=hig/5;
		if(w > 180) { w-=360; }
		if(e <= -180) { e+=360; }
		if(e < w) {
			if((180+e) > (180-w)) { w=-180;
			} else { e=180; }
		}
	//}

	var searchOption={extras:'geo,date_upload,date_taken,owner_name,icon_server,license', per_page:200, page:1, accuracy:1};
	searchOption._search_timestamp=this.search_timestamp;
	searchOption.bbox=w+','+s+','+e+','+n;

	searchOption.user_id=this.user_id;

	flickr.callapi('flickr.photos.search', searchOption, this);
	$gfs.data("ctlMsg").showLoading();
};
PhotoCtl.prototype.flickr_photos_search_onLoad=function(success, responseXML, response, params){
	if(this.search_timestamp !== params._search_timestamp) { return; }
	var api=params._api;

	$gfs.data("ctlMsg").clearLoading();

	var rsp= (typeof(response)==='string') ? eval('(' + response + ')') : response;
	if(!api.check(rsp)) { return; }

	if(!this.photos.search_timestamp || this.photos.search_timestamp!==this.search_timestamp) {
		this.photos=[]; // clear previous photo data
		this.photos.search_timestamp=this.search_timestamp;
	}

	api.parse(this.photos,rsp);
	var pgroups = this.groupPhotos();

	var gmap = $gfs.data("map");
	gmap.clearOverlays();
	gmap.addOverlay(this.marker);

	for (var i=0,len=pgroups.length; i<len ; ++i) {
		var pgroup = pgroups[i];
		if(pgroup.photos.length === 0) { continue; }

		if(pgroup.maker) { gmap.removeOverlay(pgroup.maker); }
		pgroup.maker=PhotoGroupMarker.getInstance(pgroup);
		pgroup.maker.setLatLng(pgroup.getCenter());
		gmap.addOverlay(pgroup.maker);
	}
};
PhotoCtl.prototype.groupPhotos=function() {
	var zoom = $gfs.data("map").getZoom();
	var delta=this.deltas[zoom];

	var temp_bounds=[];
	for (var i=0,len=this.photos.length; i<len; ++i) {
		var photo=this.photos[i];
		if(photo.id === this.photo_id) continue;
		var pos = photo.pos;

		var isMerged=false;
		for (var j=0,len2=temp_bounds.length; j<len2; ++j) {
			var b=temp_bounds[j];
			if( b.containsLatLng(pos)) {
				isMerged=true;
				b.photos.push(photo);
				break;
			}
		}
		if(!isMerged) {
			var bb = new google.maps.LatLngBounds(new google.maps.LatLng(pos.lat()-delta, pos.lng()-delta), new google.maps.LatLng(pos.lat()+delta, pos.lng()+delta));
			bb.photos=[photo];
			temp_bounds.push(bb);
		}
	}
	return temp_bounds;
};
PhotoCtl.prototype.onMarkerDrag=function() { // this == marker
	$gfs.data("ctlMsg").updateLocationInfo(null, this.getLatLng());
};
PhotoCtl.prototype.onMarkerDragend=function() { // this == marker
	$gfs.data("ctlPhoto").onMarkerChanged();
};
PhotoCtl.prototype.onMarkerChanged=function() {
	var latlng = this.marker.getLatLng();
	$gfs.data("ctlMsg").updateLocationInfo(latlng, latlng);
	$gfs.data("ctlMsg").showSave();
};
PhotoCtl.prototype.onSearchItemClick=function(lat, lng, zoom) {
	var latlng = new google.maps.LatLng(lat, lng);
	$gfs.data("map").setCenter(latlng, zoom);
	$gfs.data("ctlMsg").updateLocationInfo(latlng, latlng);
	this.refreshMap();
};
PhotoCtl.prototype.onSave=function() {
	if(!confirm("Save Location?")) return;
	
	var latlng = this.marker.getLatLng();
	var zoom = $gfs.data("map").getZoom();
	if(zoom < 1) zoom = 1;
	if(zoom > 16) zoom = 16;

	flickr.callapi('flickr.photos.geo.setLocation', {photo_id:this.photo_id, lat:latlng.lat(), lon:latlng.lng(), accuracy:zoom}, this);
	flickr.callapi('flickr.people.geo.setLocation', {context:"last", lat:latlng.lat(), lon:latlng.lng(), accuracy:zoom});
};
PhotoCtl.prototype.flickr_photos_geo_setLocation_onLoad=function(success, responseXML, responseText, params){
	var rsp = eval('(' + responseText + ')');
	if(rsp.stat != 'ok') {
		alert('Save location failed.\n\n' + rsp.message);
		return;
	}

	$gfs.data("ctlMsg").clearSave();
	alert('Saved.');
};


var MsgCtl=function(){
	$gfs.find('.gfs_savebtn').click(function(){
		if($gfs.ctl && $gfs.ctl.onSave)
			$gfs.ctl.onSave();
	});
};
MsgCtl.prototype.init=function() {
	this.setTitle("");
	this.clearSave();
	this.clearLoading();
};
MsgCtl.prototype.setTitle=function(txt) {
	$gfs.find(".gfs_title").text(txt);
};
MsgCtl.prototype.updateLocationInfo=function(locat, center) {
	if(locat && locat.lat) { // latlng
		$gfs.find('.gfs_loc').text("loading...");
		
		var zoom = $gfs.data("map").getZoom();
		if(zoom < 1) zoom = 1;
		if(zoom > 16) zoom = 16;
		flickr.callapi('flickr.geocode.reverseGeocodePoint', {lat:locat.lat(), lon:locat.lng(), accuracy:zoom}, this);
	} else if(locat) {
		var locname=[];
		var last='';
		var loc = locat.neighbourhood;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		loc = locat.locality;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		loc = locat.county;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		loc = locat.region;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		loc = locat.country;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }

		$gfs.find('.gfs_loc').html(locname.join());
	}
	if(center) {
		$gfs.find(".gfs_lat").text(center.toUrlValue());
	}
};
MsgCtl.prototype.flickr_geocode_reverseGeocodePoint_onLoad=function(success, responseXML, responseText, params){
	var rsp = eval('('+responseText+')');
	if(rsp.stat != 'ok') { return; }
	this.updateLocationInfo(rsp.location, null);
};
MsgCtl.prototype.showSave=function() {
	$gfs.find('.gfs_savebtn').show();
};
MsgCtl.prototype.clearSave=function() {
	$gfs.find('.gfs_savebtn').hide();
};
MsgCtl.prototype.showLoading=function() {
	$gfs.find('.gfs_loading').show();
};
MsgCtl.prototype.clearLoading=function() {
	$gfs.find('.gfs_loading').hide();
};


var SearchCtl=function(){
	this.geocoder = new google.maps.ClientGeocoder();
	$gfs.find('form.gfs_searchform').submit(function(){ try{
		var inp = $gfs.find('input.gfs_searchinput').val();
		$gfs.data("ctlSearch").search(inp);
	} finally { return false; }});
};
SearchCtl.prototype.init=function() {
	$gfs.find('div.gfs_res').empty();
};
SearchCtl.prototype.accuracytozoom=[3,5,7,9,11,13,14,15,16];
SearchCtl.prototype.search=function(text) {
	this.geocoder.getLocations( text, function(rsp){ $gfs.data("ctlSearch").search_callback(rsp); } );
};
SearchCtl.prototype.searchitem_click=function() {
	if($gfs.ctl && $gfs.ctl.onSearchItemClick) $gfs.ctl.onSearchItemClick(this.lat, this.lng, this.zoom);
};
SearchCtl.prototype.search_callback=function(rsp) {
	if(!rsp || !rsp.Status || rsp.Status.code != 200 || !rsp.Placemark) {
		switch(rsp.Status.code) {
			case 400: msg = 'Bad Request!'; break;
			case 500: msg = 'Server Error!'; break;
			case 601: msg = 'Missing Address!'; break;
			case 602: msg = 'Unknown Address!'; break;
			case 603: msg = 'Unavailable Address!'; break;
			case 604: msg = 'Unknown Directions!'; break;
			case 610: msg = 'Bad Key!'; break;
			case 620: msg = 'Too Many Queries!'; break;
			default: msg = 'Unknown Error!'; break;
		}
		alert('Geocode search failed.\n\n' + rsp.message);
		return;
	}
	$gfs.find('div.gfs_res').empty();
	for(var i = 0, n = rsp.Placemark.length; i < n; ++i) {
		var p = rsp.Placemark[i];

		var addr = [];
		var addrdtl = p.AddressDetails;
		while(true) {
			if(!addrdtl) {
				break;
			} else if(addrdtl.Country) {
				if(addrdtl.Country.CountryNameCode) { addr.push(addrdtl.Country.CountryNameCode); }
				addrdtl=addrdtl.Country;
			} else if(addrdtl.AdministrativeArea) {
				if(addrdtl.AdministrativeArea.AdministrativeAreaName) { addr.push(addrdtl.AdministrativeArea.AdministrativeAreaName); }
				addrdtl=addrdtl.AdministrativeArea;
			} else if(addrdtl.SubAdministrativeArea) {
				if(addrdtl.SubAdministrativeArea.SubAdministrativeAreaName) { addr.push(addrdtl.SubAdministrativeArea.SubAdministrativeAreaName); }
				addrdtl=addrdtl.SubAdministrativeArea;
			} else if(addrdtl.Locality) {
				if(addrdtl.Locality.LocalityName) { addr.push(addrdtl.Locality.LocalityName); }
				addrdtl=addrdtl.Locality;
			} else if(addrdtl.Thoroughfare) {
				if(addrdtl.Thoroughfare.ThoroughfareName) { addr.push(addrdtl.Thoroughfare.ThoroughfareName); }
				addrdtl=addrdtl.Thoroughfare;
			} else {
				break;
			}
		}

		addr.reverse();
		var address = '';
		if(p.address) {
			var j = 0;
			for(; j< addr.length; ++j) {
				if( p.address.indexOf(addr[j]) < 0) { break; }
			}
			addr.splice(0,j);
			address = p.address + ' (' + addr.join(', ') + ')';
		} else {
			address = addr.join(', ');
		}

		var a=$('<a class="searchres">'+address+'</a>').click(this.searchitem_click).get(0);
		var pos=p.Point.coordinates;
		a.zoom=this.accuracytozoom[parseInt(p.AddressDetails.Accuracy,10)];
		a.lat=parseFloat(pos[1]);
		a.lng=parseFloat(pos[0]);
		$gfs.find('div.gfs_res').append(a);
	}
};



	CSS_STYLE+=
'div.gfs_win a.gfs_btn      {background:transparent url('+pics.icons+') no-repeat scroll 0px 0px; display:block; text-indent:-999em; cursor:pointer;} '+
'div.gfs_win a.gfs_closebtn {background-position:0px    0px; width:15px; height:15px;} div.gfs_win a.gfs_closebtn:hover {background-position:-15px    0px; width:15px; height:15px;} '+
'div.gfs_win a.gfs_savebtn  {background-position:0px  -15px; width:50px; height:50px;} '+
'div.gfs_win a.gfs_loading  {background-position:0px  -65px; width:50px; height:50px;} '+
'div.gfs_win div.gfs_loc a {text-decoration:none;} '+
'div.gfs_win div.gfs_res a.searchres {display:block; padding:5px 0; border-bottom:1px dotted black;} '+
'div.gfs_win div.gfs_res a.photores {display:block; padding:5px 0; text-align:center;} '+
'';

	var gfsstr=
'<div id="gfs" style="position:absolute; width:100%; height:100%; z-index:90000; display:none;">'+
	'<div class="gfs_blocker" style="position:absolute; width:100%; height:100%; top:0px; left:0px; background-color:rgb(153, 153, 153); opacity:0.5;"></div>'+
	'<div class="gfs_win" style="position:relative; width:800px; height:600px; margin:20px auto; border:solid 5px gray; background-color:white;">'+
		'<div class="gfs_topbar" style="position:absolute; width:100%; height:30px; top:0px;"><div class="gfs_title" style="position:absolute; left:6px; top:5px; font:normal bold 14pt sans-serif; color:#FF0084;"></div></div>'+
		'<a   class="gfs_closebtn gfs_btn" style="position:absolute; right:12px; top:6px;" title="Close"></a>'+
		'<div class="gfs_map" style="position:absolute; width:670px; height:540px; top:30px;"></div>'+
		'<div class="gfs_panel" style="position:absolute; width:120px; height:540px; right:3px; top:30px;">'+
			'<a class="gfs_loading gfs_btn" style="position:absolute; left:3px; top:3px;" title="Loading"></a>'+
			'<a class="gfs_savebtn gfs_btn" style="position:absolute; right:12px; top:6px;" title="Save"></a>'+
			'<div class="gfs_search" style="position:absolute; width:100%; top:60; text-align:left;"> Search:'+
				'<form class="gfs_searchform" style="display:inline;"><input class="gfs_searchinput" style="width:100%;"></input> <input type="submit"></input></form>'+
			'</div>'+
			'<div class="gfs_res" style="position:absolute; width:100%; height:400px; top:130px;  text-align:left; overflow:auto;"></div>'+
		'</div>'+
		'<div class="gfs_bottombar" style="position:absolute; width:100%; height:30px; bottom:0px;">'+
			'<div class="gfs_loc" style="position:absolute; width:80%; height:30px; left:10px; text-align:left; line-height:30px;"></div>'+
			'<div class="gfs_lat" style="position:absolute; width:20%; height:30px; right:5px; text-align:right; font:italic normal 10pt arial; line-height:30px;"></div>'+
		'</div>'+
	'</div>'+
'</div>';

	$gfs = $(gfsstr).prependTo(document.body);
	GM_addStyle(CSS_STYLE);

	$gfs.data("ctlPhoto", new PhotoCtl());
	$gfs.data("ctlMsg", new MsgCtl());
	$gfs.data("ctlSearch", new SearchCtl());

	$gfs.find("a.gfs_closebtn").click(function(){ $gfs.fadeOut("fast"); });
	var gmap = new google.maps.Map2($gfs.find("div.gfs_map").get(0));
	google.maps.Event.addListener(gmap, "zoomend", function(){ if($gfs.ctl && $gfs.ctl.onMapZoomend) $gfs.ctl.onMapZoomend.apply($gfs.ctl, arguments); });
	google.maps.Event.addListener(gmap, "dragend", function(){ if($gfs.ctl && $gfs.ctl.onMapDragend) $gfs.ctl.onMapDragend.apply($gfs.ctl, arguments); });
	google.maps.Event.addListener(gmap, "dblclick", function(){ if($gfs.ctl && $gfs.ctl.onMapDblclick) $gfs.ctl.onMapDblclick.apply($gfs.ctl, arguments); });
	gmap.enableScrollWheelZoom();
	gmap.enableContinuousZoom();
	gmap.addMapType(google.maps.PHYSICAL_MAP);
	gmap.addControl(new google.maps.HierarchicalMapTypeControl());
	gmap.addControl(new google.maps.LargeMapControl());
	gmap.addControl(new google.maps.OverviewMapControl());
	$gfs.data("map", gmap);

	function global_onWindowResizeScroll() {
		$gfs.css({top:unsafewin.pageYOffset, left:unsafewin.pageXOffset});
	}
	$(window).unload(google.maps.Unload).resize(global_onWindowResizeScroll).scroll(global_onWindowResizeScroll);
	global_onWindowResizeScroll();
}

function checknewversion() {
try {
	if (!GM_getValue) return;
	var DOS_PREVENTION_TIME = 2*60*1000;
	var isSomeoneChecking = GM_getValue('CHECKING', null);
	var now = new Date().getTime();
	GM_setValue('CHECKING', now.toString());
	if (isSomeoneChecking && (now - parseInt(isSomeoneChecking,10)) < DOS_PREVENTION_TIME) return;

	// check daily
	var ONE_DAY = 24*60*60*1000;
	var lastChecked = GM_getValue('LAST_CHECKED', null);
	if (lastChecked && (now - lastChecked) < ONE_DAY) return;

	GM_xmlhttpRequest({
		method: 'GET',
		url: SCRIPT.identifier + '?source',
		onload: function(result) {
			if (!result.responseText.match(/@version\s+([\d.]+)/)) return;     // did not find a suitable version header
			var theOtherVersion = parseFloat(RegExp.$1);
			if (theOtherVersion <= parseFloat(SCRIPT.version)) return;      // no updates or older version on userscripts.orge site
			if (confirm('A new version ' + theOtherVersion + ' of userscript "' + SCRIPT.name + '" is available.\nYour installed version is ' + SCRIPT.version + ' .\n\nUpdate now?\n')) {
				GM_openInTab(SCRIPT.identifier);
			}
		}
	});
	GM_setValue('LAST_CHECKED', now.toString());
} catch (ex) {
}}



function is_preload_ok() {
	if( is_preload_ok.ok) return true;

	if(unsafewin.jQuery && google && google.maps && google.maps.Map2 && google.maps.Unload ) {
		is_preload_ok.ok = true;
		$ = unsafewin.jQuery;
		return true;
	}
	return false;
}

function launch() {
	if(!launch.init) {
		launch.init = true;

		var loading = document.createElement("img");
		loading.setAttribute("src", libs_loading);
		this.appendChild(loading);

		if(!is_preload_ok()) {
			var k = map_key[location.hostname];
			if(!k) { alert("Not support This host, please contact: "+SCRIPT.author); return false; }
			loadscript(js_gmap+k,function(){
				unsafewin.grab_win = (function(w) { google=w.google; }); // unsafe!!, pass real window to sandbox...
				location.href = "javascript:void(window.grab_win(window));"; // call
				unsafewin.google.load("jquery", "1.2");
				unsafewin.google.load("maps", "2", {"language":unsafewin.navigator.language});
			});
		}

		var lnk = this;
		(function() {
			if(!is_preload_ok())
				return window.setTimeout(arguments.callee, 100);

			setTimeout(function(){ checknewversion(); }, 0);

			//prepare_pics();
			init_libs();
			launch.call(lnk, null);
			$(loading).remove();
		})();
		return;
	}

	if(!is_preload_ok()) {
		return false;
	}

	var opt = {photo_id:this.getAttribute("photo_id"), user_id:this.getAttribute("user_id"), group_id:this.getAttribute("group_id"), photoset_id:this.getAttribute("photoset_id")};
	if(opt.photo_id) {
		$gfs.ctl = $gfs.data("ctlPhoto");
		$gfs.ctl.init();
		$gfs.fadeIn("fast");
		$gfs.data("map").setCenter(new google.maps.LatLng(0, 0), 2);
		$gfs.data("map").checkResize();
		$gfs.data("map").setCenter(new google.maps.LatLng(0, 0));

		$gfs.data("ctlPhoto").loadLocation(opt);
	}
}

function init() {
	var re_url_photo = /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/(\d+)(?:\/.*)?$/;
	var re_url_user  = /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)(?:\/.*)?$/;

	var re_photo_map_link = /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/(\d+)\/map(?:\/.*)?$/;

	function parseLink(p, exp) {
		if(!p) { return; }
		var lnks = p.getElementsByTagName('a');
		for(var ln in lnks) {
			var maplnk = lnks[ln];
			if(maplnk.href && exp.exec(maplnk.href)) {
				maplnk.setAttribute('onclick','return false;');
				maplnk.addEventListener('click',launch,false);
				return maplnk;
			}
		}
	}
	function parsePhotoMap(p) {
		var maplnk = parseLink(p, re_photo_map_link);
		if(maplnk) {
			maplnk.setAttribute('photo_id',RegExp.$2);
			maplnk.setAttribute("type","edit");
		}
	}

	if( re_url_photo.exec(location.href)) {
		var span = document.getElementById("div_taken_in_links");
		if(span) {
			var lnks = span.getElementsByTagName("a");
			if(lnks[0]) {
				lnks[0].setAttribute("photo_id",RegExp.$2);
				lnks[0].setAttribute("onclick","return false;");
				lnks[0].addEventListener("click",launch,false);
			}
			if(lnks[1]) {
				lnks[1].setAttribute("photo_id",RegExp.$2);
				lnks[1].setAttribute("onclick","return false;");
				lnks[1].addEventListener("click",launch,false);
			}
		}
	} else if( re_url_user.exec(location.href)) {
		var paras = document.getElementsByTagName('p');
		for(pp in paras) {
			paras[pp].className === 'Do' && parsePhotoMap(paras[pp]);
		}
	}
}

init();

})();

