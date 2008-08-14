// Flickr Gmap Show
// v3.4
// Copyright (c) 2008, wctang (Tang Wei-Ching).
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// Change Log:
// v3.4  08/08/14 Minor update for flickr update.
// v3.3  08/05/28 Update library version.
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
// @version       3.4
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
	version: '3.4',
	date: (new Date(2008, 8, 14)).valueOf() // update date
};

var unsafewin = (typeof unsafeWindow != 'undefined') ? unsafeWindow : window;
var unsafedoc=unsafewin.document;

var $;
var map_key = {
	'www.flickr.com':'ABQIAAAA5iyLqLpUbk1qBe2volmsqxSJH83gQrDVSdV8r9NArjCP9aOWERRU1og-N0K74gHhNgzjBwOD_qJqMA',
	'flickr.com'    :'ABQIAAAA5iyLqLpUbk1qBe2volmsqxSGM0_bDfGWz8SC2GLcx2eGJvE10BTGjbXI0oN8Qn9JZDhW_LeBOkw_sA'
};
var js_gmap = 'http://www.google.com/jsapi?key=';
var google=null;
var js_analytics = 'http://www.google-analytics.com/ga.js';

// var EMBEDDED_URL = 'http://flickr-gmap-show.googlecode.com/svn/trunk/';

var PER_PAGE = 200;
var DEF_LAT = '0';
var DEF_LNG = '0';
var DEF_ZOOM = '3';

var small_loading = 'data:image/gif;base64,R0lGODlhCgAKAJEDAMzMzP9mZv8AAP%2F%2F%2FyH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQFAAADACwAAAAACgAKAAACF5wncgaAGgJzJ647cWua4sOBFEd62VEAACH5BAUAAAMALAEAAAAIAAMAAAIKnBM2IoMDAFMQFAAh%2BQQFAAADACwAAAAABgAGAAACDJwHMBGofKIRItJYAAAh%2BQQFAAADACwAAAEAAwAIAAACChxgOBPBvpYQYxYAIfkEBQAAAwAsAAAEAAYABgAAAgoEhmPJHOGgEGwWACH5BAUAAAMALAEABwAIAAMAAAIKBIYjYhOhRHqpAAAh%2BQQFAAADACwEAAQABgAGAAACDJwncqi7EQYAA0p6CgAh%2BQQJAAADACwHAAEAAwAIAAACCpRmoxoxvQAYchQAOw%3D%3D';
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
	infobg_flickr   : imgdir+'infobg_flickr.jpg'
};

function prepare_pics() { $.each(pics, function() { $("<img>").attr("src", this); }); }


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


/*include loadscript.js */

/*include replace_document_write.js */

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
'div.flickrgmapshow .changed {color:red;} '+
'';

/*include api_flickr.js */

/*include gmap_geocode.js */

/*include create_window.js */

var mymap = {};

function init() {
	if(arguments.callee.inited) { return; }

/*include extend.js */

/*include ContextMenuControl.js */

/*include PhotoMap.js */

/*include PhotoGroupMarker.js */

/*include PanelControl.js */
/*include PhotoSetPanelControl.js */
/*include BrowsePanelControl.js */
/*include OrganizePanelControl.js */

/*include PhotosMap.js */
/*include PhotoSetMap.js */
/*include BrowseMap.js */
BrowseMap.prototype.loadLocation=function(){
	var lat = parseFloat(GM_getValue('last_browse_lat', DEF_LAT));
	var lng = parseFloat(GM_getValue('last_browse_lng', DEF_LNG));
	var zoom = parseInt(GM_getValue('last_browse_zoom', DEF_ZOOM),10);
	this.setCenter(new google.maps.LatLng(lat,lng), zoom);
};
BrowseMap.prototype.saveLocation=function(){
	var gmap = this;
	window.setTimeout(function() {
		GM_setValue('last_browse_zoom', gmap.getZoom()+'');
		GM_setValue('last_browse_lat', gmap.lastcenter.lat()+'');
		GM_setValue('last_browse_lng', gmap.lastcenter.lng()+'');
	}, 0);
};
BrowseMap.prototype.onSearchResultClicked=function(pos, zoom){
	this.disable_refresh=true;
	this.setCenter(pos,zoom);
	this.disable_refresh=false;

	this.clearOverlays();
	this.getPanelControl().setPage(1,-1); //loading
	this.refreshView();
};

	mymap.PhotoSetPanelControl=PhotoSetPanelControl;
	mymap.BrowsePanelControl=BrowsePanelControl;
	mymap.OrganizePanelControl=OrganizePanelControl;
	mymap.ContextMenuControl=ContextMenuControl;
	mymap.PhotoMap=PhotoMap;
	mymap.PhotoSetMap=PhotoSetMap;
	mymap.BrowseMap=BrowseMap;

	GM_addStyle(CSS_STYLE);

	function onWindowResizeScroll() {
		$('div.flickrgmapshow').each(function() { this.onWindowResize(); });
	}
	$(window).unload(google.maps.Unload).resize(onWindowResizeScroll).scroll(onWindowResizeScroll);

	arguments.callee.inited=true;
}

/*include check_userscript_version.js */

function prepare() {
	if(arguments.callee.init_ok) { return true; }

	if(unsafewin.jQuery && google && google.maps && google.maps.Map2 && google.maps.Unload ) {
		arguments.callee.init_ok=true;
		unsafewin.grab_win=undefined;

		$=unsafewin.jQuery;
/*include jquery_init.js */

		return true;
	}

	if(arguments.callee.prepare_called) return false;
	arguments.callee.prepare_called = true;

	var k = map_key[location.hostname];
	if(!k) {
		alert('Not support This host, please contact: '+SCRIPT.author);
		return false;
	}
	loadscript(js_gmap+k,null,function(){
		unsafewin.grab_win = (function(w) { google=w.google; }); // unsafe!!, pass real window to sandbox...
		location.href = 'javascript:void(window.grab_win(window));'; // call
		unsafewin.google.load('maps', '2', {'language':unsafewin.navigator.language});
		unsafewin.google.load('jquery', '1.2');
	});
	loadscript(js_analytics,null,function(){
		location.href='javascript:(' + function() { var pageTracker = _gat._getTracker('UA-359113-6'); pageTracker._initData(); pageTracker._trackPageview(); } + ')()';
	});
	return false;
}

function launch(){
try {
	if(!arguments.callee.init_prepare) {
		arguments.callee.init_prepare = true; // only once...

		setTimeout(function(){
			checknewversion();
		}, 0);

		var loading = document.createElement('img');
		loading.setAttribute('src', small_loading);
		this.appendChild(loading);

		var lnk = this;
		var callfun = arguments.callee;
		(function() {
			if(prepare()) {
				prepare_pics();
				init();
				callfun.call(lnk, null);
				loading.parentNode.removeChild(loading);
			} else {
				window.setTimeout(arguments.callee, 100);
			}
		})();
		return;
	}

	if(!prepare()) {
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
		new mymap.PhotoMap(this.win.mapdiv, opt);
	} else if(opt.photoset_id) {
		this.win=create_mapwindow({link:this,fixmax:true,readonly:true,embedlink:true});
		opt.win=this.win;
		this.win.open(document.body);
		new mymap.PhotoSetMap(this.win.mapdiv, opt);
	} else { // world map, user map, organize map
		this.win=create_mapwindow({link:this,fixmax:true,readonly:true,loadlast:true});
		opt.win=this.win;
		var organize_user_id=this.getAttribute('organize_user_id');
		if(organize_user_id) {
			opt.user_id=organize_user_id;
			opt.panelctrl=new mymap.OrganizePanelControl('all',null,'relevance');
			opt.contextMenu = new mymap.ContextMenuControl(function(point, src, overlay){
				if(!src || !src.tagName) return false;
				if((src.tagName === 'DIV' && src.className && src.className === 'markerlabel') || (src.tagName == 'IMG' && overlay && overlay.photos)) {
				   	return true;
				}
				return false;
			});
			opt.contextMenu.addItem('delete', function(point, src, overlay){
				var marker = (overlay.photos ? overlay : src.marker);
				marker.deleteAllGeoInfo();
			});
		} else if(opt.user_id) {
			opt.panelctrl=new mymap.BrowsePanelControl('all',null,'relevance');
		} else {
			opt.panelctrl=new mymap.BrowsePanelControl();
		}
		this.win.open(document.body);
		new mymap.BrowseMap(this.win.mapdiv, opt);
	}
} finally {
	return false;
}}


function initialize() {
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
				maplnk.addEventListener('click',launch,false);
				return maplnk;
			}
		}
	}
	function parsePhotoMap(p) {
		var maplnk = parseLink(p, re_photo_map_link);
		if(maplnk) { maplnk.setAttribute('photo_id',RegExp.$2); }
	}
	function parseUserMap(p,user_id) {
		var maplnk = parseLink(p, re_user_map_link);
		if(maplnk) { maplnk.setAttribute('user_id',user_id); }
	}
	function parseWorldMap(p) {
		parseLink(p, re_world_map_link);
	}
	function parseGroupMap(p) {
		var maplnk = parseLink(p, re_group_map_link);
		if(maplnk) { maplnk.setAttribute('group_id',unsafewin.f.w.value); }
	}
	function parsePhotosetMap(p) {
		var maplnk = parseLink(p, re_set_map_link);
		if(maplnk) { maplnk.setAttribute('photoset_id',RegExp.$2); }
	}
	function parseOrganizeMap(p) {
		var maplnk = parseLink(p, re_organize_map_link);
		if(maplnk) { maplnk.setAttribute('organize_user_id',unsafewin.global_nsid); }
	}

	var paras,pp;
	if(       /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/(\d+)(?:\/.*)?$/.exec(location.href)) {
		var span = document.getElementById('div_taken_in_links');
		if(span) {
			var lnks = span.getElementsByTagName('a');
			for(var ln in lnks) {
				lnks[ln].setAttribute('photo_id',RegExp.$2);
				lnks[ln].setAttribute('onclick','return false;');
				lnks[ln].addEventListener('click',launch,false);
			}
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/sets\/(\d+)(?:\/.*)?$/.exec(location.href)) {
		paras = document.getElementsByTagName('p');
		for(pp in paras) {
			paras[pp].className == 'Do' && parsePhotoMap(paras[pp]);
			paras[pp].className == 'Links' && parsePhotosetMap(paras[pp]);
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)(?:\/.*)?$/.exec(location.href)) {
		paras = document.getElementsByTagName('p');
		for(pp in paras) {
			paras[pp].className == 'Do' && parsePhotoMap(paras[pp]);
			paras[pp].className == 'Links' && parseUserMap(paras[pp],unsafewin.f.w.value);
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/explore(?:\/.*)?$/.exec(location.href)) {
		parseWorldMap(document.getElementById('Main'));
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]+)(?:\/.*)?$/.exec(location.href)) {
		paras = document.getElementsByTagName('p');
		for(pp in paras) {
			paras[pp].className == 'Links' && parseGroupMap(paras[pp]);
		}
	}

	parseUserMap(document.getElementById('candy_nav_menu_you'), unsafewin.global_nsid);
	parseOrganizeMap(document.getElementById('candy_nav_menu_organize'));
	parseWorldMap(document.getElementById('candy_nav_menu_explore'));
}

initialize();

})();
