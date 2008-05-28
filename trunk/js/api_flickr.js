var flickr={
	_api_key: '',
	name:'flickr',
	check: function(rsp) { return (rsp && rsp.stat === 'ok'); },
	parseCurrPage: function(rsp) { var photos=rsp.photos?rsp.photos:rsp.photoset; return parseInt(photos.page,10); },
	parseTotalPage: function(rsp) { var photos=rsp.photos?rsp.photos:rsp.photoset; return parseInt(photos.pages,10); },
	parse: function(photos,rsp,ismustgeo,owner,ownername,buddy_url) {
		var phs=rsp.photos||rsp.photoset;
		for (var i=0,len=phs.photo.length; i<len; i++) {
			var p=phs.photo[i];
			var lat=parseFloat(p.latitude);
			var lng=parseFloat(p.longitude);
			if(ismustgeo && !lat && !lng) { continue; }

			var latlng= ( (lat || lng) ? new google.maps.LatLng(lat, lng) : null);

			photos.push({id:p.id, secret:p.secret, title:p.title, pos:latlng, accuracy:parseInt(p.accuracy,10), api:flickr, dateupload:parseInt(p.dateupload,10), datetaken:p.datetaken, owner:p.owner?p.owner:owner, ownername:p.ownername?p.ownername:ownername, farm:p.farm, server:p.server, iconfarm:p.iconfarm, iconserver:p.iconserver, buddy_url:buddy_url, license:parseInt(p.license,10)});
		}
	},
	gettitle: function(photo) {return photo.title;},
	smalliconurl: function(photo) { return this.iconurl(photo); },
	iconurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_s.jpg';}, //75x75
	thumburl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_t.jpg';}, //max100
	smallurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_m.jpg';}, //max240
	mediumurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';}, //max500
	largeurl: function(photo) {return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_b.jpg';}, //max1024
	pageurl: function(photo) {return 'http://www.flickr.com/photo.gne?id='+photo.id;},
	placeurl: function(placeid) { return 'http://www.flickr.com/places/'+placeid; },
	owner: function(photo) {return photo.ownername || photo.owner;},
	ownerurl: function(photo) {return 'http://www.flickr.com/photos/'+photo.owner+'/';},
	datetaken: function(photo) { return photo.datetaken.substr(0,10); },
	datetakenurl: function(photo) { return 'http://www.flickr.com/photos/'+photo.owner+'/archives/date-taken/'+(flickr.datetaken(photo).replace(/\-/g,'/'))+'/'; },
	dateupload: function(photo) {
		var t=new Date(photo.dateupload*1000), y=t.getFullYear(), m=t.getMonth()+1, d=t.getDate();
		return ''+y+'-'+(m>9?'':'0')+m+'-'+(d>9?'':'0')+d;
	},
	dateuploadurl: function(photo) { return 'http://www.flickr.com/photos/'+photo.owner+'/archives/date-posted/'+(flickr.dateupload(photo).replace(/\-/g,'/'))+'/'; },
	buddyurl: function(photo) {
		if(photo.buddy_url) { return photo.buddy_url; }
		if(photo.iconserver&parseInt(photo.iconserver,10)>0) { return 'http://farm'+photo.iconfarm+'.static.flickr.com/'+photo.iconserver+'/buddyicons/'+photo.owner+'.jpg'; }
		else { return 'http://www.flickr.com/images/buddyicon.jpg'; }
	},
	licensestr: function(photo) {
		switch(photo.license) {
			case 1: return '<a href="http://creativecommons.org/licenses/by-nc-sa/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noncomm_small.gif" alt="Noncommercial" title="Noncommercial"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_sharealike_small.gif" alt="Share Alike" title="Share Alike"></span> Some rights reserved.</a>';
			case 2: return '<a href="http://creativecommons.org/licenses/by-nc/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noncomm_small.gif" alt="Noncommercial" title="Noncommercial"></span> Some rights reserved.</a>';
			case 3: return '<a href="http://creativecommons.org/licenses/by-nc-nd/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noncomm_small.gif" alt="Noncommercial" title="Noncommercial"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noderivs_small.gif" alt="No Derivative Works" title="No Derivative Works"></span> Some rights reserved.</a>';
			case 4: return '<a href="http://creativecommons.org/licenses/by/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"></span> Some rights reserved.</a>';
			case 5: return '<a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_sharealike_small.gif" alt="Share Alike" title="Share Alike"></span> Some rights reserved.</a>';
			case 6: return '<a href="http://creativecommons.org/licenses/by-nd/2.0/" target="_blank"><span><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_attribution_small.gif" alt="Attribution" title="Attribution"><img src="http://l.yimg.com/www.flickr.com/images/cc_icon_noderivs_small.gif" alt="No Derivative Works" title="No Derivative Works"></span> Some rights reserved.</a>';
			default: return '<span style="font-size: 12px;">&copy;</span> All rights reserved';
		}
	},
	_url: function(args, sign) {
		var url = 'http://api.flickr.com/services/rest/?';
		var keys = [];
		for (var arg in args) { if(args.hasOwnProperty(arg)) {
			if(arg.charAt(0)==='_') continue;
			keys.push(arg);
		}}
		keys.sort();

	//	var signature = flickr._secret_key;
		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			var v = args[k];
	//		signature = signature + k + v;
			url = url + (i>0?'&':'') + escape(k) + '=' + escape(v);
		}
	//	if(sign) {
	//    signature = Utilities.MD5(signature);
	//    url = url + '&api_sig='+signature;
	//	}
		return url;
	},
	isGMScript:undefined,
	callapi: function(methodname, searchopts, obj) {
		if(this.isGMScript===undefined) {
			if(window.wrappedJSObject && unsafewin && unsafewin.F && unsafewin.F.API && unsafewin.F.API.callMethod) { this.isGMScript=true;
			} else { this.isGMScript=false; }
		}
		searchopts._api=flickr;
		searchopts.format='json';
		if(this.isGMScript) {
			searchopts.nojsoncallback = '1';
			if(typeof(obj) === 'function') {
				var tmp={};
				tmp[methodname.replace(/\./g,'_')+'_onLoad']=obj;
				obj=tmp;
			}
			unsafewin.F.API.callMethod(methodname, searchopts, obj);
		} else {
			var cb_id='cb'+this.name+(new Date()).getTime();
			searchopts.api_key = flickr._api_key;
			searchopts.method=methodname;
			searchopts.jsoncallback=cb_id;
			window[cb_id]=function(rsp){obj[methodname.replace(/\./g,'_')+'_onLoad'].call(obj,true,null,rsp,searchopts); window[cb_id]=null; $('script#'+cb_id).remove();};
			loadscript(this._url(searchopts), cb_id);
		}
	}
};
