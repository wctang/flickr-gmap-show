var picasa={
	name:'picasa',
	check: function(rsp) { return true; },
	parseCurrPage: function(rsp) { return 0; }, // TODO
	parseTotalPage: function(rsp) { return Math.ceil(parseInt(rsp.feed.gphoto$crowded_length.$t,10)/PER_PAGE); },
	parse: function(photos,rsp) {
		if(!rsp.feed.entry) { return; }
		for (var i=0,len=rsp.feed.entry.length; i<len; i++) {
			var p=rsp.feed.entry[i];
			var w=p.georss$where.gml$Point.gml$pos.$t.split(/\s+/);
			w[0]=parseFloat(w[0]); w[1]=parseFloat(w[1]);
			if(!w[0] && !w[1]) { continue; }

			var pp={api:picasa, id:parseInt(p.gphoto$id,10), title:p.title.$t, pos:new google.maps.LatLng(w[0],w[1]), accuracy:12, linkurl:p.link[1].href, content:p.content.src, owner:p.author[0].name.$t, owner_url:p.author[0].uri.$t, buddyurl:p.author[0].gphoto$thumbnail.$t, date:p.published.$t};
			photos.push(pp);
		}
	},
	gettitle: function(photo) {return photo.title;},
	smalliconurl: function(photo) { return photo.content+'?imgmax=32&crop=1'; },
	iconurl: function(photo) { return photo.content+'?imgmax=72&crop=1'; },
	thumburl: function(photo) { return ''; },
	smallurl: function(photo) { return photo.content+'?imgmax=200'; }, // or 288
	mediumurl: function(photo) { return ''; },
	largeurl: function(photo) { return ''; },
	pageurl: function(photo) { return photo.linkurl; },
	placeurl: function(placeid) { return ''; },
	owner: function(photo) { return photo.owner; },
	ownerurl: function(photo) { return photo.owner_url; },
	datetaken: function(photo) { return photo.date; },
	datetakenurl: function(photo) { return ''; },
	dateupload: function(photo) { return ''; },
	dateuploadurl: function(photo) { return ''; },
	buddyurl: function(photo) { return photo.buddyurl; },
	licensestr: function(photo) { return ''; },
	_url: function(args, sign) {
		var url = 'http://picasaweb.google.com/data/feed/api/all?kind=photo&';
		var keys = [];
		for (var arg in args) { if(args.hasOwnProperty(arg)) {
			if(arg.charAt(0)==='_') continue;
			keys.push(arg);
		}}
		keys.sort();

		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			var v = args[k];
			url = url + (i>0?'&':'') + escape(k) + '=' + escape(v);
		}
		return url;
	},
	callapi: function(methodname, searchopts, obj) {
		var cb_id='cb'+this.name+(new Date()).getTime();
		searchopts._api=picasa;
		searchopts.alt='json-in-script';
		searchopts.callback=cb_id;
		window[cb_id]=function(rsp){obj[methodname.replace(/\./g,'_')+'_onLoad'].call(obj,true,null,rsp,searchopts); window[cb_id]=null; $('script#'+cb_id).remove();};
		loadscript(this._url(searchopts), cb_id);
	}
};
