

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		switch(request.rtype){
			case "webReq":
				Ajax(request.url, request.body, request.method, function(res){
					sendResponse(res);
				});
				break;
			case "storage":
				var storageObj = {};
				storageObj[request.key] = request.value;
				chrome.storage.local.set(storageObj, function(){
					sendResponse("Ok");
				});
				break;
			case "getStorage":
				chrome.storage.local.get(request.key, function(res){
					sendResponse(res);
				});
				break;
			case "removeStorage":
				chrome.storage.local.remove(request.key, function(res){
					sendResponse('Ok');
				});
				break;
		}
	}
);

function Ajax(url, body, method, callback){
	var XHR = new XMLHttpRequest();
	XHR.open(method, url, true);
	XHR.send(body);
	
	XHR.onreadystatechange = function(){
		if(XHR.readyState != 4){
			return;
		}
		callback(XHR.responseText);
	};
};