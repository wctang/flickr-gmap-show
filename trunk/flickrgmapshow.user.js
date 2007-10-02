// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @author        wctang <wctang@gmail.com>
// @include       http://www*.flickr.com/*
// @include       http://flickr.com/*
// @description   Show Flickr geotagged photos with Google Map.
// @source        http://userscripts.org/scripts/show/9450
// @identifier    http://userscripts.org/scripts/source/9450.user.js
// @version       2.7
//
// Change Log
// ==========
// v2.7  07/09/xx Refine photoset map. Change browse map behavior. Fix bugs.
// v2.6  07/08/22 Add Embedded Link.
// v2.5  07/08/06 Add photoset time track. Add more action can do.
// v2.4  07/08/03 Refine photoset map behavior. Apply more effects. Fix some bugs.
// v2.3  07/08/01 Add Google Analytics. Refine one photo map marker. Fix some bugs.
// v2.2  07/07/31 Refine Location Search, Speed up normal operation by delay loading.
// v2.1  07/07/30 Add Geocode Search function.
// v2.0  07/07/27 Rewrite from v1.2.
//
// ==/UserScript==

var gobj = (typeof unsafeWindow != 'undefined') ? unsafeWindow : window;
gobj.gobj = gobj;
var document=gobj.document;

(function() {
var scriptname = 'Flickr Gmap Show';
var installurl = 'http://userscripts.org/scripts/source/9450.user.js';
var currVer = '2.7';

var js_jquery = 'http://jqueryjs.googlecode.com/files/jquery-1.2.1.min.js';
var js_gmap = 'http://maps.google.com/maps?file=api&v=2.x';
var js_analytics = 'http://www.google-analytics.com/urchin.js';

var EMBEDDED_URL = 'http://flickr-gmap-show.googlecode.com/svn/trunk/';

var imgdir = 'http://flickr-gmap-show.googlecode.com/svn/trunk/pics/';
var imgs_src = {
	marker_img      : {src:imgdir+'marker_image.png'},
	marker_shw      : {src:imgdir+'marker_shadow.png'},
	marker_trans    : {src:imgdir+'marker_transparent.png'},
	loading         : {src:imgdir+'loading.gif'},
	flickr_loading  : {src:'http://l.yimg.com/www.flickr.com/images/pulser2.gif'},
	close_default   : {src:imgdir+'fgs_close_default.gif',w:15,h:15},
	close_hover     : {src:imgdir+'fgs_close_hover.gif'},
	close_selected  : {src:imgdir+'fgs_close_selected.gif'},
	max_default     : {src:imgdir+'fgs_max_default.gif',w:15,h:15},
	max_hover       : {src:imgdir+'fgs_max_hover.gif'},
	max_selected    : {src:imgdir+'fgs_max_selected.gif'},
	search_default  : {src:imgdir+'fgs_search_default.gif',w:15,h:15},
	search_hover    : {src:imgdir+'fgs_search_hover.gif'},
	search_selected : {src:imgdir+'fgs_search_selected.gif'},
	prev_default    : {src:imgdir+'fgs_prev_default.gif',w:15,h:15},
	prev_hover      : {src:imgdir+'fgs_prev_hover.gif'},
	prev_selected   : {src:imgdir+'fgs_prev_selected.gif'},
	next_default    : {src:imgdir+'fgs_next_default.gif',w:15,h:15},
	next_hover      : {src:imgdir+'fgs_next_hover.gif'},
	next_selected   : {src:imgdir+'fgs_next_selected.gif'},
	updown_default  : {src:imgdir+'fgs_toggle_default.gif',w:15,h:15},
	updown_hover    : {src:imgdir+'fgs_toggle_hover.gif'},
	updown_selected : {src:imgdir+'fgs_toggle_selected.gif'},
	action_default  : {src:imgdir+'fgs_action_default.gif',w:15,h:15},
	action_hover    : {src:imgdir+'fgs_action_hover.gif'},
	action_selected : {src:imgdir+'fgs_action_selected.gif'},
	emblnk_default  : {src:imgdir+'fgs_emblnk_default.gif',w:15,h:15},
	emblnk_hover    : {src:imgdir+'fgs_emblnk_hover.gif'},
	emblnk_selected : {src:imgdir+'fgs_emblnk_selected.gif'},
	about_default   : {src:imgdir+'fgs_about_default.gif',w:15,h:15},
	about_hover     : {src:imgdir+'fgs_about_hover.gif'},
	about_selected  : {src:imgdir+'fgs_about_selected.gif'},
	p_default       : {src:imgdir+'p_default.gif',w:12,h:75},
	p_hover         : {src:imgdir+'p_hover.gif'},
	p_selected      : {src:imgdir+'p_selected.gif'},
	pp_default      : {src:imgdir+'pp_default.gif',w:12,h:75},
	pp_hover        : {src:imgdir+'pp_hover.gif'},
	pp_selected     : {src:imgdir+'pp_selected.gif'},
	r_default       : {src:imgdir+'r_default.gif',w:12,h:75},
	r_hover         : {src:imgdir+'r_hover.gif'},
	r_selected      : {src:imgdir+'r_selected.gif'},
	rr_default      : {src:imgdir+'rr_default.gif',w:12,h:75},
	rr_hover        : {src:imgdir+'rr_hover.gif'},
	rr_selected     : {src:imgdir+'rr_selected.gif'},
	shadow_main     : {src:imgdir+'shadow-main.png'},
	shadow_top      : {src:imgdir+'shadow-top.png'},
	shadow_left     : {src:imgdir+'shadow-left.png'},
	icon_shadow     : {src:imgdir+'icon_shadow.png'},
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
var msg_viewonsite = 'View this photo on $1';
var msg_takenon = 'Taken on $1';
var msg_postby = 'Posted by $1';
var msg_pageinfo = '$1 / $2';

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
		if(f>0) {
			var m = str.substring(f+7,str.indexOf('"',f+7));
			sty.media=m;
		}
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
function totaloffset(elem) {var t,l; for(var e=elem,t=0,l=0;e.offsetParent;t+=e.offsetTop,l+=e.offsetLeft,e=e.offsetParent); return {top:t,left:l};};
function hideself(){this.style.display='none';};



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
'.mapwin {position:relative;z-index:1000; font:14px arial; text-align:left;} '+
'.mapwinmain {border:solid 2px #EEEEEE; background-color:white; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .search {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .info {color:#999999;} '+
'.mapwinmain .locate {font-style:italic;color:#999999;} '+
'.mapwinmain .embeddedlink {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .action {background-color:white;border:solid 1px black; } '+
'.mapwinmain .action a {display:block; margin:5px;} '+
'.mapwinmain .about {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'.mapwinmain .msg {background-color:yellow;} '+
'.option {border:solid 1px black; background-color:white; padding:5px; text-align:left;} '+
'.popup {z-index:2000; background-color:white; font:14px arial; text-align:left;} '+
'.fgs_photobox {background-color:white;} '+
'.fgs_photobox .fgs_photopanel img {position:absolute; background:url('+imgs_src['loading'].src+') no-repeat bottom right; cursor:pointer;} '+
'.fgs_photobox .fgs_photopanelidx {height:5px;width:75px; background-color:#FF8888;} '+
'.fgs_photobox a.title {text-decoration:none;} '+
'.fgs_photobox a.popuplnk:link {text-decoration:none;} '+
'.fgs_photobox a.popuplnk:hover {background-color:white !important; color:#0087E1 !important; text-decoration:underline;} '+
'.fgs_photobox .progress {height:4px; background-color:#DDDDDD;} '+
'.fgs_photobox .progressbar {height:4px; background-color:#8888FF;} '+
'table.shadow {position:absolute;width:100%;height:100%;left:6px;top:6px;border-collapse:collapse;border:0;} '+
'table.shadow td.main {border:0;background:url('+imgs_src['shadow_main'].src+') no-repeat bottom right;} '+
'table.shadow td.top  {border:0;height:12px; background:url('+imgs_src['shadow_top'].src+') no-repeat right top;} '+
'table.shadow td.left {border:0;width:10px; background:url('+imgs_src['shadow_left'].src+') no-repeat left bottom;} '+
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
	owner: function(photo) {return photo.ownername ? photo.ownername : photo.owner;},
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
	callapi : function(methodname, args, obj, callback, params) {
		var fun = methodname.replace(/\./g, '_')+'_onLoad';
		args.format='json';
		args.nojsoncallback = '1';
		var o = {callback:callback,tgt:obj,params:params};
		o[fun]=flickr.apifun;
		gobj.F.API.callMethod(methodname, args, o);
	}
};

var geocode={
	accuracytozoom:[3,5,7,9,11,13,14,15,16],
	search:function(obj,callback,str) {
		var path = 'http://maps.google.com/maps/geo?key=ABQIAAAAtOjLpIVcO8im8KJFR8pcMhQjskl1-YgiA_BGX2yRrf7htVrbmBTWZt39_v1rJ4xxwZZCEomegYBo1w&q='+encodeURI(str);
		GM_xmlhttpRequest({method: 'GET', url: path, onload: function(result){callback.call(obj,result);}});
	}
};

function setupbtn(a,n,title,clickfun) {
	var $a = $(a).mouseout(setupbtn.mouseout).mouseover(setupbtn.mouseover).mousedown(setupbtn.mousedown).mouseup(setupbtn.mouseup);
	if(clickfun) $a.click(clickfun);
	if(title) $a.attr('title',title);
	a.img=$a.children('img').width(imgs_src[n+'_default'].w).height(imgs_src[n+'_default'].h).get(0);
	a.n=n;
	$a.trigger('mouseout');
	return a;
};
setupbtn.mouseout=function(){ this.img.src=imgs[this.n+'_default'].src;};
setupbtn.mouseover=function(){ this.img.src=imgs[this.n+'_hover'].src;};
setupbtn.mousedown=function(){ this.img.src=imgs[this.n+'_selected'].src;};
setupbtn.mouseup=function(){ this.img.src=imgs[this.n+'_hover'].src;};


function create_mapwindow(wid,hei,opt) {
	var win= $(
		'<div class="mapwin">'+
			'<table class="shadow"><tr><td class="top" colspan="2"></td></tr><tr><td class="left"></td><td class="main"></td></tr></table>'+
			'<div class="mapwinmain" style="position:absolute;left:0px;">'+ // main
				'<div style="position:absolute;left:7px;top:5px; display:none;"><img src="'+imgs['flickr_loading'].src+'"></img> <span id="loading_msg">Loading...</span></div>' + // loading
				'<div style="position:absolute;left:7px;top:5px;"></div>'+ // title
				'<div style="position:absolute;left:5px;top:27px;"></div>' + // map
				'<div class="mask"   style="position:absolute;left:5px;top:27px; display:none;"><div><img src="'+imgs['loading'].src+'"></img></div></div>' + // mask
				'<div class="search" style="position:absolute;left:15px;top:37px; display:none;"><div style="margin:10px;"><form id="geocode_search">Google Geo Search: <input id="geocode_search_input" name="s_str"><input type="submit"></form><br><div id="geocode_result_wrap" style="overflow:auto;width:100%;"><div id="geocode_result"></div></div></div></div>' + //search
				'<div class="msg"    style="position:absolute;left:5px;bottom:24px;height:20px;"><a class="btn">Load last location? </a><a class="btn">Save location? </a></div>' + // msg
				'<div class="info"   style="position:absolute;left:9px;bottom:8px;"></div>'+ // info
				'<div class="locate" style="position:absolute;right:12px;bottom:8px;"></div>'+ // locate div
				'<span class="btn"   style="position:absolute;right:12px;top:6px;"><img></img></span>'+ // close btn
				'<span class="btn"   style="position:absolute;right:32px;top:6px;"><img></img></span>'+ // max btn
				'<span class="btn"   style="position:absolute;right:52px;top:6px;"><img></img></span>'+ // search btn
				'<span class="btn"   style="position:absolute;right:72px;top:6px;"><img></img></span>'+ // action btn
				'<div class="action" style="position:absolute;right:5px;top:25px;width:150px; display:none;"></div>'+ // action panel
				'<span class="btn"   style="position:absolute;right:92px;top:6px;"><img></img></span>'+ // embedded link btn
				'<div class="embeddedlink" style="position:absolute;left:15px;top:37px; display:none;"><div style="margin:10px;">Paste HTML to embed in website:<br><input style="width:100%;" id="embbed_link"></div></div>' + //embedded link
				'<span class="btn"   style="position:absolute;right:12px;bottom:6px;"><img></img></span>'+ // about btn
				'<div class="about"  style="position:absolute;right:15px;bottom:37px;width:200px;height:180px; display:none;"><div style="text-align:center; padding:3px;"><p><b>Flickr GMap Show</b></p><p><a href="http://code.google.com/p/flickr-gmap-show/">Project page</a><br><a href="http://userscripts.org/scripts/show/9450">Script page</a></p><p>Author: <a href="mailto:wctang@gmail.com">wctang</a></p><p><a target="_blank" href="https://www.paypal.com/xclick/business=wctang%40gmail%2ecom&item_name=fgs_donation&no_note=1&currency_code=USD"><img src="http://www.pspad.com/img/paypal_en.gif"></img></a></p></div></div>' + //about
			'</div>'+
		'</div>').get(0);
	for(var f in create_mapwindow) {
		if(typeof create_mapwindow[f] == 'function')
			win[f] = create_mapwindow[f];
	}

	win.shadow = win.childNodes[0];
	win.maindiv = win.childNodes[1];
	var w = win.maindiv.childNodes;
	win.loadingdiv = w[0];
	win.loadingdiv.msg = $(win.loadingdiv).find('#loading_msg').get(0);
	win.titlediv = w[1];
	win.mapdiv = w[2];
	win.maskdiv = w[3];
	$(win.maskdiv).css('opacity',.5);
	win.searchdiv = w[4];
	var $searchdiv = $(win.searchdiv);
	win.searchdiv.form=$searchdiv.find('#geocode_search').get(0);
	win.searchdiv.input=$searchdiv.find('#geocode_search_input').get(0);
	win.searchdiv.resultwrap=$searchdiv.find('#geocode_result_wrap').get(0);
	win.searchdiv.result=$searchdiv.find('#geocode_result').get(0);
	win.msgdiv = w[5];
	win.msgdiv.loadlastlocation = win.msgdiv.childNodes[0];
	win.msgdiv.savelocation = win.msgdiv.childNodes[1];
	win.msgdiv.loadlastlocation.win = win.msgdiv.savelocation.win = win;
	$(win.msgdiv.loadlastlocation).hide().click(win.loadlastlocation_click);
	$(win.msgdiv.savelocation).hide().click(win.savelocation_click);
	win.infodiv = w[6];
	win.locatediv = w[7];
	win.clsbtn = w[8];
	win.maxbtn = w[9];
	win.searchbtn = w[10];
	win.actionbtn = w[11];
	win.actiondiv = w[12];
	win.embeddlinkbtn = w[13];
	win.embbeddiv = w[14];
	win.aboutbtn = w[15];
	win.aboutdiv = w[16];

	win.m_width=wid;
	win.m_height=hei;
	win.m_max=true;
	win.m_fixmax=(opt&&opt.fixmax)||false;
	win.m_readonly=(opt&&opt.readonly)||false;
	win.m_loadlast=(opt&&opt.loadlast)||false;
	win.m_embedlink=(opt&&opt.embedlink)||false;
	win.m_about=(opt&&opt.about)||false;

	if(win.m_fixmax) $(win.maxbtn).hide(); // hide max button if always max

	win.clsbtn.win = win.maxbtn.win = win.searchbtn.win = win.searchdiv.form.win = win.actionbtn.win = win.embeddlinkbtn.win = win.aboutbtn.win = win;
	setupbtn(win.clsbtn,'close','Close',win.f_close);
	setupbtn(win.maxbtn,'max','Maximize/Restore',win.f_max_toggle);
	setupbtn(win.searchbtn,'search','Location Search',win.f_search_toggle);
	setupbtn(win.actionbtn,'action','Action',win.f_action_toggle);
	if(win.m_about) {
		setupbtn(win.aboutbtn,'about','About',win.f_about_toggle);
	} else {
		$(win.aboutbtn).hide();
	}
	if(win.m_embedlink) {
		setupbtn(win.embeddlinkbtn,'emblnk','Embedded Link',win.f_embeddedlink_toggle);
	} else {
		$(win.embeddlinkbtn).hide();
	}
	win.searchdiv.form.onsubmit=win.f_search_submit;
  
	if(win.m_loadlast) {
		win.f_action_append('Load Last Location',win.loadlastlocation_click).win=win;
	}
	if(!win.m_readonly) {
		win.f_action_append('Save Location',win.savelocation_click).win=win;
		win.f_action_append('Remove Location',win.removelocation_click).win=win;
	}

	return win;
};
create_mapwindow.f_open=function(){
	$(this).fadeIn('fast');
};
create_mapwindow.f_close=function(){
	if(this.win) return arguments.callee.apply(this.win,arguments);
	$(this).fadeOut('fast');
};
create_mapwindow.f_refreshsize=function() {
	var pos;
	if(this.m_max) {
		pos = {top:10,left:10,width:document.body.clientWidth-30,height:document.body.clientHeight-30};
	} else {
		pos = {top:this.m_top,left:this.m_left,width:this.m_width,height:this.m_height};
	}
	var $this=$(this);
	if($this.css('display') == 'none') {
		$this.css(pos);
		$(this.maindiv).width(pos.width-4).height(pos.height-4)
		this.f_resize(pos.width,pos.height);
	} else {
		$this.animate(pos,'normal');
		$(this.maindiv).animate({width:pos.width-4,height:pos.height-4},'normal');
		this.f_resize(pos.width,pos.height);
	}
	if(this.gmap) {
		this.gmap.checkResize();
		if(this.gmap.marker) {
			this.gmap.setCenter(this.gmap.marker.getLatLng());
		}
	}
};
create_mapwindow.f_max_toggle=function(){
	if(this.win) return arguments.callee.apply(this.win,arguments);

	if(this.m_fixmax) {
		this.m_max=true;
	} else {
		this.m_max=!this.m_max;
	}
	if(this.m_max) {
		if($.browser.msie) $(this).css('position','absolute');
		else $(this).css('position','fixed');
	} else {
		$(this).css('position','absolute');
		var ofst = totaloffset(this.link);
		this.m_top=ofst.top-this.m_height-10;
		this.m_left=ofst.left-(this.m_width*.85);
		if(this.m_left < 10) this.m_left = 10;
	}
	this.f_refreshsize();
};
create_mapwindow.f_resize=function(w,h){
	var ww=w-13;
	var hh=h-57;
	$(this.mapdiv).width(ww).height(hh);
	$(this.maskdiv).width(ww).height(hh);
	$(this.searchdiv).width(ww-20).height(hh-30);
	$(this.searchdiv.resultwrap).height(hh-100);
	$(this.embbeddiv).width(ww-20).height(hh-43);
	$(this.infodiv).width(ww-133);
};
create_mapwindow.onwindowresize=function(){
	if(this.style.display == 'none') return;
	if(!this.m_max) return;

	this.f_refreshsize();
}
create_mapwindow.f_search_toggle=function(){
	if(this.win) return arguments.callee.apply(this.win,arguments);
	var $searchdiv = $(this.searchdiv);
	if($searchdiv.css('display') != 'none'){
		$searchdiv.fadeOut('fast');
	} else {
		$searchdiv.fadeIn('fast');
		this.searchdiv.input.focus();
	}
};
create_mapwindow.f_action_append=function(str,fun){
	return $('<a class="btn">'+str+'</a>').appendTo(this.actiondiv).click(fun).get(0);
};
create_mapwindow.f_action_toggle=function(e,forcehide){
	if(this.win) return arguments.callee.apply(this.win,arguments);
	var $actiondiv = $(this.actiondiv);
	if(forcehide) {
		$actiondiv.fadeOut('fast');
	} else if($actiondiv.css('display') != 'none'){
		$actiondiv.fadeOut('fast');
	} else {
		$actiondiv.fadeIn('fast');
	}
};
create_mapwindow.f_about_toggle=function(){
	if(this.win) return arguments.callee.apply(this.win,arguments);
	var $aboutdiv = $(this.aboutdiv);
	if($aboutdiv.css('display') != 'none'){
		$aboutdiv.fadeOut('fast');
	} else {
		$aboutdiv.fadeIn('fast');
	}
};
create_mapwindow.f_search_result_click=function(){
  var win = this.win;
  var zoom = this.zoom;
  var pos = new gobj.GLatLng(this.lat,this.lng);
  if(win.gmap) {
    win.gmap.setCenter(pos,zoom);
    if(win.gmap.marker) {
      win.gmap.marker.setPoint(pos);
    }
    if(win.gmap.searchresult_click) win.gmap.searchresult_click();
  }
  win.f_search_toggle();
};
create_mapwindow.f_search_submit_callback=function(result){
	if(result.status != 200) {
		alert('Server Error!');
		return;
	}

	var gres = eval('('+result.responseText+')');
	if(gres.Status && gres.Status.code) {
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
		var $result = $(this.searchdiv.result);
		$result.empty();
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

			var accuracy = point.AddressDetails.Accuracy;
			var zoom=geocode.accuracytozoom[parseInt(accuracy)];
			var pos = point.Point.coordinates;
			var lat=parseFloat(pos[1]);
			var lng=parseFloat(pos[0]);
			var a = $('<a class="btn">'+addr+'</a>').get(0);
			a.zoom = zoom;
			a.lat = lat;
			a.lng = lng;
			a.win = this;
			a.onclick=create_mapwindow.f_search_result_click;
			$result.append(a).append('<br>');
		}
	}
};
create_mapwindow.f_search_submit=function(){
try {
	geocode.search(this.win,this.win.f_search_submit_callback,this.s_str.value);
} finally {
	return false;
}
};
create_mapwindow.loadlastlocation_display=function() {
	$(this.msgdiv.loadlastlocation).show();
};
create_mapwindow.loadlastlocation_click=function() {
	$(this.win.msgdiv.loadlastlocation).hide();
	this.win.f_action_toggle(null, true);
	if(this.win.gmap.loadlastlocation) this.win.gmap.loadlastlocation();
	if(!this.win.m_readonly) this.win.savelocation_display();
};
create_mapwindow.savelocation_display=function() {
	$(this.msgdiv.savelocation).show();
};
create_mapwindow.savelocation_click=function() {
	if(confirm('Save location?')) {
		$(this.win.msgdiv.savelocation).hide();
		if(this.win.gmap.savelocation) this.win.gmap.savelocation();
	}
	this.win.f_action_toggle(null, true);
};
create_mapwindow.removelocation_click=function() {
	if(confirm('Remove location?')) {
		if(this.win.gmap.removelocation) this.win.gmap.removelocation();
	}
	this.win.f_action_toggle(null, true);
};
create_mapwindow.f_embeddedlink_toggle=function() {
	if(this.win) return arguments.callee.apply(this.win,arguments);
	if(this.embbeddiv.style.display != 'none') {
		$(this.embbeddiv).fadeOut('fast');
	} else {
		if(this.gmap&&this.gmap.getembeddedlink) {
			$(this.embbeddiv).find('#embbed_link').get(0).value = this.gmap.getembeddedlink();
		}
		$(this.embbeddiv).fadeIn('fast');
	}
};
create_mapwindow.disable_action=function() {
  $(this.actionbtn).hide();
};
create_mapwindow.disable_search=function() {
  $(this.searchbtn).hide();
};
create_mapwindow.f_mask=function(){$(this.maskdiv).show();};
create_mapwindow.f_unmask=function(){$(this.maskdiv).hide();};
create_mapwindow.f_loading=function(msg){$(this.loadingdiv).show(); if(msg) { this.loadingdiv.msg.innerHTML = 'Loading... ' + msg; } };
create_mapwindow.f_closeloading=function(){$(this.loadingdiv).hide();};
create_mapwindow.f_settitle=function(t){this.titlediv.innerHTML = t;};





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
	this.div=$('<div class="markerlabel"></div>').width(this.iconsize.width-2).height(this.iconsize.height-2).click(this.onclick).get(0);
	this.div.marker=this;
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
PhotoGroupMarker.getMap=function() {
	if(!arguments.callee.currmap) {
		var mapdiv = $('<div></div>').width(240).height(200).get(0);
		var map = new gobj.GMap2(mapdiv);
		mapdiv.map = map;
		arguments.callee.currmap=mapdiv;
	}
	return arguments.callee.currmap;
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
	this.photos = photos;
	this.infowin=null;
	this.currpos=0;
	this.currimg=null;
	this.div.innerHTML=this.photos.length;
};
PhotoGroupMarker.prototype.initialize=function(map){
	this.superprototype.initialize.apply(this,arguments);
	map.getPane(gobj.G_MAP_MARKER_PANE).appendChild(this.div);
	var posi = this.getLatLng();
	this.pos = map.fromLatLngToDivPixel(posi);
	this.zidx = gobj.GOverlay.getZIndex(posi.lat());
	this.map=map;
};
PhotoGroupMarker.prototype.redraw = function(force) {
	this.superprototype.redraw.apply(this, arguments);
	if (!force || !this.pos) return;

	this.div.style.left=(this.pos.x-this.iconsize.width/2) +'px';
	this.div.style.top =(this.pos.y-this.iconsize.height/2)+(this.iconsize.height-18)/2+'px';
	this.div.style.zIndex=this.zidx+1; // in front of the marker
};
PhotoGroupMarker.prototype.remove=function(){
	this.superprototype.remove.apply(this,arguments);
	this.div.parentNode.removeChild(this.div);
	this.photos=null;
	this.infowin=null;
	this.currpos=0;
	PhotoGroupMarker.release(this);
};
PhotoGroupMarker.prototype.onclick=function(){
	if(this.marker) return arguments.callee.apply(this.marker,arguments);

	var isfirst = false;
	if(!this.infowin) {
		isfirst = true;
		var infowin= $(arguments.callee.infostr).get(0);
		var showpanel = infowin.childNodes[0];
		showpanel.titl    = showpanel.childNodes[0].firstChild;
		showpanel.imgctnr =  showpanel.childNodes[1].firstChild;
		showpanel.popuplnk = showpanel.childNodes[1].childNodes[1];
		showpanel.mapctnr = showpanel.childNodes[2];
		showpanel.authinfo = showpanel.childNodes[3];
		var $authinfo = $(showpanel.authinfo);
		showpanel.authinfo.authicn = $authinfo.find('#authicn').get(0);
		showpanel.authinfo.datelnk = $authinfo.find('#datelnk').get(0);
		showpanel.authinfo.authlnk = $authinfo.find('#authlnk').get(0);
		infowin.showpanel = showpanel;

		var listpanel = infowin.childNodes[1];
		var pprev = listpanel.childNodes[0];
		var prev = listpanel.childNodes[1];
		var next = listpanel.childNodes[3];
		var nnext = listpanel.childNodes[4];
		pprev.marker=prev.marker=nnext.marker=next.marker=this;
		setupbtn(pprev,'pp','Prev', this.pprevimg);
		setupbtn(prev,'p','Prev', this.previmg);
		setupbtn(next,'r','Next', this.nextimg);
		setupbtn(nnext,'rr','Next', this.nnextimg);

		infowin.imagspanel    = listpanel.childNodes[2].firstChild;
		infowin.imagspanelidx = listpanel.childNodes[2].firstChild.firstChild;
		infowin.progressbar   = listpanel.childNodes[5].firstChild;
		this.infowin = infowin;
	}
	this.openInfoWindow(this.infowin, {suppressMapPan:false});
	if(isfirst) {
		this.refreshImglist(0);
		this.currimg=this.photos[0].img;
	}

	var showpanel = this.infowin.showpanel;
	$(showpanel.mapctnr).empty();
	var mapdiv = $('<div style="width:240px;height:200px;"></div>').appendTo(showpanel.mapctnr).get(0);
	var map = new gobj.GMap2(mapdiv);
	map.addControl(new gobj.GSmallMapControl());
	map.setCenter(new gobj.GLatLng(0,0));
	map.marker=new gobj.GMarker(new gobj.GLatLng(0,0));
	map.addOverlay(map.marker);
	showpanel.map = map;
	this.onphotoclick.apply(this.currimg);
};
PhotoGroupMarker.prototype.onclick.infostr = 
	'<div class="fgs_photobox" style="width:510px;height:375px; padding:4px; border:1px solid gray;">'+
		'<div style="position:absolute; top:5px;left:5px;width:510px;height:290px;">'+
			'<div style="margin-bottom:5px;"><a class="title" target="_blank"></a></div>'+
			'<div style="float:right; width:240px;">'+
				'<div></div>'+
				'<a class="popuplnk" target="_blank"><img src="'+imgs['max_default'].src+'"></img> Open in new window </a>'+
			'</div>'+
			'<div style="width:240px; height:200px"></div>'+
			'<div style="width:240px; margin-top:10px;">'+
				'<img id="authicn" style="float:left; margin-right:5px;"></img> Taken on <span id="datelnk" target="_blank"></span><br>by <a id="authlnk" target="_blank"></a>'+
			'</div>'+
		'</div>'+
		'<div style="position:absolute;top:295px;left:5px;width:510px;height:85px;">'+
			'<span style="position:absolute;left: 0px;top:5px;height:75px;width:12px;" class="btn"><img></img></span>'+
			'<span style="position:absolute;left:13px;top:5px;height:75px;width:12px;" class="btn"><img></img></span>'+
			'<div  style="position:absolute;left:27px;top:5px;height:80px;width:455px; overflow:hidden;">'+
				'<div class="fgs_photopanel" style="position:absolute;height:80px;">'+
					'<div class="fgs_photopanelidx" style="position:absolute;top:75px;"></div>'+
				'</div>'+
			'</div>'+
			'<span style="position:absolute;right:13px;top:5px;height:75px;width:12px;" class="btn"><img></img></span>'+
			'<span style="position:absolute;right: 0px;top:5px;height:75px;width:12px;" class="btn"><img></img></span>'+
			'<div  class="progress" style="position:absolute;left:27px;top:0px;width:455px; overflow:hidden;">'+
				'<div class="progressbar" style="position:relative;width:10px;"></div>'+
			'</div>'+
		'</div>'+
	'</div>';
PhotoGroupMarker.prototype.pprevimg=function() {
	this.marker.refreshImglist(0);
};
PhotoGroupMarker.prototype.previmg=function() {
	this.marker.refreshImglist(null, -6);
};
PhotoGroupMarker.prototype.nextimg=function() {
	this.marker.refreshImglist(null, 6);
};
PhotoGroupMarker.prototype.nnextimg=function() {
	this.marker.refreshImglist(Math.floor((this.marker.photos.length-1)/6)*6);
};
PhotoGroupMarker.prototype.refreshImglist=function(pos,dif){
	var speed=400;
	var photos = this.photos;
	if(!dif) {
		this.currpos=pos;
	} else if(dif > 0) {
		if(this.currpos >= photos.length-dif) return;
		this.currpos+=dif;
	} else if(dif < 0) {
		if( this.currpos <= 0) return;
		this.currpos+=dif;
	}

	var $imagspanel  = $(this.infowin.imagspanel);

	var end = this.currpos + 6;
	if(end > photos.length) end = photos.length;

	if($imagspanel.width() < end*76) $imagspanel.width(end*76);

	var cssprop = {width:75,height:75};
	for(var i = this.currpos; i<end; ++i) {
		var photo = photos[i];
		if(!photo.img) {
			photo.img = $('<img></img>').attr('src',photo.api.iconurl(photo)).attr('alt',photo.api.gettitle(photo)).addClass(photo.api.name).click(this.onphotoclick).get(0);
		}
		cssprop.left=i*76;
		$(photo.img).css(cssprop);
		photo.img.photo=photo;
		photo.img.marker=this;
		$imagspanel.append(photo.img);
	}

	$(this.infowin.progressbar).animate({width:((end-this.currpos)/photos.length)*455, left:(this.currpos/photos.length)*455},speed);
	$imagspanel.animate({left:(this.currpos)*(-76)},speed);
};
PhotoGroupMarker.prototype.onphotoclick=function(){
	var photo = this.photo;
	var showpanel = this.marker.infowin.showpanel;
	$(showpanel.titl).text(photo.api.gettitle(photo)).attr('href',photo.api.pageurl(photo));
	$(showpanel.popuplnk).attr('href',photo.api.pageurl(photo));
	$(showpanel.imgctnr).empty();
	$('<img></img>').attr('src',photo.api.smallurl(photo)).appendTo(showpanel.imgctnr);
	$(showpanel.authinfo.authicn).attr('src',photo.api.buddyurl(photo));
	$(showpanel.authinfo.datelnk).text(photo.api.date(photo));
	$(showpanel.authinfo.authlnk).text(photo.api.owner(photo)).attr('href',photo.api.ownerurl(photo));

	showpanel.map.checkResize();
	showpanel.map.setCenter(photo.pos, photo.accuracy);
	showpanel.map.marker.setLatLng(photo.pos);

	$(this.marker.infowin.imagspanelidx).css('left',$(this).css('left'));
	this.marker.currimg=this;
};



// PhotoMap
var PhotoMap=fgs.PhotoMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.photo_id=opts.photo_id;
	this.win.f_mask();
	this.b_saveloc=false;
	flickr.callapi('flickr.photos.getInfo', {photo_id:this.photo_id}, this, this.photoinfo_callback);
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
PhotoMap.prototype.photoinfo_callback=function(str){
try {
	var rsp = eval('(' + str + ')');
	if(!rsp || rsp.stat != 'ok') return;

	var photo = rsp.photo;

	this.win.f_settitle(photo.title._content);

	var zoom = 12;
	var locname = [];
	var loc = photo.location;
	if(!loc) {
		photo.location=loc={latitude:0,longitude:0};
		zoom=2;
		this.win.loadlastlocation_display();
	} else {
		var last = '';
		if(loc.locality && loc.locality._content!=last) { last=loc.locality._content; locname.push(last); }
		if(loc.county && loc.county._content!=last)     { last=loc.county._content; locname.push(last); }
		if(loc.region && loc.region._content!=last)     { last=loc.region._content; locname.push(last); }
		if(loc.country && loc.country._content!=last)   { last=loc.country._content; locname.push(last); }
		if(locname.length)
			this.win.infodiv.innerHTML='Taken on '+locname.join();

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
		gobj.GEvent.addListener(marker, 'dragend', this.searchresult_click);
	}

	this.setCenter(center, zoom);
	this.addOverlay(marker);
} finally {
	this.win.f_unmask();
}
};

PhotoMap.prototype.searchresult_click=function() {
	this.win.savelocation_display();
};
PhotoMap.prototype.loadlastlocation=function() {
	var center = new gobj.GLatLng(parseFloat(GM_getValue('last_lat', DEF_LAT)), parseFloat(GM_getValue('last_lng', DEF_LNG)));
	var zoom = parseInt(GM_getValue('last_zoom', DEF_ZOOM));

	this.setCenter(center, zoom);
	if(this.marker) {
		this.marker.setPoint(center);
	}
};
PhotoMap.prototype.savelocation=function() {
	var marker=this.marker;
	var p=marker.getLatLng();
	var zoom=this.getZoom();
	if(zoom < 1) zoom = 1;
	if(zoom > 16) zoom = 16;
	flickr.callapi('flickr.photos.geo.setLocation', {photo_id:marker.photo.id, lat:p.lat(), lon:p.lng(), accuracy:zoom}, this, this.savelocation_callback);
};
PhotoMap.prototype.savelocation_callback=function(str) {
	var rsp = eval('(' + str + ')');
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
	var marker=this.marker;
	flickr.callapi('flickr.photos.geo.removeLocation', {photo_id:marker.photo.id}, this, this.removelocation_callback);
}
PhotoMap.prototype.removelocation_callback=function(str) {
	var rsp = eval('(' + str + ')');
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
	opts = opts||{};
	this.win=opts.win;
	this.photoset_id=opts.photoset_id;

	this.nodate=true;
	this.datetracking=true;

	var mt=this.getMapTypes();
	for(var i=0; i<mt.length; i++) {
		mt[i].getMinimumResolution=this.getMinimumResolution;
	}

	this.win.f_action_append('Toggle Tracking',this.tracking_toggle).map=this;
	gobj.GEvent.addListener(this, 'zoomend', this.onzoomend);

	this.win.f_mask();

	var opts={photoset_id:this.photoset_id, extras:'geo,date_taken,owner_name,icon_server', per_page:PER_PAGE, page:1};
	flickr.callapi('flickr.photosets.getPhotos', opts, this, this.search_callback, []);
};
fgs.extend(PhotoSetMap, gobj.GMap2);
PhotoSetMap.prototype.getMinimumResolution=function(){return 3;};
PhotoSetMap.prototype.search_callback=function(str,params){
	var pageCurr = 0;
	var pageTotal = 0;
try {
	var rsp=eval('(' + str + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var photoset=rsp.photos?rsp.photos:rsp.photoset;

	pageCurr=parseInt(photoset.page);
	pageTotal=parseInt(photoset.pages);

	if(pageCurr < pageTotal) {
		this.win.f_loading( Math.floor(pageCurr/pageTotal*100)+'%');
		var opts={photoset_id:this.photoset_id,extras:'geo,date_taken,owner_name,icon_server', per_page:PER_PAGE, page:pageCurr+1};
		flickr.callapi('flickr.photosets.getPhotos', opts, this, this.search_callback, []);
	}

	this.photos = this.photos || [];
	for (var i=0,len=photoset.photo.length; i<len; i++) {
		var photo=photoset.photo[i];

		var lat=parseFloat(photo.latitude);
		var lon=parseFloat(photo.longitude);
		if(!lat && !lon) { 
			continue; 
		}
		var accuracy=parseInt(photo.accuracy);

		var p = {id:photo.id,secret:photo.secret,title:photo.title,pos:new gobj.GLatLng(lat, lon),accuracy:accuracy,api:flickr,datetaken:photo.datetaken,owner:photo.owner||photoset.owner,ownername:photo.ownername||photoset.owner,farm:photo.farm,server:photo.server,iconfarm:photo.iconfarm,iconserver:photo.iconserver};
		this.photos.push(p);
	}

	this.regroupphotos();
} finally {
	if(pageCurr >= pageTotal) this.win.f_closeloading();
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

	this.clearOverlays();

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
			b.photos=[];
			b.photos.push(photo);
			b.firstdate=photo.datetaken;
			temp_bounds.push(b);
		}
	}

	if(this.datetracking) {
		temp_bounds.sort(function(a,b){
			if(a.firstdate>b.firstdate) return -1; else return 1;}
		);
		var trackpoints = [];
		for (var i=0,len=temp_bounds.length; i<len ; i++) {
			var b = temp_bounds[i];
			trackpoints.push(b.getCenter());
		}
		this.addOverlay(new gobj.GPolyline(trackpoints));
	}

	for (var i=0,len=temp_bounds.length; i<len ; i++) {
		var b = temp_bounds[i];
		if(b.photos.length == 0) {
			continue;
		}
		if(b.maker) this.removeOverlay(b.maker);
		var center = b.getCenter();
		b.maker = fgs.PhotoGroupMarker.getInstance(b.photos.length);
		b.maker.setPhotos(b.photos);
		b.maker.setPoint(center);
		this.addOverlay(b.maker);
	}
};
PhotoSetMap.prototype.onzoomend=function(){
	this.regroupphotos();
};
PhotoSetMap.prototype.getembeddedlink=function(){
	if(this.photoset_id) {
		return '<iframe width="425" height="350" frameborder="no" scrolling="no" marginheight="0" marginwidth="0" src="'+EMBEDDED_URL+'flickr-gmap-photoset.html?photoset_id='+this.photoset_id+'"></iframe>';
	}
	return '';
};
PhotoSetMap.prototype.tracking_toggle=function(){
	this.map.win.f_action_toggle(null, true);
	this.map.datetracking = !this.map.datetracking;
	this.map.regroupphotos();
};


// BrowseMap
var BrowseMap=fgs.BrowseMap=function(container, opts){
	this.superconstructor.apply(this, arguments);
	opts = opts || {};
	this.win=opts.win;
	this.user_id=opts.user_id;
	this.group_id=opts.group_id;
	this.lastcenter = null;
	this.pageCurr = 1;
	this.pageTotal = 1;

	var options=this.options=$(
		'<div class="option" style="position:absolute;top:6px; left:80px;">'+
			'<span>'+
				'<span class="btn"><img></img></span>'+
				'<span class="btn"><img></img></span>'+
				'<span class="btn"><img></img></span>'+
			'</span>'+
			'<span style="margin-left:5px;"></span>'+
			'<div style="padding-top:10px;"></div>'+
		'</div>').get(0);
	options.ctrl=options.childNodes[0];
	options.info=options.childNodes[1];
	options.pane=options.childNodes[2];

	var nowy = new Date().getFullYear();
	var datestr = '<div>Date: <select id="fgs_select_year"><option value="all">All</option>';
	for(var i = 0; i<10; ++i) {
		datestr += '<option value="'+(nowy-i)+'">'+(nowy-i)+'</option>';
	}
	datestr += '</select> - <select id="fgs_select_month"><option value="all">All</option>';
	for(var i = 1; i<=12; ++i) {
		if(i < 10) datestr += '<option value="0'+i+'">0'+i+'</option>';
		else       datestr += '<option value="'+i+'">'+i+'</option>';
	}
	datestr += '</select></div>';
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
	var searchstr = '<div> Search: <form id="fgs_search_form"><input id="fgs_search" type="text"><input type="submit"></form></div>';
	$(options.pane).append(datestr).append(sortstr).append(searchstr);
	options.optionYear=$(options).find('#fgs_select_year').get(0);
	options.optionMonth=$(options).find('#fgs_select_month').get(0);
	options.optionSort=$(options).find('#fgs_select_sort').get(0);
	options.optionSearchForm=$(options).find('#fgs_search_form').get(0);
	options.optionSearch=$(options).find('#fgs_search').get(0);
	options.optionYear.gmap=options.optionMonth.gmap=options.optionSort.gmap=options.optionSearchForm.gmap=this;
	options.optionYear.onchange=options.optionMonth.onchange=options.optionSort.onchange=options.optionSearchForm.onsubmit=this.changeOption;

	var tog=options.ctrl.childNodes[0];
	var pre=options.ctrl.childNodes[1];
	var nex=options.ctrl.childNodes[2];
	pre.gmap=nex.gmap=tog.gmap=this;
	setupbtn(tog,'updown','Option Panel', this.togglePanel);
	setupbtn(pre,'prev','Previous Page', this.prevPage);
	setupbtn(nex,'next','Next Page', this.nextPage);
	this.updateOptionInfo();
	this.getContainer().appendChild(options);

	var mt=this.getMapTypes();
	for(var i=0; i<mt.length; i++) {
		mt[i].getMinimumResolution=this.getMinimumResolution;
	}

	gobj.GEvent.addListener(this, 'zoomend', this.onzoomend);
	gobj.GEvent.addListener(this, 'dragend', this.ondragend);
};
fgs.extend(BrowseMap, gobj.GMap2);
BrowseMap.prototype.getMinimumResolution=function(){return 3;};
BrowseMap.prototype.updateOptionInfo=function(){
	this.options.info.innerHTML=msg_pageinfo.replace('$1',this.pageCurr).replace('$2',this.pageTotal);
};
BrowseMap.prototype.search_callback=function(str,params){
try {
	var rsp=eval('(' + str + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var points=params[0];
	var photoset=rsp.photos?rsp.photos:rsp.photoset;

	this.pageCurr=parseInt(photoset.page);
	this.pageTotal=parseInt(photoset.pages);
	this.updateOptionInfo();

	this.photos = [];
	for (var i=0,len=photoset.photo.length; i<len; i++) {
		var photo=photoset.photo[i];

		var lat=parseFloat(photo.latitude);
		var lon=parseFloat(photo.longitude);
		if(!lat && !lon) { continue; }
		var accuracy=parseInt(photo.accuracy);

		var p = {id:photo.id,secret:photo.secret,title:photo.title,pos:new gobj.GLatLng(lat, lon),accuracy:accuracy,api:flickr,datetaken:photo.datetaken,owner:photo.owner||photoset.owner,ownername:photo.ownername||photoset.owner,farm:photo.farm,server:photo.server,iconfarm:photo.iconfarm,iconserver:photo.iconserver};
		this.photos.push(p);
	}

	this.regroupphotos(points);
} finally {
	this.win.f_unmask();
}};
BrowseMap.prototype.regroupphotos=function(points){
	if(!this.photos) return;

	var photos=this.photos;

	this.clearOverlays();

	if(points)
	    this.addOverlay(new gobj.GPolyline(points, '#0000FF', 1, .3));

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
			b.photos=[];
			b.photos.push(photo);
			b.firstdate=photo.datetaken;
			temp_bounds.push(b);
		}
	}

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
BrowseMap.prototype.refreshView=function(){
	this.win.f_mask();
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
	w += wid/5;
	if( w > 180) w -= 360;
	e -= wid/5;
	if( e <= -180) e += 360;
	if( e < w) {
		if( (180+e) > (180-w))
			w = -180;
		else
			e = 180;
	}
	n-=hig/5;
	s+=hig/5;

	var searchOption={extras:'geo,date_taken,owner_name,icon_server', per_page:PER_PAGE, page:this.pageCurr};
	searchOption.bbox=w+','+s+','+e+','+n;

	var sort = this.options.optionSort.value;
	searchOption.sort=sort;

	var year = this.options.optionYear.value;
	var month = this.options.optionMonth.value;
	if(year == 'all') {
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
	if(searchtxt!='') {
		searchOption.text=searchtxt;
	}

	var points = [new gobj.GLatLng(n,e),new gobj.GLatLng(n,w),new gobj.GLatLng(s,w),new gobj.GLatLng(s,e),new gobj.GLatLng(n,e)];
	flickr.callapi('flickr.photos.search', searchOption, this, this.search_callback, [points]);
};
BrowseMap.prototype.onzoomend=function(){
	this.pageCurr=this.pageTotal=1;
	this.refreshView();
};
BrowseMap.prototype.ondragend=function(){
	var lastcenter = this.lastcenter;
	var bound = this.getBounds();
	var center = bound.getCenter();
	var span   = bound.toSpan();
	if(lastcenter) {
		var dx  = Math.abs(center.lng() - lastcenter.lng());
		var dy  = Math.abs(center.lat() - lastcenter.lat());
		var bx = span.lng();
		var by = span.lat();
		if ((dx < 0.15*bx) && (dy < 0.15*by))
			return;
	}

	this.pageCurr=this.pageTotal=1;
	this.refreshView();
};
BrowseMap.prototype.prevPage=function(){
	if( this.gmap.pageCurr <= 1) return;
	this.gmap.pageCurr--;
	this.gmap.refreshView();
};
BrowseMap.prototype.nextPage=function(){
	if( this.gmap.pageCurr >= this.gmap.pageTotal) return;
	this.gmap.pageCurr++;
	this.gmap.refreshView();
};
BrowseMap.prototype.changeOption=function(){
try{
	this.pageCurr=this.pageTotal=1;
	this.gmap.refreshView();
} finally{
	return false;
}
};
BrowseMap.prototype.togglePanel=function(){
	$(this.gmap.options.pane).toggle();
};
BrowseMap.prototype.loadlastlocation=function() {
	var center = new gobj.GLatLng(parseFloat(GM_getValue('last_lat', DEF_LAT)), parseFloat(GM_getValue('last_lng', DEF_LNG)));
	var zoom = parseInt(GM_getValue('last_zoom', DEF_ZOOM));
	this.setCenter(center, zoom);
	this.refreshView();
};
BrowseMap.prototype.getembeddedlink=function(){
	if(this.photoset_id) {
		return '<iframe width="425" height="350" frameborder="no" scrolling="no" marginheight="0" marginwidth="0" src="'+EMBEDDED_URL+'flickr-gmap-photoset.html?photoset_id='+this.photoset_id+'"></iframe>';
	}
	return '';
};

fgs.init.inited=true;
};






var userjs = gobj.userjs = {

registerUnload: function() {
	if (gobj.addEventListener) gobj.addEventListener('unload', gobj.GUnload, false);
	else if (gobj.attachEvent) gobj.attachEvent('onunload', gobj.GUnload);
},
onwindowresize: function() {
	var mapwins = $('div.mapwin');
	for(var i = 0,len=mapwins.length;i<len; ++i) {
		mapwins.get(i).onwindowresize();
	}
},
prepare: function() {
	if(arguments.callee.init) return true;

	if(!js_jquery && !js_gmap && !js_analytics && $ && gobj.GMap2 && gobj.GUnload && gobj.urchinTracker) {
		prepare_imgs();
		fgs.init();
		userjs.registerUnload();
		gobj.GEvent.addDomListener(gobj, 'resize', userjs.onwindowresize);
		arguments.callee.init=true;

		_uacct=gobj._uacct= 'UA-359113-4';
		gobj.urchinTracker('/fgs/userjs');
		return true;
	}

	if(!arguments.callee.prepare) {
		arguments.callee.prepare = true;
		document.write(FGS_STYLE);
		loadscript(js_jquery,function(){$=gobj.jQuery;js_jquery=null;});
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
		userjs.check_loading(id);
		return;
	}

	if(this.win) {
		if(this.win.style.display != 'none') {
			this.win.f_close();
		} else {
			this.win.f_open();
			this.win.f_refreshsize();
		}
		return;
	}

	if(this.photo_id) {
		this.win=create_mapwindow(516,313,{embedlink:true,loadlast:true});
	} else if(this.photoset_id) {
		this.win=create_mapwindow(0,0,{fixmax:true,readonly:true,embedlink:true,about:true});
	} else {
		this.win=create_mapwindow(0,0,{fixmax:true,readonly:true,loadlast:true,about:true});
	}
	var win=this.win;
	win.link=this;
	$(win).hide();
	win.f_max_toggle();
	$(win).insertBefore(document.body.firstChild);
	win.f_open();

	var opt = {win:win, photo_id:this.photo_id, user_id:this.user_id, group_id:this.group_id, photoset_id:this.photoset_id};

	if(opt.photo_id) {
		var gmap =win.gmap= new fgs.PhotoMap(win.mapdiv, opt);
		gmap.enableDoubleClickZoom();
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.addControl(new gobj.GSmallMapControl());
	} else if(opt.photoset_id) {
		var gmap =win.gmap= new fgs.PhotoSetMap(win.mapdiv, opt);
		gmap.enableDoubleClickZoom();
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.addControl(new gobj.GLargeMapControl());
		gmap.addControl(new gobj.GOverviewMapControl());
	} else {
		var gmap =win.gmap= new fgs.BrowseMap(win.mapdiv, opt);
		gmap.enableDoubleClickZoom();
		gmap.addControl(new gobj.GMapTypeControl());
		gmap.addControl(new gobj.GLargeMapControl());
		gmap.addControl(new gobj.GOverviewMapControl());

		var lat = parseFloat(GM_getValue('last_browse_lat', DEF_LAT));
		var lng = parseFloat(GM_getValue('last_browse_lng', DEF_LNG));
		var zoom = parseInt(GM_getValue('last_browse_zoom', DEF_ZOOM));
		gmap.setCenter(new gobj.GLatLng(lat,lng), zoom);
	}
} finally {
	return false;
}},


checkup : function(SCRIPT){ try {
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
} catch (ex) {}},
onload: function() {
	this.checkup({name:scriptname, url:installurl, version:currVer});

	var pageparse = {
		rexp_photo_map_link : /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)\/map(\/.*)?$/,
		rexp_set_map_link :   /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)\/map(\/.*)?$/,
		rexp_user_map_link :  /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/map(\/.*)?$/,
		rexp_group_map_link : /^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)\/map(\/.*)?$/,
		rexp_world_map_link : /^http:\/\/(?:www.*\.)?flickr\.com\/map(\/.*)?$/,
		PhotoMap : function(p) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href) {
					var ma = this.rexp_photo_map_link.exec(maplnk.href);
					if(ma&&ma[1]&&ma[2]) {
						maplnk.photo_id=ma[2];
						maplnk.onclick=userjs.launch;
						return;
					}
				}
			}
		},
		UserMap: function(p,user_id) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href) {
					var ma = this.rexp_user_map_link.exec(maplnk.href);
					if(ma&&ma[1]) {
						maplnk.user_id=user_id;
						maplnk.onclick=userjs.launch;
						return;
					}
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
				if(maplnk.href) {
					var ma = this.rexp_group_map_link.exec(maplnk.href);
					if(ma&&ma[1]) {
						maplnk.group_id=gobj.f.w.value;
						maplnk.onclick=userjs.launch;
						return;
					}
				}
			}
		},
		SetMap: function(p) {
			if(!p) return;
			var lnks = p.getElementsByTagName('a');
			for(var ln in lnks) {
				var maplnk = lnks[ln];
				if(maplnk.href) {
					var ma = this.rexp_set_map_link.exec(maplnk.href);
					if(ma&&ma[1]&&ma[2]) {
						maplnk.photoset_id=ma[2];
						maplnk.onclick=userjs.launch;
						return;
					}
				}
			}
		}
	};

	var rexp_single_photo =   /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(\/.*)?$/;
	var rexp_set =            /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)(\/.*)?$/;
	var rexp_user_photo =     /^http:\/\/(?:www.*\.)?flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)(\/.*)?$/;
	var rexp_group =          /^http:\/\/(?:www.*\.)?flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)(\/.*)?$/;
	var rexp_explore =        /^http:\/\/(?:www.*\.)?flickr\.com\/explore(\/.*)?$/;

	var urls=null;
	if((urls = rexp_single_photo.exec(gobj.location.href))&&urls[1]&&urls[2]) {
		var maplnk = document.getElementById('a_link_to_map');
		var edtlnk = document.getElementById('a_place_on_map_old');
		if(maplnk) {
			maplnk.photo_id=urls[2];
			maplnk.onclick=userjs.launch;
		}
		if(edtlnk) {
			edtlnk.photo_id=urls[2];
			edtlnk.onclick=userjs.launch;
		}
	} else if((urls = rexp_set.exec(gobj.location.href))&&urls[1]&&urls[2]) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras)
			if(paras[p].className == 'Links')
				pageparse.SetMap(paras[p]);
	} else if((urls = rexp_user_photo.exec(gobj.location.href))&&urls[1]) {
		var paras = document.getElementsByTagName('p');
		for(var p in paras) {
			if(paras[p].className == 'Do')
				pageparse.PhotoMap(paras[p]);
			if(paras[p].className == 'Links')
				pageparse.UserMap(paras[p],gobj.f.w.value);
		}
	} else if(urls = rexp_explore.exec(gobj.location.href)) {
		var main = document.getElementById('Main');
		pageparse.WorldMap(main);
	} else if((urls = rexp_group.exec(gobj.location.href))&&urls[1]) {
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
