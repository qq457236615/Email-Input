// 邮箱后缀List参考
var postfixList = ['163.com', 'gmail.com', '126.com', 'qq.com', '263.net'];
// 定义一个数组存储所有提示内容
var sugContentList = [];

// 当前选择的提示索引
var nowSelectIndex = 0;
// 获取输入框
var emailInput = document.getElementById("email-input");
// 获取提示框
var emailSugWrapper = document.getElementById("email-sug-wrapper");
// 监听input事件
emailInput.addEventListener("input", toggleDisplayOfSugWrapper);
// 监听keydown事件(↑  ↓  Enter  ESC)
emailInput.addEventListener("keydown", selectSug);
// 监听点击事件(将所点击的提示信息输入到input中)
emailSugWrapper.addEventListener("click", inputSug);

// 根据按键选择提示信息
function selectSug(e){
	if (e.keyCode === 38) {
	    // 如果按键为"↑"
		var lastSelectIndex = nowSelectIndex; // 历史提示索引(之前一个)
		if (nowSelectIndex === 0) {
			// 如果当前选择的是第一个则转到最后一个
			nowSelectIndex = postfixList.length - 1;
		}else {
			// 如果不是第一个则转到前一个
			nowSelectIndex -= 1;
		}
		setSugClass(lastSelectIndex);
	}else if (e.keyCode === 40) {
		// 如果按键为"↓"
		var lastSelectIndex = nowSelectIndex; // 历史提示索引(之前一个)
		if (nowSelectIndex === postfixList.length-1) {
			// 如果当前选择的是最后一个,则转到第一个
			nowSelectIndex = 0;
		}else {
			// 如果不是最后一个,则转到下一个
			nowSelectIndex += 1;
		}
		setSugClass(lastSelectIndex);
	}else if (e.keyCode === 13) {
		// 如果按键为"Enter"
		emailInput.value = HtmlUtil.htmlDecode(sugContentList[nowSelectIndex]); // 将当前选择的提示信息设置给Input
		// 然后隐藏提示框
		hideSugWrapper();
	}else if (e.keyCode === 27) {
		// 如果按键为"ESC"
		emailInput.select(); // 全选内容
	}
}

// 设置当前选择到的提示内容的class(给一个背景色)
// 参数: lastSelectIndex(之前的一个选择索引)
function setSugClass(lastSelectIndex){
	var sugList = emailSugWrapper.getElementsByTagName("li");
	// 先清空之前的一个选择索引的样式
	sugList[lastSelectIndex].className = "";
	// 再给当前选择索引添加样式
	sugList[nowSelectIndex].className = "now-select";
}

// 重置当前选择的索引
function resetSelectIndex(){
	nowSelectIndex = 0;
}
// 对字符串进行编码和解码(转码器)
var HtmlUtil = {
	/* 利用浏览器内部转换器进行html转码 */
	htmlEncode: function(html){
		// 1.首先动态创建一个div标签
		var tempDiv = document.createElement("div");
		// 2.然后将要转换的字符串设置为这个元素的innerText;
		tempDiv.innerText = html;
		// 3.最后返回innerHTML就得到经过html编码转换的字符串了
		return tempDiv.innerHTML;
	},
	/* 利用浏览器内部转换器实现html解码 */
	htmlDecode: function(text){
		// 1.首先动态创建一个div标签
		var tempDiv = document.createElement("div");
		// 2.然后将要转换的字符串设置为这个元素的innerHTML;
		tempDiv.innerHTML = text;
		// 3.最后返回innerText就得到经过html解码的字符串了
		return tempDiv.innerText;
	}
}

// 将提示内容输入到input框中
function inputSug(e){
	var target = e.target || window.srcElement;
	// 事件代理
	while (target !== this) {
		if (target.nodeName.toLowerCase() === "li") {
			// 将点击到的li标签的内容设置给input
		    var content = target.innerHTML;
			content = HtmlUtil.htmlDecode(content);
			emailInput.value = content;
			// 设置焦点
			emailInput.focus();
			// 隐藏提示框
			hideSugWrapper();
			break;
		}else {
			target = target.parentNode;
		}	
	}
}

// 获得用户输入内容
function getUserInput(){
	var userInput = emailInput.value;
    
	// trim去掉前后空格
	while (userInput[0] === " " || userInput[0] === "　") {
		// 去掉头部空格
		userInput = userInput.slice(1);
	}
	while (userInput[userInput.length-1] === " " || userInput[userInput.length-1] === "　") {
		// 去掉尾部空格
		userInput = userInput.slice(0, userInput.length-1);
	}
	// 返回获取的用户输入内容(已去掉前后空格)
	return userInput;
}

// 生成提示内容
function createSug(){
	// 先将重置当前选择的提示索引
	resetSelectIndex();
	// 获得用户输入(已删除头尾空格)
	var userInput = getUserInput();
	// 对特殊字符串进行转义编码
	userInput = HtmlUtil.htmlEncode(userInput);
	// 判断用户输入是否有@符号
	var indexOfAt = userInput.indexOf("@");
	var userPosfix = "";
	if (indexOfAt !== -1) {
		// (这个要先执行)取@后面的字符串作为后缀来和postfixList中的所有做后缀匹配
		userPosfix = userInput.slice(indexOfAt+1);
		// 如果有@符号,则取@之前的字符串用于拼接的字符串
		userInput = userInput.slice(0, indexOfAt);
	}
	var sugContent = "";
	var sugList = [];
	
	// 先做后缀匹配
	var postfixMatchList = []; // 临时数组存储匹配到的后缀
	for (var k = 0; k < postfixList.length; k++) {
		// 如果匹配到(返回索引必须为0,必须从头部就匹配)
		if (postfixList[k].indexOf(userPosfix) === 0) {
			postfixMatchList.push(postfixList[k]);
		}
	}
	
	// 如果没匹配到则拼接全部后缀
	if (postfixMatchList.length === 0) {
	    postfixMatchList = postfixList;
	}
	// 进行拼接
	sugContentList.length = 0; // 先将数组清空
	for (var i = 0; i < postfixMatchList.length; i++) {
		// 拼接邮箱地址
		sugContent = userInput + "@" + postfixMatchList[i];
		// 将拼接好的提示内容存到数组中
		sugContentList.push(sugContent);
		// 创建为li元素
		var li = document.createElement("li");
		li.innerHTML = sugContent;
		// 添加到数组
		sugList.push(li);
	}
	sugList[nowSelectIndex].className = "now-select";
	// 返回提示内容的li数组
	return sugList;
}

// 将生成好的提示列表添加到email-sug-wrapper中
function addSugToWrapper(){
	// 先将提示列表清空
	emailSugWrapper.innerHTML = "";
	// 获取生成好的提示内容(li数组)
	var sugList = createSug();
		for (var i = 0; i < sugList.length; i++) {
		// 添加li元素到列表中
		emailSugWrapper.appendChild(sugList[i]);
	}
}

// 控制提示框的显示
function toggleDisplayOfSugWrapper(e){
	// 获得用户输入(已删除头尾空格)
	var userInput = getUserInput();
	if (userInput.length !== 0) {
		showSugWrapper();
	}else {
		hideSugWrapper();
	}
}

// 显示提示框
function showSugWrapper(){
	// 添加提示内容
	addSugToWrapper();
	emailSugWrapper.style.display = "block";
}

// 隐藏提示框
function hideSugWrapper(){
	emailSugWrapper.style.display = "none";
}
