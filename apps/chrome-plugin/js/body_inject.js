

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
	var container = `
	<div id="CJDP_CONTAINER"></div>
	`;
	$("body").append(container);
	$("#CJDP_CONTAINER").css("display", "none");
	
	//为container注入内容
	var inner = `
		<div id="CJDP_HEADER">
			<span class="CJDP_LEFT">评论</span>
			<span id='CJDP_QUIT' class='CJDP_RIGHT'>×</span>
			<p id="CJDP_WARRING">ces</p>
		</div>
		<div id='CJDP_MAIN'></div>
		<div id='CJDP_FOOTER'>
			<div id='CJDP_INPUT_BANNER'>
				<input type='text' id='CJDP_INPUT_INIT' readonly="readonly" placeholder='请输入你的评论'> 
			</div>
			<div id='CJDP_PAGE_BANNER'>
				<span id='CJDP_LAST'>上一页</span>
				<span id='CJDP_PAGE'>1</span>
				<span id='CJDP_NEXT'>下一页</span>
			</div>
		</div>
	`;
	$("#CJDP_CONTAINER").append(inner);
	
	
	//注入按钮
	var imgUrl = "data:image/png;base64,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";
	var btn = `<button id="CJDP_EXPAND"><img src="${imgUrl}"></button>`;
	$("body").append(btn);
	
	$("#CJDP_EXPAND").click(function(){
		$(this).fadeOut();
		$("#CJDP_CONTAINER").fadeIn();
	});
	
	$("#CJDP_QUIT").click(function(){
		$("#CJDP_CONTAINER").fadeOut();
		$("#CJDP_EXPAND").fadeIn();
	});
	
	//注入输入框
	var inputArea = `
	<div id="CJDP_INPUT_CONTAINER">
		<div id="CJDP_INPUT">
			<div id="CJDP_INPUT_HEADER">
				<p id="CJDP_INPUT_CLOSE">×</p>
			</div>
			<div id="CJDP_INPUT_WARRING">提醒：你的程序优化未完成。。。</div>
			<div id="CJDP_REPLY_ATTENTION">
				<span>回复：</span>
				<span id="CJDP_REPLY_ATTENTION_CONTENT">测试</span>
			</div>
			<textarea rows='8' placeholder="请输入你的评论" id="CJDP_INPUT_AREA"></textarea>
			<br>
			<button id="CJDP_INPUT_SURE">确定</button>
		</div>
	</div>
	`;
	$(body).append(inputArea);
	
	$("#CJDP_INPUT_CONTAINER").css("height", document.documentElement.clientHeight || document.body.clientHeight);
	$("#CJDP_INPUT_CONTAINER").css("width", document.documentElement.clientWidth || document.body.clientWidth);
	$("#CJDP_INPUT").css("margin-top", document.documentElement.clientHeight * 0.15 ||  document.body.clientHeight * 0.15);
	$("#CJDP_INPUT_CONTAINER").css("display", "none");
	
	$("#CJDP_WARRING").css("display", "none");
	$("#CJDP_REPLY_ATTENTION").css("display", "none");
	$("#CJDP_INPUT_WARRING").css("display", "none");
	
	$("#CJDP_INPUT_CLOSE").click(function(){
		$("#CJDP_INPUT_CONTAINER").fadeOut();
	});
})();


function CJDP_alert(msg){
	$("#CJDP_WARRING").text(msg);
	$("#CJDP_WARRING").slideDown();
	setTimeout(function(){
		$("#CJDP_WARRING").slideUp();
	},3000);
};

function CJDP_input_alert(msg){
	$("#CJDP_INPUT_WARRING").text(msg);
	$("#CJDP_INPUT_WARRING").slideDown();
	setTimeout(function(){
		$("#CJDP_INPUT_WARRING").slideUp();
	},3000);
};

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
	if(pageIndex.endsWith("/")){
		pageIndex = pageIndex.slice(0, pageIndex.length - 1);
	}
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
				CJDP_alert("接收错误");
			}else{
				console.log("res:" + res);
				//插入DOM
				var msgs = JSON.parse(res);
				if(msgs.length == 0){
					CJDP_alert("已经是所有评论");
					return;
				}
				$("#CJDP_MAIN").html("");
				for(var i = 0; i < msgs.length; i++){
					var keyboardman = msgs[i].userMsg[0].name;
					var content = msgs[i].content;
					keyboardman = keyboardman.replaceAll(">", "&gt;").replaceAll("<", "&lt;");
					content = content.replaceAll(">", "&gt;").replaceAll("<", "&lt;");
					content = content.replaceAll("\n", "<br>");
					var like = msgs[i].like;
					var replied = msgs[i].replied.length > 0 ? msgs[i].replied[0].content : "";
					replied = replied.replaceAll(">", "&gt;").replaceAll("<", "&lt;").replaceAll("\n", "<br>");
					var adjid = msgs[i].adjid;
					var adjDom =`
					<div class='CJDP_ADJ' data-adjid="${adjid}">
						<p class='CJDP_NAME'>${keyboardman}</p>
						<p class="CJDP_REPLIED">${replied}</p>
						<p class='CJDP_CONTENT'>${content}</p>
						<div class='CJDP_FUNCTIONS'>
							<div class="CJDP_LIKE"><span>喜欢</span><span class="CJDP_LIKE_NUM">${like}</span></div>
							<div class="CJDP_REPLY">回复</div>
						</div>
					</div>`;
					$("#CJDP_MAIN").append(adjDom);
				}
				$("#CJDP_PAGE").text(index + 1);
			}
		}
	);
};

function Upload(content, replied){
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
	if(pageIndex.endsWith("/")){
		pageIndex = pageIndex.slice(0, pageIndex.length - 1);
	}
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
				"content": content,
				"to": replied || null
			})
		},
		function(res){
			if(res == "Ok"){
				CJDP_input_alert("发送成功");
				CJDP_alert("发送成功");
				$("#CJDP_INPUT_AREA").val("");
				$("#CJDP_REPLY_ATTENTION").slideUp();
				$("#CJDP_REPLY_ATTENTION").removeData("repid");
				$("#CJDP_INPUT_CONTAINER").fadeOut();
			}else{
				CJDP_input_alert("发送失败, 请再试一次");
			}
		}
	);
};


$("#CJDP_INPUT_SURE").click(function(){
	Upload(
		$("#CJDP_INPUT_AREA").val(), 
		$("#CJDP_REPLY_ATTENTION").data("repid") || null
	);
});

$("#CJDP_LAST").click(function(){
	var nowPage = +$("#CJDP_PAGE").text() - 1;
	if(nowPage > 1){
		getPage(nowPage - 1);
	}else{
		CJDP_alert("已经是第一页了");
	}
});

var CJDP_PAGE_TIMEREST = 0;
$("#CJDP_NEXT").click(function(){
	var nowPage = +$("#CJDP_PAGE").text() - 1;
	getPage(nowPage + 1);
});

$("#CJDP_MAIN").on("click", ".CJDP_LIKE", function(){
	var adjid = $(this).parent().parent().data("adjid");
	var srcEle = $(this);
	chrome.runtime.sendMessage(
		{
			rtype:"webReq",
			url: CJDP_Config.server.aggrement + "://"
			+ CJDP_Config.server.host + CJDP_Config.adjustApi
			+ "?atype=like",
			method: "POST",
			body: JSON.stringify({
				uid: Msgs.id,
				adjid: adjid
			})
		},
		function(res){
			if(res == "Ok"){
				var likeNum = +srcEle.find(".CJDP_LIKE_NUM").text();
				srcEle.find(".CJDP_LIKE_NUM").text(likeNum + 1);
				CJDP_alert("点赞成功");
			}else{
				CJDP_alert("点赞失败");
			}
		}
	);
});

$("#CJDP_MAIN").on("click", ".CJDP_REPLY", function(){
	var id = Msgs.id;
	if(!id){
		var nowHref = location.href;
		location.href = CJDP_Config.server.aggrement + "://"
			+ CJDP_Config.server.host + CJDP_Config.loginPath
			+ "?originHref=" + encodeURIComponent(nowHref);
		return;
	}
	var adj = $(this).parent().parent();
	var adjid = adj.data("adjid");
	var content = adj.find(".CJDP_CONTENT").text();
	$("#CJDP_REPLY_ATTENTION_CONTENT").text(content.slice(0, 15) + "...");
	$("#CJDP_REPLY_ATTENTION").data("repid", adjid);
	$("#CJDP_REPLY_ATTENTION").slideDown();
	$("#CJDP_INPUT_CONTAINER").fadeIn();
	$("#CJDP_INPUT_AREA").focus();
});


$("#CJDP_INPUT_INIT").click(function(){
	var id = Msgs.id;
	if(!id){
		var nowHref = location.href;
		location.href = CJDP_Config.server.aggrement + "://"
			+ CJDP_Config.server.host + CJDP_Config.loginPath
			+ "?originHref=" + encodeURIComponent(nowHref);
		return;
	}
	$("#CJDP_INPUT_CONTAINER").fadeIn();
	$("#CJDP_INPUT_AREA").focus();
});


getPage(0);



	