function load_history() {
	var searchhistory=[];
	for(var i=0; i<10; ++i) {
		var h=GM_getValue('history_'+i, null);
		if(!h) { continue; }
		if(!(/^\((\-?\d+\.\d+)\,(\-?\d+\.\d+)\,(\d+)\)(.*)?$/).exec(h)) { continue; }
		var lat=RegExp.$1,lng=RegExp.$2,zoom=RegExp.$3,n=RegExp.$4;
		searchhistory[i]={lat:lat,lng:lng,zoom:zoom,text:n};
	}
	return searchhistory;
}

// create_mapwindow

var shadwbkgnd = 'background:transparent url('+imgdir+'shadow-main.png) no-repeat scroll ';
CSS_STYLE+=
'div.flickrgmapshow {font:14px arial; text-align:left;} '+
'div.flickrgmapshow table.shadow {position:absolute;width:100%;height:100%;left:6px;top:6px;border-collapse:collapse;border:0;} '+
'div.flickrgmapshow table.shadow td.br {border:0;             '+shadwbkgnd+' bottom right;} '+
'div.flickrgmapshow table.shadow td.bl {border:0;width:10px;  '+shadwbkgnd+' left bottom;} '+
'div.flickrgmapshow table.shadow td.top{border:0;height:12px; '+shadwbkgnd+' right top;} '+
'div.flickrgmapshow div.main {border:solid 2px #EEEEEE; background-color:white; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
// in main
'div.flickrgmapshow span.title {} '+
'div.flickrgmapshow div.mask {background-color:black; opacity:.75;-moz-opacity:.75;filter:alpha(opacity=75);} '+
'div.flickrgmapshow div.mask div {position:relative;float:left;top:50%;margin-top:-16px;left:50%;margin-left:-16px;} '+
'div.flickrgmapshow div.search,div.about {background-color:white;border:solid 1px black; border-radius:9px;-moz-border-radius:9px;-webkit-border-radius:9px;} '+
'div.flickrgmapshow span.address {background-color:white;} '+
'div.flickrgmapshow span.address a {text-decoration:none;} '+
'div.flickrgmapshow span.latlng {font:italic 11px arial; cursor:pointer;} ';


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
	}});

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
		var left=ofst.left-(opt.width*0.85);
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
