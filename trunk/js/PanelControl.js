// PanelControl
CSS_STYLE+=
'div.flickrgmapshow div.panelwrapper div.background {background-color:white; opacity:.75;-moz-opacity:.75;filter:alpha(opacity=75);} '+
'div.flickrgmapshow div.panelwrapper div.content img {top:6px; width:75px; height:75px; cursor:pointer; border:1px solid gray; background:transparent url('+pics.loading+') no-repeat scroll right bottom; } '+
'div.flickrgmapshow div.panelwrapper div.content img.selected {top:1px; border-bottom:3px solid #FF8888;} '+
'div.flickrgmapshow div.panelwrapper div.barloading {background:transparent url('+pics.bar_loading+') repeat-x scroll left top;} '+
'div.flickrgmapshow div.panelwrapper.small div.content img { margin-left:20px; width:32px; height:32px; } '+
'div.flickrgmapshow div.panelwrapper div.smallshow img {background:transparent url('+pics.loading+') no-repeat scroll center center; } ';

var PanelControl=function(){
	this.wait={};

	this.imgs=[];
	this.photos=null;

	var panelstr=
'<div class="panelwrapper" style="right:130px;height:150px;">'+
	'<div class="background" style="position:absolute;top:0px;right:0px;bottom:0px;left:0px;"></div>'+
	'<div class="toppanel">'+
		'<a class="updnbtn" title="Search Option..." style="position:absolute;top:5px;left:5px;"></a>'+
		'<div class="pagebarctnr" style="position:absolute;top:5px;left:25px;right:5px; height:15px; overflow:hidden;">'+
			'<div class="pagebartotal" style="position:absolute; left:0px;right:0px; top:2px; bottom:2px; background-color:#DDDDDD; cursor:pointer;"></div>'+
			'<div class="pagebar" style="position:relative; height:15px; width:120px; text-align:center; line-height:15px; background-color:#8888FF;"><span class="info" style="font:14px arial;">Loading...</span></div>'+
		'</div>'+
	'</div>'+
	'<div class="smallshow" style="position:absolute;width:250px;height:260px;left:0px;bottom:60px; display:none; background-color:white;">'+
		'<a class="closebtn" style="position:absolute;right:3px;top:3px;" title="'+msg.close+'"></a>'+ // close btn
		'<img class="smallshowimg" style="margin:15px 5px 5px 5px; width:240px; height:240px;"></img>'+
	'</div>'+
	'<div class="subpanel" style="position:absolute; left:0px;right:0px;bottom:0px;height:100px; overflow:hidden;">'+
		'<div style="position:absolute;left:26px;right:26px; top:5px;height:10px; overflow:hidden; display:none;">'+
			'<div class="progresstotal" style="position:absolute; left:0px;right:0px; top:2px; bottom:2px; background-color:#DDDDDD; cursor:pointer;"></div>'+
			'<div class="progressbar" style="position:relative; height:10px; background-color:#8888FF;"></div>'+
		'</div>'+
		'<div class="contentwrap" style="position:absolute;left:26px;right:26px;top:15px;height:85px; overflow:hidden;">'+
			'<div class="content" style="position:absolute;top:0px; height:85px; overflow:hidden;"></div>'+
		'</div>'+
		'<a class="pp_btn" style="position:absolute;left:0px;top:63px;" title="'+msg.pagefrst+'"></a>'+
		'<a class="p_btn" style="position:absolute;left:0px;top:15px;" title="'+msg.pageprev+'"></a>'+
		'<a class="r_btn" style="position:absolute;right:0px;top:15px;" title="'+msg.pagenext+'"></a>'+
		'<a class="rr_btn" style="position:absolute;right:0px;top:63px;" title="'+msg.pagelast+'"></a>'+
	'</div>'+
'</div>';
	var $panel=$(panelstr);
	this.$panel=$panel;

	var ctrl=this;

	$panel.find('a.pp_btn').click(function(){ ctrl.slide(-Infinity); });
	$panel.find('a.p_btn' ).click(function(){ ctrl.slide(-1); });
	$panel.find('a.r_btn') .click(function(){ ctrl.slide(1); });
	$panel.find('a.rr_btn').click(function(){ ctrl.slide(Infinity); });

	var $progressbar=$panel.find('div.progressbar');
	var progressbar=$progressbar.get(0);
	$.setDragable(progressbar,{direction:'horizontal',boundbyparent:true},null,null,function(e) {
		var bw=$progressbar.width();
		var cw=$progressbar.parent().width();
		var lef=parseInt($progressbar.css('left'),10);
		if(lef === 0 && lef+bw === cw) { return;
		} else if(lef === 0) { ctrl.slide(-Infinity);
		} else if(lef+bw === cw) { ctrl.slide(Infinity);
		} else { ctrl.slide(0, lef, bw, cw); }
	});
	$panel.find('div.progresstotal').click(function(e) {
		var ofst=$progressbar.offset();
		if(e.clientX < ofst.left) {
			ctrl.slide(-1);
		} else if(e.clientX > ofst.left+$progressbar.width()) {
			ctrl.slide(1);
		}
	});


	$panel.find('div.smallshow').find('a.closebtn').click(function(){
		$panel.find('div.smallshow').fadeOut();
	});	

	// click photo...
	$panel.find('div.content').click(function(e){
		if(e.target.tagName != 'IMG') return;
		e.stopPropagation();
		ctrl.onPhotoClick(e.target);
	});
};
PanelControl.prototype=new google.maps.Control();
PanelControl.prototype.getDefaultPosition=function(){ return new google.maps.ControlPosition(google.maps.ANCHOR_BOTTOM_LEFT, new google.maps.Size(10, 15)); };
PanelControl.prototype.initialize=function(map){
	this.gmap=map;
	var panel=this.$panel.get(0);
	map.getContainer().appendChild(panel);
	this.show(false);
	return panel;
};
PanelControl.prototype.show=function(isshow){
	if($(this.gmap.getContainer()).height() < 450) {
		this.$panel.addClass('small');
	} else {
		this.$panel.removeClass('small');
	}
	if(isshow) {
		this.$panel.find('div.toppanel').hide();
		if(this.$panel.hasClass('small')) {
			this.$panel.find('div.subpanel').height(60).show();
			this.$panel.animate({'height':60});
		} else {
			this.$panel.find('div.subpanel').height(100).show();
			this.$panel.animate({'height':100});
		}
	} else {
		this.$panel.find('div.toppanel').show();
		this.$panel.find('div.subpanel').hide();
		this.$panel.animate({'height':25});
		this.$panel.find('div.smallshow').find('a.closebtn').click();
	}
};
PanelControl.prototype.setPhotos=function(photos){
	this.pagestoload=null; // disable more loading
	this.photos=photos;
	photos.show_idx=photos.show_idx||0;
	photos.sel_idx=photos.sel_idx||0;

	this.total=photos.length;

	if(photos.length > 1) {
		this.show(true);
	}

	this.prepareImage(0, photos);

	this.slide(0);

	this.onPhotoClick(this.imgs[photos.sel_idx]);
};
PanelControl.prototype.prepareImage=function(startidx,photos){
	var content=this.$panel.find('div.content').width(this.total*79).get(0);
	for(var i=0; i<photos.length; ++i) {
		var idx=startidx+i;
		var photo=photos[i];
		var img=this.imgs[idx];
		if(!img) {
			img=this.imgs[idx]=$('<img style="position:absolute;"></img>').css('left',idx*79+1).appendTo(content).get(0);
			img.idx=idx;
		}
		img.photo=photo;
		photo.img=null;
		this.photos[idx]=photo;
		$(img).attr({title:'Loading...',src:pics.marker_trans});
	}
};
PanelControl.prototype.slide=function(dif,left,barwid,bartotal){
	var width_wrap = this.$panel.find('div.contentwrap').width();
	var show_count = parseInt((width_wrap+78)/79,10);
	var rel_count = parseInt(width_wrap/79,10);

	var total_idx = this.total-1;
	var begin_idx = this.photos.show_idx;
	var end_idx=begin_idx;

	switch(dif) {
	case 0:
		if(left!==undefined && barwid!==undefined && bartotal!==undefined) {
			begin_idx = Math.floor(left*(this.total-rel_count)/(bartotal-barwid));
		}
		end_idx=begin_idx+(show_count-1);
		if(end_idx>total_idx) { end_idx=total_idx; }
		break;

	case 1:
		if(total_idx-begin_idx+1 <= rel_count) { return; }

		begin_idx+=rel_count;
		if(total_idx-begin_idx+1 <= rel_count) {
			end_idx=total_idx;
			begin_idx=end_idx-(rel_count-1);
		} else {
			end_idx=begin_idx+(show_count-1);
		}
		break;

	case -1:
		if(begin_idx === 0) { return; }

		begin_idx-=rel_count;
		if(begin_idx <= 0) { begin_idx = 0; }
		end_idx=begin_idx+(show_count-1);
		if(end_idx>total_idx) { end_idx=total_idx; }
		break;

	case Infinity:
		if(total_idx-begin_idx+1 <= rel_count) { return; }

		end_idx=total_idx;
		begin_idx=end_idx-(rel_count-1);
		if(begin_idx<0) { begin_idx=0; }
		break;

	case -Infinity:
		if(begin_idx === 0) { return; }

		begin_idx=0;
		end_idx=begin_idx+(show_count-1);
		if(end_idx>total_idx) { end_idx=total_idx; }
		break;

	default:
		return;
	}
	this.photos.show_idx=begin_idx;

	var isSmall = this.$panel.hasClass('small');

	for(var i=begin_idx; i<=end_idx; ++i) {
		var photo = this.photos[i];
		if(!photo) {
			if(this.loadData) { this.loadData(parseInt(i/this.perpage,10)+1); }
		} else if(!photo.img) {
			photo.img=this.imgs[i];
			var $img=$(photo.img);
			if($img.hasClass('selected')) { photo.img.className='selected';
			} else { photo.img.className=''; }
			var imgsrc = (isSmall) ? photo.api.smalliconurl(photo) : photo.api.iconurl(photo);
			$img.addClass(photo.api.name).attr({title:photo.api.gettitle(photo),src:imgsrc});
		}
	}

	var $progressbarctnr=this.$panel.find('div.progressbar').parent();
	if(this.total <= rel_count) {
		$progressbarctnr.hide();
	} else {
		var bartotalwid=$progressbarctnr.show().width();
		var relbarwid=rel_count/this.total*bartotalwid;
		var mov;
		if(relbarwid < 50 && bartotalwid > 100) {
			mov={width:'50px', left:Math.floor(begin_idx/(this.total-rel_count)*(bartotalwid-50))};
		} else {
			mov={width:Math.floor(rel_count/this.total*bartotalwid), left:Math.floor(begin_idx/this.total*bartotalwid)};
		}
		this.$panel.find('div.progressbar').animate(mov, 'fast');
	}

	this.$panel.find('div.content').animate({left:begin_idx*(-79)},'fast');
	this.$panel.find('div.smallshow').find('a.closebtn').click();
};
PanelControl.prototype.showSmallPhotoPanel=function(img){
	var $smallpanel=this.$panel.find('div.smallshow');
	$smallpanel.find('img.smallshowimg').attr('src',pics.marker_trans);
	$(new Image()).load(function() {
		var loadedimg=this;
		var llft=parseInt($smallpanel.css('left'))-Math.floor(((loadedimg.width+10)-$smallpanel.width())/2);
		if(llft<0) {
			llft=0;
		} else if(llft > $smallpanel.parent().width()-(loadedimg.width+10)) {
			llft = $smallpanel.parent().width()-(loadedimg.width+10);
		}
		$smallpanel.animate({left:llft,width:loadedimg.width+10,height:loadedimg.height+20},function(){
			$smallpanel.find('img.smallshowimg').attr('src',loadedimg.src).css({width:loadedimg.width,height:loadedimg.height});
		});
	}).attr('src',img.photo.api.smallurl(img.photo));

	var $img=$(img);
	var ofst=$img.offset();
	var wid=$img.width();
	var pofst=$smallpanel.parent().offset();
	var panelwid=$smallpanel.width();

	$smallpanel.css('left',Math.floor(ofst.left-pofst.left+wid/2-panelwid/2)).fadeIn();
};
PanelControl.prototype.onPhotoClick=function(img){
	this.photos.sel_idx=img.idx;
	this.$panel.find('img.selected').removeClass('selected');
	var $img=$(img);
	$img.addClass('selected');

	if(this.$panel.hasClass('small')) {
		this.showSmallPhotoPanel(img);
	} else if(this.gmap && this.gmap.onPanelPhotoClick) {
		this.gmap.onPanelPhotoClick(img.idx);
	}
};
PanelControl.prototype.setInfo=function(txt){
	this.$panel.find('span.info').text(txt);
};
PanelControl.prototype.showPageLoading=function(iswaiting,api){
	if(iswaiting) {
		this.wait[api.name]=true;
		this.$panel.find('div.pagebar').get(0).disableDrag=true;
		this.$panel.find('div.pagebartotal').addClass('barloading');
	} else {
		var t=false;
		this.wait[api.name]=false;
		for(var elem in this.wait) { if(this.wait[elem]) { t=true; }}
		if(!t) { this.$panel.find('div.pagebartotal').removeClass('barloading'); }
	}
};
PanelControl.prototype.showPhotoLoading=function(show){
	if(show) { this.$panel.find('div.progresstotal').addClass('barloading');
	} else {   this.$panel.find('div.progresstotal').removeClass('barloading'); }
};
