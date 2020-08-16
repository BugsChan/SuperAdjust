

//这部分是专门用于获取信息的
var href = location.href;
var i = href.indexOf("?");
if(i > 0)
	href = href.slice(0, i);
if(href.charAt(href.length - 1) == '/')
	href = href.slice(0, href.length - 1);
if(href == CJDP_Config.server.aggrement + "://" + CJDP_Config.server.host 
+ CJDP_Config.homepage){
	var CJDP_CACHE = localStorage.getItem("CJDP_CACHE");
	//try{
		chrome.runtime.sendMessage({"rtype": "storage", "key": "CJDP_CACHE", "value": CJDP_CACHE }, function(response){
			return;
		});
	//}except(e){}
}

//-----------------------------------------------------------------
//注入html
(function(){
	//注入container
	var body = document.body;
	var container = document.createElement("div");
	container.id = "CJDP_CONTAINER";
	document.body.appendChild(container);
	container.style.display = "none";
	
	var inner = "<div id='CJDP_HEADER'><span class='CJDP_LEFT'>评论</span> <span id='CJDP_QUIT' class='CJDP_RIGHT'>×</span></div>";
	inner += "<div id='CJDP_MAIN'></div>";
	inner += "<div id='CJDP_FOOTER'></div>";
	container.innerHTML = inner;
	
	
	//注入按钮
	var btn = document.createElement("button");
	btn.id = "CJDP_EXPAND";
	btn.innerText = "展开评论";
	body.appendChild(btn);
	
	
	btn.onclick = function(){
		btn.style.display = "none";
		document.querySelector("#CJDP_CONTAINER").style.display = "block";
	};
	
	document.querySelector("#CJDP_QUIT").onclick = function(){
		document.querySelector("#CJDP_CONTAINER").style.display = "none";
		document.querySelector("#CJDP_EXPAND").style.display = "block";
	};
	
	document.querySelector("#CJDP_FOOTER").innerHTML
	= "<div id='CJDP_INPUT_BANNER'><input type='text' id='CJDP_INPUT' placeholder='请输入你的评论'> &nbsp; <button id='CJDP_INPUT_SURE'>确定</button></div>"
	+ "<div id='CJDP_PAGE_BANNER'><span id='CJDP_LAST'>上一页</span><span id='CJDP_PAGE'>1</span><span id='CJDP_NEXT'>下一页</span></div>";
	
	// for(var i = 0 ;i < 50 ;i ++)
	// 	document.querySelector("#CJDP_MAIN").innerHTML += "<div class='CJDP_ADJ'><p class='CJDP_NAME'>张三</p><p class='CJDP_CONTENT'>这是我的测试这是我的测试这是我的测试这是我的测试</p></div>";
})();


//Ajas拉取信息
var Msgs = {};
chrome.runtime.sendMessage({rtype: "getStorage", key: "CJDP_CACHE"},function(res){
	if(res){
		Msgs = JSON.parse(res);
	}
});
function getPage(index){
	var _from = index * 50;
	var _to = (index + 1) * 50;
	
	var pageIndex = location.href
	;
	pageIndex = pageIndex.slice(0, pageIndex.indexOf("?"));
	
	chrome.runtime.sendMessage(
		{
			rtype: "webReq",
			url: CJDP_Config.server.aggrement + "://"
			+ CJDP_Config.server.host + CJDP_Config.adjustApi
			+ "?atype=query",
			method: "POST",
			body: JSON.stringify({
				"pageIndex": pageIndex,
				"from": _from,
				"to": _to
			})
		},
		function(res){
			if(res.startsWith("Error")){
				//alert("接收错误");
			}else{
				console.log("res:" + res);
				//插入DOM
				var msgs = JSON.parse(res);
				if(msgs.length == 0){
					//alert("已经是所有评论");
					return;
				}
				var doms = ""
				for(var i = 0; i < msgs.length; i++){
					doms +="<div class='CJDP_ADJ'><p class='CJDP_NAME'>"
					+ msgs[i].userMsg[0].name
					+"</p><p class='CJDP_CONTENT'>"
					+ msgs[i].content
					+"</p></div>";
				}
				document.querySelector("#CJDP_MAIN").innerHTML = doms;
				document.querySelector("#CJDP_PAGE").innerText = index + 1;
			}
		}
	);
};

function Upload(content){
	var id = Msgs.id;
	if(!id){
		location.href = CJDP_Config.server.aggrement + "://"
			+ CJDP_Config.server.host + CJDP_Config.loginPath
			;
		return;
	}
	var passwdhash = Msgs.passwdhash;
	var pageIndex = location.href
	;
	pageIndex = pageIndex.slice(0, pageIndex.indexOf("?"));
	chrome.runtime.sendMessage(
		{
			rtype: "webReq",
			url: CJDP_Config.server.aggrement + "://"
			+ CJDP_Config.server.host + CJDP_Config.adjustApi
			+ "?atype=upload",
			method: "POST",
			body: JSON.stringify({
				"userid": id,
				"passwdhash": passwdhash,
				"pageIndex": pageIndex,
				"content": content
			})
		},
		function(res){
			if(res == "Ok"){
				alert("发送成功");
				document.querySelector("#CJDP_INPUT").value = "";
			}else{
				alert("发送失败, 请再试一次");
			}
		}
	);
};


document.querySelector("#CJDP_INPUT_SURE").onclick = function(){
	Upload(document.querySelector("#CJDP_INPUT").value);
};

document.querySelector("#CJDP_LAST").onclick = function(){
	var nowPage = +document.querySelector("#CJDP_PAGE").innerText - 1;
	if(nowPage > 1){
		getPage(nowPage - 1);
	}
};

var CJDP_PAGE_TIMEREST = 0;
document.querySelector("#CJDP_NEXT").onclick = function(){
	var nowPage = +document.querySelector("#CJDP_PAGE").innerText - 1;
	if(nowPage > 1){
		getPage(nowPage + 1);
	}
};

getPage(0);



	