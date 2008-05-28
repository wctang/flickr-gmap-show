// PhotoSetMap : PhotosMap
var PhotoSetMap=function(container, opts){
	PhotoSetMap.superconstructor.call(this, container, opts);
	this.win=opts.win;
	this.win.gmap=this;
	this.photoset_id=opts.photoset_id;
	this.datetracking=false;

	this.isSetCenter=false;
	this.setCenter(new google.maps.LatLng(0,0), 0);

	this.addMapType(google.maps.PHYSICAL_MAP);
	this.addControl(new google.maps.HierarchicalMapTypeControl());
	this.addControl(new google.maps.LargeMapControl());
	var ctrl = new google.maps.OverviewMapControl();
	this.addControl(ctrl);
	ctrl.hide();

	//var photoSetCtrl = new PhotoSetControl(this.photoset_id);
	//this.addControl(photoSetCtrl);

	var panelctrl=new PhotoSetPanelControl();
	this.setPanelControl(panelctrl);
	this.addControl(panelctrl);

	google.maps.Event.addListener(this, 'zoomend', this.onzoomend);

	this.win.showmask(true);

	var that=this;
	flickr.callapi('flickr.photosets.getInfo', {photoset_id:this.photoset_id}, function(success, responseXML, responseText, params) {
		var rsp=eval('(' + responseText + ')');
		if(!rsp||rsp.stat != 'ok') return;

		that.getPanelControl().setInfo(rsp.photoset.title._content);
	});

	var params={photoset_id:this.photoset_id, extras:'geo,date_upload,date_taken,icon_server,license', per_page:PER_PAGE, page:1};
	flickr.callapi('flickr.photosets.getPhotos', params, this);
	this.getPanelControl().showPageLoading(true,flickr);
};
extend(PhotoSetMap, PhotosMap);
PhotoSetMap.prototype.flickr_photosets_getPhotos_onLoad=function(success, responseXML, responseText, params){
	var pageCurr=0,pageTotal=0;
	var api=flickr;
try {
	var rsp=eval('(' + responseText + ')');
	if(!api.check(rsp)) { return; }

	pageCurr=api.parseCurrPage(rsp);
	pageTotal=api.parseTotalPage(rsp);

	if(pageCurr < pageTotal) {
		var opts={photoset_id:this.photoset_id, extras:'geo,date_upload,date_taken,icon_server,license', per_page:PER_PAGE, page:pageCurr+1};
		flickr.callapi('flickr.photosets.getPhotos', opts, this);
	}

	api.parse(this.photos, rsp, true, rsp.photoset.owner, rsp.photoset.ownername);

	this.regroupphotos();
} finally {
	if(pageCurr >= pageTotal) this.getPanelControl().showPageLoading(false,api);
	this.win.showmask(false);
}};
PhotoSetMap.prototype.regroupphotos=function(){
	if(!this.isSetCenter) {
		this.isSetCenter=true;
		var totalbound = new google.maps.LatLngBounds();
		for (var i=0,len=this.photos.length; i<len; i++) {
			var photo=this.photos[i];
			if(!photo.pos) continue;
			totalbound.extend(photo.pos);
		}
		var zoom = this.getBoundsZoomLevel(totalbound);
		this.setCenter(totalbound.getCenter(), zoom);
		return;
	}

	this.clearOverlays();

	var pgroups=this.groupPhotos();

	if(this.datetracking) {
		pgroups.sort( function(a,b){ if(a.firstdate>b.firstdate) return -1; else return 1;} );
		var trackpoints = [];
		for(var ii=0,lenn=pgroups.length; ii<lenn; ii++) {
			trackpoints.push(pgroups[ii].getCenter());
		}
		this.addOverlay(new google.maps.Polyline(trackpoints)); // TODO disappear if large track points .....
	}

	this.showPhotoGroups(pgroups);
};
PhotoSetMap.prototype.onzoomend=function(){
	this.regroupphotos();
};
PhotoSetMap.prototype.tracking_toggle=function(){
	this.datetracking = !this.datetracking;
	this.regroupphotos();
};
PhotoSetMap.prototype.onSearchResultClicked=function(pos, zoom){
	this.setCenter(pos,zoom);
};
