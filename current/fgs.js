// -----------------------------------------------------------------------------------
//
// Flickr Gmap Show with Greasemonkey user script v1.0
// by wctang (http://www.wctang.info/)
// 
// Licensed under MIT License (http://www.opensource.org/licenses/mit-license.php)
//
// -----------------------------------------------------------------------------------



var imgPrevImg = 'http://l.yimg.com/www.flickr.com/images/simple_prev_default.gif';
var imgNextImg = 'http://l.yimg.com/www.flickr.com/images/simple_next_default.gif';
var imgClose = 'http://l.yimg.com/www.flickr.com/images/simple_close_default.gif';
var imgPos = ['http://l.yimg.com/www.flickr.com/images/dot1_b.png', 'http://l.yimg.com/www.flickr.com/images/dot2_b.png', 'http://l.yimg.com/www.flickr.com/images/dot3_b.png', 'http://l.yimg.com/www.flickr.com/images/dot4_b.png'];
var imgLoading = 'http://flickr-gmap-show.googlecode.com/svn/trunk/lightbox/images/loading.gif';

function $(e) {
    return document.getElementById(e);
};
function _ce(e) {
    return document.createElement(e);
};

function loadjs(src, id){
    var s = _ce('script');
    s.type='text/javascript';
    s.src=src;
    if(id) s.id = id;
    document.getElementsByTagName('head')[0].appendChild(s);
};

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
        orgdocwrite(str);
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
    maskMap : function(map) {
        if(!map._masklayer) {
            var div = Utilities.createDOM(
                '<div style="position:absolute; top:0px; left:0px; background:black; opacity:0.5; filter:alpha(opacity=50); cursor:wait;">'+ 
                    '<div style="position:absolute; background:white;"><img src="'+imgLoading+'"/></div>'+
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
            if( map._masklayer.counter > 0) map._masklayer.counter --;
            if( map._masklayer.counter == 0) {
                map._masklayer.parentNode.removeChild(map._masklayer);
            }
        }
    },

    markerIcons : null,
    getMarkerIcon : function(numPhotos) {
        var markerIcons = this.markerIcons;
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
        }
        
        if(numPhotos <= 100) {
            return markerIcons[0];
        } else {
            return markerIcons[1];
        }
    },
    
    createDOM : function(str) {
        var d = _ce('div');
        d.innerHTML = str;
        return d.firstChild;
    },
    
    getTotalOffsetTop : function(elem) {
        var e = elem;
        var t = 0;
        while(e.offsetParent != null) {
            t += e.offsetTop;
            e = e.offsetParent;
        }
        return t;
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
                    if( !img.getAttribute('src')) {
                        var url = a.url.substring(0,a.url.length-4);
                        img.src=url+'_s.jpg';
                    }
                }
            } else {
                var span = this.imagesDiv_.childNodes[this.currpos_+4];
                if(span) {
                    var a = span.childNodes[0];
                    var img = a.childNodes[0];
                    if( !img.getAttribute('src')) {
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
                    '<div style="height:120px; width:250px;">'+
                        '<div style="position:absolute; top:0px;  left:0px; height:20px; width:250px; text-align:center;"></div>'+
                        '<div style="position:absolute; top:20px; left:0px; height:80px; width:250px;"></div>'+
                        '<div style="position:absolute; top:100px;left:0px; height:20px; width:250px;">'+
                            '<img src="'+imgPrevImg+'" style="cursor:pointer;"/>'+ 
                            '<img src="'+imgNextImg+'" style="cursor:pointer;"/>'+
                            '<span/>'+
                        '</div>'+
                    '</div>');
                var titleDiv = infoContent.childNodes[0];
                var imagesDiv = infoContent.childNodes[1];
                var controlDiv = infoContent.childNodes[2];
                controlDiv.childNodes[0].marker=this;
                controlDiv.childNodes[1].marker=this;
                controlDiv.childNodes[0].onmousedown = this.prevImg;
                controlDiv.childNodes[1].onmousedown = this.nextImg;

                for(var i = 0, len = this.photos_.length; i < len; ++i) {
                    var photo = this.photos_[i];
                    var p_url = 'http://farm'+photo.getAttribute('farm')+'.static.flickr.com/'+photo.getAttribute('server')+'/'+photo.getAttribute('id')+'_'+photo.getAttribute('secret')+'.jpg';
                    var p_title = photo.getAttribute('title');
                    
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
                this.info_=controlDiv.childNodes[2];
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
                '<div style="position:absolute; top:'+(self.innerHeight/2-16)+'px; left:'+(self.innerWidth/2-16)+'px; background:white;"><img src="'+imgLoading+'"/></div>');
            
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

        FPhotoSet.prototype.flickr_photosets_getPhotos_onLoad = function(success, responseXML, responseText, params){
            try {
                if(success == true) {
                    var rsp = responseXML.getElementsByTagName('rsp')[0];
                    var photoset = rsp.getElementsByTagName('photoset')[0];
                    var photos = photoset.getElementsByTagName('photo');
                    
                    var photo;
                    for(var i = 0, len = photos.length; i < len; ++i) {
                        photo = photos[i];
                        var lat = photo.getAttribute('latitude');
                        var lon = photo.getAttribute('longitude');
                        if(lat == 0 && lon == 0) {
                            continue;
                        }
                        
                        photo.position = new GLatLng(parseFloat(lat), parseFloat(lon));
                        this.total_photos[this.total_photos.length] = photo;
                    }
                    
                    var pages = parseInt(photoset.getAttribute('pages'));
                    var page = parseInt(photoset.getAttribute('page'));
                    if( pages > page) {
                        Utilities.maskMap(this);
                        window.F.API.callMethod('flickr.photosets.getPhotos', { photoset_id:params.photoset_id, extras:'geo', page:page+1}, this);
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

        FPhoto.prototype.setPhotoId = function(photoid) {
            this.photoid = photoid;
            window.F.API.callMethod('flickr.photos.getInfo', {photo_id:this.photoid}, this);
        };
        
        FPhoto.prototype.flickr_photos_getInfo_onLoad = function(success, responseXML, responseText, params){
            if(success == true) {
                var rsp = responseXML.getElementsByTagName('rsp')[0];
                var photo = rsp.getElementsByTagName('photo')[0];

                var location = photo.getElementsByTagName('location')[0];

                var secret = photo.getAttribute('secret');
                var server = parseInt(photo.getAttribute('server'));
                var farm = parseInt(photo.getAttribute('farm'));
                var p_url = 'http://farm'+farm+'.static.flickr.com/'+server+'/'+this.photoid+'_'+secret+'_s.jpg';
                
                var latitude = parseFloat(location.getAttribute('latitude'));
                var longitude = parseFloat(location.getAttribute('longitude'));
                this.accuracy = parseFloat(location.getAttribute('accuracy'));
                this.position = new GLatLng(latitude, longitude);
                
                var locality = location.getElementsByTagName('locality');
                if(locality&&locality.length!=0) locality= (locality[0]).firstChild.textContent;
                var county = location.getElementsByTagName('county');
                if(county&&county.length!=0) county= (county[0]).firstChild.textContent;
                var region = location.getElementsByTagName('region');
                if(region&&region.length!=0) region= (region[0]).firstChild.textContent;
                var country = location.getElementsByTagName('country');
                if(country&&country.length!=0) country= (country[0]).firstChild.textContent;
                
                $('fgs-info').innerHTML = region+', '+country;
                

                this.recenter();
                
                var marker = new GMarker(this.position, Utilities.getMarkerIcon(1));
                GEvent.addListener(marker, "click", function() {
                    marker.openInfoWindowHtml('<div><img src="'+p_url+'"/></div>');
                });
                this.addOverlay(marker);
                GEvent.trigger(marker, 'click');
                this.marker = marker;
            }
        };

        FPhoto.prototype.recenter = function(){
            this.setCenter(this.position, 13);
            if(this.marker) GEvent.trigger(this.marker, 'click');
        };


        FPhoto.init=true;
    }
    return new FPhoto(arguments[0],arguments[1]);
};







var FGS = {
    createPhotoSetMap : function(map,photosetid) {
        if (!GBrowserIsCompatible()) return;
        
        var m = FPhotoSet.create(map);
        m.addControl(new GLargeMapControl());
        m.addControl(new GMapTypeControl());
        m.enableDoubleClickZoom();
        m.enableContinuousZoom();
        m.enableScrollWheelZoom();
        m.setPhotoSetId(photosetid);
        return m;
    },

    createPhotoMap : function(map,photoid) {
        if (!GBrowserIsCompatible()) return;

        var m = FPhoto.create(map);
        m.addControl(new GSmallMapControl());
        m.addControl(new GMapTypeControl());
        m.enableDoubleClickZoom();
        m.enableContinuousZoom();
        m.setPhotoId(photoid);
        return m;
    },

    showPhotoSet : function(photosetid) {
        var wrap=$('fgs-wrap');
        if(!wrap) {
            wrap = Utilities.createDOM(
                '<div id="fgs-wrap" style="position:absolute; top:20px; left:20px; visibility:visible; padding:10px; background-color:white; border:1px solid black;">'+
                    '<div id="fgs-close" style="position:relative; top:10px; height:10px; width:10px;"><img src="'+imgClose+'"/></div>' +
                    '<div id="fgs-map" style="position:relative; top:30px; left:10px; width:0px; height:0px; border:1px solid black;"/>' +
                '</div>');
            document.body.appendChild(wrap);
            
            var clslnk = $('fgs-close');
            clslnk.onclick=function() {
                var m = $('fgs-map');
                var wrap=$('fgs-wrap');
                wrap.style.visibility='hidden';
                m.style.width=m.style.height=wrap.style.width=wrap.style.height='0px';
            };
        }

        var w = (innerWidth-80);
        var h = (innerHeight-60);
        wrap.style.width=w+'px';
        wrap.style.height=h+'px';
        wrap.style.visibility='visible';
        
        var clslnk = $('fgs-close');
        clslnk.style.left=(w-20)+'px';
        
        var m = $('fgs-map');
        m.style.width=(w-20)+'px';
        m.style.height=(h-40)+'px';
        
        if(m.gmap) {
            m.gmap.checkResize();
        } else {
            var gmap = FGS.createPhotoSetMap(m,photosetid);
            m.gmap = gmap;
        }
    },

    showPhoto : function(photoid) {
        var wrap=$('fgs-wrap');
        if(wrap) {
            if( wrap.style.visibility == 'visible') {
                wrap.style.visibility = 'hidden';
            } else {
                $('fgs-map').gmap.recenter();
                wrap.style.visibility = 'visible';
            }
            return;
        }
        
        var offset_top = Utilities.getTotalOffsetTop($('li_location'))-320;
        
        wrap = Utilities.createDOM(
            '<div id="fgs-wrap"  style="position:absolute; top:'+offset_top+'px;left:480px;width:500px;height:300px; padding:5px; visibility:visible; background-color:white; border:1px solid gray; z-index:100;">'+
                '<div id="fgs-close" style="position:relative; left:480px; width:10px; height:20px; "><img src="'+imgClose+'"/></div>' +
                '<div id="fgs-map"   style="position:relative; width:500px; height:260px;"></div>' +
                '<div style="position:relative; width:500px; height:20px;"><span id="fgs-info"></span></div>' +
            '</div>');
        $('photoswftd').insertBefore(wrap, $('About'));

        var clslnk = wrap.firstChild;
        clslnk.onclick=function() {
            $('fgs-wrap').style.visibility='hidden';
        };
        
        var m = $('fgs-map');
        m.gmap = FGS.createPhotoMap(m,photoid);
    },

    windowUnload : function() {
        if(typeof GUnload == 'function') {
            GUnload();
        }
    },

    init : function() {
        loadjs('http://flickr-gmap-show.googlecode.com/svn/tags/fgs/current/gmap.js');


        var loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/sets\/(\d*)(\/.*)?$/(window.location.href);
        if(loc&&loc[1]&&loc[2]) { // photo set
            var paras = document.getElementsByTagName('p');
            for (var i=0; i< paras.length; i++) {
                if(paras[i].className == 'Links') {
                    if( paras[i].childNodes[0]==undefined) continue;
                    var nobr = paras[i].childNodes[0];
                    var cs = nobr.childNodes;
                    var img;
                    for(var j = 0; j<cs.length; j++) {
                        if(cs[j].nodeType == 1 && cs[j].tagName=='IMG') {
                            img=cs[j];
                            break;
                        }
                    }

                    var a = document.createElement('a');
                    a.innerHTML='GMap';
                    a.href='javascript:;';
                    a.onclick=function(){FGS.showPhotoSet(loc[2]);};
                    nobr.appendChild(img.cloneNode(true));
                    nobr.appendChild(a);
                    break;
                }
            }
        } else {
            loc = /^http:\/\/www.*\.flickr\.com\/photos\/([a-zA-Z0-9\-\_@]*)\/(\d*)(\/.*)?$/(window.location.href);
            var locdiv = document.getElementById('li_location');
            var geospan = document.getElementById('div_pre_geo_block');
            if(loc&&loc[1]&&loc[2]&&locdiv&&geospan) { // photo
                geospan.innerHTML += '(<a class="Plain" id="fgs_photo_map_link" href="javascript:;">Gmap</a>)';
                var a = $('fgs_photo_map_link');
                a.onclick=function(){FGS.showPhoto(loc[2]);};
            }
        }

        var oldOnunload = window.onunload;
        if (typeof window.onunload != 'function') {
            window.onunload = FGS.windowUnload;
        } else {
            window.onunload = function() {
                oldOnunload();
                FGS.windowUnload();
            };
        }
    }
};

FGS.init();
