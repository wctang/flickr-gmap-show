function loadscript(jspath,id,loaded) {
	var s=document.createElement('script');
	s.setAttribute('type','text/javascript');
	s.setAttribute('src',jspath);
	if(id) { s.id = id; }
	if(loaded) {
		s.addEventListener('readystatechange', function(){if(this.readyState==='complete') { loaded(); }}, false);
		s.addEventListener('load', loaded, false);
	}
	document.getElementsByTagName('head')[0].appendChild(s);
}
