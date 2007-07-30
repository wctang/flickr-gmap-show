// ==UserScript==
// @name          Flickr Gmap Show
// @namespace     http://code.google.com/p/flickr-gmap-show/
// @author        wctang <wctang@gmail.com>
// @include       http://www*.flickr.com/*
// @description   Show Flickr geotagged photos with Google Map.
// @source        http://userscripts.org/scripts/show/9450
// @identifier    http://userscripts.org/scripts/source/9450.user.js
// @version       2.0

// Change Log
// ==========
// v2.0  07/07/27 Rewrite from v1.2
//
// ==/UserScript==

(function() {
var scriptname = 'Flickr Gmap Show';
var installurl = 'http://userscripts.org/scripts/source/9450.user.js';
var currVer = '2.0';


var js_jquery = 'http://jqueryjs.googlecode.com/files/jquery-1.1.3.1.js';
var js_gmap = 'http://maps.google.com/maps?file=api&v=2.x';

var imgdir = 'http://flickr-gmap-show.googlecode.com/svn/trunk/pics/';
var imgs = {
  loading         : imgdir+'loading.gif',
  close_default   : imgdir+'simple_close_default.gif',
  close_hover     : imgdir+'simple_close_hover.gif',
  close_selected  : imgdir+'simple_close_selected.gif',
  max_default     : imgdir+'simple_new_window_default.gif',
  max_hover       : imgdir+'simple_new_window_hover.gif',
  max_selected    : imgdir+'simple_new_window_selected.gif',
  search_default  : imgdir+'simple_down_default.gif',
  search_hover    : imgdir+'simple_down_hover.gif',
  search_selected : imgdir+'simple_down_selected.gif',
  prev_default    : imgdir+'simple_prev_default.gif',
  prev_hover      : imgdir+'simple_prev_hover.gif',
  prev_selected   : imgdir+'simple_prev_selected.gif',
  next_default    : imgdir+'simple_next_default.gif',
  next_hover      : imgdir+'simple_next_hover.gif',
  next_selected   : imgdir+'simple_next_selected.gif',
  updown_default  : imgdir+'simple_updown_default.gif',
  updown_hover    : imgdir+'simple_updown_hover.gif',
  updown_selected : imgdir+'simple_updown_selected.gif',
  shadow1         : imgdir+'shadow1.png',
  shadow2         : imgdir+'shadow2.png',
  icon_shadow     : imgdir+'icon_shadow.png'
};
for(var m in imgs) { var mm = new Image(); mm.src = imgs[m]; imgs[m] = mm; }


var PER_PAGE = 200;
var def_lat = '0';
var def_lng = '0';
var def_zoom = '3';
var msg_viewonsite = 'View this photo on $1';
var msg_takenon = 'Taken on $1';
var msg_postby = 'Posted by $1';
var msg_pageinfo = '$1/$2';



var deltas = [0,0,
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

function $icon(n) {
  if(!$icon.icons) $icon.icons=[];
  if(n > 100) n = 100;
  if(!$icon.icons[n]) {
    var img = new window.GIcon(null, imgdir + n + '.png');
    if(n < 10) {
      img.iconSize = new window.GSize(18, 19);
      img.iconAnchor = new window.GPoint(9, 9);
      img.infoWindowAnchor = new window.GPoint(9, 9);
    } else if (n < 100) {
      img.iconSize = new window.GSize(20, 21);
      img.iconAnchor = new window.GPoint(10, 10);
      img.infoWindowAnchor = new window.GPoint(10, 10);
    } else {
      img.iconSize = new window.GSize(26, 27);
      img.iconAnchor = new window.GPoint(13, 13);
      img.infoWindowAnchor = new window.GPoint(13, 13);
    }
    $icon.icons[n] = img;
  }
  return $icon.icons[n];
};




var window;
if(unsafeWindow) window=unsafeWindow;
var document=window.document;



function loadscript(jspath,loaded) {
  var s = document.createElement('script');
  s.type='text/javascript'
  s.src =jspath;
  if(loaded) {
    s.onreadystatechange=function() {
      if (this.readyState=='complete') loaded();
    }
    s.onload=loaded;
  }
  document.getElementsByTagName('head')[0].appendChild(s);
};
document.oldwrite = document.write;
document.write = function(str) {
  if(str.indexOf('<script ')>=0){
    var f = str.indexOf('src="')+5;
    var src = str.substring(f,str.indexOf('"',f));
    if(!window.overwritegload && window.GLoad && (typeof window.GLoad == 'function')) {
      window.overwritegload=true;
      window.eval('var gloadstr=window.GLoad.toString(); gloadstr=gloadstr.replace(/\\n/,""); gloadstr=gloadstr.replace(/^\\s*function\\s*GLoad\\s*\\(\\)\\s*{/,""); gloadstr=gloadstr.replace(/}\\s*$/,""); gloadstr=gloadstr.replace(/GValidateKey\\("\w*"\\)/,"true"); window.GLoad=new Function(gloadstr);');
    }
    loadscript(src);
  } else if(str.indexOf('<style ')>=0){
    var e = document.createElement('div');
    e.innerHTML = str;
    document.getElementsByTagName('head')[0].appendChild(e);
  } else {
    document.oldwrite(str);
  }
};
function totaloffset(elem) {var t,l; for(var e=elem,t=0,l=0;e.offsetParent;t+=e.offsetTop,l+=e.offsetLeft,e=e.offsetParent); return {top:t,left:l};};











var FGS_STYLE=
'<style type="text/css">'+
'img {border:0;} '+
'img.buddy {width:48px;height:48px;} '+
'.btn {cursor:pointer;} '+
'.mapwin {border:solid 2px #F0F0F0; background-color:white;} '+
'.mapwin .btn {font:14px arial;color:#999999;} '+
'.mask {z-index:1000; background-color:black; opacity:.8; -moz-opacity:.8; filter:alpha(opacity=80);} '+
'.mask div {position:relative;float:left;top:50%;left:50%;margin-top:-16px;margin-left:-16px;} '+
'.popup {z-index:2000; background-color:white; font:14px arial; text-align:left;} '+
'.fgs_photo_panel {height:140px; width:255px; border:0;} '+
'.fgs_photo_panel div {position:relative;left:0px;width:255px; background-color:white;} '+
'.fgs_photo_panel .photos img {background:url('+['loading'].src+') no-repeat bottom right; cursor:pointer; margin:5px;} '+
'</style>';




var FGS=window.FGS={};

var flickr=FGS.flickr={
name:'flickr',
gettitle : function(photo) {return photo.title;},
iconurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_s.jpg';},
smallurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_m.jpg';},
mediumurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';},
pageurl : function(photo) {return 'http://www.flickr.com/photo.gne?id='+photo.id;},
owner: function(photo) {return photo.ownername ? photo.ownername : photo.owner;},
ownerurl: function(photo) {return 'http://www.flickr.com/photos/'+photo.owner+'/';},
hasbuddy: true,
buddyurl : function(photo) {
  if(photo.iconserver&parseInt(photo.iconserver)>0) return 'http://farm'+photo.iconfarm+'.static.flickr.com/'+photo.iconserver+'/buddyicons/'+photo.owner+'.jpg';
  else return 'http://www.flickr.com/images/buddyicon.jpg';
},
date: function(photo) { return photo.datetaken.substr(0,10); },
_apifun : function(success, responseXML, responseText, params) {
  this.callback.call(this.tgt, responseText, this.params);
},
callapi : function(methodname, args, obj, callback, params) {
  var fun = methodname.replace(/\./g, '_')+'_onLoad';
  args.format='json';
  args.nojsoncallback = '1';
  var o = {callback:callback,tgt:obj,params:params};
  o[fun]=flickr._apifun;
  
  window.F.API.callMethod(methodname, args, o);
}
};

var geocode=FGS.geocode={
search:function(str,callback){
  var cb='geocode_cb_'+new Date().getTime();
  FGS.geocode[cb]=function(rsp){arguments.callee.callback(rsp);};
  FGS.geocode[cb].callback=callback;
  var jspath = 'http://maps.google.com/maps/geo?key=ABQIAAAAtOjLpIVcO8im8KJFR8pcMhQjskl1-YgiA_BGX2yRrf7htVrbmBTWZt39_v1rJ4xxwZZCEomegYBo1w&callback=FGS.geocode.'+cb+'&output=json&q='+str;
  loadscript(jspath);
}
};





function $extend(subc,basec) {
  var inh=function(){}; inh.prototype=basec.prototype; subc.prototype=new inh(); subc.prototype.constructor=subc; 
  subc.prototype.superconstructor=basec;
};




function $setupbtn(a,n,title,clickfun) {
  if(!$setupbtn.mouseout) {
    $setupbtn.mouseout=function(){ this.img.src=imgs[this.n+'_default'].src;};
    $setupbtn.mouseover=function(){ this.img.src=imgs[this.n+'_hover'].src;};
    $setupbtn.mousedown=function(){ this.img.src=imgs[this.n+'_selected'].src;};
    $setupbtn.mouseup=function(){ this.img.src=imgs[this.n+'_hover'].src;};
  }
  var ja = $(a).mouseout($setupbtn.mouseout).mouseover($setupbtn.mouseover).mousedown($setupbtn.mousedown).mouseup($setupbtn.mouseup);
  if(clickfun) ja.click(clickfun);
  a.img=ja.children("img").attr('alt',title).get(0);
  a.n = n;
  ja.trigger('mouseout');
  return a;
};
function $cbtn(n, title, clickfun) {
  return $setupbtn($('<a class="btn"><img/></a>').get(0),n,title,clickfun);
};

function $photoicon(photo) {
  var icon = new window.GIcon();
  icon.image = flickr.iconurl(photo);
  icon.iconSize=new window.GSize(75,75);
  icon.iconAnchor=new window.GPoint(38,85);
  icon.shadow = imgs['icon_shadow'].src;
  icon.shadowSize=new window.GSize(75,85);
  return icon;  
}



function win_create(wid,hei,fixmax) {
  var win= $(
    '<div style="display:none; background: url('+imgs['shadow1'].src+') no-repeat bottom right;">'+
    '<div style="padding: 0px 5px 5px 0px; background: url('+imgs['shadow2'].src+') no-repeat left top;">'+
      '<div class="mapwin">'+                             // main
        '<div style="position:absolute;left:7px;top:5px; font:14px arial;"></div>'+                  // title
        '<div style="position:absolute;left:5px;top:27px;"></div>' +                                 // map
        '<div style="position:absolute;left:5px;top:27px;display:none;" class="mask"><div><img src="'+imgs['loading'].src+'"/></div></div>' +  // mask
        '<div style="position:absolute;left:5px;top:47px; text-align:left; background-color:white; display:none;"></div>' + //search
        '<div style="position:absolute;left:5px;bottom:36px; height:20px; text-align:left; background-color:yellow;"></div>' + // msg
        '<div style="position:absolute;left:9px;bottom:11px; text-align:left; font:14px arial;color:#999999"></div>'+       // info
        '<div style="position:absolute;right:12px;bottom:11px;font:italic 14px arial;color:#999999"></div>'+  // locate div
        '<a class="btn" style="position:absolute;right:12px;top:6px;"><img style="overflow:visible;"/></a>'+  // close btn
        '<a class="btn" style="position:absolute;right:32px;top:6px;"><img style="overflow:visible;"/></a>'+  // max btn
        '<a style="position:absolute;right:52px;top:6px;"><img style="overflow:visible;"/></a>'+ // search btn
      '</div>'+
    '</div>'+
    '</div>').get(0);
  win.shadow = win.firstChild;
  win.maindiv = win.firstChild.firstChild;
  var w = win.maindiv.childNodes;
  win.titlediv = w[0];
  win.mapdiv = w[1];
  win.maskdiv = w[2];
  win.searchdiv = w[3];
  win.msgdiv = w[4];
  win.infodiv = w[5];
  win.locatediv = w[6];
  win.clsbtn = w[7];
  win.maxbtn = w[8];
  win.searchbtn = w[9];
  $(win.maskdiv).css('opacity',.5);

  win.m_width=wid;
  win.m_height=hei;
  win.m_max=true;
  win.m_fixmax=fixmax;
  if(fixmax) {
    $(win.maxbtn).hide();
  }
  $(win.searchbtn).hide(); // no geocode search function...

  win.searchdiv.innerHTML = '<div style="margin:10px;"><form id="geocode_search">Geocode search: <input name="s_str"/><input type="submit"></form></div>';
  win.searchdiv.form=win.searchdiv.firstChild.firstChild;
  win.searchdiv.form.onsubmit=win.f_search_submit;

  win.f_open=function(){
    $(win).css('opacity',0).show().fadeTo('fast',1);
    if(win.gmap) win.gmap.checkResize();
  };
  //win.f_term=function(){win.style.display='none';};
  //win.f_close=function(){$(win).fadeTo('fast',0);};
  win.f_close=function(){$(win).hide();};
  win.f_max=function(e){
    win.m_max=win.m_fixmax?true:!win.m_max;
    if(!win.m_top) {
      if(win.m_fixmax) {
        win.m_top=-document.body.offsetHeight+10;
        win.m_left=10;
      } else {
        var ofst = totaloffset(win.link);
        win.m_top=ofst.top-document.body.offsetHeight-win.m_height-10;
        win.m_left=ofst.left-(win.m_width*.85);
        if(win.m_left < 0) win.m_left = 0;
      }
    }
    var pos;
    if(win.m_max) {
      pos = {top:win.m_top,left:10,width:document.body.clientWidth-30,height:600};
    } else {
      pos = {top:win.m_top,left:win.m_left,width:win.m_width,height:win.m_height};
    }
    win.f_resize(pos.width,pos.height);
    if(!e){
      $(win).css(pos);
    }else{
      $(win).animate(pos,'slow');
    }
    if(win.gmap) win.gmap.checkResize();
  };
  win.f_resize=function(w,h){
    $(win.shadow).width(w-6).height(h-6);
    $(win.maindiv).width(w-10).height(h-10);
    $(win.mapdiv).width(w-16).height(h-63);
    $(win.maskdiv).width(w-16).height(h-63);
    $(win.searchdiv).width(w-16).height(100);
    $(win.infodiv).width(w-156);
  };
  win.f_search=function(){$(win.searchdiv).toggle();};
  win.f_search_submit_callback=function(rsp){
    alert(rsp.Status.code);
    if(rsp && rsp.Status && rsp.Status.code && rsp.Status.code == 200) {
      var loc = rsp.Placemark.Point.coordinates;
      
      if(win.gmap && win.marker) {
        win.gmap.setCenter(new window.GLatLng(loc[0],loc[1]));
      }
    }
  };
  win.f_search_submit=function(){
    try {
      geocode.search(this.s_str.value,win.f_search_submit_callback);
    } finally {
      return false;
    }
  };
  win.f_mask=function(){$(win.maskdiv).show();};
  win.f_unmask=function(){$(win.maskdiv).hide();};
  

  $setupbtn(win.clsbtn,'close','close',win.f_close);
  $setupbtn(win.maxbtn,'max','max',win.f_max);
  $setupbtn(win.searchbtn,'search','search',win.f_search);

  return win;
};





FGS.init=function(){
if(FGS.init.inited) return;




var PhotoMarker=FGS.PhotoMarker=function(latlng,opts){
  this.superconstructor.apply(this, arguments);
  this.photo=opts.photo;
  this.gmap=opts.gmap;
  this.modified=false;
  window.GEvent.addListener(this, 'dragend', this.ondragend);
};
$extend(PhotoMarker, window.GMarker);
PhotoMarker.prototype.ondragend=function() {
  if(!this.modified) {
    this.modified = true;
    var lnk = $('<a style="cursor:pointer;">save location? </a>').click(this.onsavelocationclick).appendTo(this.gmap.win.msgdiv).get(0);
    lnk.marker=this;
  }
};
PhotoMarker.prototype.savelocation_callback=function(str) {
  var rsp = eval('(' + str + ')');
  if(rsp.stat != 'ok') {
    alert('save location failed.');
    return;
  }
  
  var loc=this.getPoint();
  this.gmap.win.msgdiv.innerHTML='';
  this.gmap.win.locatediv.innerHTML = loc.lat().toFixed(6)+ ' ' + loc.lng().toFixed(6);
  this.modified=false;
  GM_setValue('last_lat', loc.lat()+'');
  GM_setValue('last_lng', loc.lng()+'');
  GM_setValue('last_zoom', this.gmap.getZoom()+'');
  alert('saved');
};
PhotoMarker.prototype.onsavelocationclick=function() {
  if(confirm('save location?')) {
    var marker=this.marker;
    var p=marker.getPoint();
    var zoom=marker.gmap.getZoom();
    if(zoom < 1) zoom = 1;
    if(zoom > 16) zoom = 16;
    flickr.callapi('flickr.photos.geo.setLocation', {photo_id:marker.photo.id, lat:p.lat(), lon:p.lng(), accuracy:zoom}, marker, marker.savelocation_callback);
  }
};






var PhotoGroupMarker=FGS.PhotoGroupMarker=function(latlng,opts){
  this.superconstructor.apply(this, arguments);
  this.currpos=0;
  this.photos=opts.photos;
  this.infowin=null;
  window.GEvent.addListener(this, 'click', this.onclick);
};
$extend(PhotoGroupMarker, window.GMarker);
PhotoGroupMarker.prototype.onclick=function(){
  if(!this.infowin) {
    var infowin=this.infowin= $(
      '<div class="fgs_photo_panel">'+
        '<div style="height:40px;text-align:center;"></div>'+
        '<div style="height:85px;" class="photos"></div>'+
        '<div style="height:20px;"></div>'+
      '</div>').get(0);
    infowin.titl = infowin.childNodes[0];
    var imags = infowin.childNodes[1];
    var ctrl = infowin.childNodes[2];
    
    //var mx = $cbtn('popup','Popup', this.photolist_open, this);
    //ctrl.appendChild(mx);
    var pre = $cbtn('prev','prev', this.previmg);
    var nex = $cbtn('next','next', this.nextimg);
    pre.marker=nex.marker=this;
    ctrl.appendChild(pre);
    ctrl.appendChild(nex);
    
    var info = $('<span/>').get(0);
    ctrl.appendChild(info);
    infowin.info = info;

    var cssprop = {position:'absolute', width:75, height:75, display:'none'};
    for(var i = 0, len = this.photos.length; i < len; ++i) {
      var photo = this.photos[i];
      var img = $('<img/>').attr('alt',photo.api.gettitle(photo)).addClass(photo.api.name).css(cssprop).bind('click',this.onphotoclick).get(0);
      img.photo=photo;
      img.marker=this;
      imags.appendChild(img);
    }
    this.infowin.imags=imags.childNodes;
  }
  this.refreshImglist(0);
  this.openInfoWindow(this.infowin);
};
PhotoGroupMarker.prototype.imageDisappear=function(){
  $(this).hide();
},
PhotoGroupMarker.prototype.refreshImglist=function(dir){
  var imags = this.infowin.imags;

  var end = this.currpos + 5;
  if( end > imags.length) end = imags.length;
  for( var i = this.currpos; i<end; ++i) {
      var img = imags[i];
      if(!img.src) img.src=img.photo.api.iconurl(img.photo);
  }

  var c = this.currpos;
  var plmst = {left:0,top:0,width:0,height:0};
  var pleft = {left:8,top:8,width:60,height:60};
  var pcent = {left:85,top:0,width:75,height:75};
  var prigt = {left:178,top:8,width:60,height:60};
  var prmst = {left:245,top:75,width:0,height:0};
  var speed=200;
  for( var i = 0; i < imags.length; i++ ) {
    var img=$(imags[i]);

    if(dir==0) {
      switch(i) {
        case c-1: img.css(pleft).show(); break;
        case c  : img.css(pcent).show(); break;
        case c+1: img.css(prigt).show(); break;
        default:  img.hide(); break;
      }
    } else if(dir>0) {
      switch(i) {
        case c-2: img.css(pleft).show().animate(plmst,speed,null,this.imageDisappear); break;
        case c-1: img.css(pcent).show().animate(pleft,speed); break;
        case c  : img.css(prigt).show().animate(pcent,speed); break;
        case c+1: img.css(prmst).show().animate(prigt,speed); break;
        default:  img.hide(); break;
      }
    } else if(dir<0) {
      switch(i) {
        case c-1: img.css(plmst).show().animate(pleft,speed); break;
        case c  : img.css(pleft).show().animate(pcent,speed); break;
        case c+1: img.css(pcent).show().animate(prigt,speed); break;
        case c+2: img.css(prigt).show().animate(prmst,speed,null,this.imageDisappear); break;
        default:  img.hide(); break;
      }
    }
  }

  this.infowin.titl.innerHTML=imags[this.currpos].alt;
  this.infowin.info.innerHTML=' ' + (this.currpos+1) + ' of ' + imags.length + ' ';
};
PhotoGroupMarker.prototype.onphotoclick=function(){
  var w = document.body.clientWidth;
  var h = document.body.clientHeight;

  var overlay = $(
    '<div><div class="mask" style="position:absolute; top:0px; left:0px; width:'+w+'px; height:'+h+'px;">'+
      '<div><img src="'+imgs['loading'].src+'"/></div>'+
    '</div></div>').get(0);

  var imgPreloader = new window.Image();
  imgPreloader.overlay = overlay;
  imgPreloader.photo=this.photo;
  imgPreloader.onload=function(){
    if( this.overlay.removed) return;

    var w = this.width+20;
    var lef = (document.body.clientWidth-w)/2;
    if(lef < 0) lef=0;
    
    var hei = (document.body.clientHeight-(this.height+100))/2;
    if(hei < 0) hei=0;
    
    var photo = this.photo;
    
    var photoctx =
      '<div class="popup" style="position:absolute; top:'+hei+'px; left:'+lef+'px; width:'+w+'px;">'+
        '<div style="margin:10px;">'+
          '<b style="display: block; margin-bottom: 4px;">'+photo.api.gettitle(photo)+'</b>'+
          '<img style="margin-bottom:4px;" src="'+this.src+'"/><br />'+
          '<a style="float:right;" target="_blank" href="'+photo.api.ownerurl(photo)+'"/><img class="buddy" src="'+flickr.buddyurl(photo)+'"/></a>'+
          '<i>'+msg_postby.replace('$1','<a target="_blank" href="'+photo.api.ownerurl(photo)+'"/>'+photo.api.owner(photo)+'</a>')+'</i><br />'+
          '<i>'+msg_takenon.replace('$1', photo.api.date(photo))+'</i><br />'+
          '<a target="_blank" href="'+photo.api.pageurl(photo)+'">'+msg_viewonsite.replace('$1',photo.api.name)+'</a>'+
        '</div>'+
      '</div>';

    var photopopup = $(photoctx).get(0);
    $(this.overlay.firstChild.firstChild).hide();
    $(photopopup).appendTo(this.overlay);
  };
  imgPreloader.src = this.photo.api.mediumurl(this.photo);

  $(overlay).click(function(){
    this.removed=true;
    overlay.parentNode.removeChild(overlay);
  }).appendTo(document.body);
};
PhotoGroupMarker.prototype.previmg=function() {
  if( this.marker.currpos <= 0) return;

  this.marker.currpos--;
  this.marker.refreshImglist(-1);
};
PhotoGroupMarker.prototype.nextimg=function() {
  if(this.marker.currpos >= this.marker.infowin.imags.length-1) return;

  this.marker.currpos++;
  this.marker.refreshImglist(1);
};






var PhotoMap=FGS.PhotoMap=function(container, opts){
  this.superconstructor.apply(this, arguments);
  this.win=opts.win;
  this.photo_id=opts.photo_id;
  this.win.f_mask();
  flickr.callapi('flickr.photos.getInfo', {photo_id:this.photo_id}, this, this.photoinfo_callback);
};
$extend(PhotoMap, window.GMap2);
PhotoMap.prototype.photoinfo_callback=function(str){
try {
  var rsp = eval('(' + str + ')');
  if(!rsp || rsp.stat != 'ok') return;

  var photo = rsp.photo;

  this.win.titlediv.innerHTML = photo.title._content;

  var zoom = 12;
  var locname = [];
  var loc = photo.location;
  if(!loc) {
    photo.location=loc={latitude:0,longitude:0};
    zoom=2;
    var lnk = $('<a style="cursor:pointer;">load last location? </a>').click(this.onloadlastposclick).appendTo(this.win.msgdiv).get(0);
    lnk.gmap = this;
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

  var center = new window.GLatLng(photo.location.latitude,photo.location.longitude);
  var marker=this.marker=new FGS.PhotoMarker(center, {icon:$photoicon(photo), draggable:true, photo:photo, gmap:this});

  this.setCenter(center, zoom);
  this.addOverlay(marker);
} finally {
  this.win.f_unmask();
}
};
PhotoMap.prototype.onloadlastposclick=function() {
  var center = new window.GLatLng(parseFloat(GM_getValue('last_lat', def_lat)), parseFloat(GM_getValue('last_lng', def_lng)));
  var zoom = parseInt(GM_getValue('last_zoom', def_zoom));
  var gmap=this.gmap;
  if(gmap) {
    gmap.setCenter(center, zoom);
    if(gmap.marker) {
      gmap.marker.setPoint(center);
    }
    gmap.marker.modified=false;
    gmap.win.msgdiv.innerHTML='';
  }
};








var BrowseMap=FGS.BrowseMap=function(container, opts){
  this.superconstructor.apply(this, arguments);
  this.win=opts.win;
  this.user_id=opts.user_id;
  this.group_id=opts.group_id;
  this.photoset_id=opts.photoset_id;
  this.notoggle=opts.notoggle;
  this.nodate=opts.nodate;
  this.nosort=opts.nosort;

  this.lastcenter = null;
  this.pageCurr = 1;
  this.pageTotal = 1;
  
  var options=this.options=$(
    '<div style="position:absolute;border:solid 1px black; background-color:white; padding:5px; top:6px; left:80px; text-align:left;">'+
      '<span></span>'+
      '<span style="margin-left:5px;"></span>'+
      '<div style="display:none; padding-top:10px;"></div>'+
    '</div>').get(0);
  options.ctrl=options.childNodes[0];
  options.info=options.childNodes[1];
  options.pane=options.childNodes[2];

  var nowy = new Date().getFullYear();
  var datestr = '<div>Date: <select id="fgs_select_year">';
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
    '<div>Sort: <select id="fgs_select_sort">'+
      '<option value="interestingness-desc">Interestingness, desc</option>'+
      '<option value="interestingness-asc">Interestingness, asc</option>'+
      '<option value="date-taken-desc">Date taken, desc</option>'+
      '<option value="date-taken-asc">Date taken, asc</option>'+
      '<option value="date-posted-desc">Date posted, desc</option>'+
      '<option value="date-posted-asc">Date posted, asc</option>'+
      '<option value="relevance">Relevance</option></select></div>';
  var searchstr = '<div> Search: <form id="fgs_search_form"><input id="fgs_search" type="text"/><input type="submit"/></form></div>';
  $(options.pane).append(datestr).append(sortstr).append(searchstr);
  options.optionYear=$(options).find('#fgs_select_year').get(0);
  options.optionMonth=$(options).find('#fgs_select_month').get(0);
  options.optionSort=$(options).find('#fgs_select_sort').get(0);
  options.optionSearchForm=$(options).find('#fgs_search_form').get(0);
  options.optionSearch=$(options).find('#fgs_search').get(0);
  options.optionYear.gmap=options.optionMonth.gmap=options.optionSort.gmap=options.optionSearchForm.gmap=this;
  options.optionYear.onchange=options.optionMonth.onchange=options.optionSort.onchange=options.optionSearchForm.onsubmit=this.changeOption;

  var tog = $cbtn('updown','toggle', this.togglePanel);
  var pre = $cbtn('prev','prev', this.prevPage);
  var nex = $cbtn('next','next', this.nextPage);
  pre.gmap=nex.gmap=tog.gmap=this;
  if(!this.notoggle)
    options.ctrl.appendChild(tog);
  options.ctrl.appendChild(pre);
  options.ctrl.appendChild(nex);
  this.updateOptionInfo();
  this.getContainer().appendChild(options);
  

  window.GEvent.addListener(this, "zoomend", this.onzoomend);
  window.GEvent.addListener(this, "dragend", this.ondragend);
};
$extend(BrowseMap, window.GMap2);
BrowseMap.prototype.updateOptionInfo=function(){
  this.options.info.innerHTML=msg_pageinfo.replace('$1',this.pageCurr).replace('$2',this.pageTotal);
};
BrowseMap.prototype.search_callback=function(str,params){
try {
  var rsp=eval('(' + str + ')');
  if(!rsp||rsp.stat != 'ok') return;

  var points=params[0];
  var photoset=rsp.photos?rsp.photos:rsp.photoset;
  var photos=photoset.photo;
  
  this.pageCurr=parseInt(photoset.page);
  this.pageTotal=parseInt(photoset.pages);
  this.updateOptionInfo();
  
  
  this.clearOverlays();
  this.addOverlay(new window.GPolyline(points, '#0000FF', 1, .3));
  
  var delta=deltas[this.getZoom()];
  
  var temp_bounds=[];
  for (var i=0,len=photos.length; i<len; i++) {
    var photo=photos[i];
    photo.api = flickr;
    if(!photo.owner) photo.owner=photoset.owner;
    var lat=parseFloat(photo.latitude);
    var lon=parseFloat(photo.longitude);
    if(lat==0 && lon==0) { continue; }

    var pos=new window.GLatLng(lat, lon);
    var isMerged=false;
    for (var j=0,len2=temp_bounds.length; j<len2; j++) {
      var b=temp_bounds[j];
      if( b.contains(pos)) {
        isMerged=true;
        b.photos.push(photo);
        break;
      }
    }
    
    if(!isMerged) {
      var b = new window.GLatLngBounds(new window.GLatLng(pos.lat()-delta, pos.lng()-delta), new window.GLatLng(pos.lat()+delta, pos.lng()+delta));
      b.photos=[];
      b.photos.push(photo);
      temp_bounds.push(b);
    }
  }
  
  for (var i=0,len=temp_bounds.length; i<len ; i++) {
    var b = temp_bounds[i];
    if(b.photos.length == 0) { continue; }
    if(b.maker) this.removeOverlay(b.maker);
    b.maker = new FGS.PhotoGroupMarker(b.getCenter(), {icon:$icon(b.photos.length),photos:b.photos});
    this.addOverlay(b.maker);
  }
} finally {
  this.win.f_unmask();
}};
BrowseMap.prototype.refreshView=function(){
  this.win.f_mask();

  this.lastcenter = this.getCenter();
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

  var year = this.options.optionYear.value;
  var month = this.options.optionMonth.value;
  var sort = this.options.optionSort.value;
  var searchtxt = $.trim(this.options.optionSearch.value);

  var max_date, min_date;
  if(month == 'all') {
    min_date = year+'-01-01'; max_date = year+'-12-31';
  } else {
    min_date = year+'-'+month+'-01'; max_date = year+'-'+month+'-31';
  }

  var methodname='flickr.photos.search';
  var searchOption={bbox:w+','+s+','+e+','+n, extras:'geo,date_taken,owner_name,icon_server', per_page:PER_PAGE, page:this.pageCurr};
  if(this.user_id) searchOption.user_id=this.user_id;
  if(this.group_id) searchOption.group_id=this.group_id;
  if(this.photoset_id) {
    methodname='flickr.photosets.getPhotos';
    searchOption.photoset_id=this.photoset_id;
  }
  if(!this.nosort) {
    searchOption.sort=sort;
  }
  if(!this.nodate) {
    searchOption.max_taken_date=max_date;
    searchOption.min_taken_date=min_date;
  }

  if(searchtxt!='') {
    searchOption.text=searchtxt;
  }

  var points = [new window.GLatLng(n,e),new window.GLatLng(n,w),new window.GLatLng(s,w),new window.GLatLng(s,e),new window.GLatLng(n,e)];
  flickr.callapi(methodname, searchOption, this, this.search_callback, [points]);
};
BrowseMap.prototype.onzoomend=function(){
  GM_setValue('last_browse_zoom', this.getZoom()+'');

  this.pageCurr=this.pageTotal=1;
  this.refreshView();
};
BrowseMap.prototype.ondragend=function(){
  var lastcenter = this.lastcenter;
  var bound = this.getBounds();
  var center = bound.getCenter();
  var span   = bound.toSpan();
  if(lastcenter) {
    var deltaX  = Math.abs(center.lng() - lastcenter.lng());
    var deltaY  = Math.abs(center.lat() - lastcenter.lat());
    var boundsX = span.lng();
    var boundsY = span.lat();
    if ((deltaX < 0.3*boundsX) && (deltaY < 0.3*boundsY))
      return;
  }

  GM_setValue('last_browse_lat', center.lat()+'');
  GM_setValue('last_browse_lng', center.lng()+'');

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




FGS.init.inited=true;
};


FGS.checkloaded=function() {
  var r=(js_jquery==null && js_gmap==null && $ && window.GMap2);
  if(r) {
    FGS.init();
  } else {
    alert('wait for Flickr GMap Show loading...');
  }
  return r;
};





FGS.launchPhotoMap=function(){
try {
  if(!FGS.checkloaded()) return;

  var win=this.win;
  if(win) {
    var jwin = $(win);
    if(jwin.css('display')!='none') {
      win.f_close();
    } else {
      win.f_open();
    }
    return;
  }

  win=this.win=win_create(516,313);
  win.link=this;
  win.f_max(null);
  $(win).css('position','relative').css('zIndex','1000');
  $('<div style="position:relative;width:0;height:0;"></div>').append(win).appendTo(document.body);
  win.f_open();

  var gmap =win.gmap= new FGS.PhotoMap(win.mapdiv, {photo_id:this.photo_id,win:win});
  gmap.enableDoubleClickZoom();
  gmap.addControl(new window.GSmallMapControl());
  gmap.addControl(new window.GMapTypeControl());
} finally {
  return false;
}
};





FGS.launchBrowseMap=function(){
try {
  if(!FGS.checkloaded()) return;

  var win=this.win;
  if(win) {
    var jwin = $(win);
    if(jwin.css('display')!='none') {
      win.f_close();
    } else {
      win.f_open();
    }
    return;
  }

  win=this.win=win_create(0,0,true);
  win.link=this;
  win.f_max(null);
  $(win).css('position','relative').css('zIndex','1000');
  $('<div style="position:relative;width:0;height:0;"></div>').append(win).appendTo(document.body);
  win.f_open();

  var lat = parseFloat(GM_getValue('last_browse_lat', def_lat));
  var lng = parseFloat(GM_getValue('last_browse_lng', def_lng));
  var zoom = parseInt(GM_getValue('last_browse_zoom', def_zoom));
  
  
  var opt = {win:win};
  if(this.user_id) opt.user_id = this.user_id;
  if(this.group_id) opt.group_id = this.group_id;
  if(this.photoset_id) {
    opt.photoset_id = this.photoset_id;
    opt.notoggle=1;
    opt.nodate=1;
    opt.nosort=1;
  }
  var gmap=win.gmap=new FGS.BrowseMap(win.mapdiv, opt);
  gmap.enableDoubleClickZoom();
  gmap.addControl(new window.GLargeMapControl());
  gmap.addControl(new window.GMapTypeControl());
  gmap.addControl(new window.GOverviewMapControl());
  gmap.setCenter(new window.GLatLng(lat,lng), zoom);
} finally {
  return false;
}};













FGS.registerUnload=function() {
  if(typeof window.GUnload == 'function') {
    if (window.addEventListener) window.addEventListener('unload', window.GUnload, false);
    else if (window.attachEvent) window.attachEvent('onunload', window.GUnload);
  } else {
    setTimeout('window.FGS.registerUnload()', 300);
  }
};


FGS.load_js=function() {
  loadscript(js_jquery,function(){$=window.$;js_jquery=null;});
  loadscript(js_gmap,function(){js_gmap=null;});
};



function autoUpdateFromUserscriptsDotOrg(SCRIPT){
  try {
    if (!GM_getValue) return;
    var DoS_PREVENTION_TIME = 2 * 60 * 1000;
    var isSomeoneChecking = GM_getValue('CHECKING', null);
    var now = new Date().getTime();
    GM_setValue('CHECKING', now.toString());
    if (isSomeoneChecking && (now - parseInt(isSomeoneChecking)) < DoS_PREVENTION_TIME) return;

    // check daily
    var ONE_DAY = 24 * 60 * 60 * 1000;
    var lastChecked = GM_getValue('LAST_CHECKED', null);
    if (lastChecked && (now - lastChecked) < ONE_DAY) return;

    GM_xmlhttpRequest({
      method: 'GET',
      url: SCRIPT.url + '?source', // don't increase the 'installed' count just for update checks
      onload: function(result) {
        if (!result.responseText.match(/@version\s+([\d.]+)/)) return;     // did not find a suitable version header
        var theOtherVersion = parseFloat(RegExp.$1);
        if (theOtherVersion <= parseFloat(SCRIPT.version)) return;      // no updates or older version on userscripts.orge site
        if (window.confirm('A new version ' + theOtherVersion + ' of greasemonkey script "' + SCRIPT.name + '" is available.\nYour installed version is ' + SCRIPT.version + ' .\n\nUpdate now?\n')) {
          GM_openInTab(SCRIPT.url);   // better than location.replace as doing so might lose unsaved data
        }
      }
    });
    GM_setValue('LAST_CHECKED', now.toString());
  } catch (ex) {}
};


FGS.onload=function() {
  var rexp_single_photo =   /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(\/.*)?$/;
  var rexp_set =            /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)(\/.*)?$/;
  var rexp_user_photo =     /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)(\/.*)?$/;
  var rexp_group =          /^http:\/\/www.*\.flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)(\/.*)?$/;
  var rexp_explore =        /^http:\/\/www.*\.flickr\.com\/explore(\/.*)?$/;
  var rexp_photo_map_link = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)\/map(\/.*)?$/;
  var rexp_set_map_link =   /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)\/map(\/.*)?$/;
  var rexp_user_map_link =  /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/map(\/.*)?$/;
  var rexp_group_map_link = /^http:\/\/www.*\.flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)\/map(\/.*)?$/;
  var rexp_world_map_link = /^http:\/\/www.*\.flickr\.com\/map(\/.*)?$/;

  var needload = false;

  autoUpdateFromUserscriptsDotOrg({
    name: scriptname,
    url: installurl,
    version: currVer,
  });


  function preparePhotoMap(p) {
    var lnks = p.getElementsByTagName('a');
    for(var ln in lnks) {
      var maplnk = lnks[ln];
      if(maplnk.href) {
        var ma = rexp_photo_map_link.exec(maplnk.href);
        if(ma&&ma[1]&&ma[2]) {
          needload=true;
          maplnk.photo_id=ma[2];
          maplnk.onclick=FGS.launchPhotoMap;
          break;
        }
      }
    }
  };
  function prepareUserMap(p,isself) {
    var lnks = p.getElementsByTagName('a');
    for(var ln in lnks) {
      var maplnk = lnks[ln];
      if(maplnk.href) {
        var ma = rexp_user_map_link.exec(maplnk.href);
        if(ma&&ma[1]) {
          needload=true;
          if(isself) {
            maplnk.user_id=window.global_nsid;
          } else {
            maplnk.user_id=window.f.w.value;
          }
          maplnk.onclick=FGS.launchBrowseMap;
          break;
        }
      }
    }
  };
  function prepareWorldMap(p) {
    var lnks = p.getElementsByTagName('a');
    for(var ln in lnks) {
      var maplnk = lnks[ln];
      if(maplnk.href && rexp_world_map_link.exec(maplnk.href)) {
        needload=true;
        maplnk.onclick=FGS.launchBrowseMap;
        break;
      }
    }
  };
  function prepareGroupMap(p) {
    var lnks = p.getElementsByTagName('a');
    for(var ln in lnks) {
      var maplnk = lnks[ln];
      if(maplnk.href) {
        var ma = rexp_group_map_link.exec(maplnk.href);
        if(ma&&ma[1]) {
          needload=true;
          maplnk.group_id=window.f.w.value;
          maplnk.onclick=FGS.launchBrowseMap;
          break;
        }
      }
    }
  };
  function prepareSetMap(p) {
    var lnks = p.getElementsByTagName('a');
    for(var ln in lnks) {
      var maplnk = lnks[ln];
      if(maplnk.href) {
        var ma = rexp_set_map_link.exec(maplnk.href);
        if(ma&&ma[1]&&ma[2]) {
          needload=true;
          maplnk.photoset_id=ma[2];
          maplnk.onclick=FGS.launchBrowseMap;
          break;
        }
      }
    }
  };


  var urls=null;
  if((urls = rexp_single_photo.exec(window.location.href))&&urls[1]&&urls[2]) {
    var maplnk = document.getElementById('a_link_to_map');
    var edtlnk = document.getElementById('a_place_on_map_old');
    if(maplnk) {
      needload=true;
      maplnk.photo_id=urls[2];
      maplnk.onclick=FGS.launchPhotoMap;
    }
    if(edtlnk) {
      needload=true;
      edtlnk.photo_id=urls[2];
      edtlnk.onclick=FGS.launchPhotoMap;
    }
  }else if((urls = rexp_set.exec(window.location.href))&&urls[1]&&urls[2]) {
    var paras = document.getElementsByTagName('p');
    for(var p in paras) {
      if(paras[p].className == 'Links') prepareSetMap(paras[p]);
    }
  }else if((urls = rexp_user_photo.exec(window.location.href))&&urls[1]) { 
    var paras = document.getElementsByTagName('p');
    for(var p in paras) {
      if(paras[p].className == 'Do') preparePhotoMap(paras[p]);
      if(paras[p].className == 'Links') prepareUserMap(paras[p]);
    }
  }else if(urls = rexp_explore.exec(window.location.href)) {
    var main = document.getElementById('Main');
    prepareWorldMap(main);
  }else if((urls = rexp_group.exec(window.location.href))&&urls[1]) {
    var paras = document.getElementsByTagName('p');
    for(var p in paras) {
      if(paras[p].className == 'Links') prepareGroupMap(paras[p]);
    }
  }


  var menu_you = document.getElementById('candy_nav_menu_you');
  prepareUserMap(menu_you,true);

  var menu_explore = document.getElementById('candy_nav_menu_explore');
  prepareWorldMap(menu_explore);

  if(needload) {
    document.write(FGS_STYLE);
    FGS.load_js();
    FGS.registerUnload();
  }
};

FGS.onload();

})();
