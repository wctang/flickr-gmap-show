var document_write_old = unsafedoc.write;
unsafedoc.write = function(str) {
	if(str.indexOf('<script ')>=0){
		var f = str.indexOf('src="')+5;
		var src = str.substring(f,str.indexOf('"',f));
		loadscript(src);
	} else if(str.indexOf('<style ')>=0) {
		var sty = document.createElement('style');
		sty.setAttribute('type', 'text/css');
		var s = str.indexOf('media="');
		if(s>0) { sty.setAttribute('media', str.substring(s+7,str.indexOf('"',s+7))); }
		str=str.replace(/<style.*">/,'').replace(/<\/style>/,'');
		if(sty.styleSheet) { sty.styleSheet.cssText = str;  // ie
		} else { sty.appendChild(document.createTextNode(str)); }
		document.getElementsByTagName('head')[0].appendChild(sty);
	} else {
		document_write_old(str);
	}
};
