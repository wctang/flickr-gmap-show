// GeoPhotoShow
// Copyright (c) 2008, Tang Wei-Ching.
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html


(function() {

var PER_PAGE = 100;
var google=window.google;
var $=window.$;

var imgdir = 'http://flickr-gmap-show.googlecode.com/svn/trunk/pics/';
var pics = {
	flickr_loading  : imgdir+'flickr_loading.gif',
	marker_img      : imgdir+'marker_image.png',
	marker_shw      : imgdir+'marker_shadow.png',
	marker_trans    : imgdir+'marker_transparent.png',
	marker_mov      : imgdir+'marker_image_moved.png',
	loading         : imgdir+'loading.gif',
	icons           : imgdir+'icons.png?v=2.9',
	icon1           : imgdir+'icon1.png',
	icon2           : imgdir+'icon2.png',
	icon3           : imgdir+'icon3.png',
	bar_loading     : imgdir+'bar_loading.gif',
	infobg_flickr   : imgdir+'infobg_flickr.jpg',
	infobg_picasa   : imgdir+'infobg_picasa.jpg',
	infobg_panoramio: imgdir+'infobg_panoramio.jpg'
};

$.each(pics, function() { $("<img>").attr("src", this); });

var msg={
		'close': 'Close',
		'maxrestore': 'Maxize/Restore',
		'about': 'About',
		'youcando': 'You can do...',
		'loadlastlocation': 'Load last location',
		'savelocation': 'Save location',
		'removelocation': 'Remove location',
		'searchlocation': 'Search location',
		'getembedlink': 'Get Embedded Link',
		'showhide': 'Show/Hide',
		'pagefrst': 'First Page',
		'pagelast': 'Last Page',
		'pageprev': 'Previous Page',
		'pagenext': 'Next Page',
		'loading': 'Loading',
		'opt_all': 'All your photos',
		'opt_not_tagged': 'Your non-tagged photos',
		'opt_not_in_set': 'Your photos not in a set',
		'opt_located': 'Your geotagged photos',
		'opt_not_located': 'Your non-geotagged photos',
		'opt_set': 'Your sets',
		'opt_group': 'Your groups',
		'date_date': 'Date',
		'date_lastmonth': 'Last Month',
		'date_lastweek': 'Last Week',
		'date_yesterday': 'Yesterday',
		'date_all': 'All Time',
		'month_all': 'All',
		'day_all': 'All',
		'sort_sort': 'Sort',
		'sort_interestingness_desc': 'Interestingness',
		'sort_interestingness_asc': 'Interestingness, less-first',
		'sort_date_taken_desc': 'Date taken',
		'sort_date_taken_asc': 'Date taken, older-first',
		'sort_date_posted_desc': 'Date posted',
		'sort_date_posted_asc': 'Date posted, older-first',
		'sort_relevance': 'Relevance',
		'search': 'Search',
		'clearsel': 'Clear selection',
		'photos': 'photos',
		'selected': 'selected'
	};



function loadscript(jspath,id,loaded) {
	var s=document.createElement('script');
	s.setAttribute('type','text/javascript');
	s.setAttribute('src',jspath);
	if(id) { s.id = id; }
	if(loaded) {
		s.addEventListener('readystatechange', function(){if(this.readyState==='complete') { loaded(); }}, false);
		s.addEventListener('load', loaded, false);
	}
	document.getElementsByTagName('head')[0].appendChild(s);
}

var btnbackgnd = 'background:transparent url('+pics.icons+') no-repeat scroll ';
var CSS_STYLE=
'div.flickrgmapshow a.btn {display:block; cursor:pointer;} '+
'div.flickrgmapshow a.closebtn,a.maxbtn,a.searchbtn,a.actionbtn,a.embedbtn,a.aboutbtn,a.updnbtn,a.prevbtn,a.nextbtn,a.trkbtn {display:block;width:15px;height:15px; text-indent:-999em; cursor:pointer;} '+
'div.flickrgmapshow a.p_btn,a.r_btn   {display:block;height:48px;width:25px; text-indent:-999em; cursor:pointer;} '+
'div.flickrgmapshow a.pp_btn,a.rr_btn {display:block;height:32px;width:25px; text-indent:-999em; cursor:pointer;} '+
'div.flickrgmapshow a.closebtn  {'+btnbackgnd+' 0px    0px;} div.flickrgmapshow a.closebtn:hover  {'+btnbackgnd+' -15px    0px;} '+
'div.flickrgmapshow a.maxbtn    {'+btnbackgnd+' 0px  -15px;} div.flickrgmapshow a.maxbtn:hover    {'+btnbackgnd+' -15px  -15px;} '+
'div.flickrgmapshow a.searchbtn {'+btnbackgnd+' 0px  -30px;} div.flickrgmapshow a.searchbtn:hover {'+btnbackgnd+' -15px  -30px;} '+
'div.flickrgmapshow a.actionbtn {'+btnbackgnd+' 0px  -45px;} div.flickrgmapshow a.actionbtn:hover {'+btnbackgnd+' -15px  -45px;} '+
'div.flickrgmapshow a.embedbtn  {'+btnbackgnd+' 0px  -60px;} div.flickrgmapshow a.embedbtn:hover  {'+btnbackgnd+' -15px  -60px;} '+
'div.flickrgmapshow a.aboutbtn  {'+btnbackgnd+' 0px  -75px;} div.flickrgmapshow a.aboutbtn:hover  {'+btnbackgnd+' -15px  -75px;} '+
'div.flickrgmapshow a.updnbtn   {'+btnbackgnd+' 0px  -90px;} div.flickrgmapshow a.updnbtn:hover   {'+btnbackgnd+' -15px  -90px;} '+
'div.flickrgmapshow a.prevbtn   {'+btnbackgnd+' 0px -105px;} div.flickrgmapshow a.prevbtn:hover   {'+btnbackgnd+' -15px -105px;} '+
'div.flickrgmapshow a.nextbtn   {'+btnbackgnd+' 0px -120px;} div.flickrgmapshow a.nextbtn:hover   {'+btnbackgnd+' -15px -120px;} '+
'div.flickrgmapshow a.trkbtn    {'+btnbackgnd+' 0px -135px;} div.flickrgmapshow a.trkbtn:hover    {'+btnbackgnd+' -15px -135px;} '+
'div.flickrgmapshow a.p_btn     {'+btnbackgnd+' 0px -150px;} div.flickrgmapshow a.p_btn:hover     {'+btnbackgnd+' -25px -150px;} '+
'div.flickrgmapshow a.pp_btn    {'+btnbackgnd+' 0px -198px;} div.flickrgmapshow a.pp_btn:hover    {'+btnbackgnd+' -25px -198px;} '+
'div.flickrgmapshow a.r_btn     {'+btnbackgnd+' 0px -230px;} div.flickrgmapshow a.r_btn:hover     {'+btnbackgnd+' -25px -230px;} '+
'div.flickrgmapshow a.rr_btn    {'+btnbackgnd+' 0px -278px;} div.flickrgmapshow a.rr_btn:hover    {'+btnbackgnd+' -25px -278px;} '+
'div.flickrgmapshow div.panelwrapper div.content img.flickr    {border:1px solid red;} '+
'div.flickrgmapshow div.panelwrapper div.content img.panoramio {border:1px solid blue;} '+
'div.flickrgmapshow div.panelwrapper div.content img.picasa    {border:1px solid orange;} '+
'';



var flickr_key = '79eb664e9e18f4ea52dcd5c120701f1e';
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
			default: return '<span style="font-size: 12px;">&copy;</span> All rights reserved';
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
var picasa={
	name:'picasa',
	check: function(rsp) { return true; },
	parseCurrPage: function(rsp) { return 0; }, // TODO
	parseTotalPage: function(rsp) { return Math.ceil(parseInt(rsp.feed.gphoto$crowded_length.$t,10)/PER_PAGE); },
	parse: function(photos,rsp) {
		if(!rsp.feed.entry) { return; }
		for (var i=0,len=rsp.feed.entry.length; i<len; i++) {
			var p=rsp.feed.entry[i];
			var w=p.georss$where.gml$Point.gml$pos.$t.split(/\s+/);
			w[0]=parseFloat(w[0]); w[1]=parseFloat(w[1]);
			if(!w[0] && !w[1]) { continue; }

			var pp={api:picasa, id:parseInt(p.gphoto$id,10), title:p.title.$t, pos:new google.maps.LatLng(w[0],w[1]), accuracy:12, linkurl:p.link[1].href, content:p.content.src, owner:p.author[0].name.$t, owner_url:p.author[0].uri.$t, buddyurl:p.author[0].gphoto$thumbnail.$t, date:p.published.$t};
			photos.push(pp);
		}
	},
	gettitle: function(photo) {return photo.title;},
	smalliconurl: function(photo) { return photo.content+'?imgmax=32&crop=1'; },
	iconurl: function(photo) { return photo.content+'?imgmax=72&crop=1'; },
	thumburl: function(photo) { return ''; },
	smallurl: function(photo) { return photo.content+'?imgmax=200'; }, // or 288
	mediumurl: function(photo) { return ''; },
	largeurl: function(photo) { return ''; },
	pageurl: function(photo) { return photo.linkurl; },
	placeurl: function(placeid) { return ''; },
	owner: function(photo) { return photo.owner; },
	ownerurl: function(photo) { return photo.owner_url; },
	datetaken: function(photo) { return photo.date; },
	datetakenurl: function(photo) { return ''; },
	dateupload: function(photo) { return ''; },
	dateuploadurl: function(photo) { return ''; },
	buddyurl: function(photo) { return photo.buddyurl; },
	licensestr: function(photo) { return ''; },
	_url: function(args, sign) {
		var url = 'http://picasaweb.google.com/data/feed/api/all?kind=photo&';
		var keys = [];
		for (var arg in args) { if(args.hasOwnProperty(arg)) {
			if(arg.charAt(0)==='_') continue;
			keys.push(arg);
		}}
		keys.sort();

		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			var v = args[k];
			url = url + (i>0?'&':'') + escape(k) + '=' + escape(v);
		}
		return url;
	},
	callapi: function(methodname, searchopts, obj) {
		var cb_id='cb'+this.name+(new Date()).getTime();
		searchopts._api=picasa;
		searchopts.alt='json-in-script';
		searchopts.callback=cb_id;
		window[cb_id]=function(rsp){obj[methodname.replace(/\./g,'_')+'_onLoad'].call(obj,true,null,rsp,searchopts); window[cb_id]=null; $('script#'+cb_id).remove();};
		loadscript(this._url(searchopts), cb_id);
	}
};
var panoramio={
	name:'panoramio',
	check: function(rsp) { return true; },
	parseCurrPage: function(rsp) { return 0; }, // TODO
	parseTotalPage: function(rsp) { return Math.ceil(rsp.count/PER_PAGE); },
	parse: function(photos,rsp) {
		for (var i=0,len=rsp.photos.length; i<len; i++) {
			var photo=rsp.photos[i];
			var lat=parseFloat(photo.latitude);
			var lon=parseFloat(photo.longitude);
			if(!lat && !lon) { continue; }

			photo.pos=new google.maps.LatLng(lat, lon);
			photo.accuracy=12;
			photo.api=panoramio;
			photos.push(photo);
		}
	},
	gettitle: function(photo) { return photo.photo_title; },
	smalliconurl: function(photo) { return 'http://static.bareka.com/photos/mini_square/'+photo.photo_id+'.jpg'; }, //mini_square:32x32
	iconurl: function(photo) { return 'http://static.bareka.com/photos/square/'+photo.photo_id+'.jpg'; }, //square:60x60
	thumburl: function(photo) { return 'http://static.bareka.com/photos/thumbnail/'+photo.photo_id+'.jpg'; }, //thumbnail:max100
	smallurl: function(photo) { return 'http://static.bareka.com/photos/small/'+photo.photo_id+'.jpg'; }, //small:max240
	mediumurl: function(photo) { return 'http://static.bareka.com/photos/medium/'+photo.photo_id+'.jpg'; },  //medium:max500
	largeurl: function(photo) { return 'http://static.bareka.com/photos/original/'+photo.photo_id+'.jpg'; }, //original
	pageurl: function(photo) { return photo.photo_url; },
	placeurl: function(placeid) { return ''; },
	owner: function(photo) { return photo.owner_name; },
	ownerurl: function(photo) { return photo.owner_url; },
	datetaken: function(photo) { return photo.upload_date; },
	datetakenurl: function(photo) { return ''; },
	dateupload: function(photo) { return ''; },
	dateuploadurl: function(photo) { return ''; },
	buddyurl: function(photo) { return null; },
	licensestr: function(photo) { return ''; },
	_url: function(args, sign) {
		var url = 'http://www.panoramio.com/map/get_panoramas.php?';
		var keys = [];
		for (var arg in args) { if(args.hasOwnProperty(arg)) {
			if(arg.charAt(0)==='_') continue;
			keys.push(arg);
		}}
		keys.sort();
		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			var v = args[k];
			url = url + (i>0?'&':'') + escape(k) + '=' + escape(v);
		}
		return url;
	},
	callapi: function(methodname, searchopts, obj) {
		var cb_id='cb'+this.name+(new Date()).getTime();
		searchopts._api=panoramio;
		searchopts.callback=cb_id;
		window[cb_id]=function(rsp){obj[methodname.replace(/\./g,'_')+'_onLoad'].call(obj,true,null,rsp,searchopts); window[cb_id]=null; $('script#'+cb_id).remove();};
		loadscript(this._url(searchopts), cb_id);
	}
};

//var hq23={}; // not support geo search yet... http://www.23hq.com/forums/message-view?message_id=1714420
//var mappeo={}; // http://mappeo.net/welcome/api

var mymap = {};

function init() {
	if(arguments.callee.inited) { return; }

function extend(Constructor,Parent) {
	var Inh=function(){}; Inh.prototype=Parent.prototype; Constructor.prototype=new Inh();
	Constructor.prototype.constructor=Constructor; Constructor.superconstructor=Parent;
}

// PhotoGroupMarker

CSS_STYLE+=
'div.flickrgmapshow div.markerlabel {text-align:center; vertical-align:middle; font-size:small; cursor:pointer;} '+
'div.flickrgmapshow div.markerlabel:hover {color:white; font-weight:bold;} '+
'div.flickrgmapshow div.markerinfowin a {text-decoration:none;} '+
'div.flickrgmapshow div.markerinfowin a:hover {text-decoration:underline;} '+
'div.flickrgmapshow div.markerinfowin img {border-width:0px;} '+
'div.flickrgmapshow div.markerinfowin.flickr {background:transparent url('+pics.infobg_flickr+') no-repeat scroll bottom right;} '+
'div.flickrgmapshow div.markerinfowin.picasa    {background:transparent url('+pics.infobg_picasa+') no-repeat scroll bottom right;} '+
'div.flickrgmapshow div.markerinfowin.panoramio {background:transparent url('+pics.infobg_panoramio+') no-repeat scroll bottom right;} ';

var PhotoGroupMarker=function(latlng,opts){ // called when created
	arguments.callee.superconstructor.apply(this, arguments);
	this.photos=this.showpanel=null;
	this.iconsize = this.getIcon().iconSize;

	google.maps.Event.addListener(this, 'click', this.onClick);
	this.$div=$('<div class="markerlabel" style="position:absolute;"></div>').width(this.iconsize.width-2).height(this.iconsize.height-2).click(this.onClick);
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
		arguments.callee.i1=PhotoGroupMarker.ic(pics.icon1, 18, 19, 9, 9, 9, 9);
		arguments.callee.i2=PhotoGroupMarker.ic(pics.icon2, 20, 21,10,10,10,10);
		arguments.callee.i3=PhotoGroupMarker.ic(pics.icon3, 26, 27,13,13,13,13);
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
	this.$div.css({left:(this.pos.x-this.iconsize.width/2), top:((this.pos.y-this.iconsize.height/2)+(this.iconsize.height-18)/2),zIndex:this.zidx+1});
};
PhotoGroupMarker.prototype.onClick=function(){
	var marker=this.marker||this;
	if(marker.gmap && marker.gmap.onMarkerClick) { marker.gmap.onMarkerClick(marker,marker.photos); }
};
PhotoGroupMarker.prototype.showpanelstr =
'<div class="markerinfowin" style="width:505px;height:290px;">'+
	'<a class="title" style="position:absolute;left:0px;top:0px; font-size:large;" target="_blank"></a>'+
	'<div class="map" style="position:absolute;left:5px;top:30px; width:240px;height:180px; border:solid 1px gray; overflow:hidden;"></div>'+
	'<div style="position:absolute;left:5px;top:220px;width:240px; font-size:small;">'+
		'<a class="authicn" target="_blank"><img class="authimg" style="float:left; margin-right:5px;"></img></a>'+
		' Posted by:<br>'+
		'<a class="authlnk" target="_blank"></a><br>'+
		' Taken on <a class="takendatelnk" target="_blank"></a><br>'+
//		' Uploaded on <a class="uploaddatelnk" target="_blank"></a>'+
	'</div>'+
	'<span class="license" style="position:absolute;left:5px;top:270px; line-height:15px; font-size:small;"></span>'+

	'<div style="position:absolute;left:260px;top:30px; width:240px;height:240px; text-align:center;">'+
		'<a class="photoimg" target="_blank"></a>'+
	'</div>'+
'</div>';
PhotoGroupMarker.prototype.showInfoWindow=function(idx){
	var photo = this.photos[idx];
	var showpanel=this.showpanel;
	if(!showpanel){
		showpanel=$(this.showpanelstr).get(0);
		this.showpanel=showpanel;
	}
	var $showpanel=$(showpanel);
	if(this.gmap.getInfoWindow().isHidden()) {
		this.openInfoWindow(showpanel, {suppressMapPan:false});
		var mapdiv = $showpanel.find('div.map').get(0);
		var map = new google.maps.Map2(mapdiv);
		map.addControl(new google.maps.SmallZoomControl());
		map.setCenter(photo.pos, photo.accuracy);
		map.marker=new google.maps.Marker(photo.pos);
		map.addOverlay(map.marker);
		showpanel.map=map;
	} else {
		showpanel.map.setCenter(photo.pos, photo.accuracy);
		showpanel.map.marker.setLatLng(photo.pos);
	}
	
	if(!this.gmap.isRegMaptypeHandler) {
		this.gmap.isRegMaptypeHandler=true;
		google.maps.Event.addListener(this.gmap, 'maptypechanged', function() {
			var infowin=this.getInfoWindow();
			if(infowin && !infowin.isHidden()) {
				var ctnr=infowin.getContentContainers();
				if(ctnr[0] && ctnr[0].firstChild && ctnr[0].firstChild.map) {
					ctnr[0].firstChild.map.setMapType(this.getCurrentMapType());
				}
			}
		});
	}

	showpanel.className='markerinfowin';
	var href=photo.api.pageurl(photo);
	$showpanel.addClass(photo.api.name);
	$showpanel.find('a.title').attr('href',href).text(photo.api.gettitle(photo));
	$showpanel.find('a.authicn').attr('href',photo.api.ownerurl(photo));
	$showpanel.find('img.authimg').attr('src',photo.api.buddyurl(photo));
	$showpanel.find('a.authlnk').attr('href',photo.api.ownerurl(photo)).text(photo.api.owner(photo));
	$showpanel.find('a.takendatelnk').text(photo.api.datetaken(photo)).attr('href',photo.api.datetakenurl(photo));
//	$showpanel.find('a.uploaddatelnk').text(photo.api.dateupload(photo)).attr('href',photo.api.dateuploadurl(photo));
	$showpanel.find('span.license').html(photo.api.licensestr(photo));
	$showpanel.find('a.photoimg').attr('href',href).empty().append('<img src="'+photo.api.smallurl(photo)+'"></img>');

	var buddy=photo.api.buddyurl(photo);
	if(buddy) { $showpanel.find('img.authimg').show().attr('src',buddy); }
	else { $showpanel.find('img.authimg').hide(); }
};
PhotoGroupMarker.prototype.deleteAllGeoInfo=function(){
	if (confirm('Delete all photo\'s location information here?\n')) {
		var marker=this;
		var photos = marker.photos;
		var delids = [];
		for(var i = 0, len = photos.length; i < len; ++i) {
			delids.push(photos[i].id);
		}

		flickr.callapi('flickr.photos.geo.removeLocation', {photo_ids:delids}, function(success, responseXML, responseText, params){
			if(marker.gmap.refreshView) marker.gmap.refreshView(true);
		});
	}
};


// PanelControl
CSS_STYLE+=
'div.flickrgmapshow div.panelwrapper div.background {background-color:white; opacity:.75;-moz-opacity:.75;filter:alpha(opacity=75);} '+
'div.flickrgmapshow div.panelwrapper div.content img {top:6px; width:75px; height:75px; cursor:pointer; border:1px solid gray; background:transparent url('+pics.loading+') no-repeat scroll right bottom; } '+
'div.flickrgmapshow div.panelwrapper div.content img.selected {top:1px; border-bottom:3px solid #FF8888;} '+
'div.flickrgmapshow div.panelwrapper div.barloading {background:transparent url('+pics.bar_loading+') repeat-x scroll left top;} '+
'div.flickrgmapshow div.panelwrapper.small div.content img { margin-left:20px; width:32px; height:32px; } '+
'div.flickrgmapshow div.panelwrapper div.smallshow img {background:transparent url('+pics.loading+') no-repeat scroll center center; } ';

var PanelControl=function(){
	this.wait={};

	this.imgs=[];
	this.photos=null;

	var panelstr=
'<div class="panelwrapper" style="right:130px;height:150px;">'+
	'<div class="background" style="position:absolute;top:0px;right:0px;bottom:0px;left:0px;"></div>'+
	'<div class="toppanel">'+
		'<a class="updnbtn" title="Search Option..." style="position:absolute;top:5px;left:5px;"></a>'+
		'<div class="pagebarctnr" style="position:absolute;top:5px;left:25px;right:5px; height:15px; overflow:hidden;">'+
			'<div class="pagebartotal" style="position:absolute; left:0px;right:0px; top:2px; bottom:2px; background-color:#DDDDDD; cursor:pointer;"></div>'+
			'<div class="pagebar" style="position:relative; height:15px; width:120px; text-align:center; line-height:15px; background-color:#8888FF;"><span class="info" style="font:14px arial;">Loading...</span></div>'+
		'</div>'+
	'</div>'+
	'<div class="smallshow" style="position:absolute;width:250px;height:260px;left:0px;bottom:60px; display:none; background-color:white;">'+
		'<a class="closebtn" style="position:absolute;right:3px;top:3px;" title="'+msg.close+'"></a>'+ // close btn
		'<img class="smallshowimg" style="margin:15px 5px 5px 5px; width:240px; height:240px;"></img>'+
	'</div>'+
	'<div class="subpanel" style="position:absolute; left:0px;right:0px;bottom:0px;height:100px; overflow:hidden;">'+
		'<div style="position:absolute;left:26px;right:26px; top:5px;height:10px; overflow:hidden; display:none;">'+
			'<div class="progresstotal" style="position:absolute; left:0px;right:0px; top:2px; bottom:2px; background-color:#DDDDDD; cursor:pointer;"></div>'+
			'<div class="progressbar" style="position:relative; height:10px; background-color:#8888FF;"></div>'+
		'</div>'+
		'<div class="contentwrap" style="position:absolute;left:26px;right:26px;top:15px;height:85px; overflow:hidden;">'+
			'<div class="content" style="position:absolute;top:0px; height:85px; overflow:hidden;"></div>'+
		'</div>'+
		'<a class="pp_btn" style="position:absolute;left:0px;top:63px;" title="'+msg.pagefrst+'"></a>'+
		'<a class="p_btn" style="position:absolute;left:0px;top:15px;" title="'+msg.pageprev+'"></a>'+
		'<a class="r_btn" style="position:absolute;right:0px;top:15px;" title="'+msg.pagenext+'"></a>'+
		'<a class="rr_btn" style="position:absolute;right:0px;top:63px;" title="'+msg.pagelast+'"></a>'+
	'</div>'+
'</div>';
	var $panel=$(panelstr);
	this.$panel=$panel;

	var ctrl=this;

	$panel.find('a.pp_btn').click(function(){ ctrl.slide(-Infinity); });
	$panel.find('a.p_btn' ).click(function(){ ctrl.slide(-1); });
	$panel.find('a.r_btn') .click(function(){ ctrl.slide(1); });
	$panel.find('a.rr_btn').click(function(){ ctrl.slide(Infinity); });

	var $progressbar=$panel.find('div.progressbar');
	var progressbar=$progressbar.get(0);
	$.setDragable(progressbar,{direction:'horizontal',boundbyparent:true},null,null,function(e) {
		var bw=$progressbar.width();
		var cw=$progressbar.parent().width();
		var lef=parseInt($progressbar.css('left'),10);
		if(lef === 0 && lef+bw === cw) { return;
		} else if(lef === 0) { ctrl.slide(-Infinity);
		} else if(lef+bw === cw) { ctrl.slide(Infinity);
		} else { ctrl.slide(0, lef, bw, cw); }
	});
	$panel.find('div.progresstotal').click(function(e) {
		var ofst=$progressbar.offset();
		if(e.clientX < ofst.left) {
			ctrl.slide(-1);
		} else if(e.clientX > ofst.left+$progressbar.width()) {
			ctrl.slide(1);
		}
	});


	$panel.find('div.smallshow').find('a.closebtn').click(function(){
		$panel.find('div.smallshow').fadeOut();
	});	

	// click photo...
	$panel.find('div.content').click(function(e){
		if(e.target.tagName != 'IMG') return;
		e.stopPropagation();
		ctrl.onPhotoClick(e.target);
	});
};
PanelControl.prototype=new google.maps.Control();
PanelControl.prototype.getDefaultPosition=function(){ return new google.maps.ControlPosition(google.maps.ANCHOR_BOTTOM_LEFT, new google.maps.Size(10, 15)); };
PanelControl.prototype.initialize=function(map){
	this.gmap=map;
	var panel=this.$panel.get(0);
	map.getContainer().appendChild(panel);
	this.show(false);
	return panel;
};
PanelControl.prototype.show=function(isshow){
	if($(this.gmap.getContainer()).height() < 450) {
		this.$panel.addClass('small');
	} else {
		this.$panel.removeClass('small');
	}
	if(isshow) {
		this.$panel.find('div.toppanel').hide();
		if(this.$panel.hasClass('small')) {
			this.$panel.find('div.subpanel').height(60).show();
			this.$panel.animate({'height':60});
		} else {
			this.$panel.find('div.subpanel').height(100).show();
			this.$panel.animate({'height':100});
		}
	} else {
		this.$panel.find('div.toppanel').show();
		this.$panel.find('div.subpanel').hide();
		this.$panel.animate({'height':25});
		this.$panel.find('div.smallshow').find('a.closebtn').click();
	}
};
PanelControl.prototype.setPhotos=function(photos){
	this.pagestoload=null; // disable more loading
	this.photos=photos;
	photos.show_idx=photos.show_idx||0;
	photos.sel_idx=photos.sel_idx||0;

	this.total=photos.length;

	if(photos.length > 1) {
		this.show(true);
	}

	this.prepareImage(0, photos);

	this.slide(0);

	this.onPhotoClick(this.imgs[photos.sel_idx]);
};
PanelControl.prototype.prepareImage=function(startidx,photos){
	var content=this.$panel.find('div.content').width(this.total*79).get(0);
	for(var i=0; i<photos.length; ++i) {
		var idx=startidx+i;
		var photo=photos[i];
		var img=this.imgs[idx];
		if(!img) {
			img=this.imgs[idx]=$('<img style="position:absolute;"></img>').css('left',idx*79+1).appendTo(content).get(0);
			img.idx=idx;
		}
		img.photo=photo;
		photo.img=null;
		this.photos[idx]=photo;
		$(img).attr({title:'Loading...',src:pics.marker_trans});
	}
};
PanelControl.prototype.slide=function(dif,left,barwid,bartotal){
	var width_wrap = this.$panel.find('div.contentwrap').width();
	var show_count = parseInt((width_wrap+78)/79,10);
	var rel_count = parseInt(width_wrap/79,10);

	var total_idx = this.total-1;
	var begin_idx = this.photos.show_idx;
	var end_idx=begin_idx;

	switch(dif) {
	case 0:
		if(left!==undefined && barwid!==undefined && bartotal!==undefined) {
			begin_idx = Math.floor(left*(this.total-rel_count)/(bartotal-barwid));
		}
		end_idx=begin_idx+(show_count-1);
		if(end_idx>total_idx) { end_idx=total_idx; }
		break;

	case 1:
		if(total_idx-begin_idx+1 <= rel_count) { return; }

		begin_idx+=rel_count;
		if(total_idx-begin_idx+1 <= rel_count) {
			end_idx=total_idx;
			begin_idx=end_idx-(rel_count-1);
		} else {
			end_idx=begin_idx+(show_count-1);
		}
		break;

	case -1:
		if(begin_idx === 0) { return; }

		begin_idx-=rel_count;
		if(begin_idx <= 0) { begin_idx = 0; }
		end_idx=begin_idx+(show_count-1);
		if(end_idx>total_idx) { end_idx=total_idx; }
		break;

	case Infinity:
		if(total_idx-begin_idx+1 <= rel_count) { return; }

		end_idx=total_idx;
		begin_idx=end_idx-(rel_count-1);
		if(begin_idx<0) { begin_idx=0; }
		break;

	case -Infinity:
		if(begin_idx === 0) { return; }

		begin_idx=0;
		end_idx=begin_idx+(show_count-1);
		if(end_idx>total_idx) { end_idx=total_idx; }
		break;

	default:
		return;
	}
	this.photos.show_idx=begin_idx;

	var isSmall = this.$panel.hasClass('small');

	for(var i=begin_idx; i<=end_idx; ++i) {
		var photo = this.photos[i];
		if(!photo) {
			if(this.loadData) { this.loadData(parseInt(i/this.perpage,10)+1); }
		} else if(!photo.img) {
			photo.img=this.imgs[i];
			var $img=$(photo.img);
			if($img.hasClass('selected')) { photo.img.className='selected';
			} else { photo.img.className=''; }
			var imgsrc = (isSmall) ? photo.api.smalliconurl(photo) : photo.api.iconurl(photo);
			$img.addClass(photo.api.name).attr({title:photo.api.gettitle(photo),src:imgsrc});
		}
	}

	var $progressbarctnr=this.$panel.find('div.progressbar').parent();
	if(this.total <= rel_count) {
		$progressbarctnr.hide();
	} else {
		var bartotalwid=$progressbarctnr.show().width();
		var relbarwid=rel_count/this.total*bartotalwid;
		var mov;
		if(relbarwid < 50 && bartotalwid > 100) {
			mov={width:'50px', left:Math.floor(begin_idx/(this.total-rel_count)*(bartotalwid-50))};
		} else {
			mov={width:Math.floor(rel_count/this.total*bartotalwid), left:Math.floor(begin_idx/this.total*bartotalwid)};
		}
		this.$panel.find('div.progressbar').animate(mov, 'fast');
	}

	this.$panel.find('div.content').animate({left:begin_idx*(-79)},'fast');
	this.$panel.find('div.smallshow').find('a.closebtn').click();
};
PanelControl.prototype.showSmallPhotoPanel=function(img){
	var $smallpanel=this.$panel.find('div.smallshow');
	$smallpanel.find('img.smallshowimg').attr('src',pics.marker_trans);
	$(new Image()).load(function() {
		var loadedimg=this;
		var llft=parseInt($smallpanel.css('left'))-Math.floor(((loadedimg.width+10)-$smallpanel.width())/2);
		if(llft<0) {
			llft=0;
		} else if(llft > $smallpanel.parent().width()-(loadedimg.width+10)) {
			llft = $smallpanel.parent().width()-(loadedimg.width+10);
		}
		$smallpanel.animate({left:llft,width:loadedimg.width+10,height:loadedimg.height+20},function(){
			$smallpanel.find('img.smallshowimg').attr('src',loadedimg.src).css({width:loadedimg.width,height:loadedimg.height});
		});
	}).attr('src',img.photo.api.smallurl(img.photo));

	var $img=$(img);
	var ofst=$img.offset();
	var wid=$img.width();
	var pofst=$smallpanel.parent().offset();
	var panelwid=$smallpanel.width();

	$smallpanel.css('left',Math.floor(ofst.left-pofst.left+wid/2-panelwid/2)).fadeIn();
};
PanelControl.prototype.onPhotoClick=function(img){
	this.photos.sel_idx=img.idx;
	this.$panel.find('img.selected').removeClass('selected');
	var $img=$(img);
	$img.addClass('selected');

	if(this.$panel.hasClass('small')) {
		this.showSmallPhotoPanel(img);
	} else if(this.gmap && this.gmap.onPanelPhotoClick) {
		this.gmap.onPanelPhotoClick(img.idx);
	}
};
PanelControl.prototype.setInfo=function(txt){
	this.$panel.find('span.info').text(txt);
};
PanelControl.prototype.showPageLoading=function(iswaiting,api){
	if(iswaiting) {
		this.wait[api.name]=true;
		this.$panel.find('div.pagebar').get(0).disableDrag=true;
		this.$panel.find('div.pagebartotal').addClass('barloading');
	} else {
		var t=false;
		this.wait[api.name]=false;
		for(var elem in this.wait) { if(this.wait[elem]) { t=true; }}
		if(!t) { this.$panel.find('div.pagebartotal').removeClass('barloading'); }
	}
};
PanelControl.prototype.showPhotoLoading=function(show){
	if(show) { this.$panel.find('div.progresstotal').addClass('barloading');
	} else {   this.$panel.find('div.progresstotal').removeClass('barloading'); }
};
var BrowsePanelControl=function(year, month, sort){
	this.default_year=year||'lastweek';
	this.default_month=month||'all';
	this.default_sort=sort||'interestingness-desc';
	this.pageCurr=1;
	this.pageTotal=1;
	arguments.callee.superconstructor.apply(this, arguments);

	var ctrl=this;
	var $panel=this.$panel;
	var $pagebar=$panel.find('div.pagebar');

	var nowy = new Date().getFullYear();
	$panel.find('a.updnbtn').before(
'<div class="searchoption" style="position:absolute; top:-90px; height:90px; left:0px; width:400px; background-color:white; display:none;">'+
	'<div style="margin:5px;">'+msg.date_date+': '+
		'<select class="year_select">'+
			'<option value="lastweek">'+msg.date_lastweek+'</option>'+
			'<option value="yesterday">'+msg.date_yesterday+'</option>'+
			'<option value="lastmonth">'+msg.date_lastmonth+'</option>'+
			'<option value="all">'+msg.date_all+'</option>'+
			'<option value="'+(nowy-0)+'">'+(nowy-0)+'</option><option value="'+(nowy-1)+'">'+(nowy-1)+'</option>'+
			'<option value="'+(nowy-2)+'">'+(nowy-2)+'</option><option value="'+(nowy-3)+'">'+(nowy-3)+'</option>'+
			'<option value="'+(nowy-4)+'">'+(nowy-4)+'</option><option value="'+(nowy-5)+'">'+(nowy-5)+'</option>'+
			'<option value="'+(nowy-6)+'">'+(nowy-6)+'</option><option value="'+(nowy-7)+'">'+(nowy-7)+'</option>'+
			'<option value="'+(nowy-8)+'">'+(nowy-8)+'</option><option value="'+(nowy-9)+'">'+(nowy-9)+'</option>'+
		'</select>'+
		'<span class="date_month_option" style="display:none;"> / '+
			'<select class="month_select">'+
				'<option value="all">'+msg.month_all+'</option>'+
				'<option value="01">01</option><option value="02">02</option>'+
				'<option value="03">03</option><option value="04">04</option>'+
				'<option value="05">05</option><option value="06">06</option>'+
				'<option value="07">07</option><option value="08">08</option>'+
				'<option value="09">09</option><option value="10">10</option>'+
				'<option value="11">11</option><option value="12">12</option>'+
			'</select>'+
			'<span class="date_day_option" style="display:none;"> / '+
				'<select class="day_select">'+
					'<option value="all">'+msg.day_all+'</option>'+
					'<option value="01">01</option><option value="02">02</option><option value="03">03</option><option value="04">04</option>'+
					'<option value="05">05</option><option value="06">06</option><option value="07">07</option><option value="08">08</option>'+
					'<option value="09">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option>'+
					'<option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option>'+
					'<option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option>'+
					'<option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option>'+
					'<option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option>'+
					'<option value="29">29</option><option value="30">30</option><option value="31">31</option>'+
				'</select>'+
			'</span>'+
		'</span>'+
	'</div>'+
	'<div style="margin:5px;">'+msg.sort_sort+': '+
		'<select class="sort_select">'+
			'<option value="interestingness-desc">'+msg.sort_interestingness_desc+'</option>'+
			'<option value="date-taken-desc">'+msg.sort_date_taken_desc+'</option>'+
			'<option value="date-posted-desc">'+msg.sort_date_posted_desc+'</option>'+
			'<option value="relevance">'+msg.sort_relevance+'</option>'+
			'<option value="interestingness-asc">'+msg.sort_interestingness_asc+'</option>'+
			'<option value="date-taken-asc">'+msg.sort_date_taken_asc+'</option>'+
			'<option value="date-posted-asc">'+msg.sort_date_posted_asc+'</option>'+
		'</select>'+
	'</div>'+
	'<div style="margin:5px;"> '+msg.search+': '+
		'<form class="search_form" style="display:inline;">'+
			'<input class="search_text" type="text">'+
			'<input type="submit">'+
		'</form>'+
	'</div>'+
'</div>');

	var pagebar=$pagebar.get(0);
	$.setDragable(pagebar,{direction:'horizontal',boundbyparent:true},null,function(){
		var bw=$pagebar.width();
		var cw=$pagebar.parent().width();
		var lef=parseInt($pagebar.css('left'),10);
		var n = Math.round(lef*(ctrl.pageTotal-1)/(cw-bw));
		ctrl.setInfo((n+1)+' / '+ctrl.pageTotal);
	},function() {
		if(ctrl.pageTotal==1) { return; }
		var bw=$pagebar.width();
		var cw=$pagebar.parent().width();
		var lef=parseInt($pagebar.css('left'),10);
		var pagepos=null;
		if(lef === 0) {
			pagepos=1;
		} else if(lef+bw === cw) {
			pagepos=ctrl.pageTotal;
		} else {
			var n = Math.round(lef*(ctrl.pageTotal-1)/(cw-bw));
			pagepos=n+1;
		}

		if(ctrl.pageCurr===pagepos) { ctrl.setPage(pagepos,null); return; }
		ctrl.setPage(pagepos,null);
		ctrl.gmap.refreshView(true);
	});
	$panel.find('div.pagebartotal').click(function(e) {
		if(pagebar.disableDrag) { return; }
		var ofst=$pagebar.offset();
		var page=ctrl.pageCurr;
		if(e.clientX < ofst.left) {
			if( page <= 1) { return; }
			page--;
		} else if(e.clientX > ofst.left+$pagebar.width()) {
			if( page >= ctrl.pageTotal) { return; }
			page++;
		}
		ctrl.setPage(page,null);
		ctrl.gmap.refreshView(true);
	});

	$panel.find('select.year_select').val(this.default_year);
	$panel.find('select.month_select').val(this.default_month);
	$panel.find('select.sort_select').val(this.default_sort);

	$panel.find('div.searchoption').find('select').change(function() { try {
		if(parseInt($panel.find('select.year_select').val(),10)) {
			$panel.find('span.date_month_option').show();
			if(parseInt($panel.find('select.month_select').val(),10)) {
				$panel.find('span.date_day_option').show();
			} else {
				$panel.find('span.date_day_option').hide();
				$panel.find('select.day_select').val('all');
			}
		} else {
			$panel.find('span.date_month_option').hide();
			$panel.find('select.month_select').val('all');
			$panel.find('select.day_select').val('all');
		}
	} finally { return false; }});
	$panel.find('div.searchoption').find('form').submit(function() { try {
		$panel.find('div.searchoption').fadeToggle();
		ctrl.gmap.changeOption();
	} finally { return false; }});
	$panel.find('a.updnbtn').click(function(){ $panel.find('div.searchoption').fadeToggle(); });
};
extend(BrowsePanelControl, PanelControl);
BrowsePanelControl.prototype.setPage=function(curr,total){
	if(curr !==null) { this.pageCurr=curr; }
	if(total!==null) {
		if(total ===-1) {
			this.pageTotal=-1;
			this.show(false);
		} else if( total >this.pageTotal) {
			this.pageTotal = total;
		}
	}

	var $pagebar=this.$panel.find('div.pagebar');
	if(this.pageTotal === -1) {
		$pagebar.css('left',0);
		this.$panel.find('span.info').text('Loading...');
		$pagebar.get(0).disableDrag=true;
		return;
	}
	if(this.pageTotal === 0) {
		$pagebar.css('left',0);
		this.$panel.find('span.info').text('No photos.');
		$pagebar.get(0).disableDrag=true;
		return;
	}
	if(this.pageTotal === 1) {
		$pagebar.css('left',0);
		this.$panel.find('span.info').text(this.pageCurr+' / '+this.pageTotal);
		$pagebar.get(0).disableDrag=true;
		return;
	}

	$pagebar.get(0).disableDrag=false;
	var bw=$pagebar.width();
	var cw=$pagebar.parent().width();
	$pagebar.css('left',Math.floor((this.pageCurr-1)*(cw-bw)/(this.pageTotal-1)));
	this.$panel.find('span.info').text(this.pageCurr+' / '+this.pageTotal);
};
BrowsePanelControl.prototype.getPageCurr=function(){ return this.pageCurr; };
BrowsePanelControl.prototype.getTime=function(){
	var year=this.$panel.find('select.year_select').val();
	if(year === 'all') {
		return {begin:'1800-01-01 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	} else if(year === 'lastmonth') {
		var d=new Date();
		d.setMonth(d.getMonth()-1);
		return {begin:$.parseDateToStr(d)+' 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	} else if(year === 'lastweek') {
		var d=new Date();
		d.setDate(d.getDate()-7);
		return {begin:$.parseDateToStr(d)+' 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	} else if(year === 'yesterday') {
		var d=new Date();
		d.setDate(d.getDate()-1);
		return {begin:$.parseDateToStr(d)+' 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	}

	// year is number
	var month=this.$panel.find('select.month_select').val();
	if(month === 'all') {
		return {begin:year+'-01-01', end:year+'-12-31 23:59:59'};
	}

	var day=this.$panel.find('select.day_select').val();
	if(day === 'all') {
		return {begin:year+'-'+month+'-01', end:year+'-'+month+'-31 23:59:59'};
	}
	
	return {begin:year+'-'+month+'-'+day, end:year+'-'+month+'-'+day+' 23:59:59'};
};
BrowsePanelControl.prototype.getSort=function(){ return this.$panel.find('select.sort_select').val(); };
BrowsePanelControl.prototype.getSearchText=function(){ return $.trim(this.$panel.find('input.search_text').val()); };

// PhotosMap, for base class
var PhotosMap=function(container, opts){
	arguments.callee.superconstructor.apply(this, arguments);
	this.photos=[];

	google.maps.Event.addListener(this, 'infowindowopen', this.onInfoWindowOpen);
	google.maps.Event.addListener(this, 'infowindowclose', this.onInfoWindowClose);

	var mt=this.getMapTypes();
	for(var i=0; i<mt.length; i++) { mt[i].getMinimumResolution=this.getMinimumResolution; }
};
extend(PhotosMap, google.maps.Map2);
PhotosMap.prototype.getMinimumResolution=function() { return 3; };
PhotosMap.prototype.deltas = [
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
0.0000494593408794467];
PhotosMap.prototype.setPanelControl=function(panelctrl) { this.panelctrl=panelctrl; };
PhotosMap.prototype.getPanelControl=function() { return this.panelctrl; };
PhotosMap.prototype.groupPhotos=function() {
	var delta=this.deltas[this.getZoom()];

	var temp_bounds=[];
	for (var i=0,len=this.photos.length; i<len; ++i) {
		var photo=this.photos[i];
		var pos = photo.pos;

		var isMerged=false;
		for (var j=0,len2=temp_bounds.length; j<len2; ++j) {
			var b=temp_bounds[j];
			if( b.containsLatLng(pos)) {
				isMerged=true;
				b.photos.push(photo);
				if(b.firstdate>photo.firstdate) { b.firstdate=photo.firstdate; }
				break;
			}
		}
		if(!isMerged) {
			var bb = new google.maps.LatLngBounds(new google.maps.LatLng(pos.lat()-delta, pos.lng()-delta), new google.maps.LatLng(pos.lat()+delta, pos.lng()+delta));
			bb.photos=[photo];
			bb.firstdate=photo.datetaken;
			temp_bounds.push(bb);
		}
	}
	return temp_bounds;
};
PhotosMap.prototype.showPhotoGroups=function(pgroups) {
	for (var i=0,len=pgroups.length; i<len ; ++i) {
		var pgroup = pgroups[i];
		if(pgroup.photos.length === 0) { continue; }

		if(pgroup.maker) { this.removeOverlay(pgroup.maker); }
		pgroup.maker=PhotoGroupMarker.getInstance(pgroup);
		pgroup.maker.setLatLng(pgroup.getCenter());
		this.addOverlay(pgroup.maker);
	}
};
PhotosMap.prototype.onMarkerClick=function(marker,photos){
	this.currSelectMarker=marker;
	if(this.panelctrl && this.panelctrl.setPhotos) { this.panelctrl.setPhotos(photos); }
};
PhotosMap.prototype.onPanelPhotoClick=function(idx){
	if(this.currSelectMarker) { this.currSelectMarker.showInfoWindow(idx); }
};
PhotosMap.prototype.onInfoWindowOpen=function(){
	this.suspenddragevent=true;
	this.savePosition();
};
PhotosMap.prototype.onInfoWindowClose=function(){
	this.returnToSavedPosition();
	this.suspenddragevent=false;
	if(this.panelctrl && this.panelctrl.show) { this.panelctrl.show(false); }
};
// BrowseMap : PhotosMap
var BrowseMap=function(container, opts){
	arguments.callee.superconstructor.apply(this, arguments);
	this.win=opts.win;
	if(opts.win) { opts.win=this; }
	this.user_id=opts.user_id;
	this.group_id=opts.group_id;
	this.fullrange=opts.fullrange;
	this.hotplace=opts.hotplace;
	this.disable_refresh=false;
	this.lastcenter=null;
	this.suspenddragevent=false;
	this.delay_loading=2000;
	this.currSelectMarker=null;


	this.addMapType(google.maps.PHYSICAL_MAP);
	this.addControl(new google.maps.HierarchicalMapTypeControl());
	this.addControl(new google.maps.LargeMapControl());
	this.addControl(new google.maps.OverviewMapControl());

	if(opts.panelctrl) {
		this.setPanelControl(opts.panelctrl);
		this.addControl(opts.panelctrl);
	}

	this.getPanelControl().setPage(1,-1); // loading...

	if(opts.contextMenu) {
		this.contextMenu=opts.contextMenu;
		this.addControl(this.contextMenu);
	}
	

	google.maps.Event.addListener(this, 'zoomend', function() {
		if(this.setAddressHash) { this.setAddressHash(); }
		this.clearOverlays();
		this.getPanelControl().setPage(1,-1); // loading
		this.refreshView();
	});
	google.maps.Event.addListener(this, 'dragend', function() {
		if(this.suspenddragevent) { return; }
		if(this.setAddressHash) { this.setAddressHash(); }
		var lastcenter=this.lastcenter;
		var bound=this.getBounds();
		var center=bound.getCenter();
		var span=bound.toSpan();
		if(lastcenter) {
			var dx  = Math.abs(center.lng() - lastcenter.lng());
			var dy  = Math.abs(center.lat() - lastcenter.lat());
			if ((dx < 0.15*span.lng()) && (dy < 0.15*span.lat())) { return; }
		}
		this.getPanelControl().setPage(1,-1); // loading
		this.refreshView();
	});

	this.loadLocation();

	//flickr.callapi('flickr.tags.getHotPlaceTags', {start:'2008-3-14 00:00:00',days:7,count:60}, function(success, responseXML, responseText, params){
	//	var rsp = eval('('+responseText+')');
	//	console.log(rsp);
	//});
};
extend(BrowseMap, PhotosMap);
BrowseMap.prototype.refreshView=function(nodelay, timestamp){
	if(this.disable_refresh) { return; }
	if(!timestamp) {
		this.search_timestamp = new Date().getTime();
		timestamp = this.search_timestamp;
	}
	if(this.search_timestamp !== timestamp) { return; }

	if(!nodelay) {
		var gmap = this;
		setTimeout( function() { gmap.refreshView(true, timestamp); }, this.delay_loading);
		return;
	}

	this.lastcenter = this.getCenter();
	this.saveLocation();


	var bound = this.getBounds();
	var sw = bound.getSouthWest();
	var ne = bound.getNorthEast();
	var w = sw.lng();
	var e = ne.lng();
	var n = ne.lat();
	var s = sw.lat();
	if(!this.fullrange) {
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
	}

	//var points = [new gobj.GLatLng(n,e),new gobj.GLatLng(n,w),new gobj.GLatLng(s,w),new gobj.GLatLng(s,e),new gobj.GLatLng(n,e)];
	//this.addOverlay(new gobj.GPolyline(points, '#0000FF', 1, .3));

	var pageCurr=this.getPanelControl().getPageCurr();
	var searchOption={extras:'geo,date_upload,date_taken,owner_name,icon_server,license', per_page:PER_PAGE, page:pageCurr, accuracy:1};
	searchOption.bbox=w+','+s+','+e+','+n;
	searchOption.sort=this.getPanelControl().getSort();

	if(this.user_id) searchOption.user_id=this.user_id;
	if(this.group_id) searchOption.group_id=this.group_id;

	var t = this.getPanelControl().getTime();
	if(t.begin) { searchOption.min_taken_date=t.begin; }
	if(t.end) { searchOption.max_taken_date=t.end; }

	var searchtxt = this.getPanelControl().getSearchText();
	if(!!searchtxt) { searchOption.text=searchtxt; }

	searchOption._search_timestamp=this.search_timestamp;
	flickr.callapi('flickr.photos.search', searchOption, this);
	this.getPanelControl().showPageLoading(true,flickr);

	if(this.doAdditionalSearch) { this.doAdditionalSearch(w,s,e,n); }
};
BrowseMap.prototype.flickr_photos_search_onLoad=function(success, responseXML, response, params){
	if(this.search_timestamp !== params._search_timestamp) { return; }
	var api=params._api;
try {
	var rsp= (typeof(response)==='string') ? eval('(' + response + ')') : response;
	if(!api.check(rsp)) { return; }

	var total = api.parseTotalPage(rsp);
	api.lastTotal = total;
	this.getPanelControl().setPage(null, total);

	if(!this.photos.search_timestamp || this.photos.search_timestamp!==this.search_timestamp) {
		this.photos=[]; // clear previous photo data
		this.photos.search_timestamp=this.search_timestamp;
	}

	api.parse(this.photos,rsp);

	this.clearOverlays();

	var pgroups=this.groupPhotos();
	this.showPhotoGroups(pgroups);
} finally {
	this.getPanelControl().showPageLoading(false,api);
}};
BrowseMap.prototype.changeOption=function(){
try{
	this.getPanelControl().setPage(1,-1); // loading
	this.refreshView(true);
} finally { return false;
}};
BrowseMap.prototype.doAdditionalSearch=function(w,s,e,n){
	var pageCurr=this.getPanelControl().getPageCurr();
	var option={from:(pageCurr-1)*PER_PAGE, to:pageCurr*PER_PAGE, minx:w, miny:s, maxx:e, maxy:n};
	var sort=this.getPanelControl().getSort();
    if(sort === 'interestingness-desc' || sort === 'interestingness-asc' || sort === 'relevance') {
		option.order = 'popularity';
		option.set = 'public';
	} else {
		option.order = 'upload_date';
		option.set = 'full';
	}
	option._search_timestamp=this.search_timestamp;
	panoramio.callapi('flickr.photos.search', option, this);
	this.getPanelControl().showPageLoading(true,panoramio);

	if(picasa.lastTotal===undefined || pageCurr <= picasa.lastTotal) {
		var optt={'lower-left':s+','+w, 'upper-right':n+','+e, 'start-index':((pageCurr-1)*PER_PAGE)+1,'max-results':PER_PAGE};
		optt._search_timestamp=this.search_timestamp;
		picasa.callapi('flickr.photos.search', optt, this);
		this.getPanelControl().showPageLoading(true,picasa);
	}
};
BrowseMap.prototype.loadLocation=function(){
	if(/^#latlng=([\-\d\,\.]+)&zoom=(\d+)$/.exec(location.hash)) {
		this.setCenter(google.maps.LatLng.fromUrlValue(RegExp.$1), parseInt(RegExp.$2,10));
	} else {
		var geostr = $.cookie('init_location');
		if(geostr) {
			var geo = geostr.split(',');
			this.setCenter(new google.maps.LatLng(parseFloat(geo[0]),parseFloat(geo[1])), parseInt(geo[2],10));
		} else {
			this.setCenter(new google.maps.LatLng(40,-90), 4);
		}
	}
};
BrowseMap.prototype.saveLocation=function(){
	$.cookie('init_location', this.lastcenter.toUrlValue()+','+this.getZoom(), {expires:365});
};
BrowseMap.prototype.setAddressHash=function(){
	location.hash='#latlng='+this.getCenter().toUrlValue()+'&zoom='+this.getZoom();
};

	mymap.BrowsePanelControl=BrowsePanelControl;
	mymap.BrowseMap=BrowseMap;

	var sty=document.createElement('style');
	sty.type='text/css';
	if(sty.styleSheet) { sty.styleSheet.cssText=CSS_STYLE;
	} else { sty.appendChild(document.createTextNode(CSS_STYLE)); }
	document.getElementsByTagName('head')[0].appendChild(sty);

	arguments.callee.inited=true;
}


google.load('maps',  '2.x');

function initialize() {
	if (!google.maps.BrowserIsCompatible()) { return; }

	$().unload(google.maps.Unload);

	flickr._api_key=flickr_key;

$.fn.fadeToggle=function(speed, easing, callback) { return this.animate({opacity: 'toggle'}, speed, easing, callback); };
$.setDragable=function(obj,opt, cbmousedown, cbdraging, cbdragend) {
	opt=opt||{};
	var $obj=$(obj);
	$obj.css('cursor','pointer');
	$obj.mousedown(function(e){
		if(obj.disableDrag) { return; }
		obj.dragbegin=true;
		obj.dragposx=e.clientX;
		obj.dragposy=e.clientY;
		if(cbmousedown) { cbmousedown(e); }
	});
	$().mousemove(function(e){
		if(!obj.dragbegin || obj.disableDrag) { return; }
		$obj.css('cursor','move');

		var posx,posy,outx,outy;
		if(opt.direction==='horizontal') {
			posy=0;
		} else {
			posy=e.clientY-obj.dragposy+parseInt($obj.css('top'),10);
			if(opt.boundbyparent) {
				if(posy < 0) {
					posy=0; outy=true;
				} else {
					var dif=$obj.parent().height()-$obj.height();
					if(posydif) { posy=dif;  outy=true; }
				}
			}
		}

		if(opt.direction==='vertical') {
			posx=0;
		} else {
			posx=e.clientX-obj.dragposx+parseInt($obj.css('left'),10);
			if(opt.boundbyparent) {
				if(posx < 0) {
					posx=0; outx=true;
				} else {
					var dif2=$obj.parent().width()-$obj.width();
					if(posx>dif2) { posx=dif2;  outx=true; }
				}
			}
		}
		if(!outx) { obj.dragposx=e.clientX; }
		if(!outy) { obj.dragposy=e.clientY; }

		$obj.css({'top':posy,'left':posx});
		if(cbdraging) { cbdraging(e,obj); }
	}).mouseup(function(e){
		if(!obj.dragbegin || obj.disableDrag) { return; }
		$obj.css('cursor','pointer');
		obj.dragbegin=false;
		if(cbdragend) { cbdragend(e,obj); }
	});
};
$.parseDateToStr=function(d){
	var yy=d.getFullYear();
	var mm=d.getMonth()+1;
	var dd=d.getDate();
	return ''+yy+'-'+(mm<10?'0':'')+mm+'-'+(dd<10?'0':'')+dd;
};
	init();

	var opt={panelctrl:new mymap.BrowsePanelControl('all')};
	var map=new mymap.BrowseMap($("div#map").addClass('flickrgmapshow').get(0), opt);
	map.enableContinuousZoom();
	map.enableScrollWheelZoom();
}

google.setOnLoadCallback(initialize);

})();
