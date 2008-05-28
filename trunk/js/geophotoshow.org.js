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



/*include loadscript.js */

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
/*include api_flickr.js */
/*include api_picasa.js */
/*include api_panoramio.js */

//var hq23={}; // not support geo search yet... http://www.23hq.com/forums/message-view?message_id=1714420
//var mappeo={}; // http://mappeo.net/welcome/api

var mymap = {};

function init() {
	if(arguments.callee.inited) { return; }

/*include extend.js */

/*include PhotoGroupMarker.js */

/*include PanelControl.js */
/*include BrowsePanelControl.js */

/*include PhotosMap.js */
/*include BrowseMap.js */
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

/*include jquery_init.js */

	init();

	var opt={panelctrl:new mymap.BrowsePanelControl('all')};
	var map=new mymap.BrowseMap($("div#map").addClass('flickrgmapshow').get(0), opt);
	map.enableContinuousZoom();
	map.enableScrollWheelZoom();
}

google.setOnLoadCallback(initialize);

})();
