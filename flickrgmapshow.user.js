// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @author        wctang <wctang@gmail.com>
// @include       http://www*.flickr.com/*
// @include       http://flickr.com/*
// @description   Show Flickr geotagged photos with Google Map.
// @source        http://userscripts.org/scripts/show/9450
// @identifier    http://userscripts.org/scripts/source/9450.user.js
// @version       2.9
//
// Change Log
// ==========
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
var currVer = '2.9';

var js_jquery = 'http://jqueryjs.googlecode.com/files/jquery-1.2.1.min.js';
var js_gmap = 'http://maps.google.com/maps?file=api&v=2.x';
var js_analytics = 'http://www.google-analytics.com/urchin.js';

var EMBEDDED_URL = 'http://flickr-gmap-show.googlecode.com/svn/trunk/';

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
function prepare_imgs(){
	for(var m in imgs_src) { var mm = new Image(); mm.src = imgs_src[m].src; imgs[m] = mm; }
}


var PER_PAGE = 200;
var DEF_LAT = '0';
var DEF_LNG = '0';
var DEF_ZOOM = '3';

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
	s.type='text/javascript'
	s.src =jspath;
	if(loaded) {
		s.onreadystatechange=function() {
			if (this.readyState=='complete')
				loaded();
		};
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
		if(f>0)
			sty.media=str.substring(f+7,str.indexOf('"',f+7));
		str=str.replace(/<style.*">/,'');
		str=str.replace(/<\/style>/,'');
		if (sty.styleSheet) { // ie
			sty.styleSheet.cssText = str;
		} else {
			sty.appendChild(document.createTextNode(str));
		}
		document.getElementsByTagName('head')[0].appendChild(sty);
	} else {
		document.oldwrite(str);
	}
};

var btnbackgnd = 'background:transparent url('+imgdir+'icons.png?v=2.9) no-repeat scroll ';
var shadwbkgnd = 'background:transparent url('+imgdir+'shadow-main.png) no-repeat scroll ';
var FGS_STYLE=
'<style type="text/css">'+
'img {border:0;text-decoration:none;} '+
'img.buddy {width:48px;height:48px;} '+
'.markerlabel {position:absolute; text-align:center; vertical-align:middle; font-size:'+(navigator.userAgent.indexOf('MSIE')>0?'x-small':'small')+'; cursor:pointer;}'+
'.mask {z-index:1000; opacity:.8; -moz-opacity:.8; filter:alpha(opacity=80); background-color:black;} '+
'.mask div {position:relative;float:left;top:50%;margin-top:-16px;left:50%;margin-left:-16px;} '+
'.screenmask {z-index:1000; opacity:.8; -moz-opacity:.8; filter:alpha(opacity=80); background-color:black; position:absolute; top:0; left:0;} '+
'.screenmask div {position:relative;float:left;left:50%;margin-left:-16px;} '+
'.btn {cursor:pointer;} '+
'.btn img {overflow:visible;} '+
'.mapwin {font:14px arial; text-align:left;} '+
'.mapwin table.shadow {position:absolute;width:100%;height:100%;left:6px;top:6px;border-collapse:collapse;border:0;} '+
'.mapwin table.shadow td.main {border:0;             '+shadwbkgnd+' bottom right;} '+
'.mapwin table.shadow td.top  {border:0;height:12px; '+shadwbkgnd+' right top;} '+
'.mapwin table.shadow td.left {border:0;width:10px;  '+shadwbkgnd+' left bottom;} '+
'.mapwinmain {border:solid 2px #EEEEEE; background-color:white; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .photopanel img {position:absolute; background:url('+imgs_src['loading'].src+') no-repeat bottom right; cursor:pointer;} '+
'.mapwinmain .photopanelidx {height:5px;width:75px; background-color:#FF8888;} '+
'.mapwinmain .progress {height:4px; background-color:#DDDDDD;} '+
'.mapwinmain .progressbar {height:4px; background-color:#8888FF;} '+
'.mapwinmain .search {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .info {color:#999999;} '+
'.mapwinmain .locate {font-style:italic;color:#999999;} '+
'.mapwinmain .embeddedlink {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .action {background-color:white;border:solid 1px black; } '+
'.mapwinmain .action a {display:block; margin:5px;} '+
'.mapwinmain .about {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .msg {background-color:yellow;} '+
'.mapwinmain .option {border:solid 1px black; background-color:white; padding:5px; text-align:left; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.popup {z-index:2000; background-color:white; font:14px arial; text-align:left;} '+
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
'a.rr_btn:hover    {'+btnbackgnd+' -25px -278px;} '+
'</style>';




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
	hasbuddy: true,
	buddyurl : function(photo) {
		if(photo.iconserver&parseInt(photo.iconserver)>0) return 'http://farm'+photo.iconfarm+'.static.flickr.com/'+photo.iconserver+'/buddyicons/'+photo.owner+'.jpg';
		else return 'http://www.flickr.com/images/buddyicon.jpg';
	},
	date: function(photo) { return photo.datetaken.substr(0,10); },
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
				'<div class="mask"   style="position:absolute;left:5px;top:27px; display:none;"><div><img src="'+imgs['loading'].src+'"></img></div></div>'+ // mask
				'<div class="msg"    style="position:absolute;left:5px;bottom:24px;height:20px;"><a class="btn" style="display:none;">Load last location? </a><a class="btn" style="display:none;">Save location? </a></div>'+ // msg
				(opt.bottompanel?
				'<div                style="position:absolute;left:5px;bottom:24px;height:85px; display:none;">'+
					'<a class="pp_btn" style="position:absolute;left:1px;top:48px;"></a>'+
					'<a class="p_btn" style="position:absolute; left:1px;top:0px;"></a>'+
					'<div  style="position:absolute;left:27px;top:5px;height:80px;width:455px; overflow:hidden;"></div>'+
					'<a class="r_btn" style="position:absolute; right:1px;top:0px;"></a>'+
					'<a class="rr_btn" style="position:absolute;right:1px;top:48px;"></a>'+
					'<div  class="progress" style="position:absolute;left:27px;top:0px;width:455px; overflow:hidden;">'+
						'<div class="progressbar" style="position:relative;width:10px;"></div>'+
					'</div>'+
				'</div>' // bottom panel
				:'')+
				'<div class="info"   style="position:absolute;left:9px;bottom:8px;"></div>'+ // info
				'<div class="locate" style="position:absolute;right:30px;bottom:8px;"></div>'+ // locate div
				'<a class="closebtn" style="position:absolute;right:12px;top:6px;"></a>'+ // close btn
				'<a class="maxbtn"   style="position:absolute;right:32px;top:6px; display:none;"></a>'+ // close btn
				'<a class="searchbtn" style="position:absolute;right:52px;top:6px;"></a>'+ // search btn
				'<div class="search" style="position:absolute;left:15px;top:37px; display:none;"><a class="closebtn" style="position:absolute;right:12px;top:6px;"></a><div style="margin:10px;"><form id="geocode_search">Google Geo Search: <input id="geocode_search_input" name="s_str"><input type="submit"></form><br><div id="geocode_result" style="overflow:auto;width:100%;"></div></div></div>'+ //search
				'<a class="actionbtn" style="position:absolute;right:72px;top:6px;"></a>'+ // action btn
				'<div class="action" style="position:absolute;right:5px;top:25px;width:150px; display:none;"></div>'+ // action panel
				(opt.embedlink?
				'<a class="embedbtn" style="position:absolute;right:92px;top:6px; display:none;"></a>'+ // embedded link btn
				'<div class="embeddedlink" style="position:absolute;left:15px;top:37px; display:none;"><a class="closebtn" style="position:absolute;right:12px;top:6px;"></a><div style="margin:10px;">Paste HTML to embed in website:<br><input style="width:100%;" id="embbed_link"></div></div>' //embedded link
				:'')+
				'<a class="aboutbtn" style="position:absolute;right:5px;bottom:6px; display:none;"></a>'+ // about btn
				'<div class="about"  style="position:absolute;right:15px;bottom:37px;width:200px;height:180px; display:none;"><div style="text-align:center; padding:3px;"><p><b>Flickr GMap Show</b></p><p><a href="http://code.google.com/p/flickr-gmap-show/">Project page</a><br><a href="http://userscripts.org/scripts/show/9450">Script page</a></p><p>Author: <a href="mailto:wctang@gmail.com">wctang</a></p><p><a target="_blank" href="https://www.paypal.com/xclick/business=wctang%40gmail%2ecom&item_name=fgs_donation&no_note=1&currency_code=USD"><img src="http://www.pspad.com/img/paypal_en.gif"></img></a></p></div></div>'+ //about
			'</div>'+
		'</div>').get(0);
	for(var f in create_mapwindow) {
		if(typeof create_mapwindow[f] == 'function')
			win[f] = create_mapwindow[f];
	}

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
	win.showbottompanel = false;
	if(opt.bottompanel) {
		win.bottompanel = w[++idx];
		win.$bottompanel = $(win.bottompanel);
		var bs = win.bottompanel.childNodes;
		$(bs[0]).click(win.f_frst).get(0).win=win;
		$(bs[1]).click(win.f_prev).get(0).win=win;
		win.$photopanelcontainer = $(bs[2]);
		$(bs[3]).click(win.f_next).get(0).win=win;
		$(bs[4]).click(win.f_last).get(0).win=win;
		win.$progress=$(bs[5]);
		win.$progressbar=$(bs[5].firstChild);
	}
	win.$infodiv = $(w[++idx]);
	win.locatediv = w[++idx];
	$(w[++idx]).click(win.f_close).get(0).win=win;
	var maxbtn = w[++idx];
	win.searchbtn = w[++idx];
	$(win.searchbtn).click(win.f_search_toggle).get(0).win=win;
	win.searchdiv = w[++idx];
	win.$searchdiv = $(win.searchdiv);
	win.$searchdiv.find('a.closebtn').click(win.f_search_toggle).get(0).win=win;
	win.$searchdiv.find('#geocode_search').submit(win.f_search_submit).get(0).win=win;
	win.searchdiv.input=win.$searchdiv.find('#geocode_search_input').get(0);
	win.searchdiv.$result=win.$searchdiv.find('#geocode_result');
	win.actionbtn = w[++idx];
	$(win.actionbtn).click(win.f_action_toggle).get(0).win=win;
	win.$actiondiv = $(w[++idx]);
	if(opt.embedlink) {
		$(w[++idx]).show().click(win.f_embeddedlink_toggle).get(0).win=win;
		win.$embbeddiv = $(w[++idx]);
		win.$embbeddiv.find('a.closebtn').click(win.f_embeddedlink_toggle).get(0).win=win;
	}
	$(w[++idx]).show().click(win.f_about_toggle).get(0).win=win;
	win.$aboutdiv = $(w[++idx]);

	win.link=opt.link;
	win.link.win=win;
	if(opt.fixmax) {
		win.m_max=true;
	} else {
		win.m_max=false;

		$(maxbtn).click(win.f_max_toggle).show().get(0).win=win;

		var ofst = $(win.link).offset();
		var top=ofst.top-opt.height-10;
		var left=ofst.left-(opt.width*.85);
		if(left < 10) left = 10;
		win.m_pos = {top:top,left:left,width:opt.width,height:opt.height};
	}

	if(!!opt.loadlast) {
		win.f_action_append('Load Last Location',win.loadlastlocation_click);
	}
	if(!opt.readonly) {
		win.f_action_append('Save Location',win.savelocation_click);
		win.f_action_append('Remove Location',win.removelocation_click);
	}
	return win;
};
create_mapwindow.f_open=function(){
	$(this).fadeIn('fast');
	this.f_refreshsize();
};
create_mapwindow.f_close=function(){
	var win = this.win||this;
	$(win).fadeOut('fast');
};
create_mapwindow.f_resize=function(w,h){
	var ww=w-13;
	var hh=h-57;
	if(this.showbottompanel) {
		this.$mapdiv.width(ww).height(hh-85);
	} else {
		this.$mapdiv.width(ww).height(hh);
	}
	if(this.$bottompanel) {
		this.$bottompanel.width(ww);
		this.$photopanelcontainer.width(ww-54);
		this.$progress.width(ww-54);
	}
	this.$maskdiv.width(ww).height(hh);
	this.$searchdiv.width(ww-20).height(hh-30);
	if(this.$embbeddiv)
		this.$embbeddiv.width(ww-20).height(hh-43);
	this.$infodiv.width(ww-133);
};
create_mapwindow.f_refreshsize=function(animate) {
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
	this.f_resize(pos.width,pos.height);

	if(isvisible && this.gmap) {
		this.gmap.checkResize();
		if(this.gmap.marker)
			this.gmap.setCenter(this.gmap.marker.getLatLng());
	}
};
create_mapwindow.onwindowresize=function(){
	if(this.style.display == 'none' || !this.m_max) return;
	this.f_refreshsize();
};
create_mapwindow.f_action_append=function(str,fun){
	var lnk = $('<a class="btn">'+str+'</a>').appendTo(this.$actiondiv.get(0)).click(fun).get(0);
	lnk.win=this;
	return lnk;
};
create_mapwindow.f_max_toggle=function(){
	var win = this.win||this;
	win.m_max=!win.m_max;
	if(win.gmap.on_max_toggle) win.gmap.on_max_toggle(win.m_max);
	win.f_refreshsize(true);
};
create_mapwindow.f_search_toggle=function(e){
	var win = this.win||this;
	if(!e || win.$searchdiv.is(':visible')){
		win.$searchdiv.fadeOut('fast');
	} else {
		win.$searchdiv.fadeIn('fast');
		win.searchdiv.input.focus();
	}
};
create_mapwindow.f_action_toggle=function(e){
	var win = this.win||this;
	if(!e || win.$actiondiv.is(':visible')) {
		win.$actiondiv.fadeOut('fast');
	} else {
		win.$actiondiv.fadeIn('fast');
	}
};
create_mapwindow.f_embeddedlink_toggle=function(e) {
	var win = this.win||this;
	if(!e || win.$embbeddiv.is(':visible')) {
		win.$embbeddiv.fadeOut('fast');
	} else {
		if(win.gmap && win.gmap.getembeddedlink)
			win.$embbeddiv.find('#embbed_link').val(win.gmap.getembeddedlink());
		win.$embbeddiv.fadeIn('fast');
	}
};
create_mapwindow.f_about_toggle=function(){
	var win = this.win||this;
	if(win.$aboutdiv.is(':visible')){
		win.$aboutdiv.fadeOut('fast');
	} else {
		win.$aboutdiv.fadeIn('fast');
	}
};
create_mapwindow.f_photopanel_toggle=function(isshow){
	var win = this.win||this;
	if((win.showbottompanel && isshow) || (!win.showbottompanel && !isshow)) return;

	if(isshow) {
		win.showbottompanel=true;
		win.$bottompanel.show();
	} else {
		win.showbottompanel=false;
		win.f_putphotopanel(null);
		win.$bottompanel.hide();
	}
	win.f_refreshsize();
};
create_mapwindow.f_search_submit=function(){
try {
	geocode.search(this.win,this.win.f_search_submit_callback,this.s_str.value);
} finally {
	return false;
}
};
create_mapwindow.f_search_submit_callback=function(result){
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
		var addr = '';
		if(point.address) {
			addr = point.address;
		} else {
			var addrdtl = point.AddressDetails;
			while(true) {
				if(!addrdtl) {
					break;
				} else if(addrdtl.Country) {
					if(addrdtl.Country.CountryNameCode) addr+=addrdtl.Country.CountryNameCode;
					addrdtl=addrdtl.Country;
				} else if(addrdtl.AdministrativeArea) {
					if(addrdtl.AdministrativeArea.AdministrativeAreaName) addr+=(', ' + addrdtl.AdministrativeArea.AdministrativeAreaName);
					addrdtl=addrdtl.AdministrativeArea;
				} else if(addrdtl.SubAdministrativeArea) {
					if(addrdtl.SubAdministrativeArea.SubAdministrativeAreaName) addr+=(', ' + addrdtl.SubAdministrativeArea.SubAdministrativeAreaName);
					addrdtl=addrdtl.SubAdministrativeArea;
				} else if(addrdtl.Locality) {
					if(addrdtl.Locality.LocalityName) addr+=(', ' + addrdtl.Locality.LocalityName);
					addrdtl=addrdtl.Locality;
				} else if(addrdtl.Thoroughfare) {
					if(addrdtl.Thoroughfare.ThoroughfareName) addr+=(', ' + addrdtl.Thoroughfare.ThoroughfareName);
					addrdtl=addrdtl.Thoroughfare;
				} else {
					break;
				}
			}
		}

		var zoom=geocode.accuracytozoom[parseInt(point.AddressDetails.Accuracy)];
		var pos = point.Point.coordinates;
		var lat=parseFloat(pos[1]);
		var lng=parseFloat(pos[0]);
		var a = $('<a class="btn">'+addr+'</a>').get(0);
		a.zoom = zoom;
		a.lat = lat;
		a.lng = lng;
		a.win = this;
		a.onclick=create_mapwindow.f_search_result_click;
		this.searchdiv.$result.append(a).append('<br>');
	}
};
create_mapwindow.f_search_result_click=function(){
	var win = this.win;
	var zoom = this.zoom;
	var pos = new gobj.GLatLng(this.lat,this.lng);
	if(win.gmap && win.gmap.onsearchresultclick)
		win.gmap.onsearchresultclick(pos, zoom);
	win.f_search_toggle();
};
create_mapwindow.loadlastlocation_display=function() {
	this.$loadlastlocationlnk.show();
};
create_mapwindow.loadlastlocation_click=function() {
	this.win.$loadlastlocationlnk.hide();
	this.win.f_action_toggle();
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
	this.win.f_action_toggle();
};
create_mapwindow.removelocation_click=function() {
	if(confirm('Remove location?'))
		if(this.win.gmap.removelocation)
			this.win.gmap.removelocation();

	this.win.f_action_toggle();
};
create_mapwindow.disable_action=function() {
	$(this.actionbtn).hide();
};
create_mapwindow.disable_search=function() {
	$(this.searchbtn).hide();
};
create_mapwindow.f_mask=function(){this.$maskdiv.show();};
create_mapwindow.f_unmask=function(){this.$maskdiv.hide();};
create_mapwindow.f_settitle=function(t){this.titlediv.innerHTML = t;};
// photopanel
create_mapwindow.f_frst=function(){ var win = this.win||this; win.f_refreshlist(-Infinity); };
create_mapwindow.f_prev=function(){ var win = this.win||this; win.f_refreshlist(-1); };
create_mapwindow.f_next=function(){ var win = this.win||this; win.f_refreshlist(1); };
create_mapwindow.f_last=function(){ var win = this.win||this; win.f_refreshlist(Infinity); };
create_mapwindow.f_putphotopanel=function(p){
	var photopanel=this.$photopanelcontainer.get(0).firstChild;
	if(photopanel)
		photopanel.parentNode.removeChild(photopanel);

	if(p) {
		this.$photopanelcontainer.append(p);
		this.f_refreshlist(0);
	}
};
create_mapwindow.f_refreshlist=function(dif){
	var speed=400;
	var ctnrwid=this.$photopanelcontainer.width();
	var photopanel=this.$photopanelcontainer.get(0).firstChild;
	var $photopanel=$(photopanel);

	var marker = photopanel.marker;
	var photos = marker.photos;
	var currpos = photopanel.currpos;

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
	photopanel.currpos=currpos;

	var end = currpos+widcnt+postfix;
	if(end > phocnt) {
		end = phocnt;
		postfix=0;
	}

	if($photopanel.width() < end*76) $photopanel.width(end*76);

	for(var i = currpos; i<end; ++i) {
		var photo = photos[i];
		if(!photo.img) {
			photo.img = $('<img style="width:75px;height:75px;"></img>').attr('src',photo.api.iconurl(photo)).attr('title',photo.api.gettitle(photo)).addClass(photo.api.name).get(0);
			photo.img.photo=photo;
		}
		if(!photo.img.marker) {
			photo.img.marker=marker;
			$(photo.img).css('left',i*76).click(marker.onphotoclick).appendTo(photopanel);
		}
	}

	this.$progressbar.animate({width:((end-postfix-currpos)/phocnt)*100+'%', left:(currpos/phocnt*100)+'%'},speed);
	$photopanel.animate({left:currpos*(-76)},speed);
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
	this.photopanel=null;
	this.currphoto=null;
	this.showpanel=null;
	if(this.photos) {
		this.$div.text(this.photos.length);
	} else {
		this.$div.get(0).parentNode.removeChild(this.$div.get(0));
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

	marker.map.win.f_photopanel_toggle(true);

	var isfirst = false;
	if(!marker.photopanel) {
		isfirst = true;
		var photopanel = $(
			'<div class="photopanel" style="position:absolute;height:80px;">'+
				'<div class="photopanelidx" style="position:absolute;top:75px;left:0px;"></div>'+
			'</div>').get(0);
		photopanel.marker=marker;
		photopanel.currpos=0;
		photopanel.$photoidx=$(photopanel.firstChild);
		marker.photopanel=photopanel;
		marker.currphoto=marker.photos[0];

		// clear previous photo.img data
		for(var i = 0, len = marker.photos.length; i < len; ++i)
			if(marker.photos[i].img)
				marker.photos[i].img.marker = null;
	}
	marker.map.win.f_putphotopanel(marker.photopanel);
	marker.onphotoclick.apply(marker.currphoto.img);
};
PhotoGroupMarker.prototype.showpanelstr = 
	'<div style="border: 1px solid gray; width:505px;height:270px;">'+
		'<div style="position:absolute;left:  5px;top:  5px;"><a class="maxbtn" style="float:left;" target="_blank"></a><a class="title" target="_blank"></a></div>'+
		'<div style="position:absolute;left:  5px;top: 25px;width:240px;height:180px; overflow:hidden;"></div>'+
		'<div style="position:absolute;left:  5px;top:215px;width:240px;">'+
			'<img id="authicn" style="float:left; margin-right:5px;"></img> Taken on <span id="datelnk" target="_blank"></span><br>by <a id="authlnk" target="_blank"></a>'+
		'</div>'+
		'<div style="position:absolute;left:260px;top: 25px;width:240px;height:240px; text-align:center;"></div>'+
	'</div>';
PhotoGroupMarker.prototype.onphotoclick=function(){
	if(!this.marker.showpanel) {
		var showpanel= $(this.marker.showpanelstr).get(0);
		showpanel.icon    = showpanel.childNodes[0].childNodes[0];
		showpanel.titl    = showpanel.childNodes[0].childNodes[1];
		showpanel.mapctnr = showpanel.childNodes[1];
		showpanel.authinfo = showpanel.childNodes[2];
		var $authinfo = $(showpanel.authinfo);
		showpanel.authinfo.authicn = $authinfo.find('#authicn').get(0);
		showpanel.authinfo.datelnk = $authinfo.find('#datelnk').get(0);
		showpanel.authinfo.authlnk = $authinfo.find('#authlnk').get(0);
		showpanel.imgctnr =  showpanel.childNodes[3];

		this.marker.showpanel = showpanel;
	}

	var photo = this.photo;
	var showpanel = this.marker.showpanel;

	var infow = this.marker.map.getInfoWindow();
	if(infow.isHidden()) {
		this.marker.openInfoWindow(showpanel, {suppressMapPan:false});

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
	this.marker.currphoto=photo;

	var href=photo.api.pageurl(photo);
	$(showpanel.icon).attr('href',href);
	$(showpanel.titl).html(photo.api.gettitle(photo)).attr('href',href);
	$(showpanel.imgctnr).empty();
	$('<img></img>').attr('src',photo.api.smallurl(photo)).appendTo(showpanel.imgctnr);
	$(showpanel.authinfo.authicn).attr('src',photo.api.buddyurl(photo));
	$(showpanel.authinfo.datelnk).text(photo.api.date(photo));
	$(showpanel.authinfo.authlnk).text(photo.api.owner(photo)).attr('href',photo.api.ownerurl(photo));

	this.marker.photopanel.$photoidx.css('left',$(this).css('left'));
};


// PhotoMap
var PhotoMap=fgs.PhotoMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.win.gmap=this;
	this.photo_id=opts.photo_id;
	this.win.f_mask();
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
		this.win.f_search_toggle(true);
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
		this.win.disable_action();
		this.win.disable_search();
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
	this.win.f_unmask();
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



// PhotoSetMap
var PhotoSetMap=fgs.PhotoSetMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.win.gmap=this;
	this.photoset_id=opts.photoset_id;
	this.datetracking=true;
	this.win.disable_action();

	var mt=this.getMapTypes();
	for(var i=0; i<mt.length; i++)
		mt[i].getMinimumResolution=this.getMinimumResolution;

	var options=this.options=$(
		'<div class="option" style="position:absolute;top:6px; left:80px;">'+
			'<a class="updnbtn" style="position:absolute;left:5px;"></a>'+
			'<a class="trkbtn"  style="position:absolute;left:20px;"></a>'+
			'<span style="margin-left:35px;">&nbsp;</span>'+
			'<p style="margin:5px; display:none;"></p>'+
			'<div style="padding-top:5px;"><img src="'+imgs['flickr_loading'].src+'"></img> <span id="loading_msg">Loading...</span></div>'+
		'</div>').get(0);
	$(options.childNodes[0]).click(this.desc_toggle).get(0).gmap=this;
	$(options.childNodes[1]).click(this.tracking_toggle).get(0).gmap=this;
	options.titl=options.childNodes[2];
	options.desc=options.childNodes[3];
	options.$loading=$(options.childNodes[4]);
	options.loadingmsg = options.$loading.find('#loading_msg').get(0);
	this.getContainer().appendChild(options);

	gobj.GEvent.addListener(this, 'zoomend', this.onzoomend);
	gobj.GEvent.addListener(this, 'infowindowopen', this.oninfowindowopen);
	gobj.GEvent.addListener(this, 'infowindowclose', this.oninfowindowclose);

	this.win.f_mask();

	var opts={photoset_id:this.photoset_id, extras:'geo,date_taken,icon_server', per_page:PER_PAGE, page:1};
	flickr._callapi('flickr.photosets.getPhotos', opts, this);
	flickr._callapi('flickr.photosets.getInfo', {photoset_id:this.photoset_id}, this);
};
fgs.extend(PhotoSetMap, gobj.GMap2);
PhotoSetMap.prototype.getMinimumResolution=function(){return 3;};
PhotoSetMap.prototype.flickr_photosets_getInfo_onLoad=function(success, responseXML, responseText, params){
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;
	
	var photoset=rsp.photoset;
	$(this.options.titl).text(photoset.title._content);
	var desc = photoset.description._content;
	$(this.options.desc).html(desc.replace(/\n/g,'<br>'));
};
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
		this.loading( true, parseInt(pageCurr/pageTotal*100)+'%');
		var opts={photoset_id:this.photoset_id, extras:'geo,date_taken,owner_name,icon_server', per_page:PER_PAGE, page:pageCurr+1};
		flickr._callapi('flickr.photosets.getPhotos', opts, this);
	}

	var owner=photoset.owner;
	var ownername=photoset.ownername;
	this.photos = this.photos || [];
	for (var i=0,len=photoset.photo.length; i<len; i++) {
		var photo=photoset.photo[i];

		var lat=parseFloat(photo.latitude);
		var lon=parseFloat(photo.longitude);
		if(!lat && !lon) continue; 

		var p = {id:photo.id, secret:photo.secret, title:photo.title, pos:new gobj.GLatLng(lat,lon), accuracy:parseInt(photo.accuracy), api:flickr, datetaken:photo.datetaken, owner:owner, ownername:ownername, farm:photo.farm, server:photo.server, iconfarm:photo.iconfarm, iconserver:photo.iconserver};
		this.photos.push(p);
	}

	this.regroupphotos();
} finally {
	if(pageCurr >= pageTotal) this.loading(false);
	this.win.f_unmask();
}};
PhotoSetMap.prototype.regroupphotos=function(){
	if(!this.photos) return;

	var photos=this.photos;

	if(!this.getCenter()) {
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
	this.win.f_photopanel_toggle(false);
	this.regroupphotos();
};
PhotoSetMap.prototype.getembeddedlink=function(){
	return '<iframe width="425" height="350" frameborder="no" scrolling="no" marginheight="0" marginwidth="0" src="'+EMBEDDED_URL+'flickr-gmap-photoset.html?photoset_id='+this.photoset_id+'"></iframe>';
};
PhotoSetMap.prototype.onsearchresultclick=function(pos, zoom){
	this.setCenter(pos,zoom);
};
PhotoSetMap.prototype.desc_toggle=function(){
	$(this.gmap.options.desc).toggle();
};
PhotoSetMap.prototype.loading=function(isopen, msg){
	if(isopen) {
		this.options.$loading.show(); 
		if(msg) 
			this.options.loadingmsg.innerHTML = 'Loading... ' + msg;
	} else {
		this.options.$loading.hide(); 
	}
};
PhotoSetMap.prototype.tracking_toggle=function(){
	var gmap = this.gmap;
	gmap.datetracking = !gmap.datetracking;
	gmap.regroupphotos();
};
PhotoSetMap.prototype.oninfowindowopen=function(){
	this.savePosition();
};
PhotoSetMap.prototype.oninfowindowclose=function(){
	this.returnToSavedPosition();
	this.win.f_photopanel_toggle(false);
};



// BrowseMap
var BrowseMap=fgs.BrowseMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.win.gmap=this;
	this.user_id=opts.user_id;
	this.group_id=opts.group_id;
	this.lastcenter = null;
	this.pageCurr = 1;
	this.pageTotal = 1;
	this.suspenddragevent=false;
	this.delay_loading = 2000;

	var options=this.options=$(
		'<div class="option" style="position:absolute;top:6px; left:80px;">'+
			'<a class="updnbtn" style="position:absolute;left:5px;"></a>'+
			'<a class="prevbtn" style="position:absolute;left:20px;"></a>'+
			'<a class="nextbtn" style="position:absolute;left:35px;"></a>'+
			'<span style="margin-left:55px; margin-right:30px;"></span>'+
			'<div style="padding-top:10px;"></div>'+
			'<div style="padding-top:5px;"><img src="'+imgs['flickr_loading'].src+'"></img> <span id="loading_msg">Loading...</span></div>'+
		'</div>').get(0);
	options.info=options.childNodes[3];
	options.pane=options.childNodes[4];
	options.$loading=$(options.childNodes[5]);

	var nowy = new Date().getFullYear();
	var datestr = 
		'<div>Date: '+
			'<select id="fgs_select_year">'+
				'<option value="lastmonth">Last Month</option>'+
				'<option value="lastweek">Last Week</option>'+
				'<option value="yesterday">Yesterday</option>'+
				'<option value="all">All Time</option>';
	for(var i = 0; i<10; ++i)
		datestr += '<option value="'+(nowy-i)+'">'+(nowy-i)+'</option>';
	datestr += 
			'</select>'+
		' - '+
			'<select id="fgs_select_month" style="display:none;">'+
				'<option value="all">All</option>';
	for(var i = 1; i<=12; ++i)
		datestr += '<option value="'+(i<10?'0':'')+i+'">'+(i<10?'0':'')+i+'</option>';
	datestr += 
			'</select>'+
		'</div>';
	var sortstr = 
		'<div>Sort: '+
			'<select id="fgs_select_sort">'+
				'<option value="interestingness-desc">Interestingness, desc</option>'+
				'<option value="interestingness-asc">Interestingness, asc</option>'+
				'<option value="date-taken-desc">Date taken, desc</option>'+
				'<option value="date-taken-asc">Date taken, asc</option>'+
				'<option value="date-posted-desc">Date posted, desc</option>'+
				'<option value="date-posted-asc">Date posted, asc</option>'+
				'<option value="relevance">Relevance</option>'+
			'</select>'+
		'</div>';
	var searchstr = 
		'<div> Search: '+
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
	options.optionYear.gmap=options.optionMonth.gmap=options.optionSort.gmap=options.optionSearchForm.gmap=this;
	options.optionYear.onchange=options.optionMonth.onchange=options.optionSort.onchange=options.optionSearchForm.onsubmit=this.changeOption;

	var tog=options.childNodes[0];
	var pre=options.childNodes[1];
	var nex=options.childNodes[2];
	$(tog).click(this.togglePanel).get(0).gmap=this;
	$(pre).click(this.prevPage).get(0).gmap=this;
	$(nex).click(this.nextPage).get(0).gmap=this;
	this.updateOptionInfo();
	this.getContainer().appendChild(options);

	var mt=this.getMapTypes();
	for(var i=0; i<mt.length; i++)
		mt[i].getMinimumResolution=this.getMinimumResolution;

	gobj.GEvent.addListener(this, 'zoomend', this.onzoomend);
	gobj.GEvent.addListener(this, 'dragend', this.ondragend);
	gobj.GEvent.addListener(this, 'infowindowopen', this.oninfowindowopen);
	gobj.GEvent.addListener(this, 'infowindowclose', this.oninfowindowclose);
};
fgs.extend(BrowseMap, gobj.GMap2);
BrowseMap.prototype.getMinimumResolution=function(){return 3;};
BrowseMap.prototype.updateOptionInfo=function(){
	this.options.info.innerHTML=this.pageCurr+' / '+this.pageTotal;
};
BrowseMap.prototype.flickr_photos_search_onLoad=function(success, responseXML, responseText, params){
	if(this.search_timestamp != params.search_timestamp) return;
try {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var photoset=rsp.photos?rsp.photos:rsp.photoset;

	this.pageCurr=parseInt(photoset.page);
	this.pageTotal=parseInt(photoset.pages);
	this.updateOptionInfo();

	this.photos = [];
	for (var i=0,len=photoset.photo.length; i<len; i++) {
		var photo=photoset.photo[i];
		var lat=parseFloat(photo.latitude);
		var lon=parseFloat(photo.longitude);
		if(!lat && !lon) continue;

		var p = {id:photo.id, secret:photo.secret, title:photo.title, pos:new gobj.GLatLng(lat, lon), accuracy:parseInt(photo.accuracy), api:flickr, datetaken:photo.datetaken, owner:photo.owner, ownername:photo.ownername, farm:photo.farm, server:photo.server, iconfarm:photo.iconfarm, iconserver:photo.iconserver};
		this.photos.push(p);
	}

	this.regroupphotos();
} finally {
	//this.win.f_unmask();
	this.loading(false);
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

	if(!timestamp) {
		timestamp = this.search_timestamp= new Date().getTime();
	} else if(this.search_timestamp != timestamp) return;
	
	if(!nodelay) {
		var gmap = this;
		setTimeout(
			function() { gmap.refreshView(true, timestamp); },
			this.delay_loading
		);
		return;
	}

	this.loading(true);

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
		if((180+e) > (180-w))
			w=-180;
		else
			e=180;

	var searchOption={extras:'geo,date_taken,owner_name,icon_server', per_page:PER_PAGE, page:this.pageCurr};
	searchOption.bbox=w+','+s+','+e+','+n;

	var sort = this.options.optionSort.value;
	searchOption.sort=sort;

	var year = this.options.optionYear.value;
	var month = this.options.optionMonth.value;
	if(year == 'lastmonth') {
		var curr = new Date();
		curr.setMonth(curr.getMonth()-1);
		var y = curr.getFullYear();
		var m = curr.getMonth()+1;
		var d = curr.getDate();
		searchOption.min_taken_date=y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d;
	} else if(year == 'lastweek') {
		var curr = new Date();
		curr.setDate(curr.getDate()-7);
		var y = curr.getFullYear();
		var m = curr.getMonth()+1;
		var d = curr.getDate();
		searchOption.min_taken_date=y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d;
	} else if(year == 'yesterday') {
		var curr = new Date();
		curr.setDate(curr.getDate()-1);
		var y = curr.getFullYear();
		var m = curr.getMonth()+1;
		var d = curr.getDate();
		searchOption.min_taken_date=y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d;
	} else if(year == 'all') {
		searchOption.min_taken_date='1970-01-01';
	} else if(month == 'all') {
		searchOption.min_taken_date=year+'-01-01';
		searchOption.max_taken_date=year+'-12-31';
	} else {
		searchOption.min_taken_date=year+'-'+month+'-01';
		searchOption.max_taken_date=year+'-'+month+'-31';
	}

	if(this.user_id) searchOption.user_id=this.user_id;
	if(this.group_id) searchOption.group_id=this.group_id;

	var searchtxt = $.trim(this.options.optionSearch.value);
	if(searchtxt!='')
		searchOption.text=searchtxt;

	//var points = [new gobj.GLatLng(n,e),new gobj.GLatLng(n,w),new gobj.GLatLng(s,w),new gobj.GLatLng(s,e),new gobj.GLatLng(n,e)];
	//this.addOverlay(new gobj.GPolyline(points, '#0000FF', 1, .3));
	searchOption.search_timestamp=this.search_timestamp;
	flickr._callapi('flickr.photos.search', searchOption, this);
};
BrowseMap.prototype.onzoomend=function(){
	this.win.f_photopanel_toggle(false);
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
		if ((dx < 0.15*bx) && (dy < 0.15*by)) {
			return;
		}
	}

	this.win.f_photopanel_toggle(false);
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
	if( this.gmap.pageCurr <= 1) return;
	this.gmap.pageCurr--;
	this.gmap.refreshView(true);
};
BrowseMap.prototype.nextPage=function(){
	if( this.gmap.pageCurr >= this.gmap.pageTotal) return;
	this.gmap.pageCurr++;
	this.gmap.refreshView(true);
};
BrowseMap.prototype.changeOption=function(){
try{
	var y = this.gmap.options.optionYear.value;
	if(y == 'all' || y == 'lastmonth' || y == 'lastweek' || y == 'yesterday') {
		$(this.gmap.options.optionMonth).hide();
		this.gmap.options.optionMonth.value = 'all';
	} else {
		$(this.gmap.options.optionMonth).show();
	}

	this.gmap.pageCurr=this.gmap.pageTotal=1;
	this.gmap.refreshView(true);
} finally{
	return false;
}
};
BrowseMap.prototype.loading=function(show){
	if(show) this.options.$loading.show();
	else this.options.$loading.hide();
};
BrowseMap.prototype.togglePanel=function(){
	$(this.gmap.options.pane).toggle();
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
	this.win.f_photopanel_toggle(false);
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

onwindowresizescroll: function() {
	$('div.mapwin').each(function() { this.onwindowresize(); });
},
prepare: function() {
	if(arguments.callee.init) return true;

	if(!js_jquery && !js_gmap && !js_analytics && $ && gobj.GMap2 && gobj.GUnload && gobj.urchinTracker) {
		prepare_imgs();
		fgs.init();
		$(gobj.window).unload(gobj.GUnload).resize(userjs.onwindowresizescroll).scroll(userjs.onwindowresizescroll);
		arguments.callee.init=true;

		_uacct=gobj._uacct= 'UA-359113-4';
		gobj.urchinTracker('/fgs/userjs');
		return true;
	}

	if(!arguments.callee.prepare) {
		arguments.callee.prepare = true;
		document.write(FGS_STYLE);
		loadscript(js_jquery,function(){jQuery=$=gobj.jQuery;js_jquery=null;});
		loadscript(js_gmap,function(){js_gmap=null;});
		loadscript(js_analytics,function(){js_analytics=null;});
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
		switch(lo.innerHTML) {
			case ' -': lo.innerHTML = ' \\'; break;
			case ' \\': lo.innerHTML = ' |'; break;
			case ' |': lo.innerHTML = ' /'; break;
			case ' /': lo.innerHTML = ' -'; break;
		}
		setTimeout('gobj.userjs.check_loading("'+id+'");', 100);
	}
},


launch: function(){
try {
	if(!userjs.prepare()) {
		if(this.fgsloading) return;

		var id = 'fgs_loading_' + (new Date()).getTime();
		var lo = document.createElement('a');
		lo.innerHTML = ' -';
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
			this.win.f_close();
		} else {
			this.win.f_open();
		}
		return;
	}

	var opt = {photo_id:this.photo_id, user_id:this.user_id, group_id:this.group_id, photoset_id:this.photoset_id};
	if(this.photo_id) {
		opt.win=create_mapwindow({link:this,fixmax:false,width:516,height:313,embedlink:true,loadlast:true});
		$(document.body).prepend(opt.win);
		opt.win.f_open();
		var gmap=new fgs.PhotoMap(opt.win.mapdiv, opt);
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.ctrl_small=new gobj.GSmallMapControl();
		gmap.addControl(gmap.ctrl_small);
	} else if(this.photoset_id) {
		opt.win=create_mapwindow({link:this,fixmax:true,bottompanel:true,readonly:true,embedlink:true});
		$(document.body).prepend(opt.win);
		opt.win.f_open();
		var gmap=new fgs.PhotoSetMap(opt.win.mapdiv, opt);
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.addControl(new gobj.GLargeMapControl());
		var ctrl = new gobj.GOverviewMapControl();
		gmap.addControl(ctrl);
		ctrl.hide();
	} else {
		opt.win=create_mapwindow({link:this,fixmax:true,bottompanel:true,readonly:true,loadlast:true});
		$(document.body).prepend(opt.win);
		opt.win.f_open();
		var gmap=new fgs.BrowseMap(opt.win.mapdiv, opt);
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.addControl(new gobj.GLargeMapControl());
		var ctrl = new gobj.GOverviewMapControl();
		gmap.addControl(ctrl);
		ctrl.hide();

		var lat = parseFloat(GM_getValue('last_browse_lat', DEF_LAT));
		var lng = parseFloat(GM_getValue('last_browse_lng', DEF_LNG));
		var zoom = parseInt(GM_getValue('last_browse_zoom', DEF_ZOOM));
		gmap.setCenter(new gobj.GLatLng(lat,lng), zoom);
	}
} finally {
	return false;
}},



onload: function() {
	var pageparse = {
		rexp_photo_map_link : /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)\/map(?:\/.*)?$/,
		rexp_set_map_link :   /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)\/map(?:\/.*)?$/,
		rexp_user_map_link :  /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/map(?:\/.*)?$/,
		rexp_group_map_link : /^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)\/map(?:\/.*)?$/,
		rexp_world_map_link : /^http:\/\/(?:www.*\.)?flickr\.com\/map(?:\/.*)?$/,
		PhotoMap : function(p) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href && this.rexp_photo_map_link.exec(maplnk.href) && RegExp.$1 && RegExp.$2) {
					maplnk.photo_id=RegExp.$2;
					maplnk.onclick=userjs.launch;
					return;
				}
			}
		},
		UserMap: function(p,user_id) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href && this.rexp_user_map_link.exec(maplnk.href) && RegExp.$1) {
					maplnk.user_id=user_id;
					maplnk.onclick=userjs.launch;
					return;
				}
			}
		},
		WorldMap: function(p) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href && this.rexp_world_map_link.exec(maplnk.href)) {
					maplnk.onclick=userjs.launch;
					return;
				}
			}
		},
		GroupMap: function(p) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href && this.rexp_group_map_link.exec(maplnk.href) && RegExp.$1) {
					maplnk.group_id=gobj.f.w.value;
					maplnk.onclick=userjs.launch;
					return;
				}
			}
		},
		SetMap: function(p) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href && this.rexp_set_map_link.exec(maplnk.href) && RegExp.$1 && RegExp.$2) {
					maplnk.photoset_id=RegExp.$2;
					maplnk.onclick=userjs.launch;
					return;
				}
			}
		}
	};

	if(       /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(?:\/.*)?$/.exec(gobj.location.href) && RegExp.$1 && RegExp.$2) {
		var maplnk = document.getElementById('a_link_to_map');
		var edtlnk = document.getElementById('a_place_on_map_old');
		if(maplnk) {
			maplnk.photo_id=RegExp.$2;
			maplnk.onclick=userjs.launch;
		}
		if(edtlnk) {
			edtlnk.photo_id=RegExp.$2;
			edtlnk.onclick=userjs.launch;
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)(?:\/.*)?$/.exec(gobj.location.href) && RegExp.$1 && RegExp.$2) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras)
			if(paras[p].className == 'Links')
				pageparse.SetMap(paras[p]);
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)(?:\/.*)?$/.exec(gobj.location.href) && RegExp.$1) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras) {
			if(paras[p].className == 'Do')
				pageparse.PhotoMap(paras[p]);
			if(paras[p].className == 'Links')
				pageparse.UserMap(paras[p],gobj.f.w.value);
		}
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/explore(?:\/.*)?$/.exec(gobj.location.href)) {
		pageparse.WorldMap(document.getElementById('Main'));
	} else if(/^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)(?:\/.*)?$/.exec(gobj.location.href) && RegExp.$1) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras)
			if(paras[p].className == 'Links')
				pageparse.GroupMap(paras[p]);
	}

	pageparse.UserMap(document.getElementById('candy_nav_menu_you'), gobj.global_nsid);
	pageparse.WorldMap(document.getElementById('candy_nav_menu_explore'));
}
};

userjs.onload();

})();
