// Flickr Gmap Show
// v3.2
// Copyright (c) 2008, Tang Wei-Ching.
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// Change Log:
// v3.2  08/03/11 Remove BrowseControl and PhotoSetControl.
// v3.1  08/02/29 Support firefox 3. Add location history.
// v3.0  07/11/09 Implement Orgnaize Map. Localize interface.
// v2.9  07/10/11 Improve operation speed. Use CSS Sprites. Delay check new version. Fix minor bug.
// v2.8  07/10/07 Change browse map behavior. Fix max window style.
// v2.7  07/10/01 Refine photoset map. Change browse map behavior. Fix bugs.
// v2.6  07/08/22 Add Embedded Link.
// v2.5  07/08/06 Add photoset time track. Add more action can do.
// v2.4  07/08/03 Refine photoset map behavior. Apply more effects. Fix some bugs.
// v2.3  07/08/01 Add Google Analytics. Refine one photo map marker. Fix some bugs.
// v2.2  07/07/31 Refine Location Search, Speed up normal operation by delay loading.
// v2.1  07/07/30 Add Geocode Search function.
// v2.0  07/07/27 Rewrite from v1.2.
//
// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @description   Show Flickr geotagged photos with Google Map.
// @version       3.1
// @author        wctang <wctang@gmail.com>
// @source        http://userscripts.org/scripts/show/9450
// @identifier    http://userscripts.org/scripts/source/9450.user.js
// @include       http://www*.flickr.com/*
// @include       http://flickr.com/*
// ==/UserScript==

(function() {

var SCRIPT = {
	name: 'Flickr Gmap Show',
	author: 'wctang <wctang@gmail.com>',
	namespace: 'http://code.google.com/p/flickr-gmap-show/',
	description: 'Show Flickr geotagged photos with Google Map.',
	source: 'http://userscripts.org/scripts/show/9450',
	identifier: 'http://userscripts.org/scripts/source/9450.user.js',
	version: '3.2',
	date: (new Date(2008, 3, 11)).valueOf() // update date
};

var unsafewin = (typeof unsafeWindow != 'undefined') ? unsafeWindow : window;
var unsafedoc=unsafewin.document;

var js_jquery = 'http://jqueryjs.googlecode.com/files/jquery-1.2.3.min.js';
var $;
var map_key = {
	'www.flickr.com':'ABQIAAAA5iyLqLpUbk1qBe2volmsqxSJH83gQrDVSdV8r9NArjCP9aOWERRU1og-N0K74gHhNgzjBwOD_qJqMA',
	'flickr.com'    :'ABQIAAAA5iyLqLpUbk1qBe2volmsqxSGM0_bDfGWz8SC2GLcx2eGJvE10BTGjbXI0oN8Qn9JZDhW_LeBOkw_sA'
};
var js_gmap = 'http://www.google.com/jsapi?key=';
var google=null;
var js_analytics = 'http://www.google-analytics.com/ga.js';

// var EMBEDDED_URL = 'http://flickr-gmap-show.googlecode.com/svn/trunk/';

var small_loading = 'data:image/gif;base64,R0lGODlhCgAKAJEDAMzMzP9mZv8AAP%2F%2F%2FyH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQFAAADACwAAAAACgAKAAACF5wncgaAGgJzJ647cWua4sOBFEd62VEAACH5BAUAAAMALAEAAAAIAAMAAAIKnBM2IoMDAFMQFAAh%2BQQFAAADACwAAAAABgAGAAACDJwHMBGofKIRItJYAAAh%2BQQFAAADACwAAAEAAwAIAAACChxgOBPBvpYQYxYAIfkEBQAAAwAsAAAEAAYABgAAAgoEhmPJHOGgEGwWACH5BAUAAAMALAEABwAIAAMAAAIKBIYjYhOhRHqpAAAh%2BQQFAAADACwEAAQABgAGAAACDJwncqi7EQYAA0p6CgAh%2BQQJAAADACwHAAEAAwAIAAACCpRmoxoxvQAYchQAOw%3D%3D';
var imgdir = 'http://flickr-gmap-show.googlecode.com/svn/trunk/pics/';
var pics = {
	flickr_loading  : imgdir+'flickr_loading.gif',
	marker_img      : imgdir+'marker_image.png',
	marker_shw      : imgdir+'marker_shadow.png',
	marker_trans    : imgdir+'marker_transparent.png',
	marker_mov      : imgdir+'marker_image_moved.png',
	loading         : imgdir+'loading.gif',
	icon1           : imgdir+'icon1.png',
	icon2           : imgdir+'icon2.png',
	icon3           : imgdir+'icon3.png',
	infobg_flickr   : imgdir+'infobg_flickr.jpg',
	bar_loading     : imgdir+'bar_loading.gif'
};

function prepare_pics() { $.each(pics, function() { $("<img>").attr("src", this); }); }

var PER_PAGE = 200;
var DEF_LAT = '0';
var DEF_LNG = '0';
var DEF_ZOOM = '3';


var msg;
switch(unsafewin.global_intl_lang) {
	case 'zh-hk': msg={
		'close': '&#x95dc;&#x9589;',
		'maxrestore': '&#x6700;&#x5927;/&#x9084;&#x539f;',
		'about': '&#x95dc;&#x65bc;',
		'youcando': '&#x4f60;&#x53ef;&#x4ee5;...',
		'loadlastlocation': '&#x8df3;&#x81f3;&#x6700;&#x5f8c;&#x4f4d;&#x7f6e;',
		'savelocation': '&#x5132;&#x5b58;&#x76ee;&#x524d;&#x5730;&#x7406;&#x4f4d;&#x7f6e;',
		'removelocation': '&#x522a;&#x9664;&#x5730;&#x7406;&#x4f4d;&#x7f6e;&#x8cc7;&#x8a0a;',
		'searchlocation': '&#x641c;&#x5c0b;&#x5730;&#x7406;&#x4f4d;&#x7f6e;',
		'getembedlink': '&#x53d6;&#x5f97;&#x5167;&#x5d4c;&#x7528;&#x9023;&#x7d50;',
		'showhide': '&#x986f;&#x793a;/&#x96b1;&#x85cf;',
		'pagefrst': '&#x7b2c;&#x4e00;&#x9801;',
		'pagelast': '&#x6700;&#x5f8c;&#x4e00;&#x9801;',
		'pageprev': '&#x524d;&#x4e00;&#x9801;',
		'pagenext': '&#x4e0b;&#x4e00;&#x9801;',
		'loading': '&#x8f09;&#x5165;&#x4e2d;',
		'opt_all': '&#x4f60;&#x6240;&#x6709;&#x7684;&#x76f8;&#x7247;',
		'opt_not_tagged': '&#x4f60;&#x7684;&#x672a;&#x6a19;&#x8b58;&#x76f8;&#x7247;',
		'opt_not_in_set': '&#x4f60;&#x4e0d;&#x5728;&#x76f8;&#x7247;&#x96c6;&#x4e2d;&#x7684;&#x76f8;&#x7247;',
		'opt_located': '&#x4f60;&#x7684;&#x5df2;&#x6a19;&#x793a;&#x5730;&#x7406;&#x4f4d;&#x7f6e;&#x7684;&#x76f8;&#x7247;',
		'opt_not_located': '&#x4f60;&#x7684;&#x672a;&#x6a19;&#x793a;&#x5730;&#x7406;&#x4f4d;&#x7f6e;&#x7684;&#x76f8;&#x7247;',
		'opt_set': '&#x4f60;&#x7684;&#x76f8;&#x7247;&#x96c6;',
		'opt_group': '&#x4f60;&#x7684;&#x7fa4;&#x7d44;',
		'date_date': '&#x65e5;&#x671f;',
		'date_lastmonth': '&#x4e0a;&#x500b;&#x6708;',
		'date_lastweek': '&#x4e0a;&#x500b;&#x661f;&#x671f;',
		'date_yesterday': '&#x6628;&#x5929;',
		'date_all': '&#x5168;&#x90e8;',
		'month_all': '&#x6240;&#x6709;&#x6708;&#x5206;',
		'day_all': '&#x5168;&#x90e8;',
		'sort_sort': '&#x6392;&#x5e8f;',
		'sort_interestingness_desc': '&#x6709;&#x8da3;&#x5ea6;',
		'sort_interestingness_asc': '&#x6709;&#x8da3;&#x5ea6;&#xff0c;&#x5c0f;&#x5230;&#x5927;',
		'sort_date_taken_desc': '&#x62cd;&#x651d;&#x65e5;&#x671f;',
		'sort_date_taken_asc': '&#x62cd;&#x651d;&#x65e5;&#x671f;&#xff0c;&#x9060;&#x81f3;&#x8fd1;',
		'sort_date_posted_desc': '&#x4e0a;&#x50b3;&#x65e5;&#x671f;',
		'sort_date_posted_asc': '&#x4e0a;&#x50b3;&#x65e5;&#x671f;&#xff0c;&#x9060;&#x81f3;&#x8fd1;',
		'sort_relevance': '&#x4f4d;&#x7f6e;&#x76f8;&#x95dc;&#x6027;',
		'search': '&#x641c;&#x5c0b;',
		'clearsel': '&#x6e05;&#x9664;&#x9078;&#x64c7;',
		'photos': '&#x5f35;&#x76f8;&#x7247;',
		'selected': '&#x5f35;&#x5df2;&#x9078;&#x64c7;'
	}; break;
	case 'de-de':
	case 'en-us':
	case 'es-us':
	case 'fr-fr':
	case 'it-it':
	case 'ko-kr':
	case 'pt-br':
	default: msg={
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
	}; break;
}




function loadscript(jspath,loaded) {
	var s=document.createElement('script');
	s.setAttribute('type','text/javascript');
	s.setAttribute('src',jspath);
	if(loaded) {
		s.addEventListener('readystatechange', function(){if(this.readyState==='complete') { loaded(); }}, false);
		s.addEventListener('load', loaded, false);
	}
	document.getElementsByTagName('head')[0].appendChild(s);
}
var document_write_old = unsafedoc.write;
unsafedoc.write = function(str) {
	if(str.indexOf('<script ')>=0){
		var f = str.indexOf('src="')+5;
		var src = str.substring(f,str.indexOf('"',f));
		loadscript(src);
	} else if(str.indexOf('<style ')>=0) {
		var sty = document.createElement('style');
		sty.setAttribute('type', 'text/css');
		var s = str.indexOf('media="');
		if(s>0) { sty.setAttribute('media', str.substring(s+7,str.indexOf('"',s+7))); }
		str=str.replace(/<style.*">/,'').replace(/<\/style>/,'');
		if(sty.styleSheet) { sty.styleSheet.cssText = str;  // ie
		} else { sty.appendChild(document.createTextNode(str)); }
		document.getElementsByTagName('head')[0].appendChild(sty);
	} else {
		document_write_old(str);
	}
};

var btnbackgnd = 'background:transparent url('+imgdir+'icons.png?v=2.9) no-repeat scroll ';
var shadwbkgnd = 'background:transparent url('+imgdir+'shadow-main.png) no-repeat scroll ';
var FGS_STYLE=
'.flickrgmapshow {font:14px arial; text-align:left;} '+
'.flickrgmapshow table.shadow {position:absolute;width:100%;height:100%;left:6px;top:6px;border-collapse:collapse;border:0;} '+
'.flickrgmapshow table.shadow td.br {border:0;             '+shadwbkgnd+' bottom right;} '+
'.flickrgmapshow table.shadow td.bl {border:0;width:10px;  '+shadwbkgnd+' left bottom;} '+
'.flickrgmapshow table.shadow td.top{border:0;height:12px; '+shadwbkgnd+' right top;} '+
'.flickrgmapshow div.main {border:solid 2px #EEEEEE; background-color:white; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
// in main
'.flickrgmapshow span.title {} '+
'.flickrgmapshow div.mask {background-color:black; opacity:.75;-moz-opacity:.75;filter:alpha(opacity=75);} '+
'.flickrgmapshow div.mask div {position:relative;float:left;top:50%;margin-top:-16px;left:50%;margin-left:-16px;} '+
'.flickrgmapshow div.search,div.about {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.flickrgmapshow span.address {background-color:white;} '+
'.flickrgmapshow span.address a {text-decoration:none;} '+
'.flickrgmapshow span.latlng {font:italic 11px arial; cursor:pointer;} '+
'.flickrgmapshow a.btn {display:block; cursor:pointer;} '+
'.flickrgmapshow a.closebtn,a.maxbtn,a.searchbtn,a.actionbtn,a.embedbtn,a.aboutbtn,a.updnbtn,a.prevbtn,a.nextbtn,a.trkbtn {display:block;width:15px;height:15px; text-indent:-999em; cursor:pointer;} '+
'.flickrgmapshow a.p_btn,a.r_btn   {display:block;height:48px;width:25px; text-indent:-999em; cursor:pointer;} '+
'.flickrgmapshow a.pp_btn,a.rr_btn {display:block;height:32px;width:25px; text-indent:-999em; cursor:pointer;} '+
'.flickrgmapshow a.closebtn  {'+btnbackgnd+' 0px    0px;} .flickrgmapshow a.closebtn:hover  {'+btnbackgnd+' -15px    0px;} '+
'.flickrgmapshow a.maxbtn    {'+btnbackgnd+' 0px  -15px;} .flickrgmapshow a.maxbtn:hover    {'+btnbackgnd+' -15px  -15px;} '+
'.flickrgmapshow a.searchbtn {'+btnbackgnd+' 0px  -30px;} .flickrgmapshow a.searchbtn:hover {'+btnbackgnd+' -15px  -30px;} '+
'.flickrgmapshow a.actionbtn {'+btnbackgnd+' 0px  -45px;} .flickrgmapshow a.actionbtn:hover {'+btnbackgnd+' -15px  -45px;} '+
'.flickrgmapshow a.embedbtn  {'+btnbackgnd+' 0px  -60px;} .flickrgmapshow a.embedbtn:hover  {'+btnbackgnd+' -15px  -60px;} '+
'.flickrgmapshow a.aboutbtn  {'+btnbackgnd+' 0px  -75px;} .flickrgmapshow a.aboutbtn:hover  {'+btnbackgnd+' -15px  -75px;} '+
'.flickrgmapshow a.updnbtn   {'+btnbackgnd+' 0px  -90px;} .flickrgmapshow a.updnbtn:hover   {'+btnbackgnd+' -15px  -90px;} '+
'.flickrgmapshow a.prevbtn   {'+btnbackgnd+' 0px -105px;} .flickrgmapshow a.prevbtn:hover   {'+btnbackgnd+' -15px -105px;} '+
'.flickrgmapshow a.nextbtn   {'+btnbackgnd+' 0px -120px;} .flickrgmapshow a.nextbtn:hover   {'+btnbackgnd+' -15px -120px;} '+
'.flickrgmapshow a.trkbtn    {'+btnbackgnd+' 0px -135px;} .flickrgmapshow a.trkbtn:hover    {'+btnbackgnd+' -15px -135px;} '+
'.flickrgmapshow a.p_btn     {'+btnbackgnd+' 0px -150px;} .flickrgmapshow a.p_btn:hover     {'+btnbackgnd+' -25px -150px;} '+
'.flickrgmapshow a.pp_btn    {'+btnbackgnd+' 0px -198px;} .flickrgmapshow a.pp_btn:hover    {'+btnbackgnd+' -25px -198px;} '+
'.flickrgmapshow a.r_btn     {'+btnbackgnd+' 0px -230px;} .flickrgmapshow a.r_btn:hover     {'+btnbackgnd+' -25px -230px;} '+
'.flickrgmapshow a.rr_btn    {'+btnbackgnd+' 0px -278px;} .flickrgmapshow a.rr_btn:hover    {'+btnbackgnd+' -25px -278px;} '+
'.flickrgmapshow div.option {padding:5px; border:solid 1px black; background-color:white; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.flickrgmapshow div.markerlabel {text-align:center; vertical-align:middle; font-size:small; cursor:pointer;} '+
'.flickrgmapshow div.markerlabel:hover {color:white; font-weight:bold;} '+
'.flickrgmapshow div.flickr {background:transparent url('+pics.infobg_flickr+') no-repeat scroll bottom right;} '+
'.flickrgmapshow div.markerinfowin a {text-decoration:none;} '+
'.flickrgmapshow div.photopanel div.background {background-color:white; opacity:.75;-moz-opacity:.75;filter:alpha(opacity=75);} '+
'.flickrgmapshow div.photopanel div.content img {top:6px; cursor:pointer; border:1px solid gray; background:transparent url('+pics.loading+') no-repeat scroll right bottom; } '+
'.flickrgmapshow div.photopanel div.content img.selected {top:1px; border-bottom:3px solid #FF8888;} '+
'.flickrgmapshow div.photopanel div.barloading {background:transparent url('+pics.bar_loading+') repeat-x scroll left top;} '+
'.flickrgmapshow div.contextmenu {background-color:white; padding:3px; border:1px solid black; } '+
'.flickrgmapshow div.contextmenu a {cursor:pointer;} '+
'.flickrgmapshow .changed {color:red;} '+
'';



var flickr={
	name:'flickr',
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
	iconurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_s.jpg';},
	thumburl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_t.jpg';},
	smallurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_m.jpg';},
	mediumurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';},
	largeurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_b.jpg';},
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
	hasbuddy: true,
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
	callapi: function(methodname, args, obj) {
		args.format='json';
		args.nojsoncallback = '1';
		if(typeof(obj) == 'function') {
			var tmp={};
			tmp[methodname.replace(/\./g,'_')+'_onLoad']=obj;
			unsafewin.F.API.callMethod(methodname, args, tmp);
		} else {
			unsafewin.F.API.callMethod(methodname, args, obj);
		}
	}
};
var geocode={
	accuracytozoom:[3,5,7,9,11,13,14,15,16],
	search:function(obj,callback,str) {
		var path = 'http://maps.google.com/maps/geo?key=ABQIAAAAtOjLpIVcO8im8KJFR8pcMhQjskl1-YgiA_BGX2yRrf7htVrbmBTWZt39_v1rJ4xxwZZCEomegYBo1w&q='+encodeURI(str);
		GM_xmlhttpRequest({method: 'GET', url: path, onload: function(result){callback.call(obj,result);}});
	}
};



function load_history() {
	var searchhistory=[];
	for(var i=0; i<10; ++i) {
		var h=GM_getValue('history_'+i, null);
		if(!h) { continue; }
		if(!/^\((\-?\d+\.\d+)\,(\-?\d+\.\d+)\,(\d+)\)(.*)?$/.exec(h)) { continue; }
		var lat=RegExp.$1,lng=RegExp.$2,zoom=RegExp.$3,n=RegExp.$4;
		searchhistory[i]={lat:lat,lng:lng,zoom:zoom,text:n};
	}
	return searchhistory;
}
function create_mapwindow(opt) {
	opt = opt || {};
	var winstr=
'<div class="flickrgmapshow" style="position:absolute;z-index:99999; display:none;">'+
	'<table class="shadow"><tr><td class="top" colspan="2"></td></tr><tr><td class="bl"></td><td class="br"></td></tr></table>'+  // shadow
	'<div class="main" style="position:absolute;left:0px;">'+ // main
		'<span class="title"     style="position:absolute;left:10px;right:70px;top:5px;line-height:20px;"></span>'+ // title
		'<div  class="map"       style="position:absolute;left:4px;right:4px;top:26px;bottom:29px; border:1px solid lightgray; overflow:hidden;"></div>'+ // map
		'<div  class="mask"      style="position:absolute;left:5px;right:5px;top:27px;bottom:30px; overflow:hidden; z-index:999999; display:none;"><div><img src="'+pics.loading+'"></img></div></div>'+ // mask
		'<a    class="closebtn mainclose" style="position:absolute;right:12px;top:6px;" title="'+msg.close+'"></a>'+ // close btn
		'<a    class="maxbtn"    style="position:absolute;right:32px;top:6px; display:none;" title="'+msg.maxrestore+'"></a>'+ // max btn
		'<a    class="searchbtn" style="position:absolute;right:52px;top:6px;" title="'+msg.searchlocation+'"></a>'+ // search btn
		'<div  class="search"    style="position:absolute;left:15px;top:37px;right:15px;bottom:37px; display:none;">'+
			'<div class="searchinsert" style="position:absolute;left:10px;right:10px; top:10px;">'+msg.searchlocation+': '+
				'<form class="searchform" style="display:inline;"><input class="searchinput" style="width:250px;"></input><input type="submit"></input></form>'+
			'</div>'+
			'<div class="searchresult" style="position:absolute;left:10px;right:10px; top:35px; height:75px; overflow:auto; border-bottom:2px solid gray;"></div>'+
			'<div class="searchhistory" style="position:absolute;left:10px;right:10px; top:120px; bottom:10px; overflow:auto;"></div>'+
			'<a class="closebtn searchclose" style="position:absolute;right:12px;top:6px;"></a>'+
		'</div>'+ //search
		'<span class="address"   style="position:absolute;left:10px;right:140px;bottom:5px;line-height:20px;"></span>'+ // address
		'<span class="latlng"    style="position:absolute;right:25px;bottom:5px;line-height:20px;"></span>'+ // latlng
		'<a    class="aboutbtn"  style="position:absolute;right:5px;bottom:6px;" title="'+msg.about+'"></a>'+ // about btn
		'<div  class="about"     style="position:absolute;right:5px;bottom:30px;width:200px;height:150px; display:none;"><div style="text-align:center; padding:3px;"><p><b>Flickr GMap Show</b></p><p><a href="http://userscripts.org/scripts/show/9450">Project Page</a></p><p>Author: <a href="mailto:wctang@gmail.com">wctang</a></p><p><a target="_blank" href="https://www.paypal.com/xclick/business=wctang%40gmail%2ecom&item_name=fgs_donation&no_note=1&currency_code=USD"><img src="http://www.pspad.com/img/paypal_en.gif"></img></a></p></div></div>'+ //about
	'</div>'+
'</div>';
	var $win=$(winstr);
	var win=$win.get(0);
	for(var f in create_mapwindow) {
		if(typeof create_mapwindow[f] == 'function') { win[f] = create_mapwindow[f]; }
	}

	$win.find('form.searchform').submit(function(){ try {
		$win.find('div.searchresult').empty().html('<span><img src="'+pics.loading+'"></img> waiting...</span>');
		var inp = $win.find('input.searchinput').val();
		setTimeout(function() {
			geocode.search(win,win.submitSearch_callback, inp );
		}, 0);
	} finally {
		return false;
	}});;

	win.mapdiv=$win.find('div.map').get(0);
	$win.find('a.mainclose').click(function(){ $win.fadeToggle('fast'); });
	$win.find('a.searchbtn,a.searchclose').click(function(){
		var $search=$win.find('div.search');
		if($search.css('display') == 'none') { // to show
			$search.find('div.searchhistory').empty();
			setTimeout(function() {
				var a =$('<a class="btn searchhistory">'+msg.loadlastlocation+'</a>').get(0);
				a.lat=parseFloat(GM_getValue('last_lat', DEF_LAT));
				a.lng=parseFloat(GM_getValue('last_lng', DEF_LNG));
				a.zoom=parseInt(GM_getValue('last_zoom', DEF_ZOOM),10);
				a.win=win;
				a.notsavehistory=true;
				$search.find('div.searchhistory').append(a);
				var searchhistory=load_history();
				for(var i=0; i<10; ++i) {
					var item=searchhistory[i];
					if(!item) { continue; }
					var sitem =$('<a class="btn searchhistory">'+item.text+'</a>').get(0);
					sitem.lat=parseFloat(item.lat);
					sitem.lng=parseFloat(item.lng);
					sitem.zoom=parseInt(item.zoom,10);
					sitem.win=win;
					$search.find('div.searchhistory').append(sitem);
				}
				$search.find('div.searchhistory').children('a').click(win.searchresult_click);
				$search.find('input.searchinput').focus();
			}, 0);
		}
		$win.find('div.search').fadeToggle('fast');
	});
	$win.find('span.latlng').click(function(){ if(win.gmap && win.gmap.onLatLngClick) { win.gmap.onLatLngClick(); } });
	$win.find('a.aboutbtn').click(function(){ $win.find('div.about').slideToggle('fast'); });

	win.link=opt.link;
	if(opt.fixmax) {
		win.m_max=true;
	} else {
		win.m_max=false;

		$win.find('a.maxbtn').show().click(function(){
			win.m_max=!win.m_max;
			win.refreshSize(true);
		});

		var ofst = $(win.link).offset();
		var top=ofst.top-opt.height-10;
		var left=ofst.left-(opt.width*.85);
		if(left < 10) { left = 10; }
		win.m_pos = {top:top,left:left,width:opt.width,height:opt.height};
	}
	return win;
}
create_mapwindow.open=function(dom){
	if(dom) { $(dom).prepend(this); }
	$(this).fadeIn('fast');
	this.refreshSize();
};
create_mapwindow.close=function(){
	var win = this.win || this;
	$(win).fadeOut('fast');
};
create_mapwindow.onWindowResize=function(){
	if(this.style.display == 'none' || !this.m_max) { return; }
	this.refreshSize();
};
create_mapwindow.refreshSize=function(animate) {
	var pos;
	if(this.m_max) {
		pos={top:unsafewin.pageYOffset+10, left:unsafewin.pageXOffset+10, width:document.body.clientWidth-30, height:document.body.clientHeight-30};
		if(pos.width < 150) { pos.width = 150; }
		if(pos.height < 200) { pos.height = 200; }
	} else {
		pos = this.m_pos;
	}

	var $this=$(this);
	var isvisible = $this.is(':visible');
	var gmap = this.gmap;
	function end_resize() {
		if(isvisible && gmap) {
			gmap.checkResize();
			if(gmap.onresized) { gmap.onresized(); }
		}
	}
	if(gmap && gmap.onresize) { gmap.onresize(); }
	if(isvisible && animate) {
		$this.animate(pos,'fast').find('div.main').animate({width:pos.width-4,height:pos.height-4},'fast','',end_resize);
	} else {
		$this.css(pos).find('div.main').css({width:pos.width-4,height:pos.height-4});
		end_resize();
	}
};
create_mapwindow.submitSearch_callback=function(result){
	if(result.status != 200) {
		alert('Server Error!');
		return;
	}

	var gres = eval('('+result.responseText+')');
	if(!gres.Status || !gres.Status.code) { return; }

	var $this = $(this);
	$this.find('div.searchresult').empty();
	if(gres.Status.code != '200') {
		var msg = '';
		switch(gres.Status.code) {
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
		$this.find('div.searchresult').text(msg).append('<br>');
		return;
	}

	var points = gres.Placemark;
	for(var i = 0,len=points.length; i<len; i++) {
		var point = points[i];

		var addr = [];
		var addrdtl = point.AddressDetails;
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
		if(point.address) {
			var j = 0;
			for(; j< addr.length; ++j) {
				if( point.address.indexOf(addr[j]) < 0) { break; }
			}
			addr.splice(0,j);
			address = point.address + ' (' + addr.join(', ') + ')';
		} else {
			address = addr.join(', ');
		}

		var a=$('<a class="btn searchresult">'+address+'</a>').click(this.searchresult_click).get(0);
		a.zoom=geocode.accuracytozoom[parseInt(point.AddressDetails.Accuracy,10)];
		var pos=point.Point.coordinates;
		a.lat=parseFloat(pos[1]);
		a.lng=parseFloat(pos[0]);
		a.win=this;
		$this.find('div.searchresult').append(a);
	}
};
create_mapwindow.showmask=function(isshow){
	if(isshow) { $(this).find('div.mask').show();
	} else { $(this).find('div.mask').hide(); }
};
create_mapwindow.searchresult_click=function(){
	$(this.win).find('div.search').fadeToggle('fast');
	if(!this.notsavehistory) {
		var item_new={lat:this.lat,lng:this.lng,zoom:this.zoom,text:$(this).text()};
		setTimeout(function(){
			var searchhistory=load_history();
			var tmp=[];
			tmp[0]=item_new;
			var i=0, item;
			for(i=0; i<10; ++i) {
				item=searchhistory[i];
				if(!item || (item.lat==item_new.lat && item.lng==item_new.lng && item.zoom==item_new.zoom)) { continue; }
				tmp.push(item);
				if(tmp.length >= 10) { break; }
			}
			for(i=0; i<10; ++i) {
				item=tmp[i];
				var h = null;
				if(item) { h='('+item.lat+','+item.lng+','+item.zoom+')'+item.text; }
				GM_setValue('history_'+i, h);
			}
		}, 0);
	}
	var pos=new google.maps.LatLng(this.lat,this.lng);
	if(this.win.gmap && this.win.gmap.onSearchResultClicked) { this.win.gmap.onSearchResultClicked(pos, this.zoom); }
};
create_mapwindow.setLocationInfo=function(latlng, zoom, locate, ischanged){
	var $this=$(this);
	if(latlng) {
		var $latlng = $this.find('span.latlng');

		$latlng.text(latlng.toUrlValue());
		if(ischanged)  { $latlng.addClass('changed');
		} else { $latlng.removeClass('changed'); }
	}

	if(!locate) {
		flickr.callapi('flickr.places.findByLatLon', {lat:latlng.lat(), lon:latlng.lng(), accuracy:zoom}, function(success, responseXML, responseText, params){
			var rsp = eval('('+responseText+')');
			if(rsp.stat != 'ok') { return; }
			if(rsp.places.total==1) {
				flickr.callapi('flickr.places.resolvePlaceId', {place_id:rsp.places.place[0].place_id}, function(success, responseXML, responseText, params){
					var rsp = eval('('+responseText+')');
					if(rsp.stat != 'ok') { return; }
					$this.get(0).setLocationInfo(null, null, rsp.location, null);
				});
			} else {
				$this.find('span.address').html('');
			}
		});
	} else {
		var locname=[];
		var last='';
		var loc = locate.locality;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		loc = locate.county;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		loc = locate.region;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		loc = locate.country;
		if(loc && loc._content!=last) { last=loc._content; locname.push('<a href="'+flickr.placeurl(loc.place_id)+'" target="_blank">'+last+'</a>'); }
		if(locname.length) { $this.find('span.address').html(locname.join()); }
	}
};

var fgs = {
init_afterloaded : function() {
	if(arguments.callee.inited) { return; }

var extend=function(Constructor,Parent) {
	var Inh=function(){}; Inh.prototype=Parent.prototype; Constructor.prototype=new Inh();
	Constructor.prototype.constructor=Constructor; Constructor.superconstructor=Parent;
};

var ContextMenuControl=function(onOpenHandler){
	this.$menu=$('<div class="contextmenu" style="display:none;"></div>');
	this.onOpen=onOpenHandler;
};
ContextMenuControl.prototype=new google.maps.Control();
ContextMenuControl.prototype.getDefaultPosition=function(){ return new google.maps.ControlPosition(google.maps.ANCHOR_TOP_LEFT, new google.maps.Size(0, 0)); };
ContextMenuControl.prototype.initialize=function(map){
	this.$menu.appendTo(map.getContainer());

	var ctrl=this;
	google.maps.Event.addListener(map, 'click', function() {
		ctrl.$menu.hide();
	});

	google.maps.Event.addListener(map, 'singlerightclick', function(point, src, overlay) {
		if(ctrl.onOpen) {
			if(!ctrl.onOpen(point, src, overlay)) { return; }
		}

		ctrl.$menu.show();
		var menuw=ctrl.$menu.width();
		var menuh=ctrl.$menu.height();
		var x=point.x;
		var y=point.y;
		var size=this.getSize();
		if (x > size.width-menuw-3) { x = size.width-menuw-3; }
		if (y > size.height-menuh-3) { y = size.height-menuh-3; }

		ctrl.$menu.tgt={pos:point, target:src, overlay:overlay};

		new google.maps.ControlPosition(google.maps.ANCHOR_TOP_LEFT, new google.maps.Size(x,y)).apply(ctrl.$menu.get(0));
	});

	return this.$menu.get(0);
};
ContextMenuControl.prototype.addItem=function(str,fn){
	var $menu=this.$menu;
	var item=$('<a>'+str+'</a>').click(function(){ $menu.hide(); fn($menu.tgt.pos, $menu.tgt.target, $menu.tgt.overlay); }).get(0);
	$menu.append(item);
	$menu.append('<br>');
};



var PhotoMap=function(container, opts){
	arguments.callee.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.win.gmap=this;
	this.photo_id=opts.photo_id;

	this.addMapType(google.maps.PHYSICAL_MAP);
	this.addControl(new google.maps.HierarchicalMapTypeControl());
	this.ctrl_small=new google.maps.SmallMapControl();
	this.addControl(this.ctrl_small);

	this.loadLocation();
};
extend(PhotoMap, google.maps.Map2);
PhotoMap.prototype.flickr_photos_getInfo_onLoad=function(success, responseXML, responseText, params){
try {
	var rsp = eval('(' + responseText + ')');
	if(!rsp || rsp.stat != 'ok') return;

	var photo = rsp.photo;

	var $win = $(this.win);
	$win.find('span.title').text(photo.title._content);

	var zoom = 12;

	if(!photo.location) {
		photo.location={latitude:0,longitude:0};
		zoom=2;
		$win.find('a.searchbtn').trigger('click');
	} else {
		if(photo.location.accuracy) zoom=parseInt(photo.location.accuracy,10);
	}

	var isdraggable = true;
	if(!photo.permissions) {
		isdraggable = false;
		$win.find('a.searchbtn').hide();
	}

	this.clearOverlays();

	// create marker
	if(!arguments.callee.markericon) {
		var deficon = new google.maps.Icon();
		deficon.image = pics.marker_img;
		deficon.shadow = pics.marker_shw;
		deficon.iconSize = new google.maps.Size(79, 89);
		deficon.shadowSize = new google.maps.Size(109, 89);
		deficon.iconAnchor = new google.maps.Point(40, 89);
		deficon.infoWindowAnchor = new google.maps.Point(79, 50);
		deficon.imageMap=[0,0,78,0,78,78,49,78,39,88,39,78,0,78];
		deficon.transparent=pics.marker_trans;
		arguments.callee.markericon=deficon;
	}
	var icon= new google.maps.Icon(arguments.callee.markericon);
	icon.label = {url:flickr.iconurl(photo), anchor:new google.maps.LatLng(2,2), size:new google.maps.Size(75,75)};

	var center = new google.maps.LatLng(photo.location.latitude,photo.location.longitude);
	var marker=this.marker=new google.maps.Marker(center, {icon:icon, draggable:isdraggable});
	marker.origpos=center;
	var map = this;
	if(isdraggable) { // have permission to relocation.
		google.maps.Event.addListener(marker, 'dragend', function(){ map.onMarkerChanged(); });
		google.maps.Event.addListener(marker, 'click', function(){ if(marker.infowinPanel) map.showInfoWindow(); });

		if(!this.contextMenu) {
			this.contextMenu=new ContextMenuControl();
			this.contextMenu.addItem('Move to Here', function(point, src, overlay) {
				var latlng = map.fromContainerPixelToLatLng(point);
				marker.setLatLng(latlng);
				map.onMarkerChanged();
			});
			this.contextMenu.addItem('Cancel Move', function() {
				map.marker.closeInfoWindow();
				map.loadLocation();
			});
			this.addControl(this.contextMenu);
		}
	}

	this.setCenter(center, zoom);
	this.addOverlay(marker);

	this.win.setLocationInfo(center, zoom, photo.location, false);
} finally {
	this.win.showmask(false);
}};
PhotoMap.prototype.onresize = function() { this.lastcenter = this.getCenter(); };
PhotoMap.prototype.onresized = function() {
	this.setCenter(this.lastcenter);

	if(this.win.ismax) {
		if(!this.ctrl_large) {
			this.ctrl_large=new google.maps.LargeMapControl();
			this.ctrl_overview=new google.maps.OverviewMapControl();
		}
		this.removeControl(this.ctrl_small);
		this.addControl(this.ctrl_large);
		this.addControl(this.ctrl_overview);
		this.ctrl_overview.hide();
	} else {
		if(this.ctrl_overview) this.removeControl(this.ctrl_overview);
		if(this.ctrl_large) this.removeControl(this.ctrl_large);
		this.addControl(this.ctrl_small);
	}
};
PhotoMap.prototype.onLatLngClick = function() {
	this.setCenter(this.marker.getLatLng());
};
PhotoMap.prototype.onSearchResultClicked = function(pos, zoom) {
	this.setCenter(pos,zoom);
	this.marker && this.marker.setLatLng(pos);
	this.onMarkerChanged();
};
PhotoMap.prototype.onMarkerChanged=function() {
	if(!this.marker) return;

	this.win.setLocationInfo(this.marker.getLatLng(), this.getZoom(), null, true);
	this.marker.setImage(pics.marker_mov);

	this.showInfoWindow();
};
PhotoMap.prototype.showInfoWindow=function() {
	if(!this.marker) return;
	if(!this.marker.infowinPanel) {
		var $panel = $('<div><a class="save">'+msg.savelocation+'?</a><br><a class="remove">'+msg.removelocation+'?</a><br><a class="cancel">Cancel move?</a></div>');
		var map=this;
		$panel.find('a.save').click(  function(){ if(confirm('Save Location?')){ map.marker.closeInfoWindow(); map.saveLocation(); }});
		$panel.find('a.remove').click(function(){ if(confirm('Remove Location?')) { map.marker.closeInfoWindow(); map.removeLocation(); }});
		$panel.find('a.cancel').click(function(){ map.marker.closeInfoWindow(); map.loadLocation(); });
		this.marker.infowinPanel=$panel.get(0);
	}
	this.marker.openInfoWindow(this.marker.infowinPanel, {noCloseOnClick:false,suppressMapPan:false});
};
PhotoMap.prototype.loadLocation=function() {
	this.win.showmask(true);
	flickr.callapi('flickr.photos.getInfo', {photo_id:this.photo_id}, this);
};
PhotoMap.prototype.saveLocation=function() {
	var loc=this.marker.getLatLng();
	var zoom=this.getZoom();
	if(zoom < 1) zoom = 1;
	if(zoom > 16) zoom = 16;

	this.win.showmask(true);
	flickr.callapi('flickr.photos.geo.setLocation', {photo_id:this.photo_id, lat:loc.lat(), lon:loc.lng(), accuracy:zoom}, this);
};
PhotoMap.prototype.flickr_photos_geo_setLocation_onLoad=function(success, responseXML, responseText, params){
	var rsp = eval('(' + responseText + ')');
	if(rsp.stat != 'ok') {
		alert('Save location failed.\n\n' + rsp.message);
		this.win.showmask(false);
		return;
	}

	var loc=this.marker.getLatLng();
	var zoom=this.getZoom();
	window.setTimeout(function() {
		GM_setValue('last_zoom', zoom+'');
		GM_setValue('last_lat', loc.lat()+'');
		GM_setValue('last_lng', loc.lng()+'');
	}, 0);

	alert('Saved.');
	flickr.callapi('flickr.photos.getInfo', {photo_id:this.photo_id}, this);
};
PhotoMap.prototype.removeLocation=function() {
	this.win.showmask(true);
	flickr.callapi('flickr.photos.geo.removeLocation', {photo_id:this.photo_id}, this);
};
PhotoMap.prototype.flickr_photos_geo_removeLocation_onLoad=function(success, responseXML, responseText, params){
	var rsp = eval('(' + responseText + ')');
	if(rsp.stat != 'ok') {
		alert('Remove location failed.\n\n' + rsp.message);
		this.win.showmask(false);
		return;
	}

	alert('Removed Location Success.');
	this.loadLocation();
};


// PhotoGroupMarker
var PhotoGroupMarker=function(latlng,opts){ // called when created
	arguments.callee.superconstructor.apply(this, arguments);
	this.photos=this.showpanel=null;
	this.iconsize = this.getIcon().iconSize;

	google.maps.Event.addListener(this, 'click', this.onClick);
	this.$div=$('<div class="markerlabel" style="position:absolute;"></div>').width(this.iconsize.width-2).height(this.iconsize.height-2).click(this.onClick);
	this.$div.get(0).marker=this;
};
extend(PhotoGroupMarker, google.maps.Marker);
PhotoGroupMarker.generateIcon=function(n) {
	if(!arguments.callee.init) {
		function ic(img,w1,h1,w2,h2,w3,h3) {
			var icon=new google.maps.Icon();
			icon.image=img;
			icon.iconSize=new google.maps.Size(w1,h1);
			icon.iconAnchor=new google.maps.Point(w2,h2);
			icon.infoWindowAnchor=new google.maps.Point(w3,w3);
			return icon;
		};
		arguments.callee.init=true;
		arguments.callee.i1=ic(pics.icon1, 18, 19, 9, 9, 9, 9);
		arguments.callee.i2=ic(pics.icon2, 20, 21,10,10,10,10);
		arguments.callee.i3=ic(pics.icon3, 26, 27,13,13,13,13);
	}
	if(n < 10) return arguments.callee.i1;
	else if(n < 100) return arguments.callee.i2;
	else return arguments.callee.i3;
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
		map.addMapType(google.maps.PHYSICAL_MAP);
		map.addControl(new google.maps.HierarchicalMapTypeControl());
		map.addControl(new google.maps.SmallZoomControl());
		map.setCenter(photo.pos, photo.accuracy);
		map.marker=new google.maps.Marker(photo.pos);
		map.addOverlay(map.marker);
		showpanel.map = map;
	} else {
		showpanel.map.setCenter(photo.pos, photo.accuracy);
		showpanel.map.marker.setLatLng(photo.pos);
	}

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
var PanelControl=function(controltype, year, month, sort){
	this.default_year=year||'lastweek';
	this.default_month=month||'all';
	this.default_sort=sort||'interestingness-desc';

	this.pageCurr=1;
	this.pageTotal=1;

	this.imgs=[];
	this.photos=null;

	if(controltype === 1) {        // browse control
	} else if(controltype === 2) { // photo set control
		this.isPhotosetPanel=true;
	} else if(controltype === 3) { // orgnize control
		this.isOrganizePanel=true;
	}

	var nowy = new Date().getFullYear();
	var panelstr=
'<div class="photopanel" style="right:130px;height:150px;">'+
	'<div class="background" style="position:absolute;top:0px;right:0px;bottom:0px;left:0px;"></div>'+
	'<div class="toppanel">'+
		(this.isPhotosetPanel?
		'<a class="trkbtn" style="position:absolute;top:5px;left:5px;"></a>'
		:
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
		'</div>'+
		'<a class="updnbtn" title="Search Option..." style="position:absolute;top:5px;left:5px;"></a>'
		)+
		'<div class="pagebarctnr" style="position:absolute;top:5px;left:25px;right:5px; height:15px; overflow:hidden;">'+
			'<div class="pagebartotal" style="position:absolute; left:0px;right:0px; top:2px; bottom:2px; background-color:#DDDDDD; cursor:pointer;"></div>'+
			'<div class="pagebar" style="position:relative; height:15px; width:120px; text-align:center; background-color:#8888FF;"><span class="info">Loading...</span></div>'+
		'</div>'+
	'</div>'+
	'<div class="subpanel">'+
		(!this.isOrganizePanel?'':
		'<div style="position:absolute;top:30px;left:25px; right:5px; height:20px;">'+
			'<form style="display:inline;">'+
				'<select class="collectselect">'+
					'<option value="none"></option>'+
					'<option value="all" selected="true">'+msg.opt_all+'</option>'+
					'<option value="not_tagged">'+msg.opt_not_tagged+'</option>'+
					'<option value="not_in_set">'+msg.opt_not_in_set+'</option>'+
					'<option value="located">'+msg.opt_located+'</option>'+
					'<option value="not_located">'+msg.opt_not_located+'</option>'+
					'<optgroup class="set" label="'+msg.opt_set+'"></optgroup>'+
					'<optgroup class="group" label="'+msg.opt_group+'"></optgroup>'+
				'</select>'+
			'</form>'+
			'<span class="total" style="margin-left:10px; font-size:12px; font-weight:bold;"></span> '+msg.photos+' :: <span class="selected" style="font-weight:bold;"></span> '+msg.selected+' <span class="clearspan" style="display:none;">| <a class="clearsel" href="javascript:void(0);">'+msg.clearsel+'</a> </span>'+
		'</div>'
		)+
		'<div style="position:absolute;left:26px;right:26px; bottom:85px;height:10px; overflow:hidden; display:none;">'+
			'<div class="progresstotal" style="position:absolute; left:0px;right:0px; top:2px; bottom:2px; background-color:#DDDDDD; cursor:pointer;"></div>'+
			'<div class="progressbar" style="position:relative; height:10px; background-color:#8888FF;"></div>'+
		'</div>'+
		'<div class="contentwrap" style="position:absolute;left:26px;right:26px; bottom:0px;height:85px; overflow:hidden;">'+
			'<div class="content" style="position:absolute;top:0px; height:85px; overflow:hidden;"></div>'+
		'</div>'+
		(!this.isOrganizePanel?'':
		'<div class="dragagent" style="position:absolute;left:0px;top:0px;height:77px;width:77px; cursor:pointer;">'+
			'<div class="marker" style="display:none; width:79px; height:89px; background:transparent url('+pics.marker_img+') no-repeat scroll left top;">'+
				'<img style="position:absolute; left:2px; top:2px;"></img>'+
				'<span class="info" style="position:absolute; left:5px; top:5px; border:solid 1px gray; background-color:white;"></span>'+
			'</div>'+
		'</div>'
		)+
		'<a class="pp_btn" style="position:absolute;left:0px;bottom:0px;" title="'+msg.pagefrst+'"></a>'+
		'<a class="p_btn" style="position:absolute;left:0px;bottom:32px;" title="'+msg.pageprev+'"></a>'+
		'<a class="r_btn" style="position:absolute;right:0px;bottom:32px;" title="'+msg.pagenext+'"></a>'+
		'<a class="rr_btn" style="position:absolute;right:0px;bottom:0px;" title="'+msg.pagelast+'"></a>'+
	'</div>'+
'</div>';
	var $panel=$(panelstr);
	this.$panel=$panel;

	var ctrl=this;

	if(!this.isOrganizePanel) { this.show(false); }

	var $pagebar=$panel.find('div.pagebar');
	if(this.isPhotosetPanel) {
		$pagebar.width(300);
		$panel.find('a.trkbtn').click(function(){ if(ctrl.gmap) { ctrl.gmap.tracking_toggle(); } });
	} else {
		var pagebar=$pagebar.get(0);
		$.setDragable(pagebar,{direction:'horizontal',bounded:'parent'},null,function(){
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
			var bw=$pagebar.width();
			var cw=$pagebar.parent().width();
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
	}

	$panel.find('a.pp_btn').click(function(){ ctrl.slide(-Infinity); });
	$panel.find('a.p_btn' ).click(function(){ ctrl.slide(-1); });
	$panel.find('a.r_btn') .click(function(){ ctrl.slide(1); });
	$panel.find('a.rr_btn').click(function(){ ctrl.slide(Infinity); });

	var $progressbar=$panel.find('div.progressbar');
	var progressbar=$progressbar.get(0);
	$.setDragable(progressbar,{direction:'horizontal',bounded:'parent'},null,null,function(e) {
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

	if(this.isOrganizePanel) {
		this.flickr_photos_search_onLoad=this.onDataLoaded;
		this.flickr_photos_getUntagged_onLoad=this.onDataLoaded;
		this.flickr_photos_getNotInSet_onLoad=this.onDataLoaded;
		this.flickr_photos_getWithGeodata_onLoad=this.onDataLoaded;
		this.flickr_photos_getWithoutGeodata_onLoad=this.onDataLoaded;
		this.flickr_photosets_getPhotos_onLoad=this.onDataLoaded;
		this.flickr_groups_pools_getPhotos_onLoad=this.onDataLoaded;

		function changeOption() {
			$panel.fadeIn('fast');
			$panel.find('img.selected').removeClass('selected');

			ctrl.photos=[];
			ctrl.photos.show_idx=0;
			ctrl.pagestoload=[];
			ctrl.perpage=0;
			ctrl.total=0;

			ctrl.option={extras:'geo,date_taken',per_page:100,user_id:unsafewin.global_nsid};
			var value = $panel.find('select.collectselect').val();
			if(value=='all') {
				ctrl.method='flickr.photos.search';
			} else if(value=='not_tagged') {
				ctrl.method='flickr.photos.getUntagged';
			} else if(value=='not_in_set') {
				ctrl.method='flickr.photos.getNotInSet';
			} else if(value=='located') {
				ctrl.method='flickr.photos.getWithGeodata';
			} else if(value=='not_located') {
				ctrl.method='flickr.photos.getWithoutGeodata';
			} else if(value.indexOf('option_photoset')==0) {
				ctrl.method='flickr.photosets.getPhotos';
				ctrl.option.photoset_id=value.substr(15);
			} else if(value.indexOf('group')==0) {
				ctrl.method='flickr.groups.pools.getPhotos';
				ctrl.option.group_id=value.substr(5);
			} else {
				return;
			}
			ctrl.loadData(1);
		};
		$panel.find('select.collectselect').change(changeOption);

		$panel.find('a.clearsel').click(function(){
			$panel.find('img.selected').removeClass('selected');
			$panel.find('span.selected').text(0);
			$panel.find('span.clearspan').hide();
		});


		var $dragagent=$panel.find('div.dragagent');
		var dragagent=$dragagent.get(0);
		$dragagent.css({'top':-10000,'left':-10000});

		var currimg=null;
		var selected_ids=[];
		$panel.find('div.contentwrap').mousemove(function(e){
			if(e.target.tagName != 'IMG') return;
			e.stopPropagation();

			currimg=e.target;
			$dragagent.attr('title',$(currimg).attr('title'));
			var divofst=$(e.target).offset();
			var dragofst=$dragagent.offset();
			$dragagent.css({'top':parseInt($dragagent.css('top'),10)+divofst.top-dragofst.top,'left':parseInt($dragagent.css('left'),10)+divofst.left-dragofst.left});
		});

		$dragagent.click(function(e){
			if(!currimg) { return; }

			currimg.drag_state=0;
			$dragagent.css('cursor','pointer');
			if(e.ctrlKey) {
				$(currimg).toggleClass('selected');
			} else {
				var sels=$panel.find('img.selected');
				sels.removeClass('selected');
				if(!(sels.size()==1 && sels.get(0)==currimg)) {
					$(currimg).addClass('selected');
				}
			}

			ctrl.updateSelectionInfo();
		});
		$.setDragable(dragagent,{},function(){
			if(!currimg) return;
			currimg.drag_state=1;
			setTimeout(function(){
				if(currimg.drag_state!=1) return;
				currimg.drag_state=2;

				$dragagent.css('cursor','move');
				$dragagent.find('img').attr('src',currimg.src);

				selected_ids=[];
				if(!$(currimg).hasClass('selected')) {
					selected_ids.push(currimg.photo.id);
				} else {
					$panel.find('img.selected').each(function(){ selected_ids.push(this.photo.id); });
				}

				if(selected_ids.length > 1) {
					$dragagent.find('span.info').text(selected_ids.length + ' photos');
				} else {
					$dragagent.find('span.info').text('');
				}
				$dragagent.find('div.marker').show();
			}, 500);
		},null,function(){
			if(!currimg) return;
			var drag_state=currimg.drag_state;
			currimg.drag_state=0;
			if(drag_state!=2) return;

			$dragagent.find('div.marker').hide();

			var dragofst=$dragagent.offset();
			var ins={x:dragofst.left+40, y:dragofst.top+89};

			var $gmapdom=$(ctrl.gmap.getContainer());
			var gmapofst=$gmapdom.offset();
			var maprect={top:gmapofst.top, left:gmapofst.left, bottom:gmapofst.top+$gmapdom.height(), right:gmapofst.left+$gmapdom.width()};

			var panelofst=$panel.offset();
			var panelrect={top:panelofst.top, left:panelofst.left, bottom:panelofst.top+$panel.height(), right:panelofst.left+$panel.width()};

			if( ins.x>maprect.left && ins.x<maprect.right && ins.y>maprect.top && ins.y<panelrect.top) {
				var latlng = ctrl.gmap.fromContainerPixelToLatLng(new google.maps.Point(ins.x-maprect.left, ins.y-maprect.top));
				var zoom = ctrl.gmap.getZoom();
				flickr.callapi('flickr.photos.geo.setLocation', {photo_ids:selected_ids, lat:latlng.lat(),lon:latlng.lng(),accuracy:zoom}, function(success, responseXML, responseText, params){
					var rsp=eval('(' + responseText + ')');
					if(!rsp||rsp.stat != 'ok') { return; }

					if(ctrl.gmap.refreshView) { ctrl.gmap.refreshView(true); }

					var sel=$panel.find('select.collectselect').val();
					if(sel == 'located' || sel == 'not_located') { changeOption(); }
				});
			}

			var divofst=$(currimg).offset();
			$dragagent.css({'left':parseInt($dragagent.css('left'),10)+divofst.left-dragofst.left, 'top':parseInt($dragagent.css('top'),10)+divofst.top-dragofst.top});
		});


		flickr.callapi('flickr.photosets.getList', {user_id:unsafewin.global_nsid}, function(success, responseXML, responseText, params){
			var rsp=eval('(' + responseText + ')');
			if(!rsp||rsp.stat != 'ok') return;
			for (var i=0,photosets=rsp.photosets.photoset,len=photosets.length,$c=$panel.find('optgroup.set'); i<len; i++) {
				var photoset=photosets[i];
				$c.append('<option value="option_photoset'+photoset.id+'">'+photoset.title._content+' ('+photoset.photos+')</option>');
			}
		});
		flickr.callapi('flickr.people.getPublicGroups', {user_id:unsafewin.global_nsid}, function(success, responseXML, responseText, params){
			var rsp=eval('(' + responseText + ')');
			if(!rsp||rsp.stat != 'ok') return;
			for (var i=0,groups=rsp.groups.group,len=groups.length,$c=$panel.find('optgroup.group'); i<len; i++) {
				var group=groups[i];
				$c.append('<option value="group'+group.nsid+'">'+group.name+'</option>');
			}
		});
		changeOption();
	}
};
PanelControl.prototype=new google.maps.Control();
PanelControl.prototype.getDefaultPosition=function(){ return new google.maps.ControlPosition(google.maps.ANCHOR_BOTTOM_LEFT, new google.maps.Size(10, 15)); };
PanelControl.prototype.initialize=function(map){
	this.gmap=map;
	map.getContainer().appendChild(this.$panel.get(0));
	return this.$panel.get(0);
};
PanelControl.prototype.show=function(isshow){
	if(this.isOrganizePanel) { return; }
	if(isshow) {
		this.$panel.find('div.toppanel').hide();
		this.$panel.find('div.subpanel').show();
		this.$panel.animate({'height':100});
	} else {
		this.$panel.find('div.toppanel').show();
		this.$panel.find('div.subpanel').hide();
		this.$panel.animate({'height':30});
	}
};
PanelControl.prototype.loadData=function(page){
	if(!this.pagestoload) return;
	if(!this.pagestoload[page-1]) {
		this.option.page=page;
		this.showPhotoLoading(true);
		flickr.callapi(this.method, this.option, this);
		this.pagestoload[page-1] = true;
	}
};
PanelControl.prototype.updateSelectionInfo=function(){
	this.$panel.find('span.total').text(this.total);
	var sel_num=this.$panel.find('img.selected').size();
	this.$panel.find('span.selected').text(sel_num);
	if(sel_num) { this.$panel.find('span.clearspan').show();
	} else { this.$panel.find('span.clearspan').hide(); }
}
PanelControl.prototype.onDataLoaded=function(success, responseXML, responseText, params){ try {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var phs=rsp.photos||rsp.photoset;

	var currPage=parseInt(phs.page,10)-1;
	this.perpage=parseInt(phs.perpage||phs.per_page,10);
	this.total=parseInt(phs.total,10)||0;

	this.updateSelectionInfo();

	this.$panel.find('div.content').width(this.total*79);

	var owner=unsafewin.global_nsid;
	var ownername=unsafewin.global_name;
	var buddy_url=unsafewin.global_icon_url;
	var tmp_photos=[];
	flickr.parse(tmp_photos, rsp, false, owner, ownername, buddy_url);

	this.prepareImage(currPage*this.perpage, tmp_photos);

	this.slide(0);
} finally { this.showPhotoLoading(false); }
};
PanelControl.prototype.setPhotos=function(photos){
	if(this.isOrganizePanel) {
		this.$panel.find('select.collectselect').val('none');
	} else if(photos.length==1) {
		this.gmap.onPanelPhotoClick(0);
		return;
	}

	this.show(true);

	this.pagestoload=null; // disable more loading
	this.photos=photos;
	photos.show_idx=photos.show_idx||0;
	photos.sel_idx=photos.sel_idx||0;

	this.total=photos.length;

	this.$panel.find('span.total').text(this.total);
	this.$panel.find('span.selected').text(0);
	this.$panel.find('div.content').width(this.total*79);

	this.prepareImage(0, photos);

    if(!this.isOrganizePanel) {
		this.onPhotoClick.call(this.imgs[photos.sel_idx]);
	}

	this.slide(0);
};
PanelControl.prototype.prepareImage=function(startidx,photos){
	var content=this.$panel.find('div.content').get(0);
	for(var i=0; i<photos.length; ++i) {
		var idx=startidx+i;
		var photo=photos[i];
		var img=this.imgs[idx];
		if(!img) {
			img=this.imgs[idx]=$('<img style="position:absolute;width:75px;height:75px;"></img>').css('left',idx*79+1).appendTo(content).click(this.onPhotoClick).get(0);
			img.idx=idx;
			img.ctrl=this;
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
	}
	this.photos.show_idx=begin_idx;

	for(var i=begin_idx; i<=end_idx; ++i) {
		var photo = this.photos[i];
		if(!photo) {
			this.loadData(parseInt(i/this.perpage)+1,10);
		} else if(!photo.img) {
			photo.img=this.imgs[i];
			$(photo.img).attr({title:photo.api.gettitle(photo),src:photo.api.iconurl(photo)});
		}
	}


	var $progressbarctnr=this.$panel.find('div.progressbar').parent();

	if(this.total <= rel_count) {
		$progressbarctnr.hide();
	} else {
		var bartotalwid=$progressbarctnr.show().width();
		var barwid=rel_count/this.total*bartotalwid;

		if(barwid < 50 && bartotalwid > 100) {
			var mov={width:'50px', left:Math.floor(begin_idx/(this.total-rel_count)*(bartotalwid-50))};
		} else {
			var mov={width:Math.floor(rel_count/this.total*bartotalwid), left:Math.floor(begin_idx/this.total*bartotalwid)};
		}
		this.$panel.find('div.progressbar').animate(mov, 'fast');
	}

	this.$panel.find('div.content').animate({left:begin_idx*(-79)},'fast');
};
PanelControl.prototype.onPhotoClick=function(){
	if(this.ctrl.isOrganizePanel) { return; }

	this.ctrl.photos.sel_idx=this.idx;
	this.ctrl.$panel.find('img.selected').removeClass('selected');
	$(this).addClass('selected');

	if(this.ctrl.gmap && this.ctrl.gmap.onPanelPhotoClick) { this.ctrl.gmap.onPanelPhotoClick(this.idx); }
};
PanelControl.prototype.setInfo=function(txt){
	this.$panel.find('span.info').text(txt);
};
PanelControl.prototype.setPage=function(curr,total){
	if(total!==null) { this.pageTotal=total; }
	if(curr !==null) { this.pageCurr=curr; }

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
PanelControl.prototype.getPageCurr=function(){ return this.pageCurr; };
PanelControl.prototype.showPageLoading=function(show){
	if(show) {
		this.$panel.find('div.pagebar').get(0).disableDrag=true;
		this.$panel.find('div.pagebartotal').addClass('barloading');
	} else {
		this.$panel.find('div.pagebartotal').removeClass('barloading');
	}
};
PanelControl.prototype.showPhotoLoading=function(show){
	if(show) { this.$panel.find('div.progresstotal').addClass('barloading');
	} else {   this.$panel.find('div.progresstotal').removeClass('barloading'); }
};

PanelControl.prototype.getTime=function(){
	var year=this.$panel.find('select.year_select').val();

	if(year === 'all') {
		var ddmax=new Date();
		var yy=ddmax.getFullYear();
		var mm=ddmax.getMonth()+1;
		var dd=ddmax.getDate();
		return {begin:'1800-01-01 00:00:00', end:yy+'-'+(mm<10?'0':'')+mm+'-'+(dd<10?'0':'')+dd+' 23:59:59'};
	}

	var datemin=null;
	if(year === 'lastmonth') {
		datemin=new Date();
		datemin.setMonth(datemin.getMonth()-1);
	} else if(year === 'lastweek') {
		datemin=new Date();
		datemin.setDate(datemin.getDate()-7);
	} else if(year === 'yesterday') {
		datemin=new Date();
		datemin.setDate(datemin.getDate()-1);
	}
	if(datemin) {
		var y=datemin.getFullYear();
		var m=datemin.getMonth()+1;
		var d=datemin.getDate();
		var dmin=y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d+' 00:00:00';
		var dmax=new Date();
		y=dmax.getFullYear();
		m=dmax.getMonth()+1;
		d=dmax.getDate();
		dmax=y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d+' 23:59:59';
		return {begin:dmin, end:dmax};
	}

	// year is number
	var month=this.$panel.find('select.month_select').val();
	if(month === 'all') {
		return {begin:year+'-01-01', end:year+'-12-31 23:59:59'};
	} else {
		var day=this.$panel.find('select.day_select').val();
		if(day === 'all') { return {begin:year+'-'+month+'-01', end:year+'-'+month+'-31 23:59:59'}; }
		else {             return {begin:year+'-'+month+'-'+day, end:year+'-'+month+'-'+day+' 23:59:59'}; }
	}
};
PanelControl.prototype.getSort=function(){ return this.$panel.find('select.sort_select').val(); };
PanelControl.prototype.getSearchText=function(){ return $.trim(this.$panel.find('input.search_text').val()); };
PanelControl.prototype.isTimeTracking=function(){ return this.timetracking; };




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


// PhotoSetMap : PhotosMap
var PhotoSetMap=function(container, opts){
	PhotoSetMap.superconstructor.call(this, container, opts);
	this.win=opts.win;
	this.win.gmap=this;
	this.photoset_id=opts.photoset_id;
	this.datetracking=false;

	this.isSetCenter=false;
	this.setCenter(new google.maps.LatLng(0,0), 0);

	this.addMapType(google.maps.PHYSICAL_MAP);
	this.addControl(new google.maps.HierarchicalMapTypeControl());
	this.addControl(new google.maps.LargeMapControl());
	var ctrl = new google.maps.OverviewMapControl();
	this.addControl(ctrl);
	ctrl.hide();

	//var photoSetCtrl = new PhotoSetControl(this.photoset_id);
	//this.addControl(photoSetCtrl);

	var panelctrl=new PanelControl(2);
	this.setPanelControl(panelctrl);
	this.addControl(panelctrl);

	google.maps.Event.addListener(this, 'zoomend', this.onzoomend);

	this.win.showmask(true);

	var that=this;
	flickr.callapi('flickr.photosets.getInfo', {photoset_id:this.photoset_id}, function(success, responseXML, responseText, params) {
		var rsp=eval('(' + responseText + ')');
		if(!rsp||rsp.stat != 'ok') return;

		that.getPanelControl().setInfo(rsp.photoset.title._content);
	});

	var opts={photoset_id:this.photoset_id, extras:'geo,date_upload,date_taken,icon_server,license', per_page:PER_PAGE, page:1};
	this.getPanelControl().showPageLoading(true);
	flickr.callapi('flickr.photosets.getPhotos', opts, this);
};
extend(PhotoSetMap, PhotosMap);
PhotoSetMap.prototype.flickr_photosets_getPhotos_onLoad=function(success, responseXML, responseText, params){
	var pageCurr = 0;
	var pageTotal = 0;
try {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var photoset=rsp.photoset;

	pageCurr=parseInt(photoset.page,10);
	pageTotal=parseInt(photoset.pages,10);

	if(pageCurr < pageTotal) {
		//this.getPanelControl().showPageLoading( true, parseInt(pageCurr/pageTotal*100,10)+'%');
		var opts={photoset_id:this.photoset_id, extras:'geo,date_upload,date_taken,icon_server,license', per_page:PER_PAGE, page:pageCurr+1};
		flickr.callapi('flickr.photosets.getPhotos', opts, this);
	}

	var owner=photoset.owner;
	var ownername=photoset.ownername;
	flickr.parse(this.photos, rsp, true, owner, ownername);

	this.regroupphotos();
} finally {
	if(pageCurr >= pageTotal) this.getPanelControl().showPageLoading(false);
	this.win.showmask(false);
}};
PhotoSetMap.prototype.regroupphotos=function(){
	if(!this.isSetCenter) {
		this.isSetCenter=true;
		var totalbound = new google.maps.LatLngBounds();
		for (var i=0,len=this.photos.length; i<len; i++) {
			var photo=this.photos[i];
			if(!photo.pos) continue;
			totalbound.extend(photo.pos);
		}
		var zoom = this.getBoundsZoomLevel(totalbound);
		this.setCenter(totalbound.getCenter(), zoom);
		return;
	}

	this.clearOverlays();

	var pgroups=this.groupPhotos();

	if(this.datetracking) {
		pgroups.sort( function(a,b){ if(a.firstdate>b.firstdate) return -1; else return 1;} );
		var trackpoints = [];
		for (var i=0,len=pgroups.length; i<len; i++) {
			trackpoints.push(pgroups[i].getCenter());
		}
		this.addOverlay(new google.maps.Polyline(trackpoints)); // TODO disappear if large track points .....
	}

	this.showPhotoGroups(pgroups);
};
PhotoSetMap.prototype.onzoomend=function(){
	this.regroupphotos();
};
PhotoSetMap.prototype.tracking_toggle=function(){
	this.datetracking = !this.datetracking;
	this.regroupphotos();
};
PhotoSetMap.prototype.onSearchResultClicked=function(pos, zoom){
	this.setCenter(pos,zoom);
};



// BrowseMap : PhotosMap
var BrowseMap=function(container, opts){
	if(opts && opts.organize_user_id) {
		opts.user_id=opts.organize_user_id;
	}
	BrowseMap.superconstructor.call(this, container, opts);
	this.win=opts.win;
	this.win.gmap=this;
	this.user_id=opts.user_id;
	this.group_id=opts.group_id;
	this.fullrange=opts.fullrange;
	this.disable_refresh=false;
	this.lastcenter=null;
	this.suspenddragevent=false;
	this.delay_loading=2000;
	this.currSelectMarker=null;

	//if(this.user_id) {
	//	this.browseoption = new BrowseOptionControl('all',null,'relevance');
	//} else {
	//	this.browseoption = new BrowseOptionControl();
	//}
	//this.addControl(this.browseoption);

	this.addMapType(google.maps.PHYSICAL_MAP);
	this.addControl(new google.maps.HierarchicalMapTypeControl());
	this.addControl(new google.maps.LargeMapControl());
	var ctrl = new google.maps.OverviewMapControl();
	this.addControl(ctrl);
	ctrl.hide();

	var panelctrl=null;
	if(opts.organize_user_id) {
		panelctrl=new PanelControl(3,'all',null,'relevance');
	} else if(this.user_id) {
		panelctrl=new PanelControl(1,'all',null,'relevance');
	} else {
		panelctrl=new PanelControl(1);
	}
	this.setPanelControl(panelctrl);
	this.addControl(panelctrl);

	panelctrl.setPage(1, -1); // loading...

	if(opts.organize_user_id) {
		this.contextMenu = new ContextMenuControl(function(point, src, overlay){
			if(!src || !src.tagName) return false;
			if((src.tagName == 'DIV' && src.className && src.className == 'markerlabel') || (src.tagName == 'IMG' && overlay && overlay.photos)) {
			   	return true;
			}
			return false;
		});
		this.contextMenu.addItem('delete', function(point, src, overlay){
			var marker = (overlay.photos ? overlay : src.marker);
			marker.deleteAllGeoInfo();
		});
		this.addControl(this.contextMenu);
	}

	google.maps.Event.addListener(this, 'zoomend', this.onzoomend);
	google.maps.Event.addListener(this, 'dragend', this.ondragend);

	var lat = parseFloat(GM_getValue('last_browse_lat', DEF_LAT));
	var lng = parseFloat(GM_getValue('last_browse_lng', DEF_LNG));
	var zoom = parseInt(GM_getValue('last_browse_zoom', DEF_ZOOM),10);
	this.setCenter(new google.maps.LatLng(lat,lng), zoom);
};
extend(BrowseMap, PhotosMap);
BrowseMap.prototype.onzoomend=function(){
	this.clearOverlays();
	this.getPanelControl().setPage(1,-1); //loading
	this.refreshView();
};
BrowseMap.prototype.ondragend=function(){
	if(this.suspenddragevent) { return; }
	var lastcenter=this.lastcenter;
	var bound=this.getBounds();
	var center=bound.getCenter();
	var span=bound.toSpan();
	if(lastcenter) {
		var dx  = Math.abs(center.lng() - lastcenter.lng());
		var dy  = Math.abs(center.lat() - lastcenter.lat());
		var bx = span.lng();
		var by = span.lat();
		if ((dx < 0.15*bx) && (dy < 0.15*by)) { return; }
	}
	this.getPanelControl().setPage(1,-1); // loading
	this.refreshView();
};
BrowseMap.prototype.refreshView=function(nodelay, timestamp){
	if(this.disable_refresh) { return; }
	if(!timestamp) {
		this.search_timestamp = new Date().getTime();
		timestamp = this.search_timestamp;
	}
	if(this.search_timestamp !== timestamp) { return; }

	var gmap = this;
	if(!nodelay) {
		setTimeout( function() { gmap.refreshView(true, timestamp); }, this.delay_loading);
		return;
	}

	this.getPanelControl().showPageLoading(true);

	this.lastcenter = this.getCenter();
	window.setTimeout(function() {
		GM_setValue('last_browse_zoom', gmap.getZoom()+'');
		GM_setValue('last_browse_lat', gmap.lastcenter.lat()+'');
		GM_setValue('last_browse_lng', gmap.lastcenter.lng()+'');
	}, 0);

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

	var pageCurr=this.getPanelControl().getPageCurr();
	var searchOption={extras:'geo,date_upload,date_taken,owner_name,icon_server,license', per_page:PER_PAGE, page:pageCurr, accuracy:1};
	searchOption.search_timestamp=this.search_timestamp;
	searchOption.bbox=w+','+s+','+e+','+n;

	if(this.user_id) searchOption.user_id=this.user_id;
	if(this.group_id) searchOption.group_id=this.group_id;

	searchOption.sort=this.getPanelControl().getSort();

	var t = this.getPanelControl().getTime();
	if(t.begin) searchOption.min_taken_date=t.begin;
	if(t.end)   searchOption.max_taken_date=t.end;

	var searchtxt = this.getPanelControl().getSearchText();
	if(searchtxt!='') { searchOption.text=searchtxt; }

	//var points = [new gobj.GLatLng(n,e),new gobj.GLatLng(n,w),new gobj.GLatLng(s,w),new gobj.GLatLng(s,e),new gobj.GLatLng(n,e)];
	//this.addOverlay(new gobj.GPolyline(points, '#0000FF', 1, .3));
	flickr.callapi('flickr.photos.search', searchOption, this);
};
BrowseMap.prototype.flickr_photos_search_onLoad=function(success, responseXML, responseText, params){
	if(this.search_timestamp != params.search_timestamp) return;
try {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') { return; }

	var pageCurr=parseInt(rsp.photos.page,10);
	var pageTotal=parseInt(rsp.photos.pages,10);

	this.getPanelControl().setPage(pageCurr, pageTotal);

	this.photos=[]; // clear previous photo data

	flickr.parse(this.photos, rsp);

	this.regroupphotos();
} finally {
	this.getPanelControl().showPageLoading(false);
}};
BrowseMap.prototype.regroupphotos=function(){
	if(!this.photos) { return; }

	this.clearOverlays();

	var pgroups=this.groupPhotos();
	this.showPhotoGroups(pgroups);
};
BrowseMap.prototype.changeOption=function(){
try{
	this.getPanelControl().setPage(1,-1); // loading
	this.refreshView(true);
} finally { return false;
}};
BrowseMap.prototype.onSearchResultClicked=function(pos, zoom){
	this.disable_refresh=true;
	this.setCenter(pos,zoom);
	this.disable_refresh=false;
	this.onzoomend();
};

	this.PhotoMap=PhotoMap;
	this.PhotoSetMap=PhotoSetMap;
	this.BrowseMap=BrowseMap;
	arguments.callee.inited=true;
},


checknewversion: function() {
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
}},


prepare: function() {
	if(arguments.callee.init_ok) { return true; }

	if($ && google && google.maps && google.maps.Map2 && google.maps.Unload ) {
		arguments.callee.init_ok=true;
		unsafewin.grab_win=undefined;
		return true;
	}
	if(!arguments.callee.prepare) {
		arguments.callee.prepare = true;
		GM_addStyle(FGS_STYLE);

		loadscript(js_jquery,function(){
			$=unsafewin.jQuery;
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
					var posy=e.clientY-obj.dragposy+parseInt($obj.css('top'),10);
					var posx=e.clientX-obj.dragposx+parseInt($obj.css('left'),10);

					if(opt.direction==='horizontal') { posy=0;
					} else if(opt.direction==='vertical') { posx=0; }

					if(opt.bounded==='parent') {
						var bw=$obj.width();
						var cw=$obj.parent().width();
						if(posx < 0) { posx=0;
						} else if(posx+bw>cw) { posx=cw-bw; }
					}
					$obj.css({'top':posy,'left':posx});
					obj.dragposx=e.clientX;
					obj.dragposy=e.clientY;
					if(cbdraging) { cbdraging(e,obj); }
				}).mouseup(function(e){
					if(!obj.dragbegin || obj.disableDrag) { return; }
					$obj.css('cursor','pointer');
					obj.dragbegin=false;
					if(cbdragend) { cbdragend(e,obj); }
				});
			};
		});
		var k = map_key[location.hostname];
		if(!k) {
			alert('Not support This host, please contact: '+SCRIPT.author);
			return;
		}
		loadscript(js_gmap+k,function(){
			unsafewin.grab_win = (function(w) { google=w.google; });
			location.href = 'javascript:void(window.grab_win(window));'; // call 
			unsafewin.google.load('maps', '2.x');
		});
		loadscript(js_analytics,function(){
			location.href='javascript:(' + function() { var pageTracker = _gat._getTracker('UA-359113-6'); pageTracker._initData(); pageTracker._trackPageview(); } + ')()';
		});
	}
	return false;
},

onWindowResizeScroll: function() { $('div.flickrgmapshow').each(function() { this.onWindowResize(); }); },

launch: function(){
try {
	if(!fgs.init_prepare) {
		fgs.init_prepare = true; // only once...

		setTimeout(function(){
			fgs.checknewversion();
		}, 0);

		var loading = document.createElement('img');
		loading.setAttribute('src', small_loading);
		this.appendChild(loading);

		var lnk = this;
		var callfun = arguments.callee;
		(function() {
			if(fgs.prepare()) {
				prepare_pics();
				fgs.init_afterloaded();
				$(window).unload(google.maps.Unload).resize(fgs.onWindowResizeScroll).scroll(fgs.onWindowResizeScroll);
				callfun.call(lnk, null);
				loading.parentNode.removeChild(loading);
			} else {
				window.setTimeout(arguments.callee, 100); // unsafe!!, pass real window to sandbox...
			}
		})();
		return;
	}

	if(!fgs.prepare()) {
		alert('Flickr Gmap Show loading...');
		return false;
	}

	if(this.win) {
		if(this.win.style.display != 'none') {
			this.win.close();
		} else {
			this.win.open();
		}
		return;
	}

	var opt = {photo_id:this.getAttribute('photo_id'), user_id:this.getAttribute('user_id'), group_id:this.getAttribute('group_id'), photoset_id:this.getAttribute('photoset_id')};
	if(opt.photo_id) {
		this.win=create_mapwindow({link:this,fixmax:false,width:516,height:313,embedlink:true,loadlast:true});
		opt.win=this.win;
		this.win.open(document.body);
		new fgs.PhotoMap(this.win.mapdiv, opt);
	} else if(opt.photoset_id) {
		this.win=create_mapwindow({link:this,fixmax:true,readonly:true,embedlink:true});
		opt.win=this.win;
		this.win.open(document.body);
		new fgs.PhotoSetMap(this.win.mapdiv, opt);
	} else { // world map, user map, organize map
		this.win=create_mapwindow({link:this,fixmax:true,readonly:true,loadlast:true});
		opt.win=this.win;
		opt.organize_user_id=this.getAttribute('organize_user_id');
		this.win.open(document.body);
		new fgs.BrowseMap(this.win.mapdiv, opt);
	}
} finally {
	return false;
}},

onload: function() {
	var re_photo_map_link =    /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/(\d+)\/map(?:\/.*)?$/;
	var re_set_map_link =      /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/sets\/(\d+)\/map(?:\/.*)?$/;
	var re_user_map_link =     /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/map(?:\/.*)?$/;
	var re_organize_map_link = /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/organize\/\?start_tab=map(?:\/.*)?$/;
	var re_group_map_link =    /^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]+)\/map(?:\/.*)?$/;
	var re_world_map_link =    /^http:\/\/(?:www.*\.)?flickr\.com\/map(?:\/.*)?$/;

	function parseLink(p, exp) {
		if(!p) { return; }
		var lnks = p.getElementsByTagName('a');
		for(var ln in lnks) {
			var maplnk = lnks[ln];
			if(maplnk.href && exp.exec(maplnk.href)) {
				maplnk.setAttribute('onclick','return false;');
				maplnk.addEventListener('click',fgs.launch,false);
				return maplnk;
			}
		}
	};
	function parsePhotoMap(p) {
		var maplnk = parseLink(p, re_photo_map_link);
		if(maplnk) { maplnk.setAttribute('photo_id',RegExp.$2); }
	};
	function parseUserMap(p,user_id) {
		var maplnk = parseLink(p, re_user_map_link);
		if(maplnk) { maplnk.setAttribute('user_id',user_id); }
	};
	function parseWorldMap(p) {
		parseLink(p, re_world_map_link);
	};
	function parseGroupMap(p) {
		var maplnk = parseLink(p, re_group_map_link);
		if(maplnk) { maplnk.setAttribute('group_id',unsafewin.f.w.value); }
	};
	function parsePhotosetMap(p) {
		var maplnk = parseLink(p, re_set_map_link);
		if(maplnk) { maplnk.setAttribute('photoset_id',RegExp.$2); }
	};
	function parseOrganizeMap(p) {
		var maplnk = parseLink(p, re_organize_map_link);
		if(maplnk) { maplnk.setAttribute('organize_user_id',unsafewin.global_nsid); }
	};

	if(       /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/(\d+)(?:\/.*)?$/.exec(location.href)) {
		var maplnk = document.getElementById('a_link_to_map');
		if(maplnk) {
			maplnk.setAttribute('photo_id',RegExp.$2);
			maplnk.setAttribute('onclick','return false;');
			maplnk.addEventListener('click',fgs.launch,false);
		}
		var edtlnk = document.getElementById('a_place_on_map_old');
		if(edtlnk) {
			edtlnk.setAttribute('photo_id',RegExp.$2);
			edtlnk.setAttribute('onclick','return false;');
			edtlnk.addEventListener('click',fgs.launch,false);
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/sets\/(\d+)(?:\/.*)?$/.exec(location.href)) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras) {
			paras[p].className == 'Do' && parsePhotoMap(paras[p]);
			paras[p].className == 'Links' && parsePhotosetMap(paras[p]);
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)(?:\/.*)?$/.exec(location.href)) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras) {
			paras[p].className == 'Do' && parsePhotoMap(paras[p]);
			paras[p].className == 'Links' && parseUserMap(paras[p],unsafewin.f.w.value);
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/explore(?:\/.*)?$/.exec(location.href)) {
		parseWorldMap(document.getElementById('Main'));
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]+)(?:\/.*)?$/.exec(location.href)) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras) {
			paras[p].className == 'Links' && parseGroupMap(paras[p]);
		}
	}

	parseUserMap(document.getElementById('candy_nav_menu_you'), unsafewin.global_nsid);
	parseOrganizeMap(document.getElementById('candy_nav_menu_organize'));
	parseWorldMap(document.getElementById('candy_nav_menu_explore'));
}
};

fgs.onload();

})();
