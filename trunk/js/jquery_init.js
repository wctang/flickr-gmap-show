$.fn.fadeToggle=function(speed, easing, callback) { return this.animate({opacity: 'toggle'}, speed, easing, callback); };
$.setDragable=function(obj,opt, cbmousedown, cbdraging, cbdragend) {
	opt=opt||{};
	var $obj=$(obj);
	$obj.css('cursor','pointer');
	$obj.mousedown(function(e){
		if(obj.disableDrag) { return; }
		obj.dragbegin=true;
		obj.dragposx=e.clientX;
		obj.dragposy=e.clientY;
		if(cbmousedown) { cbmousedown(e); }
	});
	$().mousemove(function(e){
		if(!obj.dragbegin || obj.disableDrag) { return; }
		$obj.css('cursor','move');

		var posx,posy,outx,outy;
		if(opt.direction==='horizontal') {
			posy=0;
		} else {
			posy=e.clientY-obj.dragposy+parseInt($obj.css('top'),10);
			if(opt.boundbyparent) {
				if(posy < 0) {
					posy=0; outy=true;
				} else {
					var dif=$obj.parent().height()-$obj.height();
					if(posydif) { posy=dif;  outy=true; }
				}
			}
		}

		if(opt.direction==='vertical') {
			posx=0;
		} else {
			posx=e.clientX-obj.dragposx+parseInt($obj.css('left'),10);
			if(opt.boundbyparent) {
				if(posx < 0) {
					posx=0; outx=true;
				} else {
					var dif2=$obj.parent().width()-$obj.width();
					if(posx>dif2) { posx=dif2;  outx=true; }
				}
			}
		}
		if(!outx) { obj.dragposx=e.clientX; }
		if(!outy) { obj.dragposy=e.clientY; }

		$obj.css({'top':posy,'left':posx});
		if(cbdraging) { cbdraging(e,obj); }
	}).mouseup(function(e){
		if(!obj.dragbegin || obj.disableDrag) { return; }
		$obj.css('cursor','pointer');
		obj.dragbegin=false;
		if(cbdragend) { cbdragend(e,obj); }
	});
};
$.parseDateToStr=function(d){
	var yy=d.getFullYear();
	var mm=d.getMonth()+1;
	var dd=d.getDate();
	return ''+yy+'-'+(mm<10?'0':'')+mm+'-'+(dd<10?'0':'')+dd;
};