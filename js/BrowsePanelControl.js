var BrowsePanelControl=function(year, month, sort){
	this.default_year=year||'lastweek';
	this.default_month=month||'all';
	this.default_sort=sort||'interestingness-desc';
	this.pageCurr=1;
	this.pageTotal=1;
	arguments.callee.superconstructor.apply(this, arguments);

	var ctrl=this;
	var $panel=this.$panel;
	var $pagebar=$panel.find('div.pagebar');

	var nowy = new Date().getFullYear();
	$panel.find('a.updnbtn').before(
'<div class="searchoption" style="position:absolute; top:-90px; height:90px; left:0px; width:400px; background-color:white; display:none;">'+
	'<div style="margin:5px;">'+msg.date_date+': '+
		'<select class="year_select">'+
			'<option value="lastweek">'+msg.date_lastweek+'</option>'+
			'<option value="yesterday">'+msg.date_yesterday+'</option>'+
			'<option value="lastmonth">'+msg.date_lastmonth+'</option>'+
			'<option value="all">'+msg.date_all+'</option>'+
			'<option value="'+(nowy-0)+'">'+(nowy-0)+'</option><option value="'+(nowy-1)+'">'+(nowy-1)+'</option>'+
			'<option value="'+(nowy-2)+'">'+(nowy-2)+'</option><option value="'+(nowy-3)+'">'+(nowy-3)+'</option>'+
			'<option value="'+(nowy-4)+'">'+(nowy-4)+'</option><option value="'+(nowy-5)+'">'+(nowy-5)+'</option>'+
			'<option value="'+(nowy-6)+'">'+(nowy-6)+'</option><option value="'+(nowy-7)+'">'+(nowy-7)+'</option>'+
			'<option value="'+(nowy-8)+'">'+(nowy-8)+'</option><option value="'+(nowy-9)+'">'+(nowy-9)+'</option>'+
		'</select>'+
		'<span class="date_month_option" style="display:none;"> / '+
			'<select class="month_select">'+
				'<option value="all">'+msg.month_all+'</option>'+
				'<option value="01">01</option><option value="02">02</option>'+
				'<option value="03">03</option><option value="04">04</option>'+
				'<option value="05">05</option><option value="06">06</option>'+
				'<option value="07">07</option><option value="08">08</option>'+
				'<option value="09">09</option><option value="10">10</option>'+
				'<option value="11">11</option><option value="12">12</option>'+
			'</select>'+
			'<span class="date_day_option" style="display:none;"> / '+
				'<select class="day_select">'+
					'<option value="all">'+msg.day_all+'</option>'+
					'<option value="01">01</option><option value="02">02</option><option value="03">03</option><option value="04">04</option>'+
					'<option value="05">05</option><option value="06">06</option><option value="07">07</option><option value="08">08</option>'+
					'<option value="09">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option>'+
					'<option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option>'+
					'<option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option>'+
					'<option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option>'+
					'<option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option>'+
					'<option value="29">29</option><option value="30">30</option><option value="31">31</option>'+
				'</select>'+
			'</span>'+
		'</span>'+
	'</div>'+
	'<div style="margin:5px;">'+msg.sort_sort+': '+
		'<select class="sort_select">'+
			'<option value="interestingness-desc">'+msg.sort_interestingness_desc+'</option>'+
			'<option value="date-taken-desc">'+msg.sort_date_taken_desc+'</option>'+
			'<option value="date-posted-desc">'+msg.sort_date_posted_desc+'</option>'+
			'<option value="relevance">'+msg.sort_relevance+'</option>'+
			'<option value="interestingness-asc">'+msg.sort_interestingness_asc+'</option>'+
			'<option value="date-taken-asc">'+msg.sort_date_taken_asc+'</option>'+
			'<option value="date-posted-asc">'+msg.sort_date_posted_asc+'</option>'+
		'</select>'+
	'</div>'+
	'<div style="margin:5px;"> '+msg.search+': '+
		'<form class="search_form" style="display:inline;">'+
			'<input class="search_text" type="text">'+
			'<input type="submit">'+
		'</form>'+
	'</div>'+
'</div>');

	var pagebar=$pagebar.get(0);
	$.setDragable(pagebar,{direction:'horizontal',boundbyparent:true},null,function(){
		var bw=$pagebar.width();
		var cw=$pagebar.parent().width();
		var lef=parseInt($pagebar.css('left'),10);
		var n = Math.round(lef*(ctrl.pageTotal-1)/(cw-bw));
		ctrl.setInfo((n+1)+' / '+ctrl.pageTotal);
	},function() {
		if(ctrl.pageTotal==1) { return; }
		var bw=$pagebar.width();
		var cw=$pagebar.parent().width();
		var lef=parseInt($pagebar.css('left'),10);
		var pagepos=null;
		if(lef === 0) {
			pagepos=1;
		} else if(lef+bw === cw) {
			pagepos=ctrl.pageTotal;
		} else {
			var n = Math.round(lef*(ctrl.pageTotal-1)/(cw-bw));
			pagepos=n+1;
		}

		if(ctrl.pageCurr===pagepos) { ctrl.setPage(pagepos,null); return; }
		ctrl.setPage(pagepos,null);
		ctrl.gmap.refreshView(true);
	});
	$panel.find('div.pagebartotal').click(function(e) {
		if(pagebar.disableDrag) { return; }
		var ofst=$pagebar.offset();
		var page=ctrl.pageCurr;
		if(e.clientX < ofst.left) {
			if( page <= 1) { return; }
			page--;
		} else if(e.clientX > ofst.left+$pagebar.width()) {
			if( page >= ctrl.pageTotal) { return; }
			page++;
		}
		ctrl.setPage(page,null);
		ctrl.gmap.refreshView(true);
	});

	$panel.find('select.year_select').val(this.default_year);
	$panel.find('select.month_select').val(this.default_month);
	$panel.find('select.sort_select').val(this.default_sort);

	$panel.find('div.searchoption').find('select').change(function() { try {
		if(parseInt($panel.find('select.year_select').val(),10)) {
			$panel.find('span.date_month_option').show();
			if(parseInt($panel.find('select.month_select').val(),10)) {
				$panel.find('span.date_day_option').show();
			} else {
				$panel.find('span.date_day_option').hide();
				$panel.find('select.day_select').val('all');
			}
		} else {
			$panel.find('span.date_month_option').hide();
			$panel.find('select.month_select').val('all');
			$panel.find('select.day_select').val('all');
		}
	} finally { return false; }});
	$panel.find('div.searchoption').find('form').submit(function() { try {
		$panel.find('div.searchoption').fadeToggle();
		ctrl.gmap.changeOption();
	} finally { return false; }});
	$panel.find('a.updnbtn').click(function(){ $panel.find('div.searchoption').fadeToggle(); });
};
extend(BrowsePanelControl, PanelControl);
BrowsePanelControl.prototype.setPage=function(curr,total){
	if(curr !==null) { this.pageCurr=curr; }
	if(total!==null) {
		if(total ===-1) {
			this.pageTotal=-1;
			this.show(false);
		} else if( total >this.pageTotal) {
			this.pageTotal = total;
		}
	}

	var $pagebar=this.$panel.find('div.pagebar');
	if(this.pageTotal === -1) {
		$pagebar.css('left',0);
		this.$panel.find('span.info').text('Loading...');
		$pagebar.get(0).disableDrag=true;
		return;
	}
	if(this.pageTotal === 0) {
		$pagebar.css('left',0);
		this.$panel.find('span.info').text('No photos.');
		$pagebar.get(0).disableDrag=true;
		return;
	}
	if(this.pageTotal === 1) {
		$pagebar.css('left',0);
		this.$panel.find('span.info').text(this.pageCurr+' / '+this.pageTotal);
		$pagebar.get(0).disableDrag=true;
		return;
	}

	$pagebar.get(0).disableDrag=false;
	var bw=$pagebar.width();
	var cw=$pagebar.parent().width();
	$pagebar.css('left',Math.floor((this.pageCurr-1)*(cw-bw)/(this.pageTotal-1)));
	this.$panel.find('span.info').text(this.pageCurr+' / '+this.pageTotal);
};
BrowsePanelControl.prototype.getPageCurr=function(){ return this.pageCurr; };
BrowsePanelControl.prototype.getTime=function(){
	var year=this.$panel.find('select.year_select').val();
	if(year === 'all') {
		return {begin:'1800-01-01 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	} else if(year === 'lastmonth') {
		var d=new Date();
		d.setMonth(d.getMonth()-1);
		return {begin:$.parseDateToStr(d)+' 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	} else if(year === 'lastweek') {
		var d=new Date();
		d.setDate(d.getDate()-7);
		return {begin:$.parseDateToStr(d)+' 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	} else if(year === 'yesterday') {
		var d=new Date();
		d.setDate(d.getDate()-1);
		return {begin:$.parseDateToStr(d)+' 00:00:00', end:$.parseDateToStr(new Date())+' 23:59:59'};
	}

	// year is number
	var month=this.$panel.find('select.month_select').val();
	if(month === 'all') {
		return {begin:year+'-01-01', end:year+'-12-31 23:59:59'};
	}

	var day=this.$panel.find('select.day_select').val();
	if(day === 'all') {
		return {begin:year+'-'+month+'-01', end:year+'-'+month+'-31 23:59:59'};
	}
	
	return {begin:year+'-'+month+'-'+day, end:year+'-'+month+'-'+day+' 23:59:59'};
};
BrowsePanelControl.prototype.getSort=function(){ return this.$panel.find('select.sort_select').val(); };
BrowsePanelControl.prototype.getSearchText=function(){ return $.trim(this.$panel.find('input.search_text').val()); };
