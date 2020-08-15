var data = {phonenum: "", errorMsg: ""};
chrome.storage.local.get("CJDP_CACHE", function(CJDP_CACHE){
	CJDP_CACHE = CJDP_CACHE["CJDP_CACHE"];
	if(CJDP_CACHE){
		CJDP_CACHE = JSON.parse(CJDP_CACHE);
		console.log(CJDP_CACHE);
		data.login = false;
		data.name = CJDP_CACHE.username;
		document.querySelector("#login").style.display = "none";
		document.querySelector("#home-page").innerText = "欢迎，" + data.name;
	}else{
		data.login = true;
		data.name = "";
		document.querySelector("#homepageContainer").style.display = "none";
	}
	
	document.querySelector("#loginBtn").onclick = function(){
		var url = CJDP_Config.server.aggrement + "://" + CJDP_Config.server.host + CJDP_Config.loginPath;
		url += "?phonenum=" + document.querySelector("#phonenum").value;
		url += "&stat=login";
		window.open(url);
	};
	
	document.querySelector("#registerBtn").onclick = function(){
		var url = CJDP_Config.server.aggrement + "://" + CJDP_Config.server.host + CJDP_Config.loginPath;
		url += "?phonenum=" + document.querySelector("#phonenum").value;
		url += "&stat=register";
		window.open(url);
	};
	
	document.querySelector("#quit").onclick = function(){
		chrome.storage.local.remove("CJDP_CACHE", function(){
			window.close();
		})
	};
});


