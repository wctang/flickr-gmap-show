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
