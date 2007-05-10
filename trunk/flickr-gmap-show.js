
var FLICKR_API_KEY = "ebed0eef1b25b738b1903ef93b8f25ee";
var FLICKR_API_SECRET = "4260ccd8c3f7837e";

var imgPrevImg = "http://l.yimg.com/www.flickr.com/images/simple_prev_default.gif";
var imgNextImg = "http://l.yimg.com/www.flickr.com/images/simple_next_default.gif";
var imgPosition = "http://l.yimg.com/www.flickr.com/images/dot1_p.png";
var imgLoading = "http://flickr-gmap-show.googlecode.com/svn/trunk/lightbox/images/loading.gif";		

// Create our "tiny" marker icon
var markerIcon=null;
function getMarkerIcon() {
    if(markerIcon == null) {
        markerIcon = new GIcon();
        markerIcon.image = imgPosition;
        markerIcon.iconSize = new GSize(18, 19);
        markerIcon.iconAnchor = new GPoint(9, 9);
        markerIcon.infoWindowAnchor = new GPoint(9, 9);
    }
    return markerIcon;
}


var Utilities = {};
Utilities.extend = function(subClass, baseClass) {
    function inheritance() {};
    inheritance.prototype = baseClass.prototype;

    subClass.prototype = new inheritance();
    subClass.prototype.constructor = subClass;
    subClass.prototype.baseConstructor = baseClass;
    subClass.superClass = baseClass.prototype;
};
Utilities.clearLightBox = function() {
    var lightbox;
    while(lightbox = document.getElementById("overlay")) {
        document.body.removeChild(lightbox);
    }
    while(lightbox = document.getElementById("lightbox")) {
        document.body.removeChild(lightbox);
    }
};
Utilities.maskMap = function(map) {
    if(!map._masklayer) {
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.cursor="wait";
        div.style.background = "black";
        div.style.opacity = "0.5";
        div.style.filter = "alpha(opacity=50)";
        var img = document.createElement("img");
        img.src = imgLoading;
        img.style.marginLeft = "50%";
        img.style.verticalAlign="middle";
        div.appendChild(img);
        map._masklayer = div;
        map._masklayer.counter = 0;
    }
    map._masklayer.counter ++;
    if( map._masklayer.counter == 1) {
        var domobj = map.getContainer();
        var siz = map.getSize();
        map._masklayer.style.width = siz.width+"px";
        map._masklayer.style.height = siz.height+"px";
        map._masklayer.style.lineHeight=siz.height+"px";
        domobj.appendChild(map._masklayer);
    }
};
Utilities.unmaskMap = function(map) {
    if(map._masklayer) {
        if( map._masklayer.counter > 0) map._masklayer.counter --;
        if( map._masklayer.counter == 0) {
            map._masklayer.parentNode.removeChild(map._masklayer);
        }
    }
};
Utilities.MD5 = function (string) {
    function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
     }

     function F(x,y,z) { return (x & y) | ((~x) & z); }
     function G(x,y,z) { return (x & z) | (y & (~z)); }
     function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }

    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

    return temp.toLowerCase();
}








flickr = {};
flickr._api_key = null;
flickr._secret_key = null;
flickr._callbacks = {};
flickr._callback_number = 0;
flickr.keys = function(api_key, secret_key) {
    flickr._api_key = api_key;
    flickr._secret_key = secret_key;
}
flickr._url = function(args, sign, type) {
    if (!type) { type = 'rest'; }
    var url = 'http://api.flickr.com/services/'+type+'/?'
    var signature = flickr._secret_key;
    var keys = new Array ();
    for (var k in args) { keys.push (k); }
    keys.sort ();
    for (var i=0; i<keys.length; i++) {
        var k = keys[i];
        var v = args[k];
        signature = signature + k + v;
        url = url + (i>0?'&':'') + escape(k) + '=' + escape(v);
    }
    if(sign) {
        signature = Utilities.MD5(signature);
        url = url + '&api_sig='+signature;
    }
    return url;
}
flickr.callapi = function(args, obj, callback, sign) {
    flickr._callback_number++;
    var cb_id = 'cb'+flickr._callback_number;
    args.api_key = flickr._api_key;
    args.format = 'json';
    if (callback) {
        flickr._callbacks[cb_id] = function (rsp) {
            delete (flickr._callbacks[cb_id]);
            callback.call(obj, rsp);
            var script = document.getElementById(cb_id);
            if(script) {
                document.body.removeChild(script);
            }
        }
        args.jsoncallback = 'flickr._callbacks.'+cb_id;
    } else {
        args.nojsoncallback=1;
    }
    if (flickr._token) { args.auth_token = flickr._token; }
    
    var script = document.createElement ('script');
    script.type = "text/javascript";
    script.id = cb_id;
    script.src = flickr._url(args, sign);
    document.body.appendChild(script);
}


flickr.keys(FLICKR_API_KEY, FLICKR_API_SECRET);

function FPhotoMarker(icon, photos) {
    var position;
    if( photos.length == 1) {
        position = new GLatLng(photos[0].latitude, photos[0].longitude);
    } else {
        var bounds = new GLatLngBounds();
        for(var i=0, len=photos.length; i<len; ++i) {
            bounds.extend(new GLatLng(photos[i].latitude, photos[i].longitude));
        }
        position = bounds.getCenter();
    }
    this.baseConstructor.call(this, position, icon);

    this.photos_ = photos;
    this.currpos_ = 0;
    GEvent.addListener(this, "click", this.onClick);
};
function FPhotoMarker_init() {
Utilities.extend(FPhotoMarker, GMarker);
FPhotoMarker.prototype.initialize = function(map) {
    GMarker.prototype.initialize.apply(this, arguments);
    
    var div = document.createElement("div");
    div.innerHTML = this.photos_.length;
    div.style.position = "absolute";
    div.style.cursor = "pointer";
    if( this.photos_.length > 99) {
        div.style.fontSize = "xx-small";
    } else {
        div.style.fontSize = "x-small";
    }
    div.style.textAlign = "center";
    div.marker = this;
    div.onclick = function() {
        GEvent.trigger(this.marker, "click");
    }
    map.getPane(G_MAP_MARKER_PANE).appendChild(div);
    
    this.map_ = map;
    this.div_ = div;
};
FPhotoMarker.prototype.redraw = function(force) {
    GMarker.prototype.redraw.apply(this, arguments);
    if (!force) return;

    var p = this.map_.fromLatLngToDivPixel(this.getPoint());
    var z = GOverlay.getZIndex(this.getPoint().lat());
    
    var iconsize = this.getIcon().iconSize;
    this.div_.style.left = (p.x - iconsize.width/2) + "px";
    this.div_.style.top = (p.y - iconsize.height/2)+2 + "px";
    this.div_.style.width = iconsize.width-2 + "px";
    this.div_.style.height = iconsize.height-3 + "px";
    this.div_.style.zIndex = z+1; // in front of the marker
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
            if( !img.getAttribute("src")) {
                var url = a.href.substring(0,a.href.length-4);
                img.src=url+"_s.jpg";
            }
        }
    } else {
        var span = this.imagesDiv_.childNodes[this.currpos_+4];
        if(span) {
            var a = span.childNodes[0];
            var img = a.childNodes[0];
            if( !img.getAttribute("src")) {
                var url = a.href.substring(0,a.href.length-4);
                img.src=url+"_s.jpg";
            }
        }
    }

    for( var i = 0; i < this.imagesDiv_.childNodes.length; i++ ) {
        var node = this.imagesDiv_.childNodes[i];
        if(i == this.currpos_) {
            node.style.display = "inline";
            node.childNodes[0].childNodes[0].style.width=node.childNodes[0].childNodes[0].style.height='75px';
            node.style.top =  "0px";
            node.style.left = "80px";
        } else if(i == this.currpos_-1) {
            node.style.display = "inline";
            node.childNodes[0].childNodes[0].style.width = node.childNodes[0].childNodes[0].style.height = "45px";
            node.style.top =  "15px";
            node.style.left = "15px";
        } else if(i == this.currpos_+1) {
            node.style.display = "inline";
            node.childNodes[0].childNodes[0].style.width = node.childNodes[0].childNodes[0].style.height = "45px";
            node.style.top =  "15px";
            node.style.left = "175px";
        } else {
            node.style.display = "none";
        }
    }
    this.title_.innerHTML=this.imagesDiv_.childNodes[this.currpos_].childNodes[0].title;
    this.info_.innerHTML=" " + (this.currpos_+1) + " of " + this.imagesDiv_.childNodes.length + " ";
};
FPhotoMarker.prototype.onClick = function() {
    Utilities.clearLightBox();

    if(!this.infoWindow_) {
        var imagesDiv = document.createElement("div");
        for(var i = 0, len = this.photos_.length; i < len; ++i) {
            var photo = this.photos_[i];
            p_url = "http://farm"+photo.farm+".static.flickr.com/"+photo.server+"/"+photo.id+"_"+photo.secret+".jpg";

            var imgspan = document.createElement("span");
            var imglink = document.createElement("a");
            var img = document.createElement("img");

            img.alt = photo.title;
            img.width=img.height=75;
            img.border = "0";
            imglink.rel = "lightbox[photo]";
            imglink.title = photo.title;
            imglink.href = p_url;
            imgspan.id="pic"+i;
            imgspan.style.position="absolute";
            imgspan.style.display="none";

            imglink.appendChild(img);
            imgspan.appendChild(imglink);
            imagesDiv.appendChild(imgspan);
        }

        var imgl = document.createElement("img");
        var imgr = document.createElement('img');
        imgl.marker=imgr.marker=this;
        imgl.style.cursor=imgr.style.cursor="pointer";
        imgl.src=imgPrevImg;
        imgr.src=imgNextImg;
        imgl.onmousedown = this.prevImg;
        imgr.onmousedown = this.nextImg;
        var infoSpan = document.createElement("span");
        var controlDiv = document.createElement('div');
        controlDiv.appendChild(imgl);
        controlDiv.appendChild(imgr);
        controlDiv.appendChild(infoSpan);

        var titleDiv=document.createElement('div');

        var infoWindow = document.createElement("div");
        infoWindow.appendChild(titleDiv);
        infoWindow.appendChild(imagesDiv);
        infoWindow.appendChild(controlDiv);
        
        titleDiv.style.position=imagesDiv.style.position=controlDiv.style.position='absolute';
        titleDiv.style.textAlign='center';
        titleDiv.style.top='0px';
        imagesDiv.style.top='20px';
        controlDiv.style.top='100px';
        titleDiv.style.height='20px';
        imagesDiv.style.height='80px';
        controlDiv.style.height='20px';
        infoWindow.style.height='120px';
        imagesDiv.style.width=controlDiv.style.width=titleDiv.style.width=infoWindow.style.width='250px';

        this.infoWindow_=infoWindow;
        this.title_=titleDiv;
        this.imagesDiv_=imagesDiv;
        this.info_=infoSpan;
    }

    this.refreshImgList();
    this.openInfoWindow(this.infoWindow_);
    initLightbox();
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
};

function FPhotoSet() {
    if (!GBrowserIsCompatible()) { return; }
    this.baseConstructor.apply(this, arguments);
    this.total_photos = new Array();
};
function FPhotoSet_init() {
Utilities.extend(FPhotoSet, GMap2);
FPhotoSet.prototype._frob_callback = function(rsp) {
}
FPhotoSet.prototype.setPhotoSetId = function(photosetid) {
    this.photosetid = photosetid;
    Utilities.maskMap(this);
    flickr.callapi({method:'flickr.photosets.getPhotos', extras:'geo', photoset_id:photosetid}, this, this._search_callback);
    Utilities.maskMap(this);
    flickr.callapi({method:'flickr.photosets.getInfo', photoset_id:photosetid}, this, this._info_callback);
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
        var pos = new GLatLng(photo.latitude, photo.longitude);
        
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
            
            var gbounds = new GLatLngBounds(new GLatLng(pos.lat()-delta, pos.lng()-delta), new GLatLng(pos.lat()+delta, pos.lng()+delta));
            temp_bounds[temp_bounds.length] = gbounds;
            temp_photos[temp_photos.length] = ps;
        }
    }

    for (var i=0,len=temp_photos.length; i<len ; i++) {
        if(temp_photos[i].length == 0) { continue; }
        this.addOverlay(new FPhotoMarker(getMarkerIcon(), temp_photos[i]));
    }

    Utilities.unmaskMap(this);
};
FPhotoSet.prototype._search_callback = function(rsp) {
try {
    if( rsp.stat == "fail") {
        alert(rsp.message);
        return;
    }
    
    var totalphotos = this.total_photos;
    var photo;
    for (var i=0,len=rsp.photoset.photo.length; i<len; i++) {
        photo = rsp.photoset.photo[i];
        if(photo.latitude == 0 && photo.longitude == 0) {
            continue;
        }
        totalphotos[totalphotos.length] = photo;
    }

    var bounds = new GLatLngBounds();
    for (var i=0,len=totalphotos.length; i<len; i++) {
        bounds.extend(new GLatLng(totalphotos[i].latitude, totalphotos[i].longitude));
    }
    
    GEvent.addListener(this, "zoomend", this._onzoom);
    var zoom = this.getBoundsZoomLevel(bounds);
    this.setCenter(bounds.getCenter(), zoom, G_SATELLITE_MAP);

    if( rsp.photoset.pages > parseInt(rsp.photoset.page)) {
        Utilities.maskMap(this);
        flickr.callapi({method:'flickr.photosets.getPhotos', extras:'geo', photoset_id:photosetid, page:parseInt(rsp.photoset.page)+1}, this, this._search_callback);
    }
} finally {
    Utilities.unmaskMap(this);
}
};
FPhotoSet.prototype._info_callback = function(rsp) {
try {
    if( rsp.stat == "fail") {
        return;
    }

    var div = document.createElement("div");
    div.innerHTML = "<a href=\"http://www.flickr.com/photos/"+rsp.photoset.owner+"/sets/"+rsp.photoset.id+"/\">" + rsp.photoset.title._content + "</a>";// + "<br/><br/>" +rsp.photoset.description._content;
    div.style.position = "absolute";
    div.style.textAlign = "center";
    div.style.background = "white";
    div.style.left = "80px";
    div.style.top = "10px";
    div.style.border = "1px solid black";
    div.style.font = "small Arial";
    div.style.padding = "2px";
    div.style.marginBottom = "3px";
    this.getContainer().appendChild(div);
} finally {
    Utilities.unmaskMap(this);
}
};
};












function FPageControl() {
    this.baseConstructor.apply(this, arguments);

    this._spanPgup = this._setStyle(document.createElement("span"));
    this._spanPgup.appendChild(document.createTextNode("PageUp"));
    this._spanPgup.pagectrl = this;
    GEvent.addDomListener(this._spanPgup, "click", this.pageup);

    this._spanInfo = this._setStyle(document.createElement("span"));

    this._spanPgdn = this._setStyle(document.createElement("span"));
    this._spanPgdn.appendChild(document.createTextNode("PageDn"));
    this._spanPgdn.pagectrl = this;
    GEvent.addDomListener(this._spanPgdn, "click", this.pagedn);

    this._ctrl = document.createElement("div");
    this._ctrl.appendChild(this._spanPgup);
    this._ctrl.appendChild(this._spanInfo);
    this._ctrl.appendChild(this._spanPgdn);

    this._setPageNumber(1, 0);
};
function FPageControl_init() {
Utilities.extend(FPageControl, GControl);
FPageControl.prototype.initialize = function(map) {
    this.map = map;
    map.getContainer().appendChild(this._ctrl);
    return this._ctrl;
};
FPageControl.prototype.getDefaultPosition = function() {
    return new GControlPosition(G_ANCHOR_BOTTOM_RIGHT, new GSize(10, 25));
};
FPageControl.prototype._setStyle = function(elem) {
    elem.style.color = "#0000cc";
    elem.style.backgroundColor = "white";
    elem.style.font = "small Arial";
    elem.style.border = "1px solid black";
    elem.style.padding = "2px";
    elem.style.marginBottom = "3px";
    elem.style.textAlign = "center";
    return elem;
};
FPageControl.prototype._setPageNumber = function(curr, total) {
    var upen = false; var dnen = false;
    this._currpage = curr;
    this._totalpages = total;
    if(total == 0) curr = 0;
    if( total<2) {
    } else if( curr==1) {
        dnen = true;
    } else if( curr==total) {
        upen = true;
    } else {
        upen = true;
        dnen = true;
    }
    
    if(upen) {
        this._spanPgup.style.backgroundColor = "white";
        this._spanPgup.style.cursor = "pointer";
    } else {
        this._spanPgup.style.backgroundColor = "gray";
        this._spanPgup.style.cursor = "default";
    }
    if(dnen) {
        this._spanPgdn.style.backgroundColor = "white";
        this._spanPgdn.style.cursor = "pointer";
    } else {
        this._spanPgdn.style.backgroundColor = "gray";
        this._spanPgdn.style.cursor = "default";
    }
    this._spanInfo.style.cursor = "default";
    this._spanInfo.innerHTML = curr+" of "+total;
};
FPageControl.prototype.pageup = function() {
    var pagectrl = this.pagectrl;
    if( pagectrl._currpage == 1) return;
    pagectrl._currpage--;
    pagectrl._spanPgup.style.cursor = "wait";
    pagectrl._spanInfo.style.cursor = "wait";
    pagectrl._spanPgdn.style.cursor = "wait";
    pagectrl.map._refresh();
};
FPageControl.prototype.pagedn = function() {
    var pagectrl = this.pagectrl;
    if( pagectrl._currpage == pagectrl._totalpages) return;
    pagectrl._currpage++;
    pagectrl._spanPgup.style.cursor = "wait";
    pagectrl._spanInfo.style.cursor = "wait";
    pagectrl._spanPgdn.style.cursor = "wait";
    pagectrl.map._refresh();
};
};





function FBrowser() {
    if (!GBrowserIsCompatible()) { return; }
    this.baseConstructor.apply(this, arguments);
    this._pagectrl = new FPageControl();
    this.addControl(this._pagectrl);

    this._lastcenter = new GLatLng(0, 0);
    this._searchparams = "";
    GEvent.addListener(this, "dragend", this._ondrag);
    GEvent.addListener(this, "zoomend", this._onzoom);
};
function FBrowser_init() {
Utilities.extend(FBrowser, GMap2);
FBrowser.prototype.setSearchParameter = function(params) {
    this._searchparams = params;
};
FBrowser.prototype._ondrag = function() {
    var center = this.getCenter();
    var p1 = this.fromDivPixelToLatLng(new GPoint(0, 0)).lat();
    var p2 = this.fromDivPixelToLatLng(new GPoint(0, 60)).lat();
    var delta = (p1 - p2);
    if(Math.abs(center.lat()-this._lastcenter.lat())<delta && Math.abs(center.lng()-this._lastcenter.lng())<delta ) {
        return;
    }
    this._pagectrl._setPageNumber(1, 0);
    this._refresh();
};
FBrowser.prototype._onzoom = function() {
    this._pagectrl._setPageNumber(1, 0);
    this._refresh();
};
FBrowser.prototype._refresh = function() {
    this._lastcenter = this.getCenter();

    var bound = this.getBounds();
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
    
    var params = "extras=geo&";
    if(this._searchparams) {
        params += this._searchparams;
    }

    Utilities.maskMap(this);
    flickr.callapi({method:'flickr.photos.search', extras:'geo', bbox:w+','+s+','+e+','+n, min_taken_date:'2005-01-01', sort:'interestingness-asc', page:this._pagectrl._currpage, per_page:100}, this, this._search_callback);
};
FBrowser.prototype._search_callback = function(rsp) {
try {
    if( rsp.stat == "fail") {
        alert(rsp.message);
        return;
    }
    this.clearOverlays();

    this._pagectrl._setPageNumber(rsp.photos.page, rsp.photos.pages);

    var p1 = this.fromDivPixelToLatLng(new GPoint(0, 0)).lat();
    var p2 = this.fromDivPixelToLatLng(new GPoint(0, 20)).lat();
    var delta = p1 - p2; 

    var temp_bounds = new Array();
    var temp_photos = new Array();
    for (var i=0,len=rsp.photos.photo.length; i<len; i++) {
        var photo = rsp.photos.photo[i];

        if(photo.latitude == 0 && photo.longitude == 0) { continue; }

        var pos = new GLatLng(photo.latitude, photo.longitude);

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
            
            var gbounds = new GLatLngBounds(new GLatLng(pos.lat()-delta, pos.lng()-delta), new GLatLng(pos.lat()+delta, pos.lng()+delta));
            temp_bounds[temp_bounds.length] = gbounds;
            temp_photos[temp_photos.length] = ps;
        }
    }

    for (var i=0,len=temp_photos.length; i<len ; i++) {
        if(temp_photos[i].length == 0) { continue; }
        this.addOverlay(new FPhotoMarker(getMarkerIcon(), temp_photos[i]));
    }
} finally {
    Utilities.unmaskMap(this);
}
};
};



var FlickrGmapShow = {};
FlickrGmapShow.init=function() {
if(!FlickrGmapShow._init) {
FPageControl_init();
FPhotoMarker_init();
FPhotoSet_init();
FBrowser_init();
FlickrGmapShow._init = true;
}}
FlickrGmapShow.createBrowser = function(map, lat, lng, zoom, params) {
    this.init();
    var m = new FBrowser(map);
    m.setSearchParameter(params);
    m.addControl(new GLargeMapControl());
    m.addControl(new GMapTypeControl());
    m.enableDoubleClickZoom();
    m.enableContinuousZoom();
    m.enableScrollWheelZoom();
    m.setCenter(new GLatLng(lat, lng), zoom, G_SATELLITE_MAP);
    return m;
};
FlickrGmapShow.createPhotoSetMap = function(map, photosetid) {
    this.init();
    var m = new FPhotoSet(map);
    m.addControl(new GLargeMapControl());
    m.addControl(new GMapTypeControl());
    m.enableDoubleClickZoom();
    m.enableContinuousZoom();
    m.enableScrollWheelZoom();
    m.setPhotoSetId(photosetid);
    return m;
};



/*
var auth = {};
auth.auth=function() {
    flickr.callapi({method:'flickr.auth.getFrob'}, this, this._frob_callback, true);
}
auth._frob_callback=function(rsp) {
    if( rsp.stat == "fail") {
        alert(rsp.message);
        return;
    }
    alert(rsp.frob._content);
//    window.open(flickr._url({method:'flickr.auth.getToken', perms:'read', api_key:FLICKR_API_KEY, frob:rsp.frob._content}, true, 'auth'));
    flickr.callapi({method:'flickr.auth.getToken', perms:'read', frob:rsp.frob._content}, this, this._token_callback, true);

//    var iframe = document.createElement ('iframe');
//    iframe.setAttribute ('width', '1');
//    iframe.setAttribute ('height', '1');
//    iframe.setAttribute ('src', flickr._url({api_key:FLICKR_API_KEY, perms:'read', frob:frob}, 'auth'))
//    iframe.setAttribute ('onload', 'authed()');
//    document.body.appendChild (iframe);
}
auth._token_callback=function(rsp) {
    if( rsp.stat == "fail") {
        alert(rsp.message);
        return;
    }
}
*/
