// -----------------------------------------------------------------------------------
//
// Flickr Gmap Show with Greasemonkey user script v1.1
// by wctang (http://www.wctang.info/)
// 
// Licensed under MIT License (http://www.opensource.org/licenses/mit-license.php)
//
// -----------------------------------------------------------------------------------



var imgPos = ['http://l.yimg.com/www.flickr.com/images/dot1_p.png', 'http://l.yimg.com/www.flickr.com/images/dot2_p.png', 'http://labs.google.com/ridefinder/images/mm_20_red.png'];
var shwPos = ['', '', 'http://labs.google.com/ridefinder/images/mm_20_shadow.png'];
var img_loading = 'http://flickr-gmap-show.googlecode.com/svn/trunk/lightbox/images/loading.gif';

var imgs = {
    map_default  : 'data:image/gif;base64,R0lGODdhCgAMAIgAAP///4CAgCwAAAAACgAMAAACF4SPF7vY9p6CIalqQWTUYalh4eU1YgYUADs=',
    map_hover    : 'data:image/gif;base64,R0lGODdhCgAMAIgAAP///wAA/ywAAAAACgAMAAACF4SPF7vY9p6CIalqQWTUYalh4eU1YgYUADs=',
    map_selected : 'data:image/gif;base64,R0lGODdhCgAMAIgAAAAA/////ywAAAAACgAMAAACF4SPF7vY9p6CIalqQWTUYalh4eU1YgYUADs=',

    close_default  : 'data:image/gif;base64,R0lGODlhDgANAIAAAP///6CgpCH5BAAAAAAALAAAAAAOAA0AAAIfjI8Jy73mIoAzNErrs/se72Qdg4BjhnGnKo3tlsRGAQA7', // http://l.yimg.com/www.flickr.com/images/simple_close_default.gif
    close_hover    : 'data:image/gif;base64,R0lGODlhDwAPAJEDAP///wAAAP9UAP///yH5BAEAAAMALAAAAAAPAA8AAAItXI6JJu3vDpxNUmgFAG7H0HkbV4Hh+GQNmprrSJan5slv+F2YqwuqHjAohsECADs=', // http://l.yimg.com/www.flickr.com/images/simple_close_hover.gif
    close_selected : 'data:image/gif;base64,R0lGODlhDwAPAKIEALBGF////wAAAP9UAP///wAAAAAAAAAAACH5BAEAAAQALAAAAAAPAA8AAAM1SLLcrCDKKRcYOGtstx/dp4VBkJUZiZYmJ1wYi6avxm7hILcufN+9GG8GqolosCNI4WgKCAkAOw==', // http://l.yimg.com/www.flickr.com/images/simple_close_selected.gif

    prev_default  : 'data:image/gif;base64,R0lGODlhDwAPAJEDAL+/v9jY2Pn6/f///yH5BAEAAAMALAAAAAAPAA8AAAIoXI6JJu3vDpxNUmgfADjAzT2ZAE5ZaXoOKqrr1k1we8V15N6BofR7AQA7', // http://l.yimg.com/www.flickr.com/images/simple_prev_default.gif
    prev_hover    : 'data:image/gif;base64,R0lGODlhDwAPAKIEAPn6/QCG59jY2P///////wAAAAAAAAAAACH5BAEAAAQALAAAAAAPAA8AAAMqSLLcrCPKKRe90WKqZwicQH3g1A3k1aWqKJFAOH7yXG+Vi2f6LiiO4C8BADs=', // http://l.yimg.com/www.flickr.com/images/simple_prev_hover.gif
    prev_selected : 'data:image/gif;base64,R0lGODlhDwAPAKIEAPn6/UNpkwAAAAB14v///wAAAAAAAAAAACH5BAEAAAQALAAAAAAPAA8AAAMwSLLcrCHKKVcYOGtstx/dp4UZAGzkYJ6jcGGrF8ayW5r1C+OtvqM2USYlEigcSGMCADs=', // http://l.yimg.com/www.flickr.com/images/simple_prev_selected.gif

    next_default  : 'data:image/gif;base64,R0lGODlhDwAPAJEDAL+/v9jY2Pn6/f///yH5BAEAAAMALAAAAAAPAA8AAAIoXI6JJu3vDpxNUmgdADO3zT3et4kBBUYnlKpsab7derm1fQuBofR7AQA7', // http://l.yimg.com/www.flickr.com/images/simple_next_default.gif
    next_hover    : 'data:image/gif;base64,R0lGODlhDwAPAKIEAPn6/QCG59jY2P///////wAAAAAAAAAAACH5BAEAAAQALAAAAAAPAA8AAAMsSLLcrCPKKRe90WKqZQhXF33gJI6fKWBktU5A61LyPKXcu9l7pvcChWMYTAAAOw==', // http://l.yimg.com/www.flickr.com/images/simple_next_hover.gif
    next_selected : 'data:image/gif;base64,R0lGODlhDwAPAKIEAPn6/UNpkwAAAAB14v///wAAAAAAAAAAACH5BAEAAAQALAAAAAAPAA8AAAMxSLLcrCHKKVcYOGtstx/dp4UYAHjkYJ6jcGlr+8Jmlqq17dKsPuOoncg3tCkcSAEhAQA7' // http://l.yimg.com/www.flickr.com/images/simple_next_selected.gif
};

function $(e) {
    return document.getElementById(e);
};
function _ce(e) {
    return document.createElement(e);
};
function _ga(e,a) {
    return e.getAttribute(a);
};

function loadjs(src){
    var s = _ce('script');
    s.type='text/javascript';
    s.src=src;
    document.getElementsByTagName('head')[0].appendChild(s);
};

var old_document_write = document.write;
document.write = function(str) {
    if(str.indexOf('<script ')>=0){
        var f = str.indexOf('src="')+5;
        var src = str.substring(f,str.indexOf('"',f));
        loadjs(src);
    } else if(str.indexOf('<link ')>=0){
        var f=str.indexOf('href="')+6;
        var src=str.substring(f,str.indexOf('"',f));
        f=str.indexOf('media="')+7;
        media=str.substring(f,str.indexOf('"',f));
        loadcss(src,media);
    } else if(str.indexOf('<style ')>=0){
        var e = _ce('div');
        e.innerHTML = str;
        if(document.body) {
            document.body.appendChild(e);
        } else {
            document.getElementsByTagName('head')[0].appendChild(e);
        }
    } else {
        old_document_write(str);
    }
};



var Utilities={
    extend : function(subClass, baseClass){
        function inheritance() {};
        inheritance.prototype = baseClass.prototype;
    
        subClass.prototype = new inheritance();
        subClass.prototype.constructor = subClass;
        subClass.prototype.baseConstructor = baseClass;
        subClass.superClass = baseClass.prototype;
    },
    createDOM : function(str) {
        var d = _ce('div');
        d.innerHTML = str;
        return d.firstChild;
    },

    maskMap : function(map) {
        if(!map._masklayer) {
            var div = Utilities.createDOM(
                '<div style="position:absolute; top:0px; left:0px; background:black; opacity:0.5; filter:alpha(opacity=50); cursor:wait;">'+ 
                    '<div style="position:absolute; background:white;"><img src="'+img_loading+'"/><br/><span>&nbsp;</span></div>'+
                '</div>');
            map._masklayer = div;
            map._masklayer.counter = 0;
        }
        map._masklayer.counter ++;
        if( map._masklayer.counter == 1) {
            var domobj = map.getContainer();
            var imgdiv = map._masklayer.firstChild;
            map._masklayer.style.width = domobj.clientWidth + 'px';
            map._masklayer.style.height = domobj.clientHeight + 'px';
            imgdiv.style.top = (domobj.clientHeight/2-16) + 'px';
            imgdiv.style.left = (domobj.clientWidth/2-16) + 'px';
            
            domobj.appendChild(map._masklayer);
        }
    },
    unmaskMap : function(map) {
        if(map._masklayer) {
            if( map._masklayer.counter > 0) {
                map._masklayer.counter --;
                if( map._masklayer.counter == 0) {
                    map._masklayer.parentNode.removeChild(map._masklayer);
                }
            }
        }
    },
    setLoading : function(map, curr, total) {
        if(map._masklayer) {
            var imgdiv = map._masklayer.firstChild;
            imgdiv.childNodes[2].innerHTML = Math.round(curr*100/total)+'%';
        }
    },

    getMarkerIcon : function(numPhotos) {
        var markerIcons = Utilities.getMarkerIcon.markerIcons;
        if(markerIcons == null) {
            markerIcons = [];
            markerIcons[0] = new GIcon();
            markerIcons[0].image = imgPos[0];
            markerIcons[0].iconSize = new GSize(18, 19);
            markerIcons[0].iconAnchor = new GPoint(9, 9);
            markerIcons[0].infoWindowAnchor = new GPoint(9, 9);
            markerIcons[1] = new GIcon();
            markerIcons[1].image = imgPos[1];
            markerIcons[1].iconSize = new GSize(20, 21);
            markerIcons[1].iconAnchor = new GPoint(10, 10);
            markerIcons[1].infoWindowAnchor = new GPoint(10, 10);
            markerIcons[2] = new GIcon();
            markerIcons[2].image = imgPos[2];
            markerIcons[2].shadow = shwPos[2];
            markerIcons[2].iconSize = new GSize(12, 20);
            markerIcons[2].shadowSize = new GSize(22, 20);
            markerIcons[2].iconAnchor = new GPoint(6, 20);
            markerIcons[2].infoWindowAnchor = new GPoint(5, 8);
            Utilities.getMarkerIcon.markerIcons = markerIcons;
        }
        
        if(numPhotos < 0) {
            return markerIcons[2];
        } else if(numPhotos <= 100) {
            return markerIcons[0];
        } else {
            return markerIcons[1];
        }
    },
    
    getTotalOffset : function(elem) {
        var e = elem, t = 0, l = 0;
        while(e.offsetParent != null) {
            t += e.offsetTop;
            l += e.offsetLeft;
            e = e.offsetParent;
        }
        return [t,l];
    },
    
    _createButton : function(key) {
        var a = Utilities.createDOM('<a style="cursor:pointer;"><img src="'+imgs[key+'_default']+'" style="cursor:pointer;"/></a>');
        a.imgdef = imgs[key+'_default'];
        a.imghover = imgs[key+'_hover'];
        a.imgselected = imgs[key+'_selected'];
        a.onmouseout = function() { this.childNodes[0].src = this.imgdef; };
        a.onmouseover = function() { this.childNodes[0].src = this.imghover; };
        a.onmousedown = function() { this.childNodes[0].src = this.imgselected; };
        a.onmouseup = function() { this.childNodes[0].src = this.imghover; };
        return a;
    }
};


function FPhotoMarker(icon, photos, bounds) {
    if(!FPhotoMarker.init) return;

    var position;
    if( photos.length == 1) {
        position = photos[0].position;
    } else {
        position = bounds.getCenter();
    }
    this.baseConstructor.call(this, position, icon);

    this.photos_ = photos;
    this.currpos_ = 0;
    GEvent.addListener(this, 'click', this.onClick);
};
FPhotoMarker.create = function () {
    if(!FPhotoMarker.init) {
        Utilities.extend(FPhotoMarker, GMarker);

        FPhotoMarker.prototype.initialize = function(map) {
            GMarker.prototype.initialize.apply(this, arguments);
        
            var div = Utilities.createDOM(
                '<div style="position:absolute; text-align:center; font-size:x-small; cursor:pointer;">'+this.photos_.length+'</div>');
            div.marker = this;
            div.onclick = function() {
                this.marker.onClick();
            };
            map.getPane(G_MAP_MARKER_PANE).appendChild(div);

            this.pos = map.fromLatLngToDivPixel(this.getPoint());
            this.zidx = GOverlay.getZIndex(this.getPoint().lat());
            
            this.map_ = map;
            this.div_ = div;
        };
        FPhotoMarker.prototype.redraw = function(force) {
            GMarker.prototype.redraw.apply(this, arguments);
            if (!force) return;

            var iconsize = this.getIcon().iconSize;
            this.div_.style.left = (this.pos.x - iconsize.width/2) + 'px';
            this.div_.style.top = (this.pos.y - iconsize.height/2)+2 + 'px';
            this.div_.style.width = iconsize.width-2 + 'px';
            this.div_.style.height = iconsize.height-3 + 'px';
            this.div_.style.zIndex = this.zidx+1; // in front of the marker
        };
        FPhotoMarker.prototype.remove = function() {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
            GMarker.prototype.remove.apply(this, arguments);
        };

        FPhotoMarker.prototype.refreshImgList = function() {
            if( this.currpos_ == 0) {
                var to = this.imagesDiv_.childNodes.length > 5 ? 5 : this.imagesDiv_.childNodes.length;
                for(var i = 0; i< to; ++i) {
                    var a = this.imagesDiv_.childNodes[i].childNodes[0];
                    var img = a.childNodes[0];
                    if( !_ga(img,'src')) {
                        var url = a.url.substring(0,a.url.length-4);
                        img.src=url+'_s.jpg';
                    }
                }
            } else {
                var span = this.imagesDiv_.childNodes[this.currpos_+4];
                if(span) {
                    var a = span.childNodes[0];
                    var img = a.childNodes[0];
                    if( !_ga(img,'src')) {
                        var url = a.url.substring(0,a.url.length-4);
                        img.src=url+'_s.jpg';
                    }
                }
            }
            
            for( var i = 0; i < this.imagesDiv_.childNodes.length; i++ ) {
                var node = this.imagesDiv_.childNodes[i];
                if(i == this.currpos_) {
                    node.style.display = 'inline';
                    node.childNodes[0].childNodes[0].style.width=node.childNodes[0].childNodes[0].style.height='75px';
                    node.style.top = '0px';
                    node.style.left = '80px';
                } else if(i == this.currpos_-1) {
                    node.style.display = 'inline';
                    node.childNodes[0].childNodes[0].style.width = node.childNodes[0].childNodes[0].style.height = '45px';
                    node.style.top = '15px';
                    node.style.left = '15px';
                } else if(i == this.currpos_+1) {
                    node.style.display = 'inline';
                    node.childNodes[0].childNodes[0].style.width = node.childNodes[0].childNodes[0].style.height = '45px';
                    node.style.top = '15px';
                    node.style.left = '175px';
                } else {
                    node.style.display = 'none';
                }
            }
            this.title_.innerHTML=this.imagesDiv_.childNodes[this.currpos_].childNodes[0].title;
            this.info_.innerHTML=' ' + (this.currpos_+1) + ' of ' + this.imagesDiv_.childNodes.length + ' ';
        };

        FPhotoMarker.prototype.onClick = function() {
            if(!this.infoContent_) {
                var infoContent = Utilities.createDOM(
                    '<div style="height:140px; width:250px;">'+
                        '<div style="position:relative; left:0px; height:40px; width:250px; text-align:center;"></div>'+
                        '<div style="position:relative; left:0px; height:80px; width:250px;"></div>'+
                        '<div style="position:relative; left:0px; height:20px; width:250px;"></div>'+
                    '</div>');
                var titleDiv = infoContent.childNodes[0];
                var imagesDiv = infoContent.childNodes[1];
                var controlDiv = infoContent.childNodes[2];
                var pre = Utilities._createButton('prev');
                var nex = Utilities._createButton('next');
                var info = Utilities.createDOM('<span/>');
                nex.marker = pre.marker = this;
                pre.onclick = this.prevImg;
                nex.onclick = this.nextImg;
                controlDiv.appendChild(pre);
                controlDiv.appendChild(nex);
                controlDiv.appendChild(info);

                for(var i = 0, len = this.photos_.length; i < len; ++i) {
                    var photo = this.photos_[i];
                    var p_url = 'http://farm'+_ga(photo,'farm')+'.static.flickr.com/'+_ga(photo,'server')+'/'+_ga(photo,'id')+'_'+_ga(photo,'secret')+'.jpg';
                    var p_title = _ga(photo,'title');
                    
                    var imgspan = _ce('span');
                    var imglink = _ce('a');
                    var img = _ce('img');
                    
                    img.alt = p_title;
                    img.width=img.height=75;
                    img.border = '0';
                    imglink.rel = 'lightbox[photo]';
                    imglink.title = p_title;
                    //imglink.href = p_url;
                    imglink.url = p_url;
                    imglink.href = "javascript:;";
                    imglink.onclick = this.onClickPhoto;
                    imgspan.id='pic'+i;
                    imgspan.style.position='absolute';
                    imgspan.style.display='none';
                    
                    imglink.appendChild(img);
                    imgspan.appendChild(imglink);
                    imagesDiv.appendChild(imgspan);
                }
                
                this.infoContent_=infoContent;
                this.title_=titleDiv;
                this.imagesDiv_=imagesDiv;
                this.info_=info;
            }
            
            this.refreshImgList();
            
            this.openInfoWindow(this.infoContent_);
        };

        FPhotoMarker.prototype.nextImg = function() {
            if( this.marker.currpos_ >= this.marker.imagesDiv_.childNodes.length-1) {
                return;
            }
            this.marker.currpos_++;
            this.marker.refreshImgList();
        };
        
        FPhotoMarker.prototype.prevImg = function() {
            if( this.marker.currpos_ <= 0) {
                return;
            }
            this.marker.currpos_--;
            this.marker.refreshImgList();
        };

        FPhotoMarker.prototype.onClickPhoto = function() {
            var overlay = Utilities.createDOM(
                '<div style="position:absolute; top:0px; left:0px; width:'+document.body.scrollWidth+'px; height:'+document.body.scrollHeight+'px; background:black; opacity:0.8; filter:alpha(opacity=50);"></div>');
            var imgdiv = Utilities.createDOM(
                '<div style="position:absolute; top:'+(self.innerHeight/2-16)+'px; left:'+(self.innerWidth/2-16)+'px; background:white;"><img src="'+img_loading+'"/></div>');
            
            var imgPreloader = new Image();
            imgPreloader.imgdiv = imgdiv;
            imgPreloader.onload=function(){
                if( imgPreloader.imgdiv.removed) return;
                var t = (self.innerWidth-imgPreloader.width)/2;
                if ( t < 0) t = 0;
                imgPreloader.imgdiv.style.left = t + 'px';
                t = (self.innerHeight-imgPreloader.height)/2;
                if ( t < 0) t = 0;
                imgPreloader.imgdiv.style.top = t + 'px';
                imgPreloader.imgdiv.firstChild.src = imgPreloader.src;
            };
            imgPreloader.src = this.url;
            
            
            overlay.onclick=function() {
                imgdiv.removed = true;
                overlay.parentNode.removeChild(overlay);
                imgdiv.parentNode.removeChild(imgdiv);
            };
            
            document.body.appendChild(overlay);
            document.body.appendChild(imgdiv);
        };

        FPhotoMarker.init=true;
    }
    return new FPhotoMarker(arguments[0],arguments[1],arguments[2]);
};





function FPhotoSet() {
    if(!FPhotoSet.init) return;
    this.baseConstructor.apply(this, arguments);
    this.total_photos = new Array();
};
FPhotoSet.create = function() {
    if (!GBrowserIsCompatible()) return;
    
    if(!FPhotoSet.init) {
        Utilities.extend(FPhotoSet, GMap2);

        FPhotoSet.prototype.setPhotoSetId = function(photosetid) {
            this.photosetid = photosetid;
            Utilities.maskMap(this);
            window.F.API.callMethod('flickr.photosets.getPhotos', { photoset_id:photosetid, extras:'geo'}, this);
        };

        FPhotoSet.prototype.setGroupId = function(group_id) {
            this.group_id = group_id;
            Utilities.maskMap(this);
            window.F.API.callMethod('flickr.groups.pools.getPhotos', { group_id:group_id, extras:'geo'}, this);
        };
        FPhotoSet.prototype.setUserId = function(user_id) {
            this.user_id = user_id;
            Utilities.maskMap(this);
            window.F.API.callMethod('flickr.photos.search', { user_id:user_id, extras:'geo'}, this);
        };
        

        FPhotoSet.prototype.flickr_photosets_getPhotos_onLoad = function(success, responseXML, responseText, params){
            try {
                if(success == true) {
                    var rsp = responseXML.getElementsByTagName('rsp')[0];
                    var setkey;
                    if(this.photosetid) {
                        setkey = 'photoset';
                    } else if(this.group_id) {
                        setkey = 'photos';
                    } else if(this.user_id) {
                        setkey = 'photos';
                    }
                    var photoset = rsp.getElementsByTagName(setkey)[0];
                    var photos = photoset.getElementsByTagName('photo');
                    var pages = parseInt(_ga(photoset,'pages'));
                    var page = parseInt(_ga(photoset,'page'));
                    var total = parseInt(_ga(photoset,'total'));
                    var perpage = parseInt(_ga(photoset,'perpage'));
                    var curr = page * perpage;

                    Utilities.setLoading(this, page, pages);

                    var photo;
                    for(var i = 0, len = photos.length; i < len; ++i) {
                        photo = photos[i];
                        var lat = _ga(photo,'latitude');
                        var lon = _ga(photo,'longitude');
                        if(lat == 0 && lon == 0) {
                            continue;
                        }
                        
                        photo.position = new GLatLng(parseFloat(lat), parseFloat(lon));
                        this.total_photos[this.total_photos.length] = photo;
                    }
                    
                    if( pages > page) {
                        Utilities.maskMap(this);
                        if(this.photosetid) {
                            window.F.API.callMethod('flickr.photosets.getPhotos', { photoset_id:params.photoset_id, extras:'geo', page:page+1}, this);
                        } else if(this.group_id) {
                            window.F.API.callMethod('flickr.groups.pools.getPhotos', { group_id:params.group_id, extras:'geo', page:page+1}, this);
                        } else if(this.user_id) {
                            window.F.API.callMethod('flickr.photos.search', { user_id:params.user_id, extras:'geo', page:page+1}, this);
                        }
                        return;
                    }
                    
                    var bounds = new GLatLngBounds();
                    for (var i=0,len=this.total_photos.length; i<len; i++) {
                        bounds.extend(this.total_photos[i].position);
                    }

                    GEvent.addListener(this, 'zoomend', this._onzoom);
           
                    var zoom = this.getBoundsZoomLevel(bounds);
                    this.setCenter(bounds.getCenter(), zoom);
                }
            } finally {
                Utilities.unmaskMap(this);
            }
        };

        FPhotoSet.prototype.flickr_groups_pools_getPhotos_onLoad = function(success, responseXML, responseText, params){
            return this.flickr_photosets_getPhotos_onLoad(success, responseXML, responseText, params);
        };
        FPhotoSet.prototype.flickr_photos_search_onLoad = function(success, responseXML, responseText, params){
            return this.flickr_photosets_getPhotos_onLoad(success, responseXML, responseText, params);
        };


        FPhotoSet.prototype._onzoom = function() {
            Utilities.maskMap(this);
            this.clearOverlays();
    
            var p1 = this.fromDivPixelToLatLng(new GPoint(0, 0)).lat();
            var p2 = this.fromDivPixelToLatLng(new GPoint(0, 20)).lat();
            var delta = p1 - p2; 
    
            var temp_bounds = new Array();
            var temp_photos = new Array();
            for (var i=0,len=this.total_photos.length; i<len; i++) {
                var photo = this.total_photos[i];
                var pos = photo.position;
    
                var isMerged = false;
                for (var j=0,len2=temp_bounds.length; j<len2; j++) {
                    var bound = temp_bounds[j];
                    if( bound.contains(pos)) {
                        isMerged = true;
                        var photos = temp_photos[j];
                        photos[photos.length] = photo;
                        break;
                    }
                }
                
                if(!isMerged) {
                    var photos = new Array();
                    photos[0] = photo;
                    
                    var bound = new GLatLngBounds(new GLatLng(pos.lat()-delta, pos.lng()-delta), new GLatLng(pos.lat()+delta, pos.lng()+delta));
                    temp_bounds[temp_bounds.length] = bound;
                    temp_photos[temp_photos.length] = photos;
                }
            }
        
            for (var i=0,len=temp_photos.length; i<len ; i++) {
                if(temp_photos[i].length == 0) { continue; }
                this.addOverlay(FPhotoMarker.create(Utilities.getMarkerIcon(temp_photos[i].length), temp_photos[i], temp_bounds[i]));
            }
            Utilities.unmaskMap(this);
        };

        FPhotoSet.init=true;
    }
    return new FPhotoSet(arguments[0],arguments[1]);
};




function FPhoto() {
    if(!FPhoto.init) return;
    this.baseConstructor.apply(this, arguments);
};
FPhoto.create = function() {
    if (!GBrowserIsCompatible()) return;

    if(!FPhoto.init) {
        Utilities.extend(FPhoto, GMap2);

        FPhoto.prototype.setPhotoId = function(photo_id) {
            this.photo_id = photo_id;
            Utilities.maskMap(this);
            window.F.API.callMethod('flickr.photos.getInfo', {photo_id:this.photo_id}, this);
        };
        
        FPhoto.prototype.flickr_photos_getInfo_onLoad = function(success, responseXML, responseText, params){
            try {
                if(success == true) {
                    var rsp = responseXML.getElementsByTagName('rsp')[0];
                    var photo = rsp.getElementsByTagName('photo')[0];
    
                    var latitude = 0;
                    var longitude = 180;
                    var zoom = 2;
                    var location = photo.getElementsByTagName('location')[0];
                    if(location) {
                        latitude = parseFloat(_ga(location,'latitude'));
                        longitude = parseFloat(_ga(location,'longitude'));
                        zoom = 13;
        
                        var locality = location.getElementsByTagName('locality');
                        if(locality&&locality.length!=0) locality= (locality[0]).firstChild.textContent;
                        var county = location.getElementsByTagName('county');
                        if(county&&county.length!=0) county= (county[0]).firstChild.textContent;
                        var region = location.getElementsByTagName('region');
                        if(region&&region.length!=0) region= (region[0]).firstChild.textContent;
                        var country = location.getElementsByTagName('country');
                        if(country&&country.length!=0) country= (country[0]).firstChild.textContent;
                        
                        this.wrap.infoSpan.innerHTML = region+', '+country+'. ';
                    }
    
                    var marker = new GMarker(new GLatLng(latitude, longitude), {icon:Utilities.getMarkerIcon(-1), draggable: true});
                    marker.title = photo.getElementsByTagName('title').textContent;
                    marker.photo_url = 'http://farm'+_ga(photo,'farm')+'.static.flickr.com/'+_ga(photo,'server')+'/'+this.photo_id+'_'+_ga(photo,'secret')+'_s.jpg';
                    marker.infoContent = Utilities.createDOM(
                        '<div>'+
                            '<img src="'+marker.photo_url+'"/>'+
                        '</div>');
                    GEvent.addListener(marker, 'click', function() {
                        marker.openInfoWindow(marker.infoContent);
                    });
                    GEvent.addListener(marker, 'dragend', function(){
                        if(!marker.isModified) {
                            var a = Utilities.createDOM('<a href="javascript:;">Save location?</a>');
                            a.gmap = marker.gmap;
                            GEvent.addDomListener(a, 'click', function() {
                                if(confirm('save location?')) {
                                    var p=this.gmap.marker.getPoint();
                                    window.F.API.callMethod('flickr.photos.geo.setLocation', {photo_id:this.gmap.photo_id, lat:p.lat(), lon:p.lng()}, this.gmap);
                                }
                            });
                            marker.gmap.wrap.infoSpan.parentNode.appendChild(a);
                            marker.isModified = true;
                        }
                    });
                    marker.gmap = this;
                    this.marker = marker;
                    this.setCenter(marker.getPoint(), zoom);
                    this.addOverlay(marker);
                    GEvent.trigger(this.marker, 'click');
                }
            } finally {
                Utilities.unmaskMap(this);
            }
        };

        FPhoto.prototype.flickr_photos_geo_setLocation_onLoad = function(success, responseXML, responseText, params){
            if(success == true) {
                this.wrap.infoSpan.parentNode.removeChild(this.wrap.infoSpan.nextSibling);
                this.marker.isModified = false;
            } else {
                alert('save location failed.');
            }
        };

        FPhoto.prototype.recenter = function(){
            if(this.marker) {
                this.setCenter(this.marker.getPoint(), 13);
            }
        };


        FPhoto.init=true;
    }
    return new FPhoto(arguments[0],arguments[1]);
};







var FGS = {
    currMap : null,
    
    createPhotoSetMap : function(map,photosetid) {
        if (!GBrowserIsCompatible()) return;
        
        var m = FPhotoSet.create(map);
        FGS.M = m;
        m.addControl(new GLargeMapControl());
        m.addControl(new GMapTypeControl());
        m.enableDoubleClickZoom();
        m.enableContinuousZoom();
        m.enableScrollWheelZoom();
        m.setPhotoSetId(photosetid);
        return m;
    },

    createGroupPoolMap : function(map,group_id) {
        if (!GBrowserIsCompatible()) return;
        
        var m = FPhotoSet.create(map);
        FGS.M = m;
        m.addControl(new GLargeMapControl());
        m.addControl(new GMapTypeControl());
        m.enableDoubleClickZoom();
        m.enableContinuousZoom();
        m.enableScrollWheelZoom();
        m.setGroupId(group_id);
        return m;
    },
    
    createUserPhotoMap : function(map,user_id) {
        if (!GBrowserIsCompatible()) return;
        
        var m = FPhotoSet.create(map);
        FGS.M = m;
        m.addControl(new GLargeMapControl());
        m.addControl(new GMapTypeControl());
        m.enableDoubleClickZoom();
        m.enableContinuousZoom();
        m.enableScrollWheelZoom();
        m.setUserId(user_id);
        return m;
    },
    

    createPhotoMap : function(map,photo_id) {
        if (!GBrowserIsCompatible()) return;

        var m = FPhoto.create(map);
        FGS.M = m;
        m.addControl(new GSmallMapControl());
        m.addControl(new GMapTypeControl());
        m.enableDoubleClickZoom();
        m.enableContinuousZoom();
        m.setPhotoId(photo_id);
        return m;
    },

    
    getFullPageMapDom : function(domobj) {
        var wrap=domobj.mapwrap;
        if(!wrap) {
            wrap = Utilities.createDOM(
                '<div id="fgs-wrap" style="position:absolute; top:20px; left:20px; visibility:visible; padding:10px; background-color:white; border:1px solid black;">'+
                    '<div style="position:relative; top:10px; height:10px; width:10px;"></div>' +
                    '<div style="position:relative; top:30px; left:10px; width:0px; height:0px; border:1px solid black;"/>' +
                '</div>');
            var clslnk = Utilities._createButton('close');
            clslnk.mapwrap = wrap;
            clslnk.onclick=function() {
                var wrap = this.mapwrap;
                wrap.style.visibility='hidden';
                wrap.mapDom.style.width=wrap.mapDom.style.height=wrap.style.width=wrap.style.height='0px';
            };
            wrap.firstChild.appendChild(clslnk);

            wrap.clslnk = wrap.firstChild;
            wrap.mapDom = wrap.childNodes[1];
            
            domobj.mapwrap = wrap;
            document.body.appendChild(wrap);
        }

        var w = (innerWidth-80);
        var h = (innerHeight-60);
        wrap.style.width=w+'px';
        wrap.style.height=h+'px';
        wrap.style.visibility='visible';
        wrap.clslnk.style.left=(w-20)+'px';
        wrap.mapDom.style.width=(w-20)+'px';
        wrap.mapDom.style.height=(h-40)+'px';
        return wrap;
    },
    
    showPhoto : function(photo_id, domobj) {
        var wrap=domobj.mapwrap;
        if(wrap) {
            if( wrap.style.visibility == 'visible') {
                wrap.style.visibility = 'hidden';
            } else {
                wrap.gmap.recenter();
                wrap.style.visibility = 'visible';
            }
            return;
        }
        
        var offst = Utilities.getTotalOffset(domobj);
        wrap = Utilities.createDOM(
            '<div id="fgs-wrap"  style="position:absolute; top:'+(offst[0]-320)+'px;left:'+(offst[1]-200)+'px;width:500px;height:300px; padding:5px; visibility:visible; background-color:white; border:1px solid gray; z-index:2000;">'+
                '<div style="position:relative; left:480px; width:10px; height:20px;"></div>' +
                '<div style="position:relative; width:500px; height:260px;"></div>' +
                '<div style="position:relative; width:500px; height:20px; text-align:left;"><span></span></div>' +
            '</div>');
        var clslnk = Utilities._createButton('close');
        clslnk.mapwrap = wrap;
        clslnk.onclick=function() {
            this.mapwrap.style.visibility='hidden';
        };
        wrap.firstChild.appendChild(clslnk);
        
        wrap.clslnk = wrap.firstChild;
        wrap.mapDom = wrap.childNodes[1];
        wrap.infoSpan = wrap.childNodes[2].firstChild;
        
        domobj.mapwrap = wrap;
        document.body.appendChild(wrap);
        //$('photoswftd').insertBefore(wrap, $('About'));

        wrap.gmap = FGS.createPhotoMap(wrap.mapDom,photo_id);
        wrap.gmap.wrap = wrap;
    },



    _windowUnload : function() {
        if(typeof GUnload == 'function') {
            GUnload();
        }
    },    



    _processFlickrPage : function() {
        var loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)(\/.*)?$/(window.location.href);
        if(loc&&loc[1]&&loc[2]) { // photo set
            var paras = document.getElementsByTagName('p');
            for (var i=0; i< paras.length; i++) {
                if(paras[i].className == 'Links') {
                    if( paras[i].childNodes[0]==undefined) continue;
                    var cs = paras[i].getElementsByTagName('a');
                    for(var j = 0; j<cs.length; j++) {
                        if(cs[j].textContent == 'Map') {
                            var a = Utilities._createButton('map');
                            a.onclick=function(){
                                var wrap = FGS.getFullPageMapDom(a);
                                if(wrap.gmap) {
                                    wrap.gmap.checkResize();
                                } else {
                                    wrap.gmap = FGS.createPhotoSetMap(wrap.mapDom,loc[2]);
                                    wrap.gmap.wrap = wrap;
                                }
                            };
                            cs[j].parentNode.insertBefore(a, cs[j]);
                            break;
                        }
                    }
                    break;
                }
            }
            return;
        }
        
        loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(\/.*)?$/(window.location.href);
        var maplink = document.getElementById('a_link_to_map');
        var maplink2 = document.getElementById('a_place_on_map_old');
        if(loc&&loc[1]&&loc[2]&&(maplink||maplink2)) { // photo
            var a = Utilities._createButton('map');
            a.onclick=function(){FGS.showPhoto(loc[2], this);};
            if(maplink) {
                maplink.parentNode.insertBefore(a, maplink);
            } else if(maplink2) {
                maplink2.parentNode.insertBefore(a, maplink2.nextSibling);
            }
            return;
        }

        loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)(\/.*)?$/(window.location.href);
        if(loc&&loc[1]) {
            var paras = document.getElementsByTagName('p');
            for (var i=0; i< paras.length; i++) {
                if(paras[i].className == 'Do') {
                    if( paras[i].childNodes[0]==undefined) continue;
                    var cs = paras[i].getElementsByTagName('a');
                    for(var j = 0; j<cs.length; j++) {
                        if(cs[j].textContent == 'Map') {
                            var maphref = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(\/.*)?$/(cs[j].href);
                            var a = Utilities._createButton('map');
                            a.photo_id = maphref[2];
                            a.onclick=function(){FGS.showPhoto(this.photo_id, this);};
                            cs[j].parentNode.insertBefore(a, cs[j]);
                            break;
                        }
                    }
                } else if(paras[i].className == 'Links') {
                    if( paras[i].childNodes[0]==undefined) continue;
                    var cs = paras[i].getElementsByTagName('a');
                    for(var j = 0; j<cs.length; j++) {
                        if(cs[j].textContent == 'Map') {
                            var a = Utilities._createButton('map');
                            a.onclick=function(){
                                var wrap = FGS.getFullPageMapDom(a);
                                if(wrap.gmap) {
                                    wrap.gmap.checkResize();
                                } else {
                                    wrap.gmap = FGS.createUserPhotoMap(wrap.mapDom,f.w.value);
                                }
                            };
                            cs[j].parentNode.insertBefore(a, cs[j]);
                            break;
                        }
                    }
                }
            }
            return;
        }
        
        loc = /^http:\/\/www.*\.flickr\.com\/groups\/([a-zA-Z0-9\-\_@]*)(\/)?$/(window.location.href);
        if(loc&&loc[1]) {
            var paras = document.getElementsByTagName('p');
            for (var i=0; i< paras.length; i++) {
                if(paras[i].className == 'Links') {
                    if( paras[i].childNodes[0]==undefined) continue;
                    var cs = paras[i].getElementsByTagName('a');
                    for(var j = 0; j<cs.length; j++) {
                        if(cs[j].textContent == 'Map') {
                            var a = Utilities._createButton('map');
                            a.onclick=function(){
                                var wrap = FGS.getFullPageMapDom(a);
                                if(wrap.gmap) {
                                    wrap.gmap.checkResize();
                                } else {
                                    wrap.gmap = FGS.createGroupPoolMap(wrap.mapDom,f.w.value);
                                }
                            };
                            cs[j].parentNode.insertBefore(a, cs[j]);
                            break;
                        }
                    }
                    break;
                }
            }
            return;
        }
    },



    init : function() {
        loadjs('http://flickr-gmap-show.googlecode.com/svn/tags/fgs/current/gmap.js');

        FGS._processFlickrPage();

        var oldOnunload = window.onunload;
        if (typeof window.onunload != 'function') {
            window.onunload = FGS._windowUnload;
        } else {
            window.onunload = function() {
                oldOnunload();
                FGS._windowUnload();
            };
        }
    }
};

FGS.init();
