var geocode={
	accuracytozoom:[3,5,7,9,11,13,14,15,16],
	search:function(obj,callback,str) {
		var path = 'http://maps.google.com/maps/geo?key=ABQIAAAAtOjLpIVcO8im8KJFR8pcMhQjskl1-YgiA_BGX2yRrf7htVrbmBTWZt39_v1rJ4xxwZZCEomegYBo1w&q='+encodeURI(str);
		GM_xmlhttpRequest({method: 'GET', url: path, onload: function(result){callback.call(obj,result);}});
	}
};
