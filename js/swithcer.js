//Style Sheet Switcher version 1.1 Oct 10th, 2024

//JS for DIET by Team Redpanchi. v 1.5. Copyright (c) 2024 Redpanchi http://redpanchi.in
// do not use this codes without permission from redpanchi

//Unofficial Update to fix Safari 5.1 glitch re: alternate stylesheets or the disabled property in regards to them


var manual_or_random="manual" //"manual" or "random"
var randomsetting="3 days" //"eachtime", "sessiononly", or "x days (replace x with desired integer)". Only applicable if mode is random.

//////No need to edit beyond here- redpanchi//////////////

function getCookie(Name) { 
	var re=new RegExp(Name+"=[^;]+", "i"); //construct RE to search for target name/value pair
	if (document.cookie.match(re)) //if cookie found
		return document.cookie.match(re)[0].split("=")[1] //return its value
	return null
}

function setCookie(name, value, days) {
	var expireDate = new Date()
	//set "expstring" to either future or past date, to set or delete cookie, respectively
	var expstring=(typeof days!="undefined")? expireDate.setDate(expireDate.getDate()+parseInt(days)) : expireDate.setDate(expireDate.getDate()-5)
	document.cookie = name+"="+value+"; expires="+expireDate.toGMTString()+"; path=/";
}
 
function deleteCookie(name){
	setCookie(name, "moot")
}

function setStylesheet(title, randomize){ //Main stylesheet switcher function. Second parameter if defined causes a random alternate stylesheet (including none) to be enabled
	var i, cacheobj, altsheets=[""];
	if(setStylesheet.chosen)
	try{
		document.getElementsByTagName('head')[0].removeChild(setStylesheet.chosen);
	}catch(e){}
	for(i=0; (cacheobj=document.getElementsByTagName("link")[i]); i++) {
		if(cacheobj.getAttribute("rel").toLowerCase()=="alternate stylesheet" && cacheobj.getAttribute("title")) { //if this is an alternate stylesheet with title
		cacheobj.disabled = true
		altsheets.push(cacheobj) //store reference to alt stylesheets inside array
			if(cacheobj.getAttribute("title") == title){ //enable alternate stylesheet with title that matches parameter
				cacheobj.disabled = false //enable chosen style sheet
				setStylesheet.chosen = document.createElement('link');//cloneNode(false);
				setStylesheet.chosen.rel = 'stylesheet';
				setStylesheet.chosen.type = 'text/css';
				if(cacheobj.media)
					setStylesheet.chosen.media = cacheobj.media;
				setStylesheet.chosen.href = cacheobj.href;
				document.getElementsByTagName('head')[0].appendChild(setStylesheet.chosen);
			}
		}
	}
	if (typeof randomize!="undefined"){ //if second paramter is defined, randomly enable an alt style sheet (includes non)
		var randomnumber=Math.floor(Math.random()*altsheets.length)
		altsheets[randomnumber].disabled=false
	}
	return (typeof randomize!="undefined" && altsheets[randomnumber]!="")? altsheets[randomnumber].getAttribute("title") : "" //if in "random" mode, return "title" of randomly enabled alt stylesheet
}

function chooseStyle(styletitle, days){ //Interface function to switch style sheets plus save "title" attr of selected stylesheet to cookie
	if (document.getElementById){
		setStylesheet(styletitle)
		setCookie("mysheet", styletitle, days)
	}
}

function indicateSelected(element){ //Optional function that shows which style sheet is currently selected within group of radio buttons or select menu
	if (selectedtitle!=null && (element.type==undefined || element.type=="select-one")){ //if element is a radio button or select menu
		var element=(element.type=="select-one") ? element.options : element
		for (var i=0; i<element.length; i++){
			if (element[i].value==selectedtitle){ //if match found between form element value and cookie value
				if (element[i].tagName=="OPTION") //if this is a select menu
					element[i].selected=true
				else{ //else if it's a radio button
					element[i].checked=true
				}
			break
			}
		}
	}
}
if (manual_or_random=="manual"){ //IF MANUAL MODE
	var selectedtitle=getCookie("mysheet")
	if (document.getElementById && selectedtitle!=null) //load user chosen style sheet from cookie if there is one stored
		setStylesheet(selectedtitle)
}else if (manual_or_random=="random"){ //IF AUTO RANDOM MODE
	if (randomsetting=="eachtime")
		setStylesheet("", "random")
	else if (randomsetting=="sessiononly"){ //if "sessiononly" setting
		if (getCookie("mysheet_s")==null) //if "mysheet_s" session cookie is empty
			document.cookie="mysheet_s="+setStylesheet("", "random")+"; path=/" //activate random alt stylesheet while remembering its "title" value
		else
			setStylesheet(getCookie("mysheet_s")) //just activate random alt stylesheet stored in cookie
	}
	else if (randomsetting.search(/^[1-9]+ days/i)!=-1){ //if "x days" setting
		if (getCookie("mysheet_r")==null || parseInt(getCookie("mysheet_r_days"))!=parseInt(randomsetting)){ //if "mysheet_r" cookie is empty or admin has changed number of days to persist in "x days" variable
			setCookie("mysheet_r", setStylesheet("", "random"), parseInt(randomsetting)) //activate random alt stylesheet while remembering its "title" value
			setCookie("mysheet_r_days", randomsetting, parseInt(randomsetting)) //Also remember the number of days to persist per the "x days" variable
		}
		else
		setStylesheet(getCookie("mysheet_r")) //just activate random alt stylesheet stored in cookie
	} 
}

try {
	jQuery(document).ready(function(){		
		jQuery('#menu-item-278 > a, #menu-item-194 > a, #menu-item-192 >  a').click(function(){return false;});		
		jQuery('.dark').click(function(){	
			var thirtyDays = 1000*60*60*24*30;
			var expireDate = new Date((new Date()).valueOf() + thirtyDays);		
			document.cookie = 'contrast' +"="+ 1 +"; expires="+expireDate.toGMTString()+"; path=/";
			document.cookie="username=John Doe";
			jQuery(".light").show();
			jQuery(".dark").hide();
			jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="/css/change.css">');
			jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="theme/css/site-change.html">');
			jQuery(".national_emblem").attr("src","/images/logo.png");// high contrast
			
			jQuery(".ico-skip img.top").attr("src","/images/ico-skip-y.png");
			jQuery(".ico-skip img.bottom").attr("src","/images/ico-skip-light.png");
			
			//jQuery(".ico-social img.top").attr("src","/images/ico-social-y.png");
			//jQuery(".ico-social img.bottom").attr("src","/images/ico-social-light.png");
			
			jQuery(".ico-site-search img.top").attr("src","/images/ico-site-search-y.png");
			jQuery(".ico-site-search img.bottom").attr("src","/images/ico-site-search-light.png");
			
			jQuery(".ico-sitemap img.top").attr("src","/images/ico-sitemap-y.png");
			jQuery(".ico-sitemap img.bottom").attr("src","/images/ico-sitemap-light.html");
			
			jQuery(".ico-accessibility img.top").attr("src","/images/ico-accessibility-light.png");
			jQuery(".ico-accessibility img.bottom").attr("src","/images/ico-accessibility-light.png");
			
			jQuery(".sw-logo img").attr("src","/images/favicon/english-logo.png");
			
		});
		jQuery('.light').click(function(){	
			var thirtyDays = 1000*60*60*24*30;
			var expireDate = new Date((new Date()).valueOf() + thirtyDays);		
			document.cookie = 'contrast' +"="+ 0 +"; expires="+expireDate.toGMTString()+"; path=/";		
			jQuery(".light").hide();
			jQuery(".dark").show();		
			jQuery("[href*='change.css']").remove();
			jQuery("[href*='site-change.css']").remove();
			jQuery(".national_emblem").attr("src","/images/logo.png"); //normal
			
			jQuery(".ico-skip img.top").attr("src","/images/ico-skip.png");
			jQuery(".ico-skip img.bottom").attr("src","/images/ico-skip-light.png");
			
			//jQuery(".ico-social img.top").attr("src","/images/ico-social.png");
			//jQuery(".ico-social img.bottom").attr("src","/images/ico-social-light.png");
			
			jQuery(".ico-site-search img.top").attr("src","/images/ico-site-search.png");
			jQuery(".ico-site-search img.bottom").attr("src","/images/ico-site-search-light.png");
			
			jQuery(".ico-sitemap img.top").attr("src","/images/ico-sitemap.png");
			jQuery(".ico-sitemap img.bottom").attr("src","/images/ico-sitemap-light.html");
			
			jQuery(".ico-accessibility img.top").attr("src","/images/ico-accessibility.png");
			jQuery(".ico-accessibility img.bottom").attr("src","/images/ico-accessibility-light.png");
			
			jQuery(".sw-logo img").attr("src","/images/favicon/english-logo.png");
	
		});
		if(getCookie('contrast') == "1") {
			jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="/css/change.css">');
			jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="theme/css/site-change.html">');
			jQuery(".national_emblem").attr("src","/images/logo.png");// high contrast
			
			jQuery(".ico-skip img.top").attr("src","/images/ico-skip-y.png");
			jQuery(".ico-skip img.bottom").attr("src","/images/ico-skip-light.png");
			
			//jQuery(".ico-social img.top").attr("src","/images/ico-social-y.png");
			//jQuery(".ico-social img.bottom").attr("src","/images/ico-social-light.png");
			
			jQuery(".ico-site-search img.top").attr("src","/images/ico-site-search-y.png");
			jQuery(".ico-site-search img.bottom").attr("src","/images/ico-site-search-light.png");
			
			jQuery(".ico-sitemap img.top").attr("src","/images/ico-sitemap-y.png");
			jQuery(".ico-sitemap img.bottom").attr("src","/images/ico-sitemap-light.html");
			
			jQuery(".ico-accessibility img.top").attr("src","/images/ico-accessibility-light.png");
			jQuery(".ico-accessibility img.bottom").attr("src","/images/ico-accessibility-light.png");
			
			jQuery(".sw-logo img").attr("src","/images/favicon/english-logo.png");
		}
		if(getCookie('contrast') == "0" ) {
			jQuery("[href*='../css/change.css']").remove();
			jQuery(".national_emblem").attr("src","/images/logo.png"); //normal
			
			jQuery(".ico-skip img.top").attr("src","/images/ico-skip.png");
			jQuery(".ico-skip img.bottom").attr("src","/images/ico-skip-light.png");
			
			//jQuery(".ico-social img.top").attr("src","/images/ico-social.png");
			//jQuery(".ico-social img.bottom").attr("src","/images/ico-social-light.png");
			
			jQuery(".ico-site-search img.top").attr("src","/images/ico-site-search.png");
			jQuery(".ico-site-search img.bottom").attr("src","/images/ico-site-search-light.png");
			
			jQuery(".ico-sitemap img.top").attr("src","/images/ico-sitemap.png");
			jQuery(".ico-sitemap img.bottom").attr("src","/images/ico-sitemap-light.html");
			
			jQuery(".ico-accessibility img.top").attr("src","/images/ico-accessibility.png");
			jQuery(".ico-accessibility img.bottom").attr("src","/images/ico-accessibility-light.png");
			
		}
	});
} catch (error) {
	console.log(error);
}
