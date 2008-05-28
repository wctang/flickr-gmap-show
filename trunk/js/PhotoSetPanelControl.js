
var PhotoSetPanelControl=function(){
	arguments.callee.superconstructor.apply(this, arguments);
	var ctrl=this;
	var $panel=this.$panel;
	var $pagebar=$panel.find('div.pagebar');

	$panel.find('a.updnbtn').get(0).className='trkbtn';
	$pagebar.width(300);
	$panel.find('a.trkbtn').click(function(){ if(ctrl.gmap) { ctrl.gmap.tracking_toggle(); } });
};
extend(PhotoSetPanelControl, PanelControl);
