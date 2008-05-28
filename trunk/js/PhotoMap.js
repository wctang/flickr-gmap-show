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
