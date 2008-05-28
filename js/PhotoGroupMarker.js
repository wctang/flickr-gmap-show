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

