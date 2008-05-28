// BrowseMap : PhotosMap
var BrowseMap=function(container, opts){
	arguments.callee.superconstructor.apply(this, arguments);
	this.win=opts.win;
	if(opts.win) { opts.win=this; }
	this.user_id=opts.user_id;
	this.group_id=opts.group_id;
	this.fullrange=opts.fullrange;
	this.hotplace=opts.hotplace;
	this.disable_refresh=false;
	this.lastcenter=null;
	this.suspenddragevent=false;
	this.delay_loading=2000;
	this.currSelectMarker=null;


	this.addMapType(google.maps.PHYSICAL_MAP);
	this.addControl(new google.maps.HierarchicalMapTypeControl());
	this.addControl(new google.maps.LargeMapControl());
	this.addControl(new google.maps.OverviewMapControl());

	if(opts.panelctrl) {
		this.setPanelControl(opts.panelctrl);
		this.addControl(opts.panelctrl);
	}

	this.getPanelControl().setPage(1,-1); // loading...

	if(opts.contextMenu) {
		this.contextMenu=opts.contextMenu;
		this.addControl(this.contextMenu);
	}
	

	google.maps.Event.addListener(this, 'zoomend', function() {
		if(this.setAddressHash) { this.setAddressHash(); }
		this.clearOverlays();
		this.getPanelControl().setPage(1,-1); // loading
		this.refreshView();
	});
	google.maps.Event.addListener(this, 'dragend', function() {
		if(this.suspenddragevent) { return; }
		if(this.setAddressHash) { this.setAddressHash(); }
		var lastcenter=this.lastcenter;
		var bound=this.getBounds();
		var center=bound.getCenter();
		var span=bound.toSpan();
		if(lastcenter) {
			var dx  = Math.abs(center.lng() - lastcenter.lng());
			var dy  = Math.abs(center.lat() - lastcenter.lat());
			if ((dx < 0.15*span.lng()) && (dy < 0.15*span.lat())) { return; }
		}
		this.getPanelControl().setPage(1,-1); // loading
		this.refreshView();
	});

	this.loadLocation();

	//flickr.callapi('flickr.tags.getHotPlaceTags', {start:'2008-3-14 00:00:00',days:7,count:60}, function(success, responseXML, responseText, params){
	//	var rsp = eval('('+responseText+')');
	//	console.log(rsp);
	//});
};
extend(BrowseMap, PhotosMap);
BrowseMap.prototype.refreshView=function(nodelay, timestamp){
	if(this.disable_refresh) { return; }
	if(!timestamp) {
		this.search_timestamp = new Date().getTime();
		timestamp = this.search_timestamp;
	}
	if(this.search_timestamp !== timestamp) { return; }

	if(!nodelay) {
		var gmap = this;
		setTimeout( function() { gmap.refreshView(true, timestamp); }, this.delay_loading);
		return;
	}

	this.lastcenter = this.getCenter();
	this.saveLocation();


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
		if(w > 180) { w-=360; }
		if(e <= -180) { e+=360; }
		if(e < w) {
			if((180+e) > (180-w)) { w=-180;
			} else { e=180; }
		}
	}

	//var points = [new gobj.GLatLng(n,e),new gobj.GLatLng(n,w),new gobj.GLatLng(s,w),new gobj.GLatLng(s,e),new gobj.GLatLng(n,e)];
	//this.addOverlay(new gobj.GPolyline(points, '#0000FF', 1, .3));

	var pageCurr=this.getPanelControl().getPageCurr();
	var searchOption={extras:'geo,date_upload,date_taken,owner_name,icon_server,license', per_page:PER_PAGE, page:pageCurr, accuracy:1};
	searchOption.bbox=w+','+s+','+e+','+n;
	searchOption.sort=this.getPanelControl().getSort();

	if(this.user_id) searchOption.user_id=this.user_id;
	if(this.group_id) searchOption.group_id=this.group_id;

	var t = this.getPanelControl().getTime();
	if(t.begin) { searchOption.min_taken_date=t.begin; }
	if(t.end) { searchOption.max_taken_date=t.end; }

	var searchtxt = this.getPanelControl().getSearchText();
	if(!!searchtxt) { searchOption.text=searchtxt; }

	searchOption._search_timestamp=this.search_timestamp;
	flickr.callapi('flickr.photos.search', searchOption, this);
	this.getPanelControl().showPageLoading(true,flickr);

	if(this.doAdditionalSearch) { this.doAdditionalSearch(w,s,e,n); }
};
BrowseMap.prototype.flickr_photos_search_onLoad=function(success, responseXML, response, params){
	if(this.search_timestamp !== params._search_timestamp) { return; }
	var api=params._api;
try {
	var rsp= (typeof(response)==='string') ? eval('(' + response + ')') : response;
	if(!api.check(rsp)) { return; }

	var total = api.parseTotalPage(rsp);
	api.lastTotal = total;
	this.getPanelControl().setPage(null, total);

	if(!this.photos.search_timestamp || this.photos.search_timestamp!==this.search_timestamp) {
		this.photos=[]; // clear previous photo data
		this.photos.search_timestamp=this.search_timestamp;
	}

	api.parse(this.photos,rsp);

	this.clearOverlays();

	var pgroups=this.groupPhotos();
	this.showPhotoGroups(pgroups);
} finally {
	this.getPanelControl().showPageLoading(false,api);
}};
BrowseMap.prototype.changeOption=function(){
try{
	this.getPanelControl().setPage(1,-1); // loading
	this.refreshView(true);
} finally { return false;
}};
