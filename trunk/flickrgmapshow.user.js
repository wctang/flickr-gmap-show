// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @author        wctang <wctang@gmail.com>
// @include       http://www*.flickr.com/*
// @include       http://flickr.com/*
// @description   Show Flickr geotagged photos with Google Map.
// @source        http://userscripts.org/scripts/show/9450
// @identifier    http://userscripts.org/scripts/source/9450.user.js
// @version       3.0
//
// Change Log
// ==========
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
// ==/UserScript==

var gobj = (typeof unsafeWindow != 'undefined') ? unsafeWindow : window;
gobj.gobj = gobj;
var document=gobj.document;

(function() {
var scriptname = 'Flickr Gmap Show';
var installurl = 'http://userscripts.org/scripts/source/9450.user.js';
var currVer = '3.0';

var js_jquery = 'http://jqueryjs.googlecode.com/files/jquery-1.2.1.min.js';
var js_gmap = 'http://maps.google.com/maps?file=api&v=2.x';
var js_analytics = 'http://www.google-analytics.com/urchin.js';

var EMBEDDED_URL = 'http://flickr-gmap-show.googlecode.com/svn/trunk/';

var small_loading = 'data:image/gif;base64,R0lGODlhCgAKAJEDAMzMzP9mZv8AAP%2F%2F%2FyH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQFAAADACwAAAAACgAKAAACF5wncgaAGgJzJ647cWua4sOBFEd62VEAACH5BAUAAAMALAEAAAAIAAMAAAIKnBM2IoMDAFMQFAAh%2BQQFAAADACwAAAAABgAGAAACDJwHMBGofKIRItJYAAAh%2BQQFAAADACwAAAEAAwAIAAACChxgOBPBvpYQYxYAIfkEBQAAAwAsAAAEAAYABgAAAgoEhmPJHOGgEGwWACH5BAUAAAMALAEABwAIAAMAAAIKBIYjYhOhRHqpAAAh%2BQQFAAADACwEAAQABgAGAAACDJwncqi7EQYAA0p6CgAh%2BQQJAAADACwHAAEAAwAIAAACCpRmoxoxvQAYchQAOw%3D%3D';
var imgdir = 'http://flickr-gmap-show.googlecode.com/svn/trunk/pics/';
var imgs_src = {
	flickr_loading  : {src:imgdir+'flickr_loading.gif'},
	marker_img      : {src:imgdir+'marker_image.png'},
	marker_shw      : {src:imgdir+'marker_shadow.png'},
	marker_trans    : {src:imgdir+'marker_transparent.png'},
	loading         : {src:imgdir+'loading.gif'},
	icon1           : {src:imgdir+'icon1.png'},
	icon2           : {src:imgdir+'icon2.png'},
	icon3           : {src:imgdir+'icon3.png'}
};
var imgs = {};
function prepare_imgs() {
	for(var m in imgs_src) { var mm = new Image(); mm.src = imgs_src[m].src; imgs[m] = mm; }
}


var PER_PAGE = 200;
var DEF_LAT = '0';
var DEF_LNG = '0';
var DEF_ZOOM = '3';

var msg = [];

switch(gobj.global_intl_lang) {
	case 'zh-hk':
		msg['close'] = '&#x95dc;&#x9589;';
		msg['maxrestore'] = '&#x6700;&#x5927;/&#x9084;&#x539f;';
		msg['about'] = '&#x95dc;&#x65bc;';
		msg['youcando'] = '&#x4f60;&#x53ef;&#x4ee5;...';
		msg['loadlastlocation'] = '&#x8df3;&#x81f3;&#x6700;&#x5f8c;&#x4f4d;&#x7f6e;';
		msg['savelocation'] = '&#x5132;&#x5b58;&#x76ee;&#x524d;&#x5730;&#x7406;&#x4f4d;&#x7f6e;';
		msg['removelocation'] = '&#x522a;&#x9664;&#x5730;&#x7406;&#x4f4d;&#x7f6e;&#x8cc7;&#x8a0a;';
		msg['searchlocation'] = '&#x641c;&#x5c0b;&#x5730;&#x7406;&#x4f4d;&#x7f6e;';
		msg['getembedlink'] = '&#x53d6;&#x5f97;&#x5167;&#x5d4c;&#x7528;&#x9023;&#x7d50;';
		msg['showhide'] = '&#x986f;&#x793a;/&#x96b1;&#x85cf;';
		msg['pagefrst'] = '&#x7b2c;&#x4e00;&#x9801;';
		msg['pagelast'] = '&#x6700;&#x5f8c;&#x4e00;&#x9801;';
		msg['pageprev'] = '&#x524d;&#x4e00;&#x9801;';
		msg['pagenext'] = '&#x4e0b;&#x4e00;&#x9801;';
		msg['loading'] = '&#x8f09;&#x5165;&#x4e2d;';
		msg['opt-all'] = '&#x4f60;&#x6240;&#x6709;&#x7684;&#x76f8;&#x7247;';
		msg['opt-not_tagged'] = '&#x4f60;&#x7684;&#x672a;&#x6a19;&#x8b58;&#x76f8;&#x7247;';
		msg['opt-not_in_set'] = '&#x4f60;&#x4e0d;&#x5728;&#x76f8;&#x7247;&#x96c6;&#x4e2d;&#x7684;&#x76f8;&#x7247;';
		msg['opt-located'] = '&#x4f60;&#x7684;&#x5df2;&#x6a19;&#x793a;&#x5730;&#x7406;&#x4f4d;&#x7f6e;&#x7684;&#x76f8;&#x7247;';
		msg['opt-not_located'] = '&#x4f60;&#x7684;&#x672a;&#x6a19;&#x793a;&#x5730;&#x7406;&#x4f4d;&#x7f6e;&#x7684;&#x76f8;&#x7247;';
		msg['opt-set'] = '&#x4f60;&#x7684;&#x76f8;&#x7247;&#x96c6;';
		msg['opt-group'] = '&#x4f60;&#x7684;&#x7fa4;&#x7d44;';
		msg['date-date'] = '&#x65e5;&#x671f;';
		msg['date-lastmonth'] = '&#x4e0a;&#x500b;&#x6708;';
		msg['date-lastweek'] = '&#x4e0a;&#x500b;&#x661f;&#x671f;';
		msg['date-yesterday'] = '&#x6628;&#x5929;';
		msg['date-all'] = '&#x5168;&#x90e8;';
		msg['month-all'] = '&#x6240;&#x6709;&#x6708;&#x5206;';
		msg['sort-sort'] = '&#x6392;&#x5e8f;';
		msg['sort-interestingness-desc'] = '&#x6709;&#x8da3;&#x5ea6;&#xff0c;&#x5927;&#x5230;&#x5c0f;';
		msg['sort-interestingness-asc'] = '&#x6709;&#x8da3;&#x5ea6;&#xff0c;&#x5c0f;&#x5230;&#x5927;';
		msg['sort-date-taken-desc'] = '&#x62cd;&#x651d;&#x65e5;&#x671f;&#xff0c;&#x8fd1;&#x81f3;&#x9060;';
		msg['sort-date-taken-asc'] = '&#x62cd;&#x651d;&#x65e5;&#x671f;&#xff0c;&#x9060;&#x81f3;&#x8fd1;';
		msg['sort-date-posted-desc'] = '&#x4e0a;&#x50b3;&#x65e5;&#x671f;&#xff0c;&#x8fd1;&#x81f3;&#x9060;';
		msg['sort-date-posted-asc'] = '&#x4e0a;&#x50b3;&#x65e5;&#x671f;&#xff0c;&#x9060;&#x81f3;&#x8fd1;';
		msg['sort-relevance'] = '&#x4f4d;&#x7f6e;&#x76f8;&#x95dc;&#x6027;';
		msg['search'] = '&#x641c;&#x5c0b;';
		msg['clearsel'] = '&#x6e05;&#x9664;&#x9078;&#x64c7;';
		msg['photos'] = '&#x5f35;&#x76f8;&#x7247;';
		msg['selected'] = '&#x5f35;&#x5df2;&#x9078;&#x64c7;';
		break;
	case 'de-de':
	case 'en-us':
	case 'es-us':
	case 'fr-fr':
	case 'it-it':
	case 'ko-kr':
	case 'pt-br':
	default:
		msg['close'] = 'Close';
		msg['maxrestore'] = 'Maxize/Restore';
		msg['about'] = 'About';
		msg['youcando'] = 'You can do...';
		msg['loadlastlocation'] = 'Load last location';
		msg['savelocation'] = 'Save location';
		msg['removelocation'] = 'Remove location';
		msg['searchlocation'] = 'Search location';
		msg['getembedlink'] = 'Get Embedded Link';
		msg['showhide'] = 'Show/Hide';
		msg['pagefrst'] = 'First Page';
		msg['pagelast'] = 'Last Page';
		msg['pageprev'] = 'Previous Page';
		msg['pagenext'] = 'Next Page';
		msg['loading'] = 'Loading';
		msg['opt-all'] = 'All your photos';
		msg['opt-not_tagged'] = 'Your non-tagged photos';
		msg['opt-not_in_set'] = 'Your photos not in a set';
		msg['opt-located'] = 'Your geotagged photos';
		msg['opt-not_located'] = 'Your non-geotagged photos';
		msg['opt-set'] = 'Your sets';
		msg['opt-group'] = 'Your groups';
		msg['date-date'] = 'Date';
		msg['date-lastmonth'] = 'Last Month';
		msg['date-lastweek'] = 'Last Week';
		msg['date-yesterday'] = 'Yesterday';
		msg['date-all'] = 'All Time';
		msg['month-all'] = 'All';
		msg['sort-sort'] = 'Sort';
		msg['sort-interestingness-desc'] = 'Interestingness, desc';
		msg['sort-interestingness-asc'] = 'Interestingness, asc';
		msg['sort-date-taken-desc'] = 'Date taken, desc';
		msg['sort-date-taken-asc'] = 'Date taken, asc';
		msg['sort-date-posted-desc'] = 'Date posted, desc';
		msg['sort-date-posted-asc'] = 'Date posted, asc';
		msg['sort-relevance'] = 'Relevance';
		msg['search'] = 'Search';
		msg['clearsel'] = 'Clear selection';
		msg['photos'] = 'photos';
		msg['selected'] = 'selected';
		break;
}


var deltas = [
0,
0,
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

function loadscript(jspath,loaded) {
	var s = document.createElement('script');
	s.type = 'text/javascript'
	s.src = jspath;
	if(loaded) {
		s.onreadystatechange = function() { this.readyState=='complete' && loaded(); };
		s.onload=loaded;
	}
	document.getElementsByTagName('head')[0].appendChild(s);
};
document.oldwrite = document.write;
document.write = function(str) {
	if(str.indexOf('<script ')>=0){
		var f = str.indexOf('src="')+5;
		var src = str.substring(f,str.indexOf('"',f));
		if(!gobj.overwritegload && gobj.GLoad && (typeof gobj.GLoad == 'function')) {
			gobj.overwritegload=true;
			gobj.eval('var gloadstr=gobj.GLoad.toString(); gloadstr=gloadstr.replace(/\\n/,""); gloadstr=gloadstr.replace(/^\\s*function\\s*GLoad\\s*\\(\\)\\s*{/,""); gloadstr=gloadstr.replace(/}\\s*$/,""); gloadstr=gloadstr.replace(/GValidateKey\\("[0-9a-z]*"\\)/,"true"); gobj.GLoad=new Function(gloadstr);');
		}
		loadscript(src);
	} else if(str.indexOf('<style ')>=0) {
		var sty = document.createElement('style');
		sty.type='text/css';
		var f = str.indexOf('media="');
		(f>0) && (sty.media=str.substring(f+7,str.indexOf('"',f+7)));
		str=str.replace(/<style.*">/,'').replace(/<\/style>/,'');
		sty.styleSheet ? sty.styleSheet.cssText = str /* ie */ : sty.appendChild(document.createTextNode(str));
		document.getElementsByTagName('head')[0].appendChild(sty);
	} else {
		document.oldwrite(str);
	}
};
function triggerEvent(target, type) {
	if(document.createEvent) {
		var e = document.createEvent('MouseEvents');
		e.initEvent(type, true, false);
	} else if(document.createEventObject) {
		var e = document.createEventObject();
	} else return;
	if (target.dispatchEvent) target.dispatchEvent(e);
	else if (target.fireEvent) target.fireEvent('on'+type, e);
};


var btnbackgnd = 'background:transparent url('+imgdir+'icons.png?v=2.9) no-repeat scroll ';
var shadwbkgnd = 'background:transparent url('+imgdir+'shadow-main.png) no-repeat scroll ';
var FGS_STYLE=
'img {border:0;text-decoration:none;} '+
'img.buddy {width:48px;height:48px;} '+
'.markerlabel {position:absolute; text-align:center; vertical-align:middle; font-size:'+(navigator.userAgent.indexOf('MSIE')>0?'x-small':'small')+'; cursor:pointer;}'+
'.mask {opacity:.8; -moz-opacity:.8; filter:alpha(opacity=80); background-color:black;} '+
'.mask div {position:relative;float:left;top:50%;margin-top:-16px;left:50%;margin-left:-16px;} '+
'.btn {cursor:pointer;} '+
'.btn img {overflow:visible;} '+
'.mapwin {font:14px arial; text-align:left;} '+
'.mapwin table.shadow {position:absolute;width:100%;height:100%;left:6px;top:6px;border-collapse:collapse;border:0;} '+
'.mapwin table.shadow td.main {border:0;             '+shadwbkgnd+' bottom right;} '+
'.mapwin table.shadow td.top  {border:0;height:12px; '+shadwbkgnd+' right top;} '+
'.mapwin table.shadow td.left {border:0;width:10px;  '+shadwbkgnd+' left bottom;} '+
'.mapwin .mapwinmain {border:solid 2px #EEEEEE; background-color:white; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwin .mapwinmain .panelcontent img {position:absolute; background:url('+imgs_src['loading'].src+') no-repeat bottom right; cursor:pointer;} '+
'.mapwin .mapwinmain .panelcontent .photoidx {height:5px;width:75px; background-color:#FF8888;} '+
'.mapwin .mapwinmain .progress {height:4px; background-color:#DDDDDD;} '+
'.mapwin .mapwinmain .progressbar {height:4px; background-color:#8888FF;} '+
'.mapwin .mapwinmain .search {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwin .mapwinmain .info {color:#999999;} '+
'.mapwin .mapwinmain .locate {font-style:italic;color:#999999;} '+
'.mapwin .mapwinmain .embeddedlink {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwin .mapwinmain .action {background-color:white;border:solid 1px black; } '+
'.mapwin .mapwinmain .action a {display:block; margin:5px;} '+
'.mapwin .mapwinmain .about {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwin .mapwinmain .msg {background-color:yellow;} '+
'.mapwin .mapwinmain .option {border:solid 1px black; background-color:white; padding:5px; text-align:left; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwin .mapwinmain .organizepanel .panel div.photo  {position:absolute;top:5px;width:75px;height:75px; border:1px solid gray;} '+
'.mapwin .mapwinmain .organizepanel .panel div.photo img {width:75px;height:75px;} '+
'.mapwin .mapwinmain .organizepanel .panel div.select {top:0px; border:1px solid red;} '+
'.mapwin .mapwinmain .markerpopup {font-family:arial; font-size:12px;} '+
'.mapwin .mapwinmain .contextmenu {background-color:white; border:solid 1px #8888FF; cursor:pointer;} '+
'.mapwin .mapwinmain .contextmenu a.delete {color:#4444ff; font-size:small; text-decoration:none;} '+
'.mapwin .mapwinmain .contextmenu a:hover {background:#eee;} '+
'a.closebtn,a.maxbtn,a.searchbtn,a.actionbtn,a.embedbtn,a.aboutbtn,a.updnbtn,a.prevbtn,a.nextbtn,a.trkbtn {display:block;width:15px;height:15px; text-indent:-999em; cursor:pointer;} '+
'a.p_btn,a.r_btn   {display:block;height:48px;width:25px; text-indent:-999em; cursor:pointer;} '+
'a.pp_btn,a.rr_btn {display:block;height:32px;width:25px; text-indent:-999em; cursor:pointer;} '+
'a.closebtn        {'+btnbackgnd+' 0px 0px;} '+
'a.closebtn:hover  {'+btnbackgnd+' -15px 0px; } '+
'a.maxbtn          {'+btnbackgnd+' 0px   -15px; } '+
'a.maxbtn:hover    {'+btnbackgnd+' -15px -15px; } '+
'a.searchbtn       {'+btnbackgnd+' 0px   -30px; } '+
'a.searchbtn:hover {'+btnbackgnd+' -15px -30px; } '+
'a.actionbtn       {'+btnbackgnd+' 0px   -45px; } '+
'a.actionbtn:hover {'+btnbackgnd+' -15px -45px; } '+
'a.embedbtn        {'+btnbackgnd+' 0px   -60px; } '+
'a.embedbtn:hover  {'+btnbackgnd+' -15px -60px; } '+
'a.aboutbtn        {'+btnbackgnd+' 0px   -75px; } '+
'a.aboutbtn:hover  {'+btnbackgnd+' -15px -75px; } '+
'a.updnbtn         {'+btnbackgnd+' 0px   -90px; } '+
'a.updnbtn:hover   {'+btnbackgnd+' -15px -90px; } '+
'a.prevbtn         {'+btnbackgnd+' 0px   -105px;} '+
'a.prevbtn:hover   {'+btnbackgnd+' -15px -105px;} '+
'a.nextbtn         {'+btnbackgnd+' 0px   -120px;} '+
'a.nextbtn:hover   {'+btnbackgnd+' -15px -120px;} '+
'a.trkbtn          {'+btnbackgnd+' 0px   -135px;} '+
'a.trkbtn:hover    {'+btnbackgnd+' -15px -135px;} '+
'a.p_btn           {'+btnbackgnd+' 0px   -150px;} '+
'a.p_btn:hover     {'+btnbackgnd+' -25px -150px;} '+
'a.pp_btn          {'+btnbackgnd+' 0px   -198px;} '+
'a.pp_btn:hover    {'+btnbackgnd+' -25px -198px;} '+
'a.r_btn           {'+btnbackgnd+' 0px   -230px;} '+
'a.r_btn:hover     {'+btnbackgnd+' -25px -230px;} '+
'a.rr_btn          {'+btnbackgnd+' 0px   -278px;} '+
'a.rr_btn:hover    {'+btnbackgnd+' -25px -278px;} ';




var flickr={
	name:'flickr',
	gettitle : function(photo) {return photo.title;},
	iconurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_s.jpg';},
	thumburl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_t.jpg';},
	smallurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_m.jpg';},
	mediumurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';},
	largeurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_b.jpg';},
	pageurl : function(photo) {return 'http://www.flickr.com/photo.gne?id='+photo.id;},
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
	buddyurl : function(photo) {
		if(photo.buddy_url) return photo.buddy_url;
		if(photo.iconserver&parseInt(photo.iconserver)>0) return 'http://farm'+photo.iconfarm+'.static.flickr.com/'+photo.iconserver+'/buddyicons/'+photo.owner+'.jpg';
		else return 'http://www.flickr.com/images/buddyicon.jpg';
	},
	licensestr : function(photo) {
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
	apifun : function(success, responseXML, responseText, params) {
		this.callback.call(this.tgt, responseText, this.params);
	},
	_callapi : function(methodname, args, obj) {
		args.format='json';
		args.nojsoncallback = '1';
		gobj.F.API.callMethod(methodname, args, obj);
	},
	callapi : function(methodname, args, obj, callback, params) {
		var o = {callback:callback,tgt:obj,params:params};
		o[methodname.replace(/\./g,'_')+'_onLoad']=flickr.apifun;
		return this._callapi(methodname, args, o);
	}
};

var geocode={
	accuracytozoom:[3,5,7,9,11,13,14,15,16],
	search:function(obj,callback,str) {
		var path = 'http://maps.google.com/maps/geo?key=ABQIAAAAtOjLpIVcO8im8KJFR8pcMhQjskl1-YgiA_BGX2yRrf7htVrbmBTWZt39_v1rJ4xxwZZCEomegYBo1w&q='+encodeURI(str);
		GM_xmlhttpRequest({method: 'GET', url: path, onload: function(result){callback.call(obj,result);}});
	}
};


function create_mapwindow(opt) {
	opt = opt || {};
	var win= $(
		'<div class="mapwin" style="position:absolute;z-index:1000; display:none;">'+
			($.browser.msie?'<div></div>':
			'<table class="shadow"><tr><td class="top" colspan="2"></td></tr><tr><td class="left"></td><td class="main"></td></tr></table>'  // shadow
			)+
			'<div class="mapwinmain" style="position:absolute;left:0px;">'+ // main
				'<div style="position:absolute;left:7px;top:5px;"></div>'+ // title
				'<div style="position:absolute;left:5px;top:27px; overflow:hidden;"></div>'+ // map
				'<div class="mask"   style="position:absolute;left:5px;top:27px; z-index:1000; display:none;"><div><img src="'+imgs['loading'].src+'"></img></div></div>'+ // mask
				'<div class="msg"    style="position:absolute;left:5px;bottom:24px;height:20px;"><a class="btn" style="display:none;">'+msg['loadlastlocation']+'? </a><a class="btn" style="display:none;">'+msg['savelocation']+'? </a></div>'+ // msg
				(opt.bottompanel?
				'<div style="position:absolute;left:5px;bottom:24px; background-color:white; border-top:5px solid white;">'+
					'<div class="mask" style="position:absolute; left:0px;top:0px;width:100%;height:100%; display:none;"></div>'+
				'</div>' // bottom panel
				:'')+
				(opt.activepanel?
				'<div style="position:absolute;left:5px;bottom:24px; background-color:white; border-top:5px solid white; display:none;"></div>' // default panel
				:'')+
				'<div class="info"   style="position:absolute;left:9px;bottom:8px;"></div>'+ // info
				'<div class="locate" style="position:absolute;right:30px;bottom:8px;"></div>'+ // locate div
				'<a class="closebtn" style="position:absolute;right:12px;top:6px;" title="'+msg['close']+'"></a>'+ // close btn
				'<a class="maxbtn"   style="position:absolute;right:32px;top:6px; display:none;" title="'+msg['maxrestore']+'"></a>'+ // max btn
				'<a class="searchbtn" style="position:absolute;right:52px;top:6px;" title="'+msg['searchlocation']+'"></a>'+ // search btn
				'<div class="search" style="position:absolute;left:15px;top:37px; display:none;"><a class="closebtn" style="position:absolute;right:12px;top:6px;"></a><div style="margin:10px;"><form id="geocode_search">'+msg['searchlocation']+': <input id="geocode_search_input" name="s_str"><input type="submit"></form><br><div id="geocode_result" style="overflow:auto;width:100%;"></div></div></div>'+ //search
				'<a class="actionbtn" style="position:absolute;right:72px;top:6px;" title="'+msg['youcando']+'"></a>'+ // action btn
				'<div class="action" style="position:absolute;right:5px;top:25px;width:150px; display:none;"></div>'+ // action panel
				(opt.embedlink?
				'<a class="embedbtn" style="position:absolute;right:92px;top:6px; display:none;" title="'+msg['getembedlink']+'"></a>'+ // embedded link btn
				'<div class="embeddedlink" style="position:absolute;left:15px;top:37px; display:none;"><a class="closebtn" style="position:absolute;right:12px;top:6px;"></a><div style="margin:10px;">Paste HTML to embed in website:<br><input style="width:100%;" id="embbed_link"></div></div>' //embedded link
				:'')+
				'<a class="aboutbtn" style="position:absolute;right:5px;bottom:6px; display:none;" title="'+msg['about']+'"></a>'+ // about btn
				'<div class="about"  style="position:absolute;right:15px;bottom:37px;width:200px;height:180px; display:none;"><div style="text-align:center; padding:3px;"><p><b>Flickr GMap Show</b></p><p><a href="http://code.google.com/p/flickr-gmap-show/">Project page</a><br><a href="http://userscripts.org/scripts/show/9450">Script page</a></p><p>Author: <a href="mailto:wctang@gmail.com">wctang</a></p><p><a target="_blank" href="https://www.paypal.com/xclick/business=wctang%40gmail%2ecom&item_name=fgs_donation&no_note=1&currency_code=USD"><img src="http://www.pspad.com/img/paypal_en.gif"></img></a></p></div></div>'+ //about
			'</div>'+
		'</div>').get(0);
	for(var f in create_mapwindow)
		(typeof create_mapwindow[f] == 'function') && (win[f] = create_mapwindow[f]);

	var maindiv = win.childNodes[1];
	win.$maindiv = $(maindiv);
	var idx = -1;
	var w = maindiv.childNodes;
	win.titlediv = w[++idx];
	win.mapdiv = w[++idx];
	win.$mapdiv = $(win.mapdiv);
	win.$maskdiv = $(w[++idx]);
	win.$maskdiv.css('opacity',.5);
	var msgdiv = w[++idx];
	win.$loadlastlocationlnk = $(msgdiv.childNodes[0]);
	win.$savelocationlnk = $(msgdiv.childNodes[1]);
	win.$loadlastlocationlnk.click(win.loadlastlocation_click).get(0).win=win;
	win.$savelocationlnk.click(win.savelocation_click).get(0).win=win;
	if(opt.bottompanel) {
		win.bottompanel = w[++idx];
		win.$bottompanel = $(win.bottompanel);
		win.$bottompanelmask = $(win.bottompanel.firstChild);
		
		win.bottompanelContent = opt.bottompanel;
		win.bottompanelContent.win = win;
		win.$bottompanel.height(win.bottompanelContent.height).prepend(win.bottompanelContent);
	}
	if(opt.activepanel) {
		win.activepanel = w[++idx];
		win.$activepanel = $(win.activepanel);
		
		win.activepanelContent = opt.activepanel;
		win.activepanelContent.win = win;
		win.$activepanel.height(win.activepanelContent.height).prepend(win.activepanelContent);
	}
	win.$infodiv = $(w[++idx]);
	win.locatediv = w[++idx];
	$(w[++idx]).click(win.close).get(0).win=win;
	var maxbtn = w[++idx];
	win.searchbtn = w[++idx];
	$(win.searchbtn).click(win.toggleSearch).get(0).win=win;
	win.searchdiv = w[++idx];
	win.$searchdiv = $(win.searchdiv);
	win.$searchdiv.find('a.closebtn').click(win.toggleSearch).get(0).win=win;
	win.$searchdiv.find('#geocode_search').submit(win.submitSearch).get(0).win=win;
	win.searchdiv.input=win.$searchdiv.find('#geocode_search_input').get(0);
	win.searchdiv.$result=win.$searchdiv.find('#geocode_result');
	win.actionbtn = w[++idx];
	$(win.actionbtn).click(win.toggleAction).get(0).win=win;
	win.$actiondiv = $(w[++idx]);
	if(opt.embedlink) {
		$(w[++idx]).show().click(win.toggleEmbeddedlink).get(0).win=win;
		win.$embbeddiv = $(w[++idx]);
		win.$embbeddiv.find('a.closebtn').click(win.toggleEmbeddedlink).get(0).win=win;
	}
	$(w[++idx]).show().click(win.toggleAbout).get(0).win=win;
	win.$aboutdiv = $(w[++idx]);

	win.link=opt.link;
	win.link.win=win;
	if(opt.fixmax) {
		win.m_max=true;
	} else {
		win.m_max=false;

		$(maxbtn).click(win.toggleMax).show().get(0).win=win;

		var ofst = $(win.link).offset();
		var top=ofst.top-opt.height-10;
		var left=ofst.left-(opt.width*.85);
		if(left < 10) left = 10;
		win.m_pos = {top:top,left:left,width:opt.width,height:opt.height};
	}

	if(opt.loadlast) win.action_append(msg['loadlastlocation'],win.loadlastlocation_click);
	if(!opt.readonly) {
		win.action_append(msg['savelocation'],win.savelocation_click);
		win.action_append(msg['removelocation'],win.removelocation_click);
	}

	return win;
};
create_mapwindow.open=function(){
	$(this).fadeIn('fast');
	this.refreshSize();
};
create_mapwindow.close=function(){
	var win = this.win || this;
	$(win).fadeOut('fast');
};
create_mapwindow.refreshSize=function(animate) {
	var pos;
	if(this.m_max) {
		pos = {width:document.body.clientWidth-30,height:document.body.clientHeight-30};
		if($.browser.msie) {
			pos.top=document.body.scrollTop+10;
			pos.left=document.body.scrollLeft+10;
		} else {
			pos.top=gobj.window.pageYOffset+10;
			pos.left=gobj.window.pageXOffset+10;
		}
		if(pos.width < 150) pos.width = 150;
		if(pos.height < 200) pos.height = 200;
	} else {
		pos = this.m_pos;
	}

	var $this=$(this);
	var isvisible = $this.is(':visible');
	if(isvisible && animate) {
		$this.animate(pos,'normal');
		this.$maindiv.animate({width:pos.width-4,height:pos.height-4},'normal');
	} else {
		$this.css(pos);
		this.$maindiv.css({width:pos.width-4,height:pos.height-4});
	}

	var ww=pos.width-13;
	var hh=pos.height-57;
	var maphh = hh;
	if(this.$bottompanel) {
		this.$bottompanel.width(ww);
		this.bottompanelContent.setWidth(ww-54);
		maphh -= (this.bottompanelContent.height + 5);
	}
	this.$mapdiv.width(ww).height(maphh);
	if(this.$activepanel) {
		this.$activepanel.width(ww);
		if(this.activepanelContent)
			this.activepanelContent.setWidth(ww-54);
	}
	this.$maskdiv.width(ww).height(hh);
	this.$searchdiv.width(ww-20).height(hh-30);
	this.searchdiv.$result.height(hh-85);
	(this.$embbeddiv) && this.$embbeddiv.width(ww-20).height(hh-43);
	this.$infodiv.width(ww-133);

	if(this.gmap && isvisible) {
		this.gmap.checkResize();
		if(this.gmap.marker)
			this.gmap.setCenter(this.gmap.marker.getLatLng());
	}
};
create_mapwindow.onWindowResize=function(){
	if(this.style.display == 'none' || !this.m_max) return;
	this.refreshSize();
};
create_mapwindow.action_append=function(str,fun){
	$('<a class="btn">'+str+'</a>').appendTo(this.$actiondiv.get(0)).click(fun).get(0).win=this;
};
create_mapwindow.toggleMax=function(){
	var win = this.win||this;
	win.m_max=!win.m_max;
	if(win.gmap.on_max_toggle) win.gmap.on_max_toggle(win.m_max);
	win.refreshSize(true);
};
create_mapwindow.disableSearchBtn=function() {
	$(this.searchbtn).hide();
};
create_mapwindow.toggleSearch=function(e){
	var win = this.win||this;
	if(!e || win.$searchdiv.is(':visible')){
		win.$searchdiv.fadeOut('fast');
	} else {
		win.$searchdiv.fadeIn('fast');
		win.searchdiv.input.focus();
	}
};
create_mapwindow.disableActionBtn=function() {
	$(this.actionbtn).hide();
};
create_mapwindow.toggleAction=function(e){
	var win = this.win||this;
	if(!e || win.$actiondiv.is(':visible')) {
		win.$actiondiv.fadeOut('fast');
	} else {
		win.$actiondiv.fadeIn('fast');
	}
};
create_mapwindow.toggleEmbeddedlink=function(e) {
	var win = this.win||this;
	if(!e || win.$embbeddiv.is(':visible')) {
		win.$embbeddiv.fadeOut('fast');
	} else {
		win.gmap && win.gmap.getembeddedlink && win.$embbeddiv.find('#embbed_link').val(win.gmap.getembeddedlink());
		win.$embbeddiv.fadeIn('fast');
	}
};
create_mapwindow.toggleAbout=function(){
	var win = this.win||this;
	(win.$aboutdiv.is(':visible')) ? win.$aboutdiv.fadeOut('fast') : win.$aboutdiv.fadeIn('fast');
};
create_mapwindow.toggleActivePanel=function(isshow, data){
	var win = this.win||this;

	if(isshow) {
		win.$activepanel.slideDown('slow');
		if(win.$bottompanelmask) win.$bottompanelmask.show();
		if(data) win.activepanelContent.setPhotos(data);
	} else {
		if(win.$bottompanelmask) win.$bottompanelmask.hide();
		win.$activepanel.slideUp('slow');
	}
	win.refreshSize();
};
create_mapwindow.submitSearch=function(){
try {
	geocode.search(this.win,this.win.submitSearch_callback,this.s_str.value);
} finally {
	return false;
}
};
create_mapwindow.submitSearch_callback=function(result){
	if(result.status != 200) {
		alert('Server Error!');
		return;
	}

	var gres = eval('('+result.responseText+')');
	if(!gres.Status || !gres.Status.code)
		return;
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
		alert(msg);
		return;
	}

	var points = gres.Placemark;
	this.searchdiv.$result.empty();
	for(var i = 0,len=points.length; i<len; i++) {
		var point = points[i];

		var addr = [];
		var addrdtl = point.AddressDetails;
		while(true) {
			if(!addrdtl) {
				break;
			} else if(addrdtl.Country) {
				if(addrdtl.Country.CountryNameCode) addr.push(addrdtl.Country.CountryNameCode);
				addrdtl=addrdtl.Country;
			} else if(addrdtl.AdministrativeArea) {
				if(addrdtl.AdministrativeArea.AdministrativeAreaName) addr.push(addrdtl.AdministrativeArea.AdministrativeAreaName);
				addrdtl=addrdtl.AdministrativeArea;
			} else if(addrdtl.SubAdministrativeArea) {
				if(addrdtl.SubAdministrativeArea.SubAdministrativeAreaName) addr.push(addrdtl.SubAdministrativeArea.SubAdministrativeAreaName);
				addrdtl=addrdtl.SubAdministrativeArea;
			} else if(addrdtl.Locality) {
				if(addrdtl.Locality.LocalityName) addr.push(addrdtl.Locality.LocalityName);
				addrdtl=addrdtl.Locality;
			} else if(addrdtl.Thoroughfare) {
				if(addrdtl.Thoroughfare.ThoroughfareName) addr.push(addrdtl.Thoroughfare.ThoroughfareName);
				addrdtl=addrdtl.Thoroughfare;
			} else {
				break;
			}
		}

		addr.reverse();
		var address = '';
		if(point.address) {
			var j = 0;
			for(; j< addr.length; ++j)
				if( point.address.indexOf(addr[j]) < 0) break;
			addr.splice(0,j);
			address = point.address + ' (' + addr.join(', ') + ')';
		} else {
			address = addr.join(', ');
		}

		var a = $('<a class="btn">'+address+'</a>').click(create_mapwindow.f_search_result_click).get(0);
		a.zoom=geocode.accuracytozoom[parseInt(point.AddressDetails.Accuracy)];
		var pos = point.Point.coordinates;
		a.lat=parseFloat(pos[1]);
		a.lng=parseFloat(pos[0]);
		a.win = this;
		this.searchdiv.$result.append(a).append('<br>');
	}
};
create_mapwindow.f_search_result_click=function(){
	var win = this.win;
	var pos = new gobj.GLatLng(this.lat,this.lng);
	if(win.gmap && win.gmap.onsearchresultclick)
		win.gmap.onsearchresultclick(pos, this.zoom);
	win.toggleSearch();
};
create_mapwindow.loadlastlocation_display=function() {
	this.$loadlastlocationlnk.show();
};
create_mapwindow.loadlastlocation_click=function() {
	this.win.$loadlastlocationlnk.hide();
	this.win.toggleAction();
	if(this.win.gmap.onloadlastlocation) this.win.gmap.onloadlastlocation();
};
create_mapwindow.savelocation_display=function() {
	this.$savelocationlnk.show();
};
create_mapwindow.savelocation_click=function() {
	if(confirm('Save location?')) {
		this.win.$savelocationlnk.hide();
		if(this.win.gmap.onsavelocation)
			this.win.gmap.onsavelocation();
	}
	this.win.toggleAction();
};
create_mapwindow.removelocation_click=function() {
	if(confirm('Remove location?'))
		if(this.win.gmap.removelocation)
			this.win.gmap.removelocation();

	this.win.toggleAction();
};
create_mapwindow.f_mask=function(ismask){
	ismask ? this.$maskdiv.show() : this.$maskdiv.hide();
};
create_mapwindow.f_settitle=function(t){this.titlediv.innerHTML = t;};



function PhotoPanel() {
	var panel =
		$('<div style="height:85px;">'+
			'<a class="pp_btn" title="'+msg['pagefrst']+'" style="position:absolute;left:1px;top:48px;"></a>'+
			'<a class="p_btn" title="'+msg['pageprev']+'" style="position:absolute; left:1px;top:0px;"></a>'+
			'<a class="r_btn" title="'+msg['pagenext']+'" style="position:absolute; right:1px;top:0px;"></a>'+
			'<a class="rr_btn" title="'+msg['pagelast']+'" style="position:absolute;right:1px;top:48px;"></a>'+
			'<div  style="position:absolute;left:27px;top:5px;height:80px;width:455px; overflow:hidden;"></div>'+
			'<div  class="progress" style="position:absolute;left:27px;top:0px;width:455px; overflow:hidden;">'+
				'<div class="progressbar" style="position:relative;width:10px;"></div>'+
			'</div>'+
		'</div>').get(0);
	panel.height=85;
	for(var f in PhotoPanel)
		(typeof PhotoPanel[f] == 'function') && (panel[f] = PhotoPanel[f]);
	var bs = panel.childNodes;
	$(bs[0]).click(panel.frst).get(0).panel=panel;
	$(bs[1]).click(panel.prev).get(0).panel=panel;
	$(bs[2]).click(panel.next).get(0).panel=panel;
	$(bs[3]).click(panel.last).get(0).panel=panel;
	panel.$panelcontainer=$(bs[4]);
	panel.$panelcontainer.click(panel.onphotoclick);
	panel.$progress=$(bs[5]);
	panel.$progressbar=$(bs[5].firstChild);

	return panel;
};
PhotoPanel.setWidth=function(width){
	this.$panelcontainer.width(width);
	this.$progress.width(width);
	this.refreshlist(0);
};
PhotoPanel.setPhotos=function(marker){
	var photos = marker.photos;
	if(!photos.panelcontent) {
		var panelcontent = $(
			'<div class="panelcontent" style="position:absolute;height:80px;">'+
				'<div class="photoidx" style="position:absolute;top:75px;left:0px;"></div>'+
			'</div>').get(0);
		panelcontent.marker=marker;
		panelcontent.photos=photos;
		panelcontent.currpos=0;
		panelcontent.$photoidx=$(panelcontent.firstChild);
		panelcontent.currphoto=photos[0];
		photos.panelcontent=panelcontent;

		// clear previous photo.img data
		for(var i = 0, len = photos.length; i < len; ++i)
			if(photos[i].img)
				photos[i].img.marker = null;
	}
	var panelcontent = photos.panelcontent;

	var fc=this.$panelcontainer.get(0).firstChild;
	if(fc)
		fc.parentNode.removeChild(fc);

	this.$panelcontainer.append(panelcontent);
	this.refreshlist(0);
	
	triggerEvent(panelcontent.currphoto.img, 'click');
};
PhotoPanel.frst=function(){ var panel=this.panel||this; panel.refreshlist(-Infinity); };
PhotoPanel.prev=function(){ var panel=this.panel||this; panel.refreshlist(-1); };
PhotoPanel.next=function(){ var panel=this.panel||this; panel.refreshlist(1); };
PhotoPanel.last=function(){ var panel=this.panel||this; panel.refreshlist(Infinity); };
PhotoPanel.refreshlist=function(dif){
	var speed=400;
	var ctnrwid=this.$panelcontainer.width();
	var panelcontent=this.$panelcontainer.get(0).firstChild;
	if(!ctnrwid || !panelcontent) return;

	var marker = panelcontent.marker;
	var photos = panelcontent.photos;
	var currpos = panelcontent.currpos;

	var widcnt = parseInt(ctnrwid/76);
	var postfix = ctnrwid%76?1:0;
	var phocnt = photos.length;

	if(dif == Infinity) {
		currpos+=parseInt((phocnt-currpos-1)/widcnt)*widcnt;
	} else if(dif == -Infinity) {
		currpos=0;
	} else if(dif > 0) {
		if(currpos + widcnt >= phocnt) return;
		currpos+=widcnt;
	} else if(dif < 0) {
		if(currpos <= 0) return;
		currpos-=widcnt;
		if(currpos < 0) currpos = 0;
	}
	panelcontent.currpos=currpos;

	var end = currpos+widcnt+postfix;
	if(end > phocnt) {
		end = phocnt;
		postfix=0;
	}

	var $panelcontent=$(panelcontent);
	if($panelcontent.width() < end*76) $panelcontent.width(end*76);

	for(var i = currpos; i<end; ++i) {
		var photo = photos[i];
		var img = photo.img;
		if(!img) {
			var attr = {title:photo.api.gettitle(photo),src:photo.api.iconurl(photo)};
			img=photo.img=$('<img style="width:75px;height:75px;"></img>').attr(attr).get(0);
			img.photo=photo;
		}
		if(!img.marker) {
			img.marker=marker;
			$(img).css('left',i*76).appendTo(panelcontent);
		}
	}

	this.$progressbar.animate({width:((end-postfix-currpos)/phocnt)*100+'%', left:(currpos/phocnt*100)+'%'},speed);
	$panelcontent.animate({left:currpos*(-76)},speed);
};
PhotoPanel.onphotoclick=function(e){
	if(e.target.tagName != 'IMG' || !e.target.photo) return;
	e.stopPropagation();

	var img = e.target;
	var marker = img.marker;
	var photo = img.photo;
	var panelcontent = marker.photos.panelcontent;
	panelcontent.currphoto=photo;
	panelcontent.$photoidx.css('left',$(img).css('left'));
	marker.showPhotoInfo(photo);
};


function OrganizeBottomPanel() {
	var panel =
		$('<div class="organizepanel" style="height:135px;">'+
			'<form style="position:absolute;left:5px;top:5px;">'+
				'<select></select>'+
			'</form>'+
			'<div class="info" style="position: absolute;left:10px;top:28px;width:455px; font-size:12px; color:black;"><span class="total" style="font-weight:bold;"></span> '+msg['photos']+' :: <span class="selected" style="font-weight:bold;"></span> '+msg['selected']+' <span class="clearspan" style="display:none;">| <a class="clearsel" href="javascript:void(0);">'+msg['clearsel']+'</a> </span></div>'+
			'<div class="panel" style="position:absolute;left:27px;top:50px;height:85px;width:455px; overflow:hidden;"></div>'+
			'<div class="progress" style="position:absolute;left:27px;top:45px;width:455px; overflow:hidden;">'+
				'<div class="progressbar" style="position:relative;width:10px;"></div>'+
			'</div>'+
			'<div style="position:absolute;left:0px;top:0px;height:77px;width:77px;">'+
				'<div style="display:none; width:79px; height:89px; background: transparent url('+imgs_src['marker_img'].src+') no-repeat scroll left top;">'+
					'<img style="position:absolute; left:2px; top:2px;"></img>'+
					'<span style="position:absolute; left:5px; top:5px; border:solid 1px gray; background-color:white;"></span>'+
				'</div>'+
			'</div>'+
			'<a class="pp_btn" title="'+msg['pagefrst']+'" style="position:absolute;left:1px;top:98px;"></a>'+
			'<a class="p_btn" title="'+msg['pageprev']+'" style="position:absolute; left:1px;top:50px;"></a>'+
			'<a class="r_btn" title="'+msg['pagenext']+'" style="position:absolute; right:1px;top:50px;"></a>'+
			'<a class="rr_btn" title="'+msg['pagelast']+'" style="position:absolute;right:1px;top:98px;"></a>'+
		'</div>').get(0);
	panel.height=135;
	for(var f in OrganizeBottomPanel)
		(typeof OrganizeBottomPanel[f] == 'function') && (panel[f] = OrganizeBottomPanel[f]);
	panel.alwaysshow=true;
	panel.flickr_photos_search_onLoad = OrganizeBottomPanel.onDataLoad;
	panel.flickr_photos_getUntagged_onLoad = OrganizeBottomPanel.onDataLoad;
	panel.flickr_photos_getNotInSet_onLoad = OrganizeBottomPanel.onDataLoad;
	panel.flickr_photos_getWithGeodata_onLoad = OrganizeBottomPanel.onDataLoad;
	panel.flickr_photos_getWithoutGeodata_onLoad = OrganizeBottomPanel.onDataLoad;
	panel.flickr_photosets_getPhotos_onLoad = OrganizeBottomPanel.onDataLoad;
	panel.flickr_groups_pools_getPhotos_onLoad = OrganizeBottomPanel.onDataLoad;

	var bs = panel.childNodes;
	var form=bs[0];
	panel.$infodiv=$(bs[1]);
	panel.$infodiv.find('.clearsel').click(panel.clearSelection).get(0).panel=panel;
	panel.collectselect=form.firstChild;
	panel.$panelcontainer=$(bs[2]);
	panel.$panelcontainer.mousemove(panel.onphotomousemove);

	panel.$progress=$(bs[3]);
	panel.$progressbar=$(bs[3].firstChild);
	panel.dragable=bs[4];
	panel.dragable.panel=panel;
	panel.dragable.marker=panel.dragable.firstChild;
	panel.dragable.img=panel.dragable.firstChild.firstChild;
	panel.dragable.info=panel.dragable.firstChild.childNodes[1];
	panel.dragableobj=new gobj.GDraggableObject(panel.dragable, {draggingCursor:'pointer', draggableCursor: 'pointer'});
	panel.dragableobj.dom=panel.dragable;
	gobj.GEvent.addListener(panel.dragableobj, 'mousedown', panel.ondragablemousedown);
	gobj.GEvent.addListener(panel.dragableobj, 'dragend', panel.ondragabledragend);
	gobj.GEvent.addListener(panel.dragableobj, 'click', panel.ondragableclick);

	$(bs[5]).click(panel.frst).get(0).panel=panel;
	$(bs[6]).click(panel.prev).get(0).panel=panel;
	$(bs[7]).click(panel.next).get(0).panel=panel;
	$(bs[8]).click(panel.last).get(0).panel=panel;

	panel.collectselect.panel=panel;
	$(panel.collectselect).change(panel.changeOption)
		.append('<option value="all" selected="true">'+msg['opt-all']+'</option>')
		.append('<option value="not_tagged">'+msg['opt-not_tagged']+'</option>')
		.append('<option value="not_in_set">'+msg['opt-not_in_set']+'</option>')
		.append('<option value="located">'+msg['opt-located']+'</option>')
		.append('<option value="not_located">'+msg['opt-not_located']+'</option>')
		.append('<optgroup class="set" label="'+msg['opt-set']+'"></optgroup>')
		.append('<optgroup class="group" label="'+msg['opt-group']+'"></optgroup>');
	panel.collectselect.selectedIndex=0;

	flickr._callapi('flickr.photosets.getList', {user_id:gobj.global_nsid}, panel);
	flickr._callapi('flickr.people.getPublicGroups', {user_id:gobj.global_nsid}, panel);
	panel.changeOption();
	return panel;
};
OrganizeBottomPanel.flickr_photosets_getList_onLoad=function(success, responseXML, responseText, params) {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;
	for (var i=0,photosets=rsp.photosets.photoset,len=photosets.length,$c=$(this.collectselect).children('optgroup.set'); i<len; i++) {
		var photoset=photosets[i];
		$c.append('<option value="option_photoset'+photoset.id+'">'+photoset.title._content+' ('+photoset.photos+')</option>');
	}
	this.collectselect.selectedIndex=0;
};
OrganizeBottomPanel.flickr_people_getPublicGroups_onLoad=function(success, responseXML, responseText, params) {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;
	for (var i=0,groups=rsp.groups.group,len=groups.length,$c=$(this.collectselect).children('optgroup.group'); i<len; i++) {
		var group=groups[i];
		$c.append('<option value="group'+group.nsid+'">'+group.name+'</option>');
	}
	this.collectselect.selectedIndex=0;
};
OrganizeBottomPanel.setWidth=function(width){
	this.$panelcontainer.width(width);
	this.$progress.width(width);
};
OrganizeBottomPanel.clearSelection=function(){
	for(var i=0,ps=this.panel.photos,len=ps.length; i<len; ++i) {
		var p = ps[i];
		if(!p || !p.div || !p.div.selected) continue;
		p.div.selected = false;
		$(p.div).removeClass('select');
	}
	this.panel.$infodiv
		.find('.selected').text(0).end()
		.find('.clearspan').hide();
};
OrganizeBottomPanel.changeOption=function(){
	var panel = this.panel||this;
	panel.photos = null;
	panel.pages = null;
	panel.perpage = 0;
	panel.total = 0;

	panel.option = {extras:'geo,date_taken',per_page:100,user_id:gobj.global_nsid};
	var value = panel.collectselect.value;
	if(value == 'all') {
		panel.method = 'flickr.photos.search';
	} else if(value == 'not_tagged') {
		panel.method = 'flickr.photos.getUntagged';
	} else if(value == 'not_in_set') {
		panel.method = 'flickr.photos.getNotInSet';
	} else if(value == 'located') {
		panel.method = 'flickr.photos.getWithGeodata';
	} else if(value == 'not_located') {
		panel.method = 'flickr.photos.getWithoutGeodata';
	} else if(value.indexOf('option_photoset')==0) {
		panel.option.photoset_id=value.substr(15);
		panel.method = 'flickr.photosets.getPhotos';
	} else if(value.indexOf('group')==0) {
		panel.option.group_id=value.substr(5);
		panel.method = 'flickr.groups.pools.getPhotos';
	} else {
		panel.method = ''
	}

	panel.loadData(1);
};
OrganizeBottomPanel.loadData=function(page) {
	if(!this.pages || !this.pages[page-1]) {
		var fc=this.$panelcontainer.get(0).firstChild;
		if(fc)
			fc.parentNode.removeChild(fc);

		this.option.page=page;
		flickr._callapi(this.method, this.option, this);
		if(this.pages) this.pages[page-1] = true;
	}
};
OrganizeBottomPanel.onDataLoad=function(success, responseXML, responseText, params){
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var phs=rsp.photos||rsp.photoset;

	var page=parseInt(phs.page)-1;

	var perpage=this.perpage=this.perpage||parseInt(phs.perpage||phs.per_page);
	var total =this.total =this.total || (parseInt(phs.total) || 0);
	var pages =this.pages =this.pages ||new Array(parseInt(phs.pages) || 1);
	var photos=this.photos=this.photos||new Array(total || 1); // keep previous photo data
	pages[page] = true;

	this.$infodiv
		.find('.total').text(total).end()
		.find('.selected').text(0).end();

	if(!photos.panelcontent) {
		var panelcontent = $('<div class="panelcontent" style="position:absolute;height:82px;"></div>').get(0);
		panelcontent.currpos=0;
		panelcontent.currphoto=photos[0];
		photos.panelcontent=panelcontent;
	}
	var panelcontent = photos.panelcontent;

	this.$panelcontainer.append(panelcontent);

	var owner = gobj.global_nsid;
	var ownername = gobj.global_name;
	var buddy_url = gobj.global_icon_url;
	for (var i=0,len=phs.photo.length; i<len; i++) {
		var photo=phs.photo[i];
		var idx=page*perpage+i;
		var photo_or_div=photos[idx];

		var latlng=null;
		var lat=parseFloat(photo.latitude);
		var lng=parseFloat(photo.longitude);
		var acc=parseInt(photo.accuracy);
		if(lat || lng) latlng = new gobj.GLatLng(lat, lng);

		var p = {id:photo.id, api:flickr, secret:photo.secret, title:photo.title, pos:latlng, accuracy:acc, datetaken:photo.datetaken, owner:owner, ownername:ownername, farm:photo.farm, server:photo.server, buddy_url:buddy_url};
		if(!photo_or_div) {
			photos[idx]=p;
		} else if(!photo_or_div.id) {
			p.div = photo_or_div;
			p.div.photo = p;
			$(p.div).attr('title',p.api.gettitle(p));
			$(p.div.img).attr('src',p.api.iconurl(p));
			photos[idx]=p;

			//if(p.pos) {
			//	$(p.div.childNodes[1]).text('ttt');
			//}
		}
	}

	this.refreshlist(0);
};
OrganizeBottomPanel.frst=function(){ var panel=this.panel||this; panel.refreshlist(-Infinity); };
OrganizeBottomPanel.prev=function(){ var panel=this.panel||this; panel.refreshlist(-1); };
OrganizeBottomPanel.next=function(){ var panel=this.panel||this; panel.refreshlist(1); };
OrganizeBottomPanel.last=function(){ var panel=this.panel||this; panel.refreshlist(Infinity); };
OrganizeBottomPanel.refreshlist=function(dif){
	var speed=400;
	var photos = this.photos;
	var ctnrwid=this.$panelcontainer.width();
	var panelcontent=this.$panelcontainer.get(0).firstChild;
	if(!ctnrwid || !panelcontent) return;

	var currpos = panelcontent.currpos;
	var widcnt = parseInt(ctnrwid/79);
	var postfix = ctnrwid%79?1:0;
	var phocnt = this.total;

	if(dif == Infinity) {
		currpos+=parseInt((phocnt-currpos-1)/widcnt)*widcnt;
	} else if(dif == -Infinity) {
		currpos=0;
	} else if(dif > 0) {
		if(currpos + widcnt >= phocnt) return;
		currpos+=widcnt;
	} else if(dif < 0) {
		if(currpos <= 0) return;
		currpos-=widcnt;
		if(currpos < 0) currpos = 0;
	}
	panelcontent.currpos=currpos;

	var end = currpos+widcnt+postfix;
	if(end > phocnt) {
		end = phocnt;
		postfix=0;
	}

	var $panelcontent=$(panelcontent);
	if($panelcontent.width() < end*79) $panelcontent.width(end*79);

	for(var i = currpos; i<end; ++i) {
		var photo = photos[i];
		if(!photo) {
			var div = $('<div class="photo"><img></img><div style="position:absolute;width:100%;height:100%;"></div></div>').css('left',i*79+1).appendTo(panelcontent).get(0);
			div.top = 5;
			div.left = i*79+1;
			var img = div.firstChild;
			div.panel=this;
			div.img=img;
			photos[i]=div;
		} else if(!photo.div && photo.id) {
			var div = $('<div class="photo"><img></img><div style="position:absolute;width:100%;height:100%;"></div></div>').css('left',i*79+1).appendTo(panelcontent).attr('title',photo.api.gettitle(photo)).get(0);
			div.top = 5;
			div.left = i*79+1;
			var img = div.firstChild;
			$(img).attr('src',photo.api.iconurl(photo));
			div.panel=this;
			div.img=img;
			div.photo=photo;
			photo.div=div;
			
			//if(photo.pos) {
			//	$(div.childNodes[1]).text('ttt');
			//}
		}
		this.loadData(parseInt(i/this.perpage)+1);
	}

	this.$progressbar.animate({width:((end-postfix-currpos)/phocnt)*100+'%', left:(currpos/phocnt*100)+'%'},speed);
	$panelcontent.animate({left:currpos*(-79)},speed);
};
OrganizeBottomPanel.onphotomousemove=function(e){
	if(e.target.tagName != 'DIV' || !e.target.parentNode || e.target.parentNode.tagName != 'DIV' || !e.target.parentNode.photo ) return;
	e.stopPropagation();
	
	var div = e.target.parentNode;
	var panel=div.panel;
	panel.dragable.div=div;

	var divofst=$(div).offset();
	var $dragable=$(panel.dragable);
	var dragofst=$dragable.offset();
	panel.dragableobj.moveTo(new gobj.GPoint(parseInt($dragable.css('left'))+divofst.left-dragofst.left, parseInt($dragable.css('top'))+divofst.top-dragofst.top));
};
OrganizeBottomPanel.ondragablemousedown=function(){
	var dragobj = this;
	var div = dragobj.dom.div;
	var img = div.img;

	div.drag_state=1;
	setTimeout(
		function() {
			if(div.drag_state==1) {
				div.drag_state=2;
				OrganizeBottomPanel.ondragablestartdrag.apply(dragobj);
			}
		},
		500
	);
};
OrganizeBottomPanel.ondragablestartdrag=function(){
	var dragobj = this;
	var dom = this.dom;
	var div = dom.div;
	var panel=dom.panel;

	dragobj.setDraggingCursor('move');
	$(dom.img).attr('src',div.img.src);

	var selected=[];
	if(!div.selected) {
		selected.push(div.photo.id);
	} else {
		for(var i=0,ps=dom.panel.photos,len=ps.length; i<len; ++i) {
			var p = ps[i];
			if(!p || !p.div || !p.div.selected) continue;
			selected.push(p.div.photo.id);
		}
	}
	dom.selected = selected;
	if(selected.length > 1) {
		$(dom.info).text(selected.length + ' photos');
	} else {
		$(dom.info).text('');
	}

	$(dom.marker).show();
};
OrganizeBottomPanel.ondragableclick=function(e){
	var div = this.dom.div;
	div.drag_state = 0;
	this.setDraggingCursor('pointer');

	if(!div.photo) return;
	
	var cnt=1;

	var otherdown=false;
	if(!e.ctrlKey) {
		for(var i=0,ps=this.dom.panel.photos,len=ps.length; i<len; ++i) {
			var p = ps[i];
			if(!p || !p.div || (p.div == div) || !p.div.selected) continue;
			otherdown = true;
			p.div.selected = false;
			$(p.div).removeClass('select');
		}
	} else {
		for(var i=0,ps=this.dom.panel.photos,len=ps.length; i<len; ++i) {
			var p = ps[i];
			if(!p || !p.div || (p.div == div)) continue;
			if(p.div.selected) cnt++;
		}
	}
	if(div.selected && !otherdown) {
		cnt = 0;
		div.selected = false;
		$(div).removeClass('select');
	} else {
		div.selected = true;
		$(div).addClass('select');
	}

	div.panel.$infodiv
		.find('.selected').text(cnt).end();
	if(cnt) {
		div.panel.$infodiv.find('.clearspan').show();
	} else {
		div.panel.$infodiv.find('.clearspan').hide();
	}
};
OrganizeBottomPanel.ondragabledragend=function(){
	var div = this.dom.div;
	var drag_state = div.drag_state;
	div.drag_state = 0;
	if(drag_state != 2) return;
	this.setDraggingCursor('pointer');

	var gmap = this.dom.panel.win.gmap;
	var $gmapdom = $(gmap.getContainer());

	var gmapofst = $gmapdom.offset();
	var $dragable=$(this.dom);
	var dragofst=$dragable.offset();

	var gmapw = $gmapdom.width();
	var gmaph = $gmapdom.height();

	var delx = dragofst.left-gmapofst.left+40;
	var dely = dragofst.top-gmapofst.top+89;

	if( delx < gmapw && dely < gmaph) {
		var gp = new gobj.GPoint(delx, dely);
		var latlng = gmap.fromContainerPixelToLatLng(gp);
		var zoom = gmap.getZoom();
		flickr._callapi('flickr.photos.geo.setLocation', {photo_ids:this.dom.selected, lat:latlng.lat(),lon:latlng.lng(),accuracy:zoom}, this.dom.panel);
	}

	$(this.dom.marker).hide();
	var divofst=$(div).offset();
	this.moveTo(new gobj.GPoint(parseInt($dragable.css('left'))+divofst.left-dragofst.left, parseInt($dragable.css('top'))+divofst.top-dragofst.top));
};
OrganizeBottomPanel.flickr_photos_geo_setLocation_onLoad=function(success, responseXML, responseText, params) {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;
	
	var panel = this;
	var gmap = panel.win.gmap;

	if(gmap.refreshView) gmap.refreshView(true);

	if(panel.collectselect.value == 'located' || panel.collectselect.value == 'not_located') {
		panel.changeOption();
	}
};




var fgs={};
fgs.extend=function(subc,basec) {
	var inh=function(){}; inh.prototype=basec.prototype; subc.prototype=new inh();
	subc.prototype.constructor=subc; subc.prototype.superconstructor=basec; subc.prototype.superprototype=basec.prototype;
};

fgs.init=function(){
if(fgs.init.inited) return;

// PhotoGroupMarker
var PhotoGroupMarker=fgs.PhotoGroupMarker=function(latlng,opts){
	this.superconstructor.apply(this, arguments);
	gobj.GEvent.addListener(this, 'click', this.onclick);
	this.iconsize = this.getIcon().iconSize;
	this.$div=$('<div class="markerlabel"></div>').width(this.iconsize.width-2).height(this.iconsize.height-2).click(this.onclick);
	
	this.$div.get(0).marker=this;
};
PhotoGroupMarker.generateIcon=function(n) {
	if(!arguments.callee.init) {
		function ic(img,w1,h1,w2,h2,w3,h3) {
			var icon = new gobj.GIcon();
			icon.image = img;
			icon.iconSize = new gobj.GSize(w1,h1);
			icon.iconAnchor = new gobj.GPoint(w2,h2);
			icon.infoWindowAnchor = new gobj.GPoint(w3,w3);
			return icon;
		};
		arguments.callee.init=true;
		arguments.callee.i1=ic(imgs['icon1'].src, 18, 19, 9, 9, 9, 9);
		arguments.callee.i2=ic(imgs['icon2'].src, 20, 21,10,10,10,10);
		arguments.callee.i3=ic(imgs['icon3'].src, 26, 27,13,13,13,13);
	}
	if(n < 10) return arguments.callee.i1;
	else if(n < 100) return arguments.callee.i2;
	else return arguments.callee.i3;
};
PhotoGroupMarker.instances=[[],[],[]];
PhotoGroupMarker.GOrg=new gobj.GLatLng(0,0);
PhotoGroupMarker.getInstance=function(n) {
	var idx = 0;
	if(n < 10) idx=0;
	else if(n < 100) idx=1;
	else idx=2;

	if(PhotoGroupMarker.instances[idx].length == 0) {
		var marker = new PhotoGroupMarker(PhotoGroupMarker.GOrg, {icon:PhotoGroupMarker.generateIcon(n)});
		marker.num = n;
		return marker;
	} else {
		return PhotoGroupMarker.instances[idx].pop();
	}
};
PhotoGroupMarker.release=function(marker) {
	var idx = 0;
	if(marker.num < 10) idx=0;
	else if(marker.num < 100) idx=1;
	else idx=2;
	PhotoGroupMarker.instances[idx].push(marker);
};
fgs.extend(PhotoGroupMarker, gobj.GMarker);
PhotoGroupMarker.prototype.setPhotos=function(photos){
	this.photos=photos;
	this.showpanel=null;
	if(this.photos) {
		this.$div.text(this.photos.length);
	} else {
		var cf = this.$div.get(0);
		cf.parentNode.removeChild(cf);
	}
};
PhotoGroupMarker.prototype.initialize=function(map){
	this.superprototype.initialize.apply(this,arguments);
	this.$div.appendTo(map.getPane(gobj.G_MAP_MARKER_PANE));
	var posi = this.getLatLng();
	this.pos = map.fromLatLngToDivPixel(posi);
	this.zidx = gobj.GOverlay.getZIndex(posi.lat());
	this.map=map;
};
PhotoGroupMarker.prototype.remove=function(){
	this.superprototype.remove.apply(this,arguments);
	this.setPhotos(null);
	PhotoGroupMarker.release(this);
};
PhotoGroupMarker.prototype.redraw = function(force) {
	this.superprototype.redraw.apply(this, arguments);
	if (!force || !this.pos) return;

	this.$div.css({left:(this.pos.x-this.iconsize.width/2), top:((this.pos.y-this.iconsize.height/2)+(this.iconsize.height-18)/2),zIndex:this.zidx+1});
};
PhotoGroupMarker.prototype.onclick=function(){
	var marker = this.marker||this;
	var win = marker.map.win;
	win.toggleActivePanel(true, marker);
};
PhotoGroupMarker.prototype.showpanelstr = 
	'<div class="markerpopup" style="border:1px solid gray; width:505px;height:290px;">'+
		'<div style="position:absolute;left:5px;top:  5px;"><a class="maxbtn" style="float:left;" target="_blank"></a><a class="title" target="_blank"></a></div>'+
		'<div style="position:absolute;left:5px;top: 25px;width:240px;height:180px; border:solid 1px gray; overflow:hidden;"></div>'+
		'<div style="position:absolute;left:5px;top:215px;width:240px;">'+
			'<img class="authicn" style="float:left; margin-right:5px;"></img>'+
			' Taken on <a class="takendatelnk" target="_blank"></a><br>'+
			' Uploaded on <a class="uploaddatelnk" target="_blank"></a><br>'+
			' by <a class="authlnk" target="_blank"></a>'+
		'</div>'+
		'<div class="photoctnr" style="position:absolute;left:260px;top: 25px;width:240px;height:240px; text-align:center;"></div>'+
		'<div style="position:absolute;left:5px;top:268px;width:500px;">'+
			'<span class="license" style="padding-right: 10px;"></span>'+
//			'<a class="faveact"><img width="16" height="16" style="padding-right: 2px;" src="http://l.yimg.com/www.flickr.com/images/simple_add_fave_default.gif"></img><span>Add to favorites</span></a>'+
		'</div>'+
	'</div>';
PhotoGroupMarker.prototype.showPhotoInfo=function(photo){
	if(!this.showpanel) {
		var showpanel= $(this.showpanelstr).get(0);
		showpanel.mapctnr = showpanel.childNodes[1];
		this.showpanel = showpanel;
	}
	var showpanel = this.showpanel;

	if(this.map.getInfoWindow().isHidden()) {
		this.openInfoWindow(showpanel, {suppressMapPan:false});

		$(showpanel.mapctnr).empty();
		var mapdiv = $('<div style="width:240px;height:180px;"></div>').appendTo(showpanel.mapctnr).get(0);
		var map = new gobj.GMap2(mapdiv);
		map.addControl(new gobj.GSmallZoomControl());
		map.addControl(new gobj.GMapTypeControl(true));
		map.setCenter(photo.pos, photo.accuracy);
		map.marker=new gobj.GMarker(photo.pos);
		map.addOverlay(map.marker);
		showpanel.map = map;
	} else {
		showpanel.map.setCenter(photo.pos, photo.accuracy);
		showpanel.map.marker.setLatLng(photo.pos);
	}

	var href=photo.api.pageurl(photo);
	$(showpanel)
		.find('.maxbtn').attr('href',href).end()
		.find('.title').attr('href',href).text(photo.api.gettitle(photo)).end()
		.find('.authicn').attr('src',photo.api.buddyurl(photo)).end()
		.find('.takendatelnk').text(photo.api.datetaken(photo)).attr('href',photo.api.datetakenurl(photo)).end()
		.find('.uploaddatelnk').text(photo.api.dateupload(photo)).attr('href',photo.api.dateuploadurl(photo)).end()
		.find('.authlnk').text(photo.api.owner(photo)).attr('href',photo.api.ownerurl(photo)).end()
		.find('.photoctnr').empty().append('<img src="'+photo.api.smallurl(photo)+'"></img>').end()
		.find('.license').html(photo.api.licensestr(photo)).end();
};
PhotoGroupMarker.prototype.ondelete=function(){
	if (gobj.confirm('Delete all photo\'s location information here?\n')) {
		var photos = this.photos;
		var delids = [];
		for(var i = 0, len = photos.length; i < len; ++i) {
			delids.push(photos[i].id);
		}
		flickr._callapi('flickr.photos.geo.removeLocation', {photo_ids:delids}, this);
	}
};
PhotoGroupMarker.prototype.flickr_photos_geo_removeLocation_onLoad=function(success, responseXML, responseText, params){
	if(this.map.refreshView) this.map.refreshView(true);
};


// PhotoMap
var PhotoMap=fgs.PhotoMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.win.gmap=this;
	this.photo_id=opts.photo_id;
	this.win.f_mask(true);
	this.b_saveloc=false;
	flickr._callapi('flickr.photos.getInfo', {photo_id:this.photo_id}, this);
};
fgs.extend(PhotoMap, gobj.GMap2);
PhotoMap.prototype.photoicon=function(photo) {
	if(!arguments.callee.def) {
		var deficon = new gobj.GIcon();
		deficon.image = imgs['marker_img'].src;
		deficon.shadow = imgs['marker_shw'].src;
		deficon.iconSize = new gobj.GSize(79, 89);
		deficon.shadowSize = new gobj.GSize(109, 89);
		deficon.iconAnchor = new gobj.GPoint(40, 89);
		deficon.infoWindowAnchor = new gobj.GPoint(40, 89);
		deficon.imageMap=[0,0,78,0,78,78,49,78,39,88,39,78,0,78];
		deficon.transparent=imgs['marker_trans'].src;
		arguments.callee.def=deficon;
	}
	var icon= new gobj.GIcon(arguments.callee.def);
	icon.label = {url:flickr.iconurl(photo), anchor:new gobj.GLatLng(2,2), size:new gobj.GSize(75,75)};
	return icon;
};
PhotoMap.prototype.flickr_photos_getInfo_onLoad=function(success, responseXML, responseText, params){
try {
	var rsp = eval('(' + responseText + ')');
	if(!rsp || rsp.stat != 'ok') return;

	var photo = rsp.photo;

	this.win.f_settitle(photo.title._content);

	var zoom = 12;
	var locname = [];
	var loc = photo.location;
	if(!loc) {
		photo.location=loc={latitude:0,longitude:0};
		zoom=2;
		this.win.toggleSearch(true);
		this.win.loadlastlocation_display();
	} else {
		var last = '';
		if(loc.locality && loc.locality._content!=last) { last=loc.locality._content; locname.push(last); }
		if(loc.county && loc.county._content!=last)     { last=loc.county._content; locname.push(last); }
		if(loc.region && loc.region._content!=last)     { last=loc.region._content; locname.push(last); }
		if(loc.country && loc.country._content!=last)   { last=loc.country._content; locname.push(last); }
		if(locname.length)
			this.win.$infodiv.text('Taken on '+locname.join());

		if(loc.accuracy) zoom=parseInt(loc.accuracy);

		this.win.locatediv.innerHTML = loc.latitude+' '+loc.longitude;
	}

	var isdraggable = true;
	if(!photo.permissions) {
		isdraggable = false;
		this.win.disableActionBtn();
		this.win.disableSearchBtn();
	}

	var center = new gobj.GLatLng(photo.location.latitude,photo.location.longitude);
	var marker=this.marker=new gobj.GMarker(center, {icon:this.photoicon(photo), draggable:isdraggable});
	if(isdraggable) {
		marker.win = this.win;
		gobj.GEvent.addListener(marker, 'dragend', this.onmarkerdragend);
	}

	this.setCenter(center, zoom);
	this.addOverlay(marker);
} finally {
	this.win.f_mask(false);
}
};
PhotoMap.prototype.on_max_toggle=function(ismax) {
	if(ismax) {
		if(!this.ctrl_large) {
			this.ctrl_large=new gobj.GLargeMapControl();
			this.ctrl_overview=new gobj.GOverviewMapControl();
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
PhotoMap.prototype.onmarkerdragend=function() {
	this.win.savelocation_display();
};
PhotoMap.prototype.onsearchresultclick=function(pos, zoom) {
	this.setCenter(pos,zoom);
	this.marker.setPoint(pos);
	this.win.savelocation_display();
};
PhotoMap.prototype.onloadlastlocation=function() {
	var center = new gobj.GLatLng(parseFloat(GM_getValue('last_lat', DEF_LAT)), parseFloat(GM_getValue('last_lng', DEF_LNG)));
	var zoom = parseInt(GM_getValue('last_zoom', DEF_ZOOM));

	this.setCenter(center, zoom);
	if(this.marker)
		this.marker.setPoint(center);

	this.win.savelocation_display();
};
PhotoMap.prototype.onsavelocation=function() {
	var p=this.marker.getLatLng();
	var zoom=this.getZoom();
	if(zoom < 1) zoom = 1;
	if(zoom > 16) zoom = 16;
	flickr._callapi('flickr.photos.geo.setLocation', {photo_id:this.photo_id, lat:p.lat(), lon:p.lng(), accuracy:zoom}, this);
};
PhotoMap.prototype.flickr_photos_geo_setLocation_onLoad=function(success, responseXML, responseText, params){
	var rsp = eval('(' + responseText + ')');
	if(rsp.stat != 'ok') {
		alert('Save location failed.\n\n' + rsp.message);
		return;
	}

	var loc=this.marker.getLatLng();
	this.b_saveloc=false;
	this.win.locatediv.innerHTML = loc.lat().toFixed(6)+ ' ' + loc.lng().toFixed(6);
	GM_setValue('last_lat', loc.lat()+'');
	GM_setValue('last_lng', loc.lng()+'');
	GM_setValue('last_zoom', this.getZoom()+'');
	alert('Saved.');
};
PhotoMap.prototype.removelocation=function() {
	flickr._callapi('flickr.photos.geo.removeLocation', {photo_id:this.photo_id}, this);
};
PhotoMap.prototype.flickr_photos_geo_removeLocation_onLoad=function(success, responseXML, responseText, params){
	var rsp = eval('(' + responseText + ')');
	if(rsp.stat != 'ok') {
		alert('Remove location failed.\n\n' + rsp.message);
		return;
	}

	alert('Removed Location Success.');
};
PhotoMap.prototype.getembeddedlink=function(){
	return '<iframe width="425" height="350" frameborder="no" scrolling="no" marginheight="0" marginwidth="0" src="'+EMBEDDED_URL+'flickr-gmap-photo.html?photo_id='+this.photo_id+'"></iframe>';
};



// PhotoSetControl
var PhotoSetControl=fgs.PhotoSetControl=function(photoset_id) {
	var options=this.options=$(
		'<div class="option">'+
			'<a class="updnbtn" style="position:absolute;left:5px;"></a>'+
			'<a class="trkbtn"  style="position:absolute;left:20px;"></a>'+
			'<span style="margin-left:35px;">&nbsp;</span>'+
			'<p style="margin:5px; display:none;"></p>'+
			'<div style="padding-top:5px;"><img src="'+imgs['flickr_loading'].src+'"></img> <span id="loading_msg">Loading...</span></div>'+
		'</div>').get(0);
	options.titl=options.childNodes[2];
	options.desc=options.childNodes[3];
	options.$loading=$(options.childNodes[4]);
	options.loadingmsg = options.$loading.find('#loading_msg').get(0);

	$(options.childNodes[0]).click(function() { $(this.parentNode.desc).toggle(); });
	$(this.options.childNodes[1]).click(function() { if(this.ctrl.gmap) this.ctrl.gmap.tracking_toggle(); }).get(0).ctrl=this;

	flickr._callapi('flickr.photosets.getInfo', {photoset_id:photoset_id}, this);
};
PhotoSetControl.prototype = new gobj.GControl();
PhotoSetControl.prototype.initialize = function(map) {
	this.gmap = map;
	map.getContainer().appendChild(this.options);
	return this.options;
};
PhotoSetControl.prototype.getDefaultPosition = function() {
	return new gobj.GControlPosition(gobj.G_ANCHOR_TOP_LEFT, new gobj.GSize(80, 6));
};
PhotoSetControl.prototype.flickr_photosets_getInfo_onLoad=function(success, responseXML, responseText, params){
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var photoset=rsp.photoset;
	$(this.options.titl).text(photoset.title._content);
	$(this.options.desc).html(photoset.description._content.replace(/\n/g,'<br>'));
};
PhotoSetControl.prototype.showLoading=function(show, msg){
	(show) ? this.options.$loading.show() : this.options.$loading.hide();
	if(msg) this.options.loadingmsg.innerHTML = 'Loading... ' + msg;
};

// PhotoSetMap
var PhotoSetMap=fgs.PhotoSetMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.win.gmap=this;
	this.photoset_id=opts.photoset_id;
	this.datetracking=true;
	this.win.disableActionBtn();

	var mt=this.getMapTypes();
	for(var i=0; i<mt.length; i++)
		mt[i].getMinimumResolution=this.getMinimumResolution;

	this.isSetCenter=false;
	this.setCenter(new gobj.GLatLng(0,0), 0);
		
	this.photoSetCtrl = new fgs.PhotoSetControl(this.photoset_id);
	this.addControl(this.photoSetCtrl);
		
	gobj.GEvent.addListener(this, 'zoomend', this.onzoomend);
	gobj.GEvent.addListener(this, 'infowindowopen', this.oninfowindowopen);
	gobj.GEvent.addListener(this, 'infowindowclose', this.oninfowindowclose);

	this.win.f_mask(true);

	var opts={photoset_id:this.photoset_id, extras:'geo,date_upload,date_taken,icon_server,license', per_page:PER_PAGE, page:1};
	flickr._callapi('flickr.photosets.getPhotos', opts, this);
};
fgs.extend(PhotoSetMap, gobj.GMap2);
PhotoSetMap.prototype.getMinimumResolution=function(){return 3;};
PhotoSetMap.prototype.flickr_photosets_getPhotos_onLoad=function(success, responseXML, responseText, params){
	var pageCurr = 0;
	var pageTotal = 0;
try {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var photoset=rsp.photoset;

	pageCurr=parseInt(photoset.page);
	pageTotal=parseInt(photoset.pages);

	if(pageCurr < pageTotal) {
		this.photoSetCtrl.showLoading( true, parseInt(pageCurr/pageTotal*100)+'%');
		var opts={photoset_id:this.photoset_id, extras:'geo,date_upload,date_taken,icon_server,license', per_page:PER_PAGE, page:pageCurr+1};
		flickr._callapi('flickr.photosets.getPhotos', opts, this);
	}

	var owner=photoset.owner;
	var ownername=photoset.ownername;
	this.photos = this.photos || []; // keep previous photo data
	for (var i=0,len=photoset.photo.length; i<len; i++) {
		var photo=photoset.photo[i];

		var lat=parseFloat(photo.latitude);
		var lon=parseFloat(photo.longitude);
		if(!lat && !lon) continue; 

		var p = {id:photo.id, secret:photo.secret, title:photo.title, pos:new gobj.GLatLng(lat,lon), accuracy:parseInt(photo.accuracy), api:flickr, dateupload:parseInt(photo.dateupload), datetaken:photo.datetaken, owner:owner, ownername:ownername, farm:photo.farm, server:photo.server, iconfarm:photo.iconfarm, iconserver:photo.iconserver, license:parseInt(photo.license)};
		this.photos.push(p);
	}

	this.regroupphotos();
} finally {
	if(pageCurr >= pageTotal) this.photoSetCtrl.showLoading(false);
	this.win.f_mask(false);
}};
PhotoSetMap.prototype.regroupphotos=function(){
	if(!this.photos) return;

	var photos=this.photos;

	if(!this.isSetCenter) {
		this.isSetCenter=true;
		var totalbound = new gobj.GLatLngBounds();
		for (var i=0,len=photos.length; i<len; i++) {
			var photo=photos[i];
			totalbound.extend(photo.pos);
		}
		var zoom = this.getBoundsZoomLevel(totalbound);
		this.setCenter(totalbound.getCenter(), zoom);
		return;
	}

	var delta=deltas[this.getZoom()];

	var temp_bounds=[];
	for (var i=0,len=photos.length; i<len; i++) {
		var photo=photos[i];
		var pos = photo.pos;

		var isMerged=false;
		for (var j=0,len2=temp_bounds.length; j<len2; j++) {
			var b=temp_bounds[j];
			if( b.containsLatLng(pos)) {
				isMerged=true;
				b.photos.push(photo);
				if(b.firstdate>photo.firstdate)
					b.firstdate=photo.firstdate;
				break;
			}
		}

		if(!isMerged) {
			var b = new gobj.GLatLngBounds(new gobj.GLatLng(pos.lat()-delta,pos.lng()-delta), new gobj.GLatLng(pos.lat()+delta,pos.lng()+delta));
			b.photos=[];
			b.photos.push(photo);
			b.firstdate=photo.datetaken;
			temp_bounds.push(b);
		}
	}

	this.clearOverlays();

	if(this.datetracking) {
		temp_bounds.sort( function(a,b){ if(a.firstdate>b.firstdate) return -1; else return 1;} );
		var trackpoints = [];
		for (var i=0,len=temp_bounds.length; i<len ; i++) {
			var b = temp_bounds[i];
			trackpoints.push(b.getCenter());
		}
		this.addOverlay(new gobj.GPolyline(trackpoints));
	}

	for (var i=0,len=temp_bounds.length; i<len ; i++) {
		var b = temp_bounds[i];
		if(b.photos.length == 0)
			continue;

		if(b.maker) this.removeOverlay(b.maker);
		var center = b.getCenter();
		b.maker = fgs.PhotoGroupMarker.getInstance(b.photos.length);
		b.maker.setPhotos(b.photos);
		b.maker.setPoint(center);
		this.addOverlay(b.maker);
	}
};
PhotoSetMap.prototype.onzoomend=function(){
	this.win.toggleActivePanel(false);
	this.regroupphotos();
};
PhotoSetMap.prototype.getembeddedlink=function(){
	return '<iframe width="425" height="350" frameborder="no" scrolling="no" marginheight="0" marginwidth="0" src="'+EMBEDDED_URL+'flickr-gmap-photoset.html?photoset_id='+this.photoset_id+'"></iframe>';
};
PhotoSetMap.prototype.onsearchresultclick=function(pos, zoom){
	this.setCenter(pos,zoom);
};
PhotoSetMap.prototype.tracking_toggle=function(){
	this.datetracking = !this.datetracking;
	this.regroupphotos();
};
PhotoSetMap.prototype.oninfowindowopen=function(){
	this.savePosition();
};
PhotoSetMap.prototype.oninfowindowclose=function(){
	this.returnToSavedPosition();
	this.win.toggleActivePanel(false);
};




function BrowseControl() {};
BrowseControl.prototype = new gobj.GControl();
BrowseControl.prototype.initialize = function(map) {
	var options=this.options=$(
		'<div class="option">'+
			'<div style="height:15px;">'+
				'<a class="updnbtn" style="position:absolute;left:5px;" title="'+msg['showhide']+'"></a>'+
				'<a class="prevbtn" style="position:absolute;left:20px;" title="'+msg['pageprev']+'"></a>'+
				'<a class="nextbtn" style="position:absolute;left:35px;" title="'+msg['pagenext']+'"></a>'+
				'<span style="margin-left:55px; margin-right:30px;"></span>'+
			'</div>'+
			'<div style="padding-top:5px;"></div>'+
			'<div style="padding-top:5px;"><img src="'+imgs['flickr_loading'].src+'"></img> <span id="loading_msg">'+msg['loading']+'...</span></div>'+
		'</div>').get(0);
	options.info=options.firstChild.childNodes[3];
	options.pane=options.childNodes[1];
	options.$loading=$(options.childNodes[2]);

	var nowy = new Date().getFullYear();
	var datestr = 
		'<div>'+msg['date-date']+': '+
			'<select id="fgs_select_year">'+
				'<option value="lastmonth">'+msg['date-lastmonth']+'</option>'+
				'<option value="lastweek">'+msg['date-lastweek']+'</option>'+
				'<option value="yesterday">'+msg['date-yesterday']+'</option>'+
				'<option value="all">'+msg['date-all']+'</option>';
	for(var i = 0; i<10; ++i)
		datestr += '<option value="'+(nowy-i)+'">'+(nowy-i)+'</option>';
	datestr += 
			'</select>'+
		' - '+
			'<select id="fgs_select_month" style="display:none;">'+
				'<option value="all">'+msg['month-all']+'</option>';
	for(var i = 1; i<=12; ++i)
		datestr += '<option value="'+(i<10?'0':'')+i+'">'+(i<10?'0':'')+i+'</option>';
	datestr += 
			'</select>'+
		'</div>';
	var sortstr = 
		'<div>'+msg['sort-sort']+': '+
			'<select id="fgs_select_sort">'+
				'<option value="interestingness-desc">'+msg['sort-interestingness-desc']+'</option>'+
				'<option value="interestingness-asc">'+msg['sort-interestingness-asc']+'</option>'+
				'<option value="date-taken-desc">'+msg['sort-date-taken-desc']+'</option>'+
				'<option value="date-taken-asc">'+msg['sort-date-taken-asc']+'</option>'+
				'<option value="date-posted-desc">'+msg['sort-date-posted-desc']+'</option>'+
				'<option value="date-posted-asc">'+msg['sort-date-posted-asc']+'</option>'+
				'<option value="relevance">'+msg['sort-relevance']+'</option>'+
			'</select>'+
		'</div>';
	var searchstr = 
		'<div> '+msg['search']+': '+
			'<form id="fgs_search_form">'+
				'<input id="fgs_search" type="text">'+
				'<input type="submit">'+
			'</form>'+
		'</div>';
	$(options.pane).append(datestr).append(sortstr).append(searchstr);
	options.optionYear=$(options).find('#fgs_select_year').get(0);
	options.optionMonth=$(options).find('#fgs_select_month').get(0);
	options.optionSort=$(options).find('#fgs_select_sort').get(0);
	options.optionSearchForm=$(options).find('#fgs_search_form').get(0);
	options.optionSearch=$(options).find('#fgs_search').get(0);
	options.optionYear.gmap=options.optionMonth.gmap=options.optionSort.gmap=options.optionSearchForm.gmap=map;
	options.optionYear.onchange=options.optionMonth.onchange=options.optionSort.onchange=options.optionSearchForm.onsubmit=function() {
		var y = options.optionYear.value;
		if(y == 'all' || y == 'lastmonth' || y == 'lastweek' || y == 'yesterday') {
			$(options.optionMonth).hide();
			options.optionMonth.value = 'all';
		} else {
			$(options.optionMonth).show();
		}
		this.gmap.changeOption();
	};
	
	
	var tog=options.firstChild.childNodes[0];
	var pre=options.firstChild.childNodes[1];
	var nex=options.firstChild.childNodes[2];
	$(tog).click(function() { $(this.options.pane).toggle(); }).get(0).options=options;
	$(pre).click(function() { this.gmap.prevPage(); }).get(0).gmap=map;
	$(nex).click(function() { this.gmap.nextPage(); }).get(0).gmap=map;

	map.getContainer().appendChild(options);
	return options;
};
BrowseControl.prototype.getDefaultPosition = function() {
  return new gobj.GControlPosition(gobj.G_ANCHOR_TOP_LEFT, new gobj.GSize(90, 8));
};
BrowseControl.prototype.showLoading=function(show){
	(show) ? this.options.$loading.show() : this.options.$loading.hide();
};
BrowseControl.prototype.setText=function(str){
	$(this.options.info).text(str);
};
BrowseControl.prototype.setUserMapMode=function(isUserMap){
	if(isUserMap) {
		this.options.optionYear.selectedIndex=3; // default show all time in user Map
		this.options.optionSort.selectedIndex=6;
	} else {
		this.options.optionYear.selectedIndex=0;
		this.options.optionSort.selectedIndex=0;
	}
};
BrowseControl.prototype.getValue=function(type){
	switch(type) {
		case 'year' : return this.options.optionYear.value;
		case 'month' : return this.options.optionMonth.value;
		case 'sort' : return this.options.optionSort.value;
		case 'search' : return this.options.optionSearch.value;
	}
};


// BrowseMap
var BrowseMap=fgs.BrowseMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.win.gmap=this;
	this.user_id=opts.user_id;
	this.group_id=opts.group_id;
	this.fullrange=opts.fullrange;
	this.lastcenter = null;
	this.pageCurr = 1;
	this.pageTotal = 1;
	this.suspenddragevent=false;
	this.delay_loading = 2000;

	this.browseCtrl = new BrowseControl();
	this.addControl(this.browseCtrl);

	if(this.user_id) {
		this.browseCtrl.setUserMapMode(true);
	} else {
		this.browseCtrl.setUserMapMode(false);
	}

	this.updateOptionInfo();

	var mt=this.getMapTypes();
	for(var i=0; i<mt.length; i++)
		mt[i].getMinimumResolution=this.getMinimumResolution;

	gobj.GEvent.addListener(this, 'zoomend', this.onzoomend);
	gobj.GEvent.addListener(this, 'dragend', this.ondragend);
	gobj.GEvent.addListener(this, 'infowindowopen', this.oninfowindowopen);
	gobj.GEvent.addListener(this, 'infowindowclose', this.oninfowindowclose);
};
fgs.extend(BrowseMap, gobj.GMap2);
BrowseMap.prototype.getMinimumResolution=function() { return 3; };
BrowseMap.prototype.updateOptionInfo=function() {
	this.browseCtrl.setText(this.pageCurr+' / '+this.pageTotal);
};
BrowseMap.prototype.flickr_photos_search_onLoad=function(success, responseXML, responseText, params){
	if(this.search_timestamp != params.search_timestamp) return;
try {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var photos=rsp.photos;

	this.pageCurr=parseInt(photos.page);
	this.pageTotal=parseInt(photos.pages);
	this.updateOptionInfo();

	this.photos = []; // clear previous photo data
	for (var i=0,len=photos.photo.length; i<len; i++) {
		var photo=photos.photo[i];
		var lat=parseFloat(photo.latitude);
		var lon=parseFloat(photo.longitude);
		if(!lat && !lon) continue;

		var p = {id:photo.id, secret:photo.secret, title:photo.title, pos:new gobj.GLatLng(lat, lon), accuracy:parseInt(photo.accuracy), api:flickr, dateupload:parseInt(photo.dateupload), datetaken:photo.datetaken, owner:photo.owner, ownername:photo.ownername, farm:photo.farm, server:photo.server, iconfarm:photo.iconfarm, iconserver:photo.iconserver, license:parseInt(photo.license)};
		this.photos.push(p);
	}

	this.regroupphotos();
} finally {
	this.browseCtrl.showLoading(false);
}};
BrowseMap.prototype.regroupphotos=function(){
	if(!this.photos) return;

	var photos=this.photos;

	var delta=deltas[this.getZoom()];

	var temp_bounds=[];
	for (var i=0,len=photos.length; i<len; i++) {
		var photo=photos[i];
		var pos = photo.pos;

		var isMerged=false;
		for (var j=0,len2=temp_bounds.length; j<len2; j++) {
			var b=temp_bounds[j];
			if( b.containsLatLng(pos)) {
				isMerged=true;
				b.photos.push(photo);
				if(b.firstdate>photo.firstdate)
					b.firstdate=photo.firstdate;
				break;
			}
		}

		if(!isMerged) {
			var b = new gobj.GLatLngBounds(new gobj.GLatLng(pos.lat()-delta, pos.lng()-delta), new gobj.GLatLng(pos.lat()+delta, pos.lng()+delta));
			b.photos=[photo];
			b.firstdate=photo.datetaken;
			temp_bounds.push(b);
		}
	}
	this.clearOverlays();

	for (var i=0,len=temp_bounds.length; i<len ; i++) {
		var b = temp_bounds[i];
		if(b.photos.length == 0) continue;

		if(b.maker)
			this.removeOverlay(b.maker);
		var center = b.getCenter();
		b.maker = fgs.PhotoGroupMarker.getInstance(b.photos.length);
		b.maker.setPhotos(b.photos);
		b.maker.setPoint(center);
		this.addOverlay(b.maker);
	}
};
BrowseMap.prototype.refreshView=function(nodelay, timestamp){
	if(this.disable_refresh) return;
	timestamp = timestamp || (this.search_timestamp = new Date().getTime());
	if(this.search_timestamp != timestamp) return;
	
	if(!nodelay) {
		var gmap = this;
		setTimeout(
			function() { gmap.refreshView(true, timestamp); },
			this.delay_loading
		);
		return;
	}

	this.browseCtrl.showLoading(true);

	this.lastcenter = this.getCenter();
	GM_setValue('last_browse_zoom', this.getZoom()+'');
	GM_setValue('last_browse_lat', this.lastcenter.lat()+'');
	GM_setValue('last_browse_lng', this.lastcenter.lng()+'');

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
		if(w > 180) w-=360;
		if(e <= -180) e+=360;
		if(e < w)
			((180+e) > (180-w)) ? w=-180 : e=180;
	}

	var searchOption={extras:'geo,date_upload,date_taken,owner_name,icon_server,license', per_page:PER_PAGE, page:this.pageCurr, accuracy:1};
	searchOption.bbox=w+','+s+','+e+','+n;

	searchOption.sort=this.browseCtrl.getValue('sort');

	var year = this.browseCtrl.getValue('year');
	var month = this.browseCtrl.getValue('month');
	var datemin = null;
	if(year == 'lastmonth') {
		datemin = new Date();
		datemin.setMonth(datemin.getMonth()-1);
	} else if(year == 'lastweek') {
		datemin = new Date();
		datemin.setDate(datemin.getDate()-7);
	} else if(year == 'yesterday') {
		datemin = new Date();
		datemin.setDate(datemin.getDate()-1);
	} else if(year == 'all') {
		searchOption.min_taken_date='1970-01-01 00:00:00';
	} else if(month == 'all') {
		searchOption.min_taken_date=year+'-01-01';
		searchOption.max_taken_date=year+'-12-31';
	} else {
		searchOption.min_taken_date=year+'-'+month+'-01';
		searchOption.max_taken_date=year+'-'+month+'-31';
	}
	if(datemin) {
		var y = datemin.getFullYear();
		var m = datemin.getMonth()+1;
		var d = datemin.getDate();
		searchOption.min_taken_date=y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d+' 00:00:00';
	}

	if(this.user_id) searchOption.user_id=this.user_id;
	if(this.group_id) searchOption.group_id=this.group_id;

	var searchtxt = $.trim(this.browseCtrl.getValue('search'));
	if(searchtxt!='')
		searchOption.text=searchtxt;

	//var points = [new gobj.GLatLng(n,e),new gobj.GLatLng(n,w),new gobj.GLatLng(s,w),new gobj.GLatLng(s,e),new gobj.GLatLng(n,e)];
	//this.addOverlay(new gobj.GPolyline(points, '#0000FF', 1, .3));
	searchOption.search_timestamp=this.search_timestamp;
	flickr._callapi('flickr.photos.search', searchOption, this);
};
BrowseMap.prototype.onzoomend=function(){
	this.win.toggleActivePanel(false);
	this.pageCurr=this.pageTotal=1;
	this.clearOverlays();
	this.refreshView();
};
BrowseMap.prototype.ondragend=function(){
	if(this.suspenddragevent) return;
	var lastcenter = this.lastcenter;
	var bound = this.getBounds();
	var center = bound.getCenter();
	var span   = bound.toSpan();
	if(lastcenter) {
		var dx  = Math.abs(center.lng() - lastcenter.lng());
		var dy  = Math.abs(center.lat() - lastcenter.lat());
		var bx = span.lng();
		var by = span.lat();
		if ((dx < 0.15*bx) && (dy < 0.15*by)) return;
	}

	this.win.toggleActivePanel(false);
	this.pageCurr=this.pageTotal=1;
	this.refreshView();
};
BrowseMap.prototype.onsearchresultclick=function(pos, zoom){
	this.disable_refresh=true;
	this.setCenter(pos,zoom);
	this.disable_refresh=false;
	this.onzoomend();
};
BrowseMap.prototype.prevPage=function(){
	if( this.pageCurr <= 1) return;
	this.pageCurr--;
	this.refreshView(true);
};
BrowseMap.prototype.nextPage=function(){
	if( this.pageCurr >= this.pageTotal) return;
	this.pageCurr++;
	this.refreshView(true);
};
BrowseMap.prototype.changeOption=function(){
try{
	this.pageCurr=this.pageTotal=1;
	this.refreshView(true);
} finally { return false; }
};
BrowseMap.prototype.onloadlastlocation=function() {
	var center = new gobj.GLatLng(parseFloat(GM_getValue('last_lat', DEF_LAT)), parseFloat(GM_getValue('last_lng', DEF_LNG)));
	var zoom = parseInt(GM_getValue('last_zoom', DEF_ZOOM));
	this.setCenter(center, zoom);
	this.refreshView(true);
};
BrowseMap.prototype.oninfowindowopen=function(){
	this.suspenddragevent=true;
	this.savePosition();
};
BrowseMap.prototype.oninfowindowclose=function(){
	this.returnToSavedPosition();
	this.win.toggleActivePanel(false);
	this.suspenddragevent=false;
};


fgs.init.inited=true;
};


var userjs = gobj.userjs = {

checknewversion : function(SCRIPT) {
try {
	if (!GM_getValue) return;
	var DOS_PREVENTION_TIME = 2*60*1000;
	var isSomeoneChecking = GM_getValue('CHECKING', null);
	var now = new Date().getTime();
	GM_setValue('CHECKING', now.toString());
	if (isSomeoneChecking && (now - parseInt(isSomeoneChecking)) < DOS_PREVENTION_TIME) return;

	// check daily
	var ONE_DAY = 24*60*60*1000;
	var lastChecked = GM_getValue('LAST_CHECKED', null);
	if (lastChecked && (now - lastChecked) < ONE_DAY) return;

	GM_xmlhttpRequest({
		method: 'GET',
		url: SCRIPT.url + '?source',
		onload: function(result) {
			if (!result.responseText.match(/@version\s+([\d.]+)/)) return;     // did not find a suitable version header
			var theOtherVersion = parseFloat(RegExp.$1);
			if (theOtherVersion <= parseFloat(SCRIPT.version)) return;      // no updates or older version on userscripts.orge site
			if (gobj.confirm('A new version ' + theOtherVersion + ' of userscript "' + SCRIPT.name + '" is available.\nYour installed version is ' + SCRIPT.version + ' .\n\nUpdate now?\n')) {
				GM_openInTab(SCRIPT.url);
			}
		}
	});
	GM_setValue('LAST_CHECKED', now.toString());
} catch (ex) {}
},

onWindowResizeScroll: function() {
	$('div.mapwin').each(function() { this.onWindowResize(); });
},
prepare: function() {
	if(arguments.callee.init) return true;

	if(!js_jquery && !js_gmap && $ && gobj.GMap2 && gobj.GUnload) {
		prepare_imgs();
		fgs.init();
		$(gobj.window).unload(gobj.GUnload).resize(userjs.onWindowResizeScroll).scroll(userjs.onWindowResizeScroll);
		arguments.callee.init=true;

		gobj.jQuery.fn.log = function (msg) { console.log("%s: %o", msg, this); return this; };
		return true;
	}

	if(!arguments.callee.prepare) {
		arguments.callee.prepare = true;
		GM_addStyle(FGS_STYLE);
		
		loadscript(js_jquery,function(){jQuery=$=gobj.jQuery;js_jquery=null;});
		loadscript(js_gmap,function(){js_gmap=null;});
		loadscript(js_analytics,function(){ _uacct=gobj._uacct='UA-359113-4'; gobj.urchinTracker('/fgs/userjs'); });
	}
	return false;
},

check_loading: function(id) {
	var lo = document.getElementById(id);
	if(!lo) return;

	if(userjs.prepare()) {
		lo.fun.call(lo.lnk);
		lo.parentNode.removeChild(lo);
	} else {
		setTimeout('gobj.userjs.check_loading("'+id+'");', 100);
	}
},


launch: function(){
try {
	if(!userjs.prepare()) {
		if(this.fgsloading) return;

		var id = 'fgs_loading_' + (new Date()).getTime();
		var lo = document.createElement('img');
		lo.src = small_loading;
		lo.id = id;
		lo.lnk = this;
		lo.fun = arguments.callee;
		this.appendChild(lo);
		this.fgsloading = lo;
		userjs.checknewversion({name:scriptname, url:installurl, version:currVer});
		userjs.check_loading(id);
		return;
	}

	if(this.win) {
		if(this.win.style.display != 'none') {
			this.win.close();
		} else {
			this.win.open();
		}
		return;
	}

	var opt = {photo_id:this.photo_id, user_id:this.user_id, group_id:this.group_id, photoset_id:this.photoset_id};
	if(this.photo_id) {
		var win=opt.win=create_mapwindow({link:this,fixmax:false,width:516,height:313,embedlink:true,loadlast:true});
		$(document.body).prepend(win);
		win.open();
		var gmap=new fgs.PhotoMap(win.mapdiv, opt);
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.ctrl_small=new gobj.GSmallMapControl();
		gmap.addControl(gmap.ctrl_small);
	} else if(this.photoset_id) {
		var win=opt.win=create_mapwindow({link:this,fixmax:true,activepanel:PhotoPanel(),readonly:true,embedlink:true});
		$(document.body).prepend(win);
		win.open();
		var gmap=new fgs.PhotoSetMap(win.mapdiv, opt);
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.addControl(new gobj.GLargeMapControl());
		var ctrl = new gobj.GOverviewMapControl();
		gmap.addControl(ctrl);
		ctrl.hide();
	} else { // world map, user map, organize map
		var winopt={link:this,fixmax:true,activepanel:PhotoPanel(),readonly:true,loadlast:true};
		if(this.organize_user_id) {
			opt.user_id=this.organize_user_id;
			opt.fullrange=true;
			winopt.bottompanel=OrganizeBottomPanel();
		}
		var win=opt.win=create_mapwindow(winopt);
		$(document.body).prepend(win);
		win.open();
		var gmap=new fgs.BrowseMap(win.mapdiv, opt);
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.addControl(new gobj.GLargeMapControl());
		var ctrl = new gobj.GOverviewMapControl();
		gmap.addControl(ctrl);
		ctrl.hide();

		if(opt.user_id) {
			$('<div class="contextmenu" style="display:none;">'+
				'<a class="delete">&nbsp;&nbsp;Delete&nbsp;&nbsp;</a>'+
			'</div>').appendTo(gmap.getContainer()).find('.delete').click(function() {
				$(this.parentNode).hide();
				this.parentNode.marker.ondelete();
			});
			gobj.GEvent.addListener(gmap, 'click', function() {
				$('div.contextmenu').hide();
			});
			gobj.GEvent.addListener(gmap, 'singlerightclick', function(point, src, overlay) {
				if(!src || !src.tagName || src.tagName != 'DIV' || !src.className || src.className != 'markerlabel') return;
				var map = this;
				var contextmenu = $('div.contextmenu').show().get(0);
				contextmenu.marker = src.marker;
				var x=point.x;
				var y=point.y;
				var size=map.getSize();
				if (x > size.width-20) { x = size.width-20; }
				if (y > size.height-60) { y = size.height-60; }
				new gobj.GControlPosition(gobj.G_ANCHOR_TOP_LEFT, new gobj.GSize(x,y)).apply(contextmenu);
			});
		}

		var lat = parseFloat(GM_getValue('last_browse_lat', DEF_LAT));
		var lng = parseFloat(GM_getValue('last_browse_lng', DEF_LNG));
		var zoom = parseInt(GM_getValue('last_browse_zoom', DEF_ZOOM));
		gmap.setCenter(new gobj.GLatLng(lat,lng), zoom);
	}
} finally {
	return false;
}},



onload: function() {
	var rexp_photo_map_link =    /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/(\d+)\/map(?:\/.*)?$/;
	var rexp_set_map_link =      /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/sets\/(\d+)\/map(?:\/.*)?$/;
	var rexp_user_map_link =     /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/map(?:\/.*)?$/;
	var rexp_organize_map_link = /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/organize\/\?start_tab=map(?:\/.*)?$/;
	var rexp_group_map_link =    /^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]+)\/map(?:\/.*)?$/;
	var rexp_world_map_link =    /^http:\/\/(?:www.*\.)?flickr\.com\/map(?:\/.*)?$/;

	function parseLink(p, exp) {
		if(!p) return;
		var lnks = p.getElementsByTagName('a');
		for(var ln in lnks) {
			var maplnk = lnks[ln];
			if(maplnk.href && exp.exec(maplnk.href)) {
				maplnk.onclick=userjs.launch;
				return maplnk;
			}
		}
	}
	function parsePhotoMap(p) {
		var maplnk = parseLink(p, rexp_photo_map_link);
		if(maplnk) maplnk.photo_id=RegExp.$2;
	}
	function parseUserMap(p,user_id) {
		var maplnk = parseLink(p, rexp_user_map_link);
		if(maplnk) maplnk.user_id=user_id;
	}
	function parseWorldMap(p) {
		parseLink(p, rexp_world_map_link);
	}
	function parseGroupMap(p) {
		var maplnk = parseLink(p, rexp_group_map_link);
		if(maplnk) maplnk.group_id=gobj.f.w.value;
	}
	function parsePhotosetMap(p) {
		var maplnk = parseLink(p, rexp_set_map_link);
		if(maplnk) maplnk.photoset_id=RegExp.$2;
	}
	function parseOrganizeMap(p) {
		var maplnk = parseLink(p, rexp_organize_map_link);
		if(maplnk) maplnk.organize_user_id=gobj.global_nsid;
	}

	if(       /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/(\d+)(?:\/.*)?$/.exec(gobj.location.href)) {
		var maplnk = document.getElementById('a_link_to_map');
		if(maplnk) {
			maplnk.photo_id=RegExp.$2;
			maplnk.onclick=userjs.launch;
		}
		var edtlnk = document.getElementById('a_place_on_map_old');
		if(edtlnk) {
			edtlnk.photo_id=RegExp.$2;
			edtlnk.onclick=userjs.launch;
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)\/sets\/(\d+)(?:\/.*)?$/.exec(gobj.location.href)) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras)
			paras[p].className == 'Links' && parsePhotosetMap(paras[p]);
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]+)(?:\/.*)?$/.exec(gobj.location.href)) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras) {
			paras[p].className == 'Do' && parsePhotoMap(paras[p]);
			paras[p].className == 'Links' && parseUserMap(paras[p],gobj.f.w.value);
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/explore(?:\/.*)?$/.exec(gobj.location.href)) {
		parseWorldMap(document.getElementById('Main'));
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]+)(?:\/.*)?$/.exec(gobj.location.href)) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras)
			paras[p].className == 'Links' && parseGroupMap(paras[p]);
	}

	parseUserMap(document.getElementById('candy_nav_menu_you'), gobj.global_nsid);
	parseOrganizeMap(document.getElementById('candy_nav_menu_organize'));
	parseWorldMap(document.getElementById('candy_nav_menu_explore'));
}
};

userjs.onload();

})();
