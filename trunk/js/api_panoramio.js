var panoramio={
	name:'panoramio',
	check: function(rsp) { return true; },
	parseCurrPage: function(rsp) { return 0; }, // TODO
	parseTotalPage: function(rsp) { return Math.ceil(rsp.count/PER_PAGE); },
	parse: function(photos,rsp) {
		for (var i=0,len=rsp.photos.length; i<len; i++) {
			var photo=rsp.photos[i];
			var lat=parseFloat(photo.latitude);
			var lon=parseFloat(photo.longitude);
			if(!lat && !lon) { continue; }

			photo.pos=new google.maps.LatLng(lat, lon);
			photo.accuracy=12;
			photo.api=panoramio;
			photos.push(photo);
		}
	},
	gettitle: function(photo) { return photo.photo_title; },
	smalliconurl: function(photo) { return 'http://static.bareka.com/photos/mini_square/'+photo.photo_id+'.jpg'; }, //mini_square:32x32
	iconurl: function(photo) { return 'http://static.bareka.com/photos/square/'+photo.photo_id+'.jpg'; }, //square:60x60
	thumburl: function(photo) { return 'http://static.bareka.com/photos/thumbnail/'+photo.photo_id+'.jpg'; }, //thumbnail:max100
	smallurl: function(photo) { return 'http://static.bareka.com/photos/small/'+photo.photo_id+'.jpg'; }, //small:max240
	mediumurl: function(photo) { return 'http://static.bareka.com/photos/medium/'+photo.photo_id+'.jpg'; },  //medium:max500
	largeurl: function(photo) { return 'http://static.bareka.com/photos/original/'+photo.photo_id+'.jpg'; }, //original
	pageurl: function(photo) { return photo.photo_url; },
	placeurl: function(placeid) { return ''; },
	owner: function(photo) { return photo.owner_name; },
	ownerurl: function(photo) { return photo.owner_url; },
	datetaken: function(photo) { return photo.upload_date; },
	datetakenurl: function(photo) { return ''; },
	dateupload: function(photo) { return ''; },
	dateuploadurl: function(photo) { return ''; },
	buddyurl: function(photo) { return null; },
	licensestr: function(photo) { return ''; },
	_url: function(args, sign) {
		var url = 'http://www.panoramio.com/map/get_panoramas.php?';
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
		searchopts._api=panoramio;
		searchopts.callback=cb_id;
		window[cb_id]=function(rsp){obj[methodname.replace(/\./g,'_')+'_onLoad'].call(obj,true,null,rsp,searchopts); window[cb_id]=null; $('script#'+cb_id).remove();};
		loadscript(this._url(searchopts), cb_id);
	}
};
