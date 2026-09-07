var fontSize = 100;
jQuery(document).ready(function(){
		//alert("ok");
			if(_getCookie("fontSize") != null){
				var fontSize = _getCookie("fontSize");
			}else{
				var fontSize = 100;
			}
			jQuery("#fontSize").css("font-size",fontSize + "%");
});
function _getCookie (name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) {
			return _getCookieVal (j);
		}
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) 
			break;
	}
	return null;
}
function _deleteCookie (name,path,domain) {
	if (_getCookie(name)) {
		document.cookie = name + "=" +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		"; expires=Thu, 01-Jan-70 00:00:01 GMT";
	}
}
function _setCookie (name,value,expires,path,domain,secure) {
	var vurl = true;
	if(path != '' && path != undefined){
		vurl = validUrl(path);
	}
	if(jQuery.type(name) == "string" &&  vurl){
		document.cookie = name + "=" + escape (value) +
		((expires) ? "; expires=" + expires.toGMTString() : "") +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		((secure) ? "; secure" : "");
	}
}
function _getCookieVal (offset) {
	var endstr = document.cookie.indexOf (";", offset);
	if (endstr == -1) { endstr = document.cookie.length; }
	return unescape(document.cookie.substring(offset, endstr));
}
/*********Font size resize by redpanchi**********/
/* Range/step restricted to +-15% (90-115%, 5% steps) rather than the
   original +-30% in 15% jumps -- a swing that large pushed text past
   what several fixed-width/fixed-height parts of the theme (the nav
   bar, absolutely-positioned captions, the leader-photo captions) can
   absorb without wrapping oddly or overlapping. This keeps the resize
   usable for low vision without breaking the layout it's applied to. */
function set_font_size(fontType){
	if(fontType == "increase"){
			 if(fontSize < 115){
			  fontSize = parseInt(fontSize) + 5;
			 }
		  }else if(fontType == "decrease"){
			  if(fontSize > 90){
				fontSize = parseInt(fontSize) - 5;				
			  }
		  }else{
			  fontSize = 100;
		  }
	_setCookie("fontSize",fontSize);
	jQuery("#fontSize").css("font-size",fontSize + "%");
	//jQuery("#template_three_column").css("font-size",fontSize + "%");
}

/* Delegated click handler for the font-size controls in header.njk.
   These used to be inline onClick="set_font_size(...)" attributes,
   which the production Content Security Policy's script-src (no
   'unsafe-inline') silently blocks -- the buttons rendered but did
   nothing. Any value other than "increase"/"decrease" falls through
   to set_font_size()'s existing reset branch, so "reset" works
   without special-casing here. */
document.addEventListener("click", function (event) {
	var trigger = event.target.closest("[data-fontsize]");
	if (trigger) {
		event.preventDefault();
		set_font_size(trigger.getAttribute("data-fontsize"));
	}
});

