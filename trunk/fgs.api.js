
// utility
function $(e) { return document.getElementById(e); };
function $c(e) { return document.createElement(e); };
function $a(e,a) { return e.getAttribute(a); };
function $dom(s) { var d=$c('div');d.innerHTML=s;return d.firstChild; };
function $extend(subc,basec) { 
    function inheritance(){}; inheritance.prototype=basec.prototype; subc.prototype=new inheritance(); 
    subc.prototype.constructor = subc; subc.prototype.baseConstructor = basec; subc.superClass = basec.prototype;
};
function $cbtn(n, title, href, target) {
    var a = $dom('<a class="btn"><img src="'+imgs[n+'_default']+'"/></a>');
    a.n=n;
    a.onmouseout=function(){ this.firstChild.src = imgs[this.n+'_default'];};
    a.onmouseover=function(){ this.firstChild.src = imgs[this.n+'_hover'];};
    a.onmousedown=function(){ this.firstChild.src = imgs[this.n+'_selected'];};
    a.onmouseup=function(){ this.firstChild.src = imgs[this.n+'_hover'];};
    if(title) a.title=title;
    if(href) a.href=href;
    if(target) a.target=target;
    return a;
}
var icons=[];
function $icon(n) {
    if(n > 100) n = 100;
    if(!icons[n]) {
        var img = new GIcon(null,imgdir + n + ".png");
        if(n < 10) {
            img.iconSize = new GSize(18, 19);
            img.iconAnchor = new GPoint(9, 9);
            img.infoWindowAnchor = new GPoint(9, 9);
        } else if (n < 100) {
            img.iconSize = new GSize(20, 21);
            img.iconAnchor = new GPoint(10, 10);
            img.infoWindowAnchor = new GPoint(10, 10);
        } else {
            img.iconSize = new GSize(26, 27);
            img.iconAnchor = new GPoint(13, 13);
            img.infoWindowAnchor = new GPoint(13, 13);
        }
        icons[n] = img;
    }
    return icons[n];
}


// flickr
flickr = {
_api_key : "ebed0eef1b25b738b1903ef93b8f25ee",
_secret_key : "4260ccd8c3f7837e",
_url : function(args, sign) {
    var url = 'http://api.flickr.com/services/rest/?'
    var signature = flickr._secret_key;
    var keys = [];
    for (var k in args) { keys.push(k); }
    keys.sort();
    for (var i=0; i<keys.length; i++) {
        var k = keys[i];
        var v = args[k];
//        signature = signature + k + v;
        url += (i>0?'&':'') + _esc(k) + '=' + _esc(v);
    }
//    if(sign) {
//        signature = Utilities.MD5(signature);
//        url = url + '&api_sig='+signature;
//    }
    return url;
},
callapi : function(args, obj, callback, sign) {
    args.api_key = flickr._api_key;
    args.format = 'json';
    args.nojsoncallback = '1';
    if (flickr._token) { args.auth_token = flickr._token; }

    _IG_FetchContent(flickr._url(args, sign), function(str) {
        if (!str) return;

        try {
            var rsp = eval('(' + str + ')');
            callback.call(obj, rsp);
        } finally {
            unmask();
        }
    });
},
photourl : function(photo,t) {
    if(!t) return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret;
    else if(t=='.') return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';
    else   return 'http://farm'+photo.farm+'.static.flickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_'+t+'.jpg';
},
pageurl : function(photo) {
    return 'http://www.flickr.com/photo.gne?id='+photo.id;
},
buddyurl : function(photo) {
    if(photo.iconserver&parseInt(photo.iconserver)>0) return 'http://farm'+photo.iconfarm+'.static.flickr.com/'+photo.iconserver+'/buddyicons/'+photo.owner+'.jpg';
    else return 'http://www.flickr.com/images/buddyicon.jpg';
}
};



// FPhotoMarker
function FPhotoMarker(icon, photos, bounds) {
    if(!FPhotoMarker.init) return;

    var position = bounds.getCenter();
    this.baseConstructor.call(this, position, {icon:icon});

    this.photos = photos;
    this.currpos = 0;
    this.ctx = null;
    GEvent.addListener(this, 'click', this.onClick);
};
FPhotoMarker.initialize = function () {
    if(!FPhotoMarker.init) {
        $extend(FPhotoMarker, GMarker);

        FPhotoMarker.prototype.refreshImgList = function() {
            var imgs = this.ctx.imgs;
            
            var end = this.currpos + 5;
            if( end > imgs.length) end = imgs.length;
            for( var i = this.currpos; i<end; ++i) {
                var a = imgs[i].firstChild;
                var img = a.firstChild;
                if(!img.src) img.src=flickr.photourl(a.photo,'s');
            }

            for( var i = 0; i < imgs.length; i++ ) {
                var node = imgs[i].style;
                var img = imgs[i].firstChild.firstChild.style;
                if(i == this.currpos) {
                    node.display = 'inline';
                    node.top = '0px';
                    node.left = '80px';
                    img.width=img.height='75px';
                } else if(i == this.currpos-1) {
                    node.display = 'inline';
                    node.top = '15px';
                    node.left = '15px';
                    img.width = img.height = '45px';
                } else if(i == this.currpos+1) {
                    node.display = 'inline';
                    node.top = '15px';
                    node.left = '175px';
                    img.width = img.height = '45px';
                } else {
                    node.display = 'none';
                }
            }
            this.ctx.titl.innerHTML=imgs[this.currpos].firstChild.title;
            this.ctx.info.innerHTML=' ' + (this.currpos+1) + ' of ' + imgs.length + ' ';
        };

        FPhotoMarker.prototype.onClick = function() {
            if(!this.ctx) {
                var ctx_ = $dom(
                    '<div class="photos">'+
                        '<div style="height:40px; text-align:center;"></div>'+
                        '<div style="height:80px;"></div>'+
                        '<div style="height:20px;"></div>'+
                    '</div>');
                ctx_.titl = ctx_.childNodes[0];
                var imgs = ctx_.childNodes[1]
                var ctrl = ctx_.childNodes[2];

                var pre = $cbtn('prev','Previous photo');
                var nex = $cbtn('next','Next photo');
                nex.marker = pre.marker = this;
                pre.onclick = this.prevImg;
                nex.onclick = this.nextImg;
                ctrl.appendChild(pre);
                ctrl.appendChild(nex);

                var info = $dom('<span/>');
                ctrl.appendChild(info);
                ctx_.info = info;

                for(var i = 0, len = this.photos.length; i < len; ++i) {
                    var photo = this.photos[i];

                    var img = $c('img');
                    img.alt = photo.title;
                    img.width=img.height=75;

                    var imglink = $c('a');
                    imglink.className = 'photo';
                    imglink.title = photo.title;
                    imglink.photo=photo;
                    imglink.onclick = this.onPhotoClick;

                    var imgspan = $c('span');
                    imgspan.style.position='absolute';
                    imgspan.style.display='none';

                    imglink.appendChild(img);
                    imgspan.appendChild(imglink);
                    imgs.appendChild(imgspan);
                }
                this.ctx=ctx_;
                this.ctx.imgs=imgs.childNodes;
            }

            this.refreshImgList();
            this.onPopup();
        };
        FPhotoMarker.prototype.nextImg = function() {
            if( this.marker.currpos >= this.marker.ctx.imgs.length-1) return;

            this.marker.currpos++;
            this.marker.refreshImgList();
        };
        FPhotoMarker.prototype.prevImg = function() {
            if( this.marker.currpos <= 0) return;

            this.marker.currpos--;
            this.marker.refreshImgList();
        };
        FPhotoMarker.prototype.onPhotoClick = function() {
            var w = document.body.clientWidth;
            var h = document.body.clientHeight;
            var overlay = $dom(
                '<div><div class="mask" style="position:absolute; top:0px; left:0px; width:'+w+'px; height:'+h+'px;">'+
                    '<div style="position:absolute; top:100px; left:'+(w-32)/2+'px;">'+
                        '<img src="'+imgs['loading']+'"/>'+
                    '</div>'+
                '</div></div>');

            var imgPreloader = new Image();
            imgPreloader.onload=function(){
                if( this.overlay.removed) return;

                var w = this.width+20;
                var lef = (document.body.clientWidth-w)/2;
                if(lef < 0) lef=0;

                var hei;
                if(PHOTO_CENTER) {
                    hei = (document.body.clientHeight-(this.height+100))/2;
                    if(hei < 0) hei=0;
                } else {
                    hei = 50;
                }

                var photo = this.photo;
                var owner = photo.ownername;
                if(!owner) owner = photo.owner;
                var datetaken = photo.datetaken.substr(0,10);
                var photoctx = $dom(
                    '<div class="popup" style="position:absolute; top:'+hei+'px; left:'+lef+'px; width:'+w+'px;">'+
                        '<div style="margin:10px;">'+
                            '<b style="display: block; margin-bottom: 4px;">'+photo.title+'</b>'+
                            '<img style="margin-bottom:4px;" src="'+this.src+'"/><br />'+
                            '<a style="float:right;" target="_blank" href="http://www.flickr.com/photos/'+photo.owner+'/"/><img style="width:48px;height:48px;border:0px;" src="'+flickr.buddyurl(photo)+'"/></a>'+
                            '<i>Posted by <a target="_blank" href="http://www.flickr.com/photos/'+photo.owner+'/"/>'+owner+'</a></i><br />'+
                            '<i>Taken on '+datetaken+'</i><br />'+
                            '<a target="_blank" href="'+flickr.pageurl(photo)+'">View this photo on flickr</a>'+
                        '</div>'+
                    '</div>');

                this.overlay.firstChild.firstChild.style.display='none';
                this.overlay.appendChild(photoctx);
            };
            overlay.imgPreloader = imgPreloader;
            imgPreloader.overlay = overlay;
            imgPreloader.photo=this.photo;
            imgPreloader.src = flickr.photourl(this.photo,'m');

            overlay.onclick=function() {
                this.removed=true;
                this.parentNode.removeChild(this);
            };
            document.body.appendChild(overlay);
        };

        FPhotoMarker.init=true;
    }
};



// FBrowser
function FBrowser() {
    if(!FBrowser.init) return;
    this.baseConstructor.apply(this, arguments);
    this.pageCurr = 1;
    this.pageTotal = 1;
    this.currZoom = 0;
    this._lastcenter = new GLatLng(0, 0);

    GEvent.addListener(this, "dragend", this.ondragend);
    GEvent.addListener(this, "zoomend", this.onzoomend);

    var nowy = new Date().getFullYear();
    var settingstr = '<span>'+msg_date+'<select id="fgs_select_year">';
    for(var i = 0; i<10; ++i) {
        settingstr += '<option value="'+(nowy-i)+'">'+(nowy-i)+'</option>';
    }
    settingstr += '</select> - <select id="fgs_select_month"><option value="all">All</option>';
    for(var i = 1; i<=12; ++i) {
        if(i < 10) settingstr += '<option value="0'+i+'">0'+i+'</option>';
        else       settingstr += '<option value="'+i+'">'+i+'</option>';
    }
    settingstr += 
        '</select><br />'+msg_sort+'<select id="fgs_select_sort">'+
            '<option value="date-taken-desc">'+msg_datetakendesc+'</option>'+
            '<option value="date-taken-asc">'+msg_datetakenasc+'</option>'+
            '<option value="date-posted-desc">'+msg_dateposteddesc+'</option>'+
            '<option value="date-posted-asc">'+msg_datepostedasc+'</option>'+
            '<option value="interestingness-desc">'+msg_interestingnessdesc+'</option>'+
            '<option value="interestingness-asc">'+msg_interestingnessasc+'</option>'+
            '<option value="relevance">'+msg_relevance+'</option></select>';
    settingstr += '<br />'+msg_search+'<form id="fgs_search_form"><input id="fgs_search" type="text"/><input type="submit"/></form></span>';
    settingDiv.appendChild($dom(settingstr));
    var ysel = $('fgs_select_year');
    var msel = $('fgs_select_month');
    var ssel = $('fgs_select_sort');
    var sform = $('fgs_search_form');
    ysel.map = msel.map = ssel.map = sform.map = this;
    ysel.onchange = msel.onchange = ssel.onchange = sform.onsubmit = this.changeSetting;

    var pre = $cbtn('prev','Previous Page');
    var nex = $cbtn('next','Next Page');
    var pageInfo = $dom('<span/>');
    pre.onclick = this.prevPage;
    nex.onclick = this.nextPage;
    pageDiv.appendChild(pre);
    pageDiv.appendChild(nex);
    pageDiv.appendChild(pageInfo);
    pageDiv.pageInfo = pageInfo;
    pre.map = nex.map = this;
};
FBrowser.initialize = function() {
    if(!FBrowser.init) {
        $extend(FBrowser, GMap2);

        FBrowser.prototype.updateview = function(bound, currPage, level) {
            if(level) {
                this.currZoom = level;
            }
            if( this.currZoom < MIN_ZOOM || this.currZoom > MAX_ZOOM) {
                return;
            }
            if(currPage) {
                this.pageCurr = currPage;
            } else {
                this.pageCurr = 1;
                this.pageTotal = 1;
            }

            mask(this);
            this.updateview2(bound);
        };

        FBrowser.prototype.changeSetting = function() {
            this.map.updateview();
            return false;
        };
        FBrowser.prototype.prevPage = function() {
            var map = this.map;
            if( map.pageCurr <= 1) {
                return;
            }
            map.updateview(null, map.pageCurr-1);
        };
        FBrowser.prototype.nextPage = function() {
            var map = this.map;
            if( map.pageCurr >= map.pageTotal) {
                return;
            }
            map.updateview(null, map.pageCurr+1);
        };
        FBrowser.prototype.onzoomend = function(oldLevel,newLevel) {
            this.updateview(null, null, newLevel);
        };
        FBrowser.prototype.refreshData = function(bound) {
            var sw = bound.getSouthWest();
            var ne = bound.getNorthEast();
            var w = sw.lng();
            var e = ne.lng();
            var n = ne.lat();
            var s = sw.lat();
            var wid;
            if( e < w) {
                wid = 360+e-w;
            } else {
                wid = e - w;
            }
            var hig = n - s;

            w += wid/5;
            if( w > 180) w -= 360;
            e -= wid/5;
            if( e <= -180) e += 360;

            if( e < w) {
                if( (180+e) > (180-w)) {
                    w = -180;
                } else {
                    e = 180;
                }
            }
            n-=hig/5;
            s+=hig/5;

            
            var year = $('fgs_select_year').value;
            var month = $('fgs_select_month').value;
            var sort = $('fgs_select_sort').value;
            var searchtxt = $('fgs_search').value;

            var max_date, min_date;
            if(month == 'all') {
                min_date = year+'-01-01'; max_date = year+'-12-31';
            } else {
                min_date = year+'-'+month+'-01'; max_date = year+'-'+month+'-31';
            }

            this.clearPanel();
            this.closeInfoWindow();
            if(_trim(searchtxt)) {
                flickr.callapi({method: 'flickr.photos.search',  extras:'geo,date_taken,owner_name,icon_server', bbox:w+','+s+','+e+','+n, text:_trim(searchtxt), min_taken_date:min_date, max_taken_date:max_date, sort:sort, page:this.pageCurr, per_page:100}, this, this.search_callback);
            } else {
                flickr.callapi({method: 'flickr.photos.search',  extras:'geo,date_taken,owner_name,icon_server', bbox:w+','+s+','+e+','+n,                        min_taken_date:min_date, max_taken_date:max_date, sort:sort, page:this.pageCurr, per_page:100}, this, this.search_callback);
            }
        };

        FBrowser.prototype.search_callback = function(rsp) {
            if(rsp.stat != 'ok') {
                return;
            }

            var delta = deltas[this.currZoom]/3;

            var photoset = rsp.photos;
            var photos = photoset.photo;
            this.pageCurr = parseInt(photoset.page);
            this.pageTotal = parseInt(photoset.pages);
            this.total = parseInt(photoset.total);
            this.perpage = parseInt(photoset.perpage);

            var start, end;
            if(this.total == 0) {
                start = end = 0;
            } else {
                start = ((this.pageCurr-1)*this.perpage)+1;
                end = ((this.pageCurr)*this.perpage);
            }
            if(end > this.total) end = this.total;
            var psgestr = msg_currpage;
            psgestr = psgestr.replace('$1', start);
            psgestr = psgestr.replace('$2', end);
            psgestr = psgestr.replace('$3', this.total);
            pageDiv.pageInfo.innerHTML = ' '+psgestr;

            this.clearOverlays();

            var temp_bounds = new Array();
            var temp_photos = new Array();
            for (var i=0,len=photos.length; i<len; i++) {
                var photo = photos[i];
                var lat = parseFloat(photo.latitude);
                var lon = parseFloat(photo.longitude);
                if(lat == 0 && lon == 0) { continue; }

                var pos = new GLatLng(lat, lon);

                var isMerged = false;
                for (var j=0,len2=temp_bounds.length; j<len2; j++) {
                    var bb = temp_bounds[j];
                    if( bb.contains(pos)) {
                        isMerged = true;
                        var ps = temp_photos[j];
                        ps[ps.length] = photo;
                        break;
                    }
                }

                if(!isMerged) {
                    var ps = new Array();
                    ps[0] = photo;
                    
                    var bound = new GLatLngBounds(new GLatLng(pos.lat()-delta, pos.lng()-delta), new GLatLng(pos.lat()+delta, pos.lng()+delta));
                    temp_bounds[temp_bounds.length] = bound;
                    temp_photos[temp_photos.length] = ps;
                }
            }

            for (var i=0,len=temp_photos.length; i<len ; i++) {
                if(temp_photos[i].length == 0) { continue; }
                this.addOverlay(new FPhotoMarker($icon(temp_photos[i].length), temp_photos[i], temp_bounds[i]));
            }
        };

        FBrowser.init=true;
    }
};
