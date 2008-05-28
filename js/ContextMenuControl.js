// ContextMenuControl

CSS_STYLE+=
'div.flickrgmapshow div.contextmenu {background-color:white; padding:3px; border:1px solid black; } '+
'div.flickrgmapshow div.contextmenu a {cursor:pointer;} ';

var ContextMenuControl=function(onOpenHandler){
	this.$menu=$('<div class="contextmenu" style="display:none;"></div>');
	this.onOpen=onOpenHandler;
};
ContextMenuControl.prototype=new google.maps.Control();
ContextMenuControl.prototype.getDefaultPosition=function(){ return new google.maps.ControlPosition(google.maps.ANCHOR_TOP_LEFT, new google.maps.Size(0, 0)); };
ContextMenuControl.prototype.initialize=function(map){
	this.$menu.appendTo(map.getContainer());

	var ctrl=this;
	google.maps.Event.addListener(map, 'click', function() {
		ctrl.$menu.hide();
	});

	google.maps.Event.addListener(map, 'singlerightclick', function(point, src, overlay) {
		if(ctrl.onOpen) {
			if(!ctrl.onOpen(point, src, overlay)) { return; }
		}

		ctrl.$menu.show();
		var menuw=ctrl.$menu.width();
		var menuh=ctrl.$menu.height();
		var x=point.x;
		var y=point.y;
		var size=this.getSize();
		if (x > size.width-menuw-3) { x = size.width-menuw-3; }
		if (y > size.height-menuh-3) { y = size.height-menuh-3; }

		ctrl.$menu.tgt={pos:point, target:src, overlay:overlay};

		new google.maps.ControlPosition(google.maps.ANCHOR_TOP_LEFT, new google.maps.Size(x,y)).apply(ctrl.$menu.get(0));
	});

	return this.$menu.get(0);
};
ContextMenuControl.prototype.addItem=function(str,fn){
	var $menu=this.$menu;
	var item=$('<a>'+str+'</a>').click(function(){ $menu.hide(); fn($menu.tgt.pos, $menu.tgt.target, $menu.tgt.overlay); }).get(0);
	$menu.append(item);
	$menu.append('<br>');
};
