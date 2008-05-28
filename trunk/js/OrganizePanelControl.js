// OrganizePanelControl
var OrganizePanelControl=function(year, month, sort){
	arguments.callee.superconstructor.apply(this, arguments);

	var ctrl=this;
	var $panel=this.$panel;
	$panel.find('div.toppanel').append(
'<div style="position:absolute;top:30px;left:25px; right:5px; height:20px;">'+
	'<form style="display:inline;">'+
		'<select class="collectselect">'+
			'<option value="none"></option>'+
			'<option value="all" selected="true">'+msg.opt_all+'</option>'+
			'<option value="not_tagged">'+msg.opt_not_tagged+'</option>'+
			'<option value="not_in_set">'+msg.opt_not_in_set+'</option>'+
			'<option value="located">'+msg.opt_located+'</option>'+
			'<option value="not_located">'+msg.opt_not_located+'</option>'+
			'<optgroup class="set" label="'+msg.opt_set+'"></optgroup>'+
			'<optgroup class="group" label="'+msg.opt_group+'"></optgroup>'+
		'</select>'+
	'</form>'+
	'<span class="total" style="margin-left:10px; font-size:12px; font-weight:bold;"></span> '+msg.photos+' :: <span class="selected" style="font-weight:bold;"></span> '+msg.selected+' <span class="clearspan" style="display:none;">| <a class="clearsel" href="javascript:void(0);">'+msg.clearsel+'</a> </span>'+
'</div>');
		$panel.find('a.pp_btn').before(
'<div class="dragagent" style="position:absolute;left:0px;top:0px;height:77px;width:77px; cursor:pointer;">'+
	'<div class="marker" style="display:none; width:79px; height:89px; background:transparent url('+pics.marker_img+') no-repeat scroll left top;">'+
		'<img style="position:absolute; left:2px; top:2px;"></img>'+
		'<span class="info" style="position:absolute; left:5px; top:5px; border:solid 1px gray; background-color:white;"></span>'+
	'</div>'+
'</div>');

	this.flickr_photos_search_onLoad=this.onDataLoaded;
	this.flickr_photos_getUntagged_onLoad=this.onDataLoaded;
	this.flickr_photos_getNotInSet_onLoad=this.onDataLoaded;
	this.flickr_photos_getWithGeodata_onLoad=this.onDataLoaded;
	this.flickr_photos_getWithoutGeodata_onLoad=this.onDataLoaded;
	this.flickr_photosets_getPhotos_onLoad=this.onDataLoaded;
	this.flickr_groups_pools_getPhotos_onLoad=this.onDataLoaded;

	function changeOption() {
		$panel.fadeIn('fast');
		$panel.find('img.selected').removeClass('selected');

		ctrl.photos=[];
		ctrl.photos.show_idx=0;
		ctrl.pagestoload=[];
		ctrl.perpage=0;
		ctrl.total=0;

		ctrl.option={extras:'geo,date_taken',per_page:100,user_id:unsafewin.global_nsid};
		var value = $panel.find('select.collectselect').val();
		if(value=='all') {
			ctrl.method='flickr.photos.search';
		} else if(value=='not_tagged') {
			ctrl.method='flickr.photos.getUntagged';
		} else if(value=='not_in_set') {
			ctrl.method='flickr.photos.getNotInSet';
		} else if(value=='located') {
			ctrl.method='flickr.photos.getWithGeodata';
		} else if(value=='not_located') {
			ctrl.method='flickr.photos.getWithoutGeodata';
		} else if(value.indexOf('option_photoset')===0) {
			ctrl.method='flickr.photosets.getPhotos';
			ctrl.option.photoset_id=value.substr(15);
		} else if(value.indexOf('group')===0) {
			ctrl.method='flickr.groups.pools.getPhotos';
			ctrl.option.group_id=value.substr(5);
		} else {
			return;
		}
		ctrl.loadData(1);
	}
	$panel.find('select.collectselect').change(changeOption);

	$panel.find('a.clearsel').click(function(){
		$panel.find('img.selected').removeClass('selected');
		ctrl.updateSelectionInfo();
	});


	var $dragagent=$panel.find('div.dragagent');
	var dragagent=$dragagent.get(0);
	$dragagent.css({'top':-10000,'left':-10000});

	var currimg=null;
	var selected_ids=[];
	$panel.find('div.contentwrap').mousemove(function(e){
		if(e.target.tagName != 'IMG') return;
		e.stopPropagation();

		currimg=e.target;
		$dragagent.attr('title',$(currimg).attr('title'));
		var divofst=$(e.target).offset();
		var dragofst=$dragagent.offset();
		$dragagent.css({'top':parseInt($dragagent.css('top'),10)+divofst.top-dragofst.top,'left':parseInt($dragagent.css('left'),10)+divofst.left-dragofst.left});
	});

	$dragagent.click(function(e){
		if(!currimg) { return; }

		currimg.drag_state=0;
		$dragagent.css('cursor','pointer');
		if(e.ctrlKey) {
			$(currimg).toggleClass('selected');
		} else {
			var sels=$panel.find('img.selected');
			sels.removeClass('selected');
			if(!(sels.size()==1 && sels.get(0)==currimg)) {
				$(currimg).addClass('selected');
			}
		}

		ctrl.updateSelectionInfo();
	});
	$.setDragable(dragagent,{},function(){
		if(!currimg) return;
		currimg.drag_state=1;
		setTimeout(function(){
			if(currimg.drag_state!=1) return;
			currimg.drag_state=2;

			$dragagent.css('cursor','move');
			$dragagent.find('img').attr('src',currimg.src);

			selected_ids=[];
			if(!$(currimg).hasClass('selected')) {
				selected_ids.push(currimg.photo.id);
			} else {
				$panel.find('img.selected').each(function(){ selected_ids.push(this.photo.id); });
			}

			if(selected_ids.length > 1) {
				$dragagent.find('span.info').text(selected_ids.length + ' photos');
			} else {
				$dragagent.find('span.info').text('');
			}
			$dragagent.find('div.marker').show();
		}, 500);
	},null,function(){
		if(!currimg) return;
		var drag_state=currimg.drag_state;
		currimg.drag_state=0;
		if(drag_state!=2) return;

		$dragagent.find('div.marker').hide();

		var dragofst=$dragagent.offset();
		var ins={x:dragofst.left+40, y:dragofst.top+89};

		var $gmapdom=$(ctrl.gmap.getContainer());
		var gmapofst=$gmapdom.offset();
		var maprect={top:gmapofst.top, left:gmapofst.left, bottom:gmapofst.top+$gmapdom.height(), right:gmapofst.left+$gmapdom.width()};

		var panelofst=$panel.offset();
		var panelrect={top:panelofst.top, left:panelofst.left, bottom:panelofst.top+$panel.height(), right:panelofst.left+$panel.width()};

		if( ins.x>maprect.left && ins.x<maprect.right && ins.y>maprect.top && ins.y<panelrect.top) {
			var latlng = ctrl.gmap.fromContainerPixelToLatLng(new google.maps.Point(ins.x-maprect.left, ins.y-maprect.top));
			var zoom = ctrl.gmap.getZoom();
			flickr.callapi('flickr.photos.geo.setLocation', {photo_ids:selected_ids, lat:latlng.lat(),lon:latlng.lng(),accuracy:zoom}, function(success, responseXML, responseText, params){
				var rsp=eval('(' + responseText + ')');
				if(!rsp||rsp.stat != 'ok') { return; }

				if(ctrl.gmap.refreshView) { ctrl.gmap.refreshView(true); }

				var sel=$panel.find('select.collectselect').val();
				if(sel == 'located' || sel == 'not_located') { changeOption(); }
			});
		}

		var divofst=$(currimg).offset();
		$dragagent.css({'left':parseInt($dragagent.css('left'),10)+divofst.left-dragofst.left, 'top':parseInt($dragagent.css('top'),10)+divofst.top-dragofst.top});
	});


	flickr.callapi('flickr.photosets.getList', {user_id:unsafewin.global_nsid}, function(success, responseXML, responseText, params){
		var rsp=eval('(' + responseText + ')');
		if(!rsp||rsp.stat != 'ok') return;
		for (var i=0,photosets=rsp.photosets.photoset,len=photosets.length,$c=$panel.find('optgroup.set'); i<len; i++) {
			var photoset=photosets[i];
			$c.append('<option value="option_photoset'+photoset.id+'">'+photoset.title._content+' ('+photoset.photos+')</option>');
		}
	});
	flickr.callapi('flickr.people.getPublicGroups', {user_id:unsafewin.global_nsid}, function(success, responseXML, responseText, params){
		var rsp=eval('(' + responseText + ')');
		if(!rsp||rsp.stat != 'ok') return;
		for (var i=0,groups=rsp.groups.group,len=groups.length,$c=$panel.find('optgroup.group'); i<len; i++) {
			var group=groups[i];
			$c.append('<option value="group'+group.nsid+'">'+group.name+'</option>');
		}
	});
	changeOption();
};
extend(OrganizePanelControl, BrowsePanelControl);
OrganizePanelControl.prototype.show=function(isshow){ return; };
OrganizePanelControl.prototype.onPhotoClick=function(){ return; };
OrganizePanelControl.prototype.setPhotos=function(photos){
	this.$panel.find('select.collectselect').val('none');
	BrowsePanelControl.prototype.setPhotos.apply(this,arguments);
	this.$panel.find('img.selected').removeClass('selected');
	this.updateSelectionInfo();
};
OrganizePanelControl.prototype.loadData=function(page){
	if(!this.pagestoload) return;
	if(!this.pagestoload[page-1]) {
		this.option.page=page;
		this.showPhotoLoading(true);
		flickr.callapi(this.method, this.option, this);
		this.pagestoload[page-1] = true;
	}
};
OrganizePanelControl.prototype.updateSelectionInfo=function(){
	this.$panel.find('span.total').text(this.total);
	var sel_num=this.$panel.find('img.selected').size();
	this.$panel.find('span.selected').text(sel_num);
	if(sel_num) { this.$panel.find('span.clearspan').show();
	} else { this.$panel.find('span.clearspan').hide(); }
};
OrganizePanelControl.prototype.onDataLoaded=function(success, responseXML, responseText, params){ try {
	var rsp=eval('(' + responseText + ')');
	if(!rsp||rsp.stat != 'ok') return;

	var phs=rsp.photos||rsp.photoset;

	var currPage=parseInt(phs.page,10)-1;
	this.perpage=parseInt(phs.perpage||phs.per_page,10);
	this.total=parseInt(phs.total,10)||0;

	this.updateSelectionInfo();

	var owner=unsafewin.global_nsid;
	var ownername=unsafewin.global_name;
	var buddy_url=unsafewin.global_icon_url;
	var tmp_photos=[];
	flickr.parse(tmp_photos, rsp, false, owner, ownername, buddy_url);

	this.prepareImage(currPage*this.perpage, tmp_photos);

	this.slide(0);
} finally { this.showPhotoLoading(false); }
};
