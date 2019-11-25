/*页面加载*/


window.onload = function() {
	//绑定按钮
    $(document).keydown(function(event){
        if (event.keyCode ==13 && event.ctrlKey) {
            sendClick();
        }
    });
    $("#file").change(function(){
        if (curAcceptMsgObjType == "chat") {
            sendPrivatePicture("file");
        }else if (curAcceptMsgObjType == "groupchat") {
            sendGroupPicture("file");
        }
    })
    $("#login").click(loginClick);
    $("#reLogin").click(reLoginClick);
	$("#register").click(registerClick);
	$("#logout").click(logoutClick);
	$("#getRoasters").click(getRoasters);
	$("#loginPage-registerPage").click(function(){divHide(this);});
	$("#registerPage-loginPage").click(function(){divHide(this);});
	$("#friendList-chatTemporaryList").click(function(){
        $("#chatTemporaryList-friendList").css("background-position","-220px -96px")
        // $("#friend_group-msg").css("background-position","-150px -96px")
        $("#friendList-chatTemporaryList").css("background-position","-185px -96px")
        divHide(this);
    });
	$("#chatTemporaryList-friendList").click(function(){
        $("#chatTemporaryList-friendList").css("background-position","-304px -246px")
        // $("#friend_group-msg").css("background-position","-150px -96px")
        $("#friendList-chatTemporaryList").css("background-position","-150px -96px")
        divHide(this);
    });
	// $("#friend_group-msg").click(function(){
    //     $("#chatTemporaryList-friendList").css("background-position","-376px -322px")
    //     $("#friend_group-msg").css("background-position","-185px -96px")
    //     $("#friendList-chatTemporaryList").css("background-position","-220px -96px")
    //     divHide(this);
    // });

	$("#send").click(sendClick);  
    $(".chat-box-hd a").click(chatMenuClick)
    $(".list-menu").click(listMenuClick);
    $("#addFriend").click(addFriendsClick);
    $("#createGroup").click(createGroupsClick);
    $(".face").click(faceBoxClick)
    $(".face li").click(function(){chooseFaceClick(this);})
    $("#addGroup").click(joinGroupsClick);
};
// 界面样式全局变量
var mainPage = ".main";//主界面
var nikeName = ".nikename";//用户昵称
var chatList = ".chat-list";//
var serverError = ".serverError";//  多端登陆提醒
var loginKeyError = ".loginKeyError";//  密码错误提醒
var loginPage = "#loginPage";//登录界面
var registerPage = "#registerPage";
var friendList = "#chatTemporaryList";//好友列表
var groupList = "#friendList";//群组列表
var chatBoxContent = "#chat-box-content";//聊天盒子内容容器
var chatObj = ".chat-box-hd span";//聊天对象名字
var textMsg = "#text";//需要发送的消息
var chatBox = ".chat-box";//聊天盒子
var chatCover = ".chat-cover";//聊天封面
var listgroup =".list-group";//删除好友窗口

//
var init_flag=false;
var messageAarray=new Array()
var cuttentChooseObj=null;
var chatNotReadListNum=0;chatNotReadListAddTag=false;
var groupChatNotReadListNum=0;groupChatNotReadListAddTag=false;
// var fileInput = "file";


var curUserId = null;
var curAcceptMsgObj = null; //当前接受消息对象
var curAcceptMsgObjType = null;//当前接受消息对象类型
var curAcceptMsgObjDivId = null; //当前接受消息对象Divid
var curChatGroupId = null; //
var curOwner = null;
var bothRoster = []; //好友id
var toRoster = []; //到好友id
var redPCache = {}; //添加小红点的列表
var objHeadPicture={}; //存储id对应的头像


/*基本功能*/
var conn = new WebIM.connection({
	https: WebIM.config.https,
	// https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
	url: WebIM.config.xmppURL,
    apiUrl: WebIM.config.apiURL,
	isAutoLogin: WebIM.config.isAutoLogin,
	isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
	// heartBeatWait: WebIM.config.heartBeatWait,
	// autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
    // autoReconnectInterval: WebIM.config.autoReconnectInterval
});// 创建连接



conn.listen({
	onOpened: function(message) { //连接成功回调
		// 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
		// 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
		// 则无需调用conn.setPresence();       
		// 连接成功才可以发送消息      
		console.log("%c [opened] 连接已成功建立", "color: green");
		handleOpen(conn);

	},
	onClosed: function(message) {}, //连接关闭回调
	onTextMessage: function(message) {
        // 在此接收和处理消息，根据message.type区分消息来源，私聊或群组或聊天室
        handleTextMessage(message);
        getNoReadMessageNum();

	}, //收到文本消息
	onEmojiMessage: function(message) {
		// 当为WebIM添加了Emoji属性后，若发送的消息含WebIM.Emoji里特定的字符串，connection就会自动将
		// 这些字符串和其它文字按顺序组合成一个数组，每一个数组元素的结构为{type: 'emoji(或者txt)', data:''}
		// 当type='emoji'时，data表示表情图像的路径，当type='txt'时，data表示文本消息
		console.log('表情');
		var data = message.data;
		for(var i = 0, l = data.length; i < l; i++) {
			console.log(data[i]);
		}
	}, //收到表情消息
	onPictureMessage: function(message) {
        handlePictureMessage(message);
        getNoReadMessageNum();
	}, //收到图片消息
	onCmdMessage: function(message) {
		console.log('收到命令消息');
	}, //收到命令消息
	onAudioMessage: function(message) {
		console.log("收到音频消息");
	}, //收到音频消息
	onLocationMessage: function(message) {
		console.log("收到位置消息");
	}, //收到位置消息
	onFileMessage: function(message) {
		console.log("收到文件消息");
	}, //收到文件消息
	onVideoMessage: function(message) {
		var node = document.getElementById('privateVideo');
		var option = {
			url: message.url,
			headers: {
				'Accept': 'audio/mp4'
			},
			onFileDownloadComplete: function(response) {
				var objectURL = WebIM.utils.parseDownloadResponse.call(conn, response);
				node.src = objectURL;
			},
			onFileDownloadError: function() {
				console.log('文件下载失败.')
			}
		};
		WebIM.utils.download.call(conn, option);
	}, //收到视频消息
	onPresence: function(message) {
		handlePresence(message);
	}, //处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
	onRoster: function(message) {
		console.log('处理好友申请');
	}, //处理好友申请
	onInviteMessage: function(message) {
		console.log('处理群组邀请');
	}, //处理群组邀请
	onOnline: function() {
		console.log('本机网络连接成功');
	}, //本机网络连接成功
	onOffline: function() {
		console.log('本机网络掉线');
	}, //本机网络掉线
	onError: function(message) {
		console.log('失败回调');
		console.log(message);
		//$(mainPage).addClass("hide");
		//$(loginPage).removeClass("hide");
		if(message && message.type == 1) {

            $(mainPage).addClass("hide");
            $(loginKeyError).removeClass("hide");
            console.warn('在其它端登陆。')
        }
        if(message && message.type == 8) {
            $(mainPage).addClass("hide");
            $(serverError).removeClass("hide");
            console.warn('在其它端登陆。')
        }     
	}, //失败回调
	onBlacklistUpdate: function(list) { //黑名单变动
		// 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
		console.log(list);
    },
    onReadMessage: function(message) {  
        console.log("消息已读")
    }, //收到消息已读回执   --不能用
	onReceivedMessage: function(message) {
        console.log("已送到")
	}, //收到消息送达客户端回执

	onCreateGroup: function(message) {}, //创建群组成功回执（需调用createGroupNew）
	onMutedMessage: function(message) {} //如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
	// onBlacklistUpdate: function (list) {
	//     // 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
	//     console.log(list);
	// }     // 黑名单变动
});// 回调函数



/*回调函数实现的功能*/
var handleOpen = function(conn) {
    //从连接中获取到当前的登录人注册帐号名
    curUserId = conn.context.userId;
    $(nikeName).text(curUserId);  

    getRoasters();
    getGroups();
};// 处理连接时
var handlePresence = function(message){
    console.log(message.type);
    switch(message.type) {
        case 'joinPublicGroupSuccess':
            console.log(message);
            break;
        case 'joinGroupNotifications':
            
            var a = confirm("入群申请 : "+message.from+"想加入你的群");
            var options = {
                applicant: message.from,
                groupId: message.gid,
                success: function(resp){
                    console.log(resp);
                },
                error: function(e){}
            };
            if (a) {  
                conn.agreeJoinGroup(options);
            }else{
                conn.rejectJoinGroup(options);
            }
            break;
        case 'subscribe': // 对方请求添加好友
            var a = confirm("好友申请 : "+message.status);
            // $("#selectMsg").text("好友申请 : "+message.status);
            // $("#selectdModal").modal();
            if (a) {// 同意对方添加好友
                conn.subscribed({
                    to: message.from,
                    message: "[resp:true]"
                });
            }else{
                conn.unsubscribed({
                    to: message.from,
                    message: "残忍的拒绝了你的好友请求" // 拒绝添加好友回复信息
                });
            }// 拒绝对方添加好友    
            
            break;
        case 'subscribed': // 对方同意添加好友，已方同意添加好友
            $("#remindMsg").text("成功添加"+message.from+"为好友");
            $("#remindModal").modal();
            var id = 'ListRosters-'+message.from;
            var hidename = message.from;
            var displayname = hidename;
            var type = 'chat';
            var src = "../static/demo/img/"+message.from+".jpg"
            var chatId = 'ChatRosters-'+message.from;
            appendListDiv(id,hidename,displayname,type,friendList,src);
            appendChatDiv(chatId,chatBoxContent);
            break;
        case 'unsubscribe': // 对方删除好友
            console.log(message);
            break;
        case 'unsubscribed': // 被拒绝添加好友，或被对方删除好友成功
            $("#remindMsg").text(message.from+message.status);
            $("#remindModal").modal();
            break;
        case 'memberJoinPublicGroupSuccess': // 成功加入聊天室
            console.log('join chat room success');
            break;
        case 'joinChatRoomFaild': // 加入聊天室失败
            console.log('join chat room faild');
            break;
        case 'joinPublicGroupSuccess': // 意义待查
            console.log('join public group success', message.from);
            break;
        case 'createGroupACK':
            conn.createGroupAsync({
                from: message.from,
                success: function(option) {
                    console.log('Create Group Succeed');
                }
            });
            break;
    }
}//处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
var getRoasters = function() {
    var option = {
        success: function(roster) {
            // roster是所有好友，格式为：
            /*
             [
             {
             jid:"easemob#chatdemoui_test1@easemob.com",
             name:"test1",
             subscription: "both"
             // subscription的值的集合是{both, to, from, none},
             // both表示互相在对方的好友列表中，
             // to 和 from意义待定
             // 如果添加对方为好友被拒绝则为none
             }
             ]
             */
            // var curroster;
            for(var o in roster) {
                var ros = roster[o];
                // both为双方互为好友，要显示的联系人,from我是对方的单向好友
                if(ros.subscription == 'both' || ros.subscription == 'from') {
                    bothRoster.push(ros);
                } else if(ros.subscription == 'to') {
                    //to表明了联系人是我的单向好友
                    toRoster.push(ros);
                }
            }
            if(bothRoster.length > 0) {
                buildListRostersDiv(bothRoster); //联系人列表页面处理
              
                buildChatRostersDiv(bothRoster);
            }
        }
    };
    conn.getRoster(option);
   
};// 显示好友（需要插入昵称和头像）
var getGroups = function() {
    var option = {
        success: function(rooms) {
            if(rooms.length > 0) {
                buildListGroupsDiv(rooms); //群组列表页面处理
                buildChatGroupsDiv(rooms);
            }
        },
        error: function() {
            console.log('显示群组错误');
        }
    };
    conn.listRooms(option);

};// 显示群组（需要插入头像）
function buildListRostersDiv(roster) {
    // 建立缓存，存好友，用处是下面判断是一个好友则跳出当前循环
    var cache = {};
    deleteList();//避免列表重复
    for(i = 0; i < roster.length; i++) {
        if(!(roster[i].subscription == 'both' || roster[i].subscription == 'from')) {
            continue;
        }
        var userName = roster[i].name;
        var id = "ListRosters-"+userName;
        var displayname = userName;//应该传入昵称
        var type = "chat";
        var obj = friendList;
        /*objHeadPicture[userName ]=String(Math.floor(Math.random()*10));
        console.log(objHeadPicture[userName])*/
        var imgSrc = "../static/demo/img/"+userName+".jpg";
        if(userName in cache) {
            continue;
        }
        cache[userName] = true;
        appendListDiv(id,userName,displayname,type,obj,imgSrc);
    }
};// 构建好友列表
function buildChatRostersDiv(roster) {
    for(i = 0; i < roster.length; i++) {
        var id = 'ChatRosters-'+roster[i].name;
        appendChatDiv(id,chatBoxContent);
    }
}// 构建好友聊天盒子
function buildListGroupsDiv(groups) {

    var cache = {};
    for(i = 0; i < groups.length; i++) {
        var roomsName = groups[i].name;
        var roomId = groups[i].roomId;
        var id = "ListGroups-"+roomId;
        var type = "groupchat";
        var obj = groupList;
        var imgSrc = '../static/demo/img/group_normal.png';
        if(roomId in cache) {
            continue;
        }
        cache[roomId] = true;
        appendListDiv(id,roomId,roomsName,type,obj,imgSrc);
    }
};// 构建群组列表
function buildChatGroupsDiv(groups){
    for(i = 0; i < groups.length; i++) {
        var id = 'ChatGroups-'+groups[i].roomId;
        appendChatDiv(id,chatBoxContent);
    }

    init_flag=true;         //从这里到getNoReadMessageNum();都是因为在刚上线页面还没初始化完成时，就产生了未读消息的回调函数（这时无法正常显示未读的标记）
    for (var j=0,ml=messageAarray.length;j<ml;j++){
        if (messageAarray[j].url==undefined){
            handleTextMessage(messageAarray[j]);
        }
        else{
            handlePictureMessage(messageAarray[j]);
        }

    }
    messageAarray=[];
    getNoReadMessageNum();

};// 构建群组聊天盒子
function appendListDiv(id,hidename,displayname,type,obj,src){
    var aelem = $('<a>').attr({
        "href":"JavaScript:;",
        'id': id,
        'type': type,
        'hidename': hidename,
        'displayname': displayname
    }).click(function() {
        chooseListDivClick(this);
    });
    $('<img>').attr("src", src).attr("width", "40px").attr("class", "img-circle ").attr("height", "40px").appendTo(
        aelem);
    $('<span>').html(displayname).appendTo(aelem);
    $(obj).append(aelem);
};//动态插入列表
function appendChatDiv (id,obj){
    var chatdiv = $('<div>').attr({
        'id': id,
        'class': 'chat-box-content hide',
    });
    $(obj).append(chatdiv);
};//动态插入聊天盒子
var handleTextMessage = function(message){
    var msgObjDivId = null;
    var listObjIId = null;

    if (init_flag==true){
        
            if (message.type == "chat") {
                msgObjDivId = "ChatRosters-"+message.from;
                listObjIId = "ListRosters-" +message.from;
            }else if (message.type == "groupchat") {
                msgObjDivId = "ChatGroups-"+message.to;
                listObjIId = "ListGroups-"+message.to;
            }
            // 把接受的消息添加进消息盒子中
            var chatdiv = $('<div>').attr({
                'class': 'otherMsg'
            });
            var chatdiv_info = $('<div>').attr({
                'class': 'msginfo'
            });
            $('<span>').html(message.from).attr({'class':'chat-name chat-left'}).appendTo(chatdiv_info);
            //获取时间
            var today=new Date();
            var s=today.getFullYear()+"-"+String(Number(today.getMonth())+1)+"-"+today.getDate()+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();

            $('<span>').html(s).attr({'class':'chat-time chat-right'}).appendTo(chatdiv_info);
            $('#' + msgObjDivId).append(chatdiv_info);
            var imgSrc = "../static/demo/img/"+message.from+".jpg";
            $('<img>').attr({
                'width': '40px',
                'height': '40px',
                "id": 'limg',
                'class':'img-circle',
                'src': imgSrc
            }).appendTo(chatdiv);
            $('<span>').html(message.data).attr({'class':'chat-massage'}).appendTo(chatdiv);
            $('#' + msgObjDivId).append(chatdiv);
            listChatTime(listObjIId );   //列表添加时间
            // 小红点添加
            if (msgObjDivId !=  cuttentChooseObj) {
                if(msgObjDivId in redPCache) {
                    var redIVal = $("#"+listObjIId + " i").text();
                    redIVal = parseInt(redIVal) + 1;
                    $("#"+listObjIId + " i").text(redIVal);
                } else {
                    var redI = $('<i>').attr({
                        "id": "redP-" + msgObjDivId
                    }).text(1);
                    $("#" + listObjIId).append(redI);
                    redPCache[msgObjDivId] = true;
                };

            }
        }
        else{
            messageAarray.push(message)
        }
    
};//*********************************************************收到文字消息***********************************************************

var handlePictureMessage  = function(message){
    console.log('图片');
    if (init_flag==true){

        var options = {
            url: message.url
        };
        options.onFileDownloadComplete = function() {
            // 图片下载成功
            var msgObjDivId = null;
            var listObjIId = null;
            if (message.type == "chat") {
                msgObjDivId = "ChatRosters-"+message.from;
                listObjIId = "ListRosters-" +message.from;
            }else if (message.type == "groupchat") {
                msgObjDivId = "ChatGroups-"+message.to;
                listObjIId = "ListGroups-"+message.to;
            }
            // 把接受的消息添加进消息盒子中
            var chatdiv = $('<div>').attr({
                'class': 'otherMsg'
            });
            var chatdiv_info = $('<div>').attr({
                'class': 'msginfo'
            });
        
            $('<span>').html(message.from).attr({'class':'chat-name chat-left'}).appendTo(chatdiv_info);
            //获取时间
            var today=new Date();
            var s=today.getFullYear()+"-"+"-"+String(Number(today.getMonth())+1)+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
            
            $('<span>').html(s).attr({'class':'chat-time chat-right'}).appendTo(chatdiv_info);
            $('#' + msgObjDivId).append(chatdiv_info);

            $('<img>').attr({
                'src': "../static/demo/img/"+message.from+".jpg",
                'width': '40px',
                'height': '40px',
                'id':'limg',
                'class':'img-circle'
            }).appendTo(chatdiv);
            console.log(message);
            var span = $('<span>').appendTo(chatdiv);
            $('<img>').attr({
                'margin': '0px 10px',
                'src': message.url,
                'width': '180px',
            }).appendTo(span);
            $('#' + msgObjDivId).append(chatdiv);
            setTimeout(function(){scrollBottom('#'+msgObjDivId);}, 500);
            listChatTime(listObjIId );   //列表添加时间
            // 小红点添加
            if (msgObjDivId !=  cuttentChooseObj) {
                    if(msgObjDivId in redPCache) {
                        var redIVal = $("#"+listObjIId + " i").text();
                        redIVal = parseInt(redIVal) + 1;
                        $("#"+listObjIId + " i").text(redIVal);
                    } else {
                        var redI = $('<i>').attr({
                            "id": "redP-" + msgObjDivId
                        }).text(1);
                        $("#" + listObjIId).append(redI);
                        redPCache[msgObjDivId] = true;
                    };
                    
            
                console.log('图片下载成功!');
                console.log(message);
            }
        };
        options.onFileDownloadError = function() {
            // 图片下载失败
            console.log('图片下载失败!');
        };
        WebIM.utils.download.call(conn, options); // 意义待查
    }
    else{
        messageAarray.push(message)
    }

};//**************************************************************** *收到图片消息**********************************************

/*基本API*/

function getNoReadMessageNum(){               //获取好友和群组是否有未读消息，使用在消息的回调函数里
    chatNotReadListNum=0;
    groupChatNotReadListNum=0;
    for(var name in redPCache){
        if(name.split("-")[0] == "ChatRosters" ){
            chatNotReadListNum+=1;
        }
        if(name.split("-")[0] == "ChatGroups" ){
            groupChatNotReadListNum+=1;
        }
    }
    console.log(chatNotReadListNum,groupChatNotReadListNum)
    if(chatNotReadListNum != 0 && chatNotReadListAddTag==false){
        $("#friendList-chatTemporaryList").append("<i class='notify'></i>");
        chatNotReadListAddTag=true;  //添加过标记后就不再重复添加
    }
    else if(chatNotReadListNum == 0 && chatNotReadListAddTag==true)
    {
        $("#friendList-chatTemporaryList i").remove();
        chatNotReadListAddTag=false;
    }
    if(groupChatNotReadListNum != 0 && groupChatNotReadListAddTag==false){
        $("#chatTemporaryList-friendList").append("<i class='notify'></i>")     
        groupChatNotReadListAddTag=true;  //添加过标记后就不再重复添加
    }
    else if(groupChatNotReadListNum == 0 && groupChatNotReadListAddTag==true){
        $("#chatTemporaryList-friendList i").remove();
        groupChatNotReadListAddTag=false;
    }
    
    

}


var register = function(username,password,nickname) {
    console.log("hahahahhahahah")
	var options = {

		username: username, //填入用户名
		password: password, //填入密码
		nickname: nickname, //填入昵称
		appKey: WebIM.config.appkey,
		success: function() {
			$("#remindMsg").text("注册成功");
            $("#remindModal").modal();
            $("#registerPage input").val("");
            $(registerPage).addClass("hide");
            $(loginPage).removeClass("hide");
		},
		error: function(data) {
            if (data.type == "17") {
                $("#remindMsg").text("用户名重复请重新注册");
                $("#remindModal").modal();
            }
            $("#registerPage input").val("");
		},
		apiUrl: WebIM.config.apiURL
	};
	conn.registerUser(options);
};// 注册
var login = function(user,pwd) {
	var options = {
		apiUrl: WebIM.config.apiURL,
		user: user,
		pwd: pwd,
		appKey: WebIM.config.appkey
	};
    conn.open(options);


};// 登录
var logout = function() {
	conn.close();
};// 退出
var sendPrivateText = function(text, obj) {
    var id = conn.getUniqueId();
    var msg = new WebIM.message('txt', id);
    msg.set({
        msg: text, // 消息内容
        to: obj, // 接收消息对象
        roomType: false,
        success: function(id, serverMsgId) {
            console.log("发送私聊信息成功");
        },
        fail: function(e) {
            console.log("发送私聊信息失败");
        }
    });
    msg.body.chatType = 'singleChat';
    conn.send(msg.body);
};// 私聊发送文本消息，发送表情同发送文本消息，只是会在对方客户端将表情文本进行解析成图片
var sendGroupText = function (text, obj) {
    var id = conn.getUniqueId();            // 生成本地消息id
    var msg = new WebIM.message('txt', id); // 创建文本消息
    var option = {
        msg: text,             // 消息内容
        to: obj,                     // 接收消息对象(群组id)
        roomType: false,
        chatType: 'chatRoom',
        success: function () {
            console.log('发送群信息成功');
        },
        fail: function () {
            console.log('发送群信息失败');
        }
    };
    msg.set(option);
    msg.setGroup('groupchat');
    conn.send(msg.body);
};// 群组发送文本消息

var sendPrivatePicture = function(obj){
            var id = conn.getUniqueId();
            var msg = new WebIM.message('img', id);
            var input = document.getElementById(obj);               // 选择图片的input
            var file = WebIM.utils.getFileUrl(input);                   // 将图片转化为二进制文件
            var allowType = {
                'jpg': true,
                'gif': true,
                'png': true,
                'bmp': true
            };

            var option = {
                apiUrl: WebIM.config.apiURL,
                file: file,
                to: curAcceptMsgObj,
                roomType: false,
                chatType: 'singleChat',
                onFileUploadError: function () {
                    console.log('onFileUploadError');
                },
                onFileUploadComplete: function (data) {
                    var chatdiv = $('<div>').attr({
                        'class': 'myMsg'
                    });
                    var chatdiv_info = $('<div>').attr({
                        'class': 'msginfo'
                    });
                    //获取时间
                    listChatTime("ListRosters-"+curAcceptMsgObj) ;   //列表添加时间
                    var today=new Date();
                    var s=today.getFullYear()+"-"+String(Number(today.getMonth())+1)+"-"+today.getDate()+"  "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
                    $('<span>').html("my").attr({'class':'chat-name chat-right'}).appendTo(chatdiv_info);
                    $('<span>').html(s).attr({'class':'chat-time chat-left'}).appendTo(chatdiv_info);
                    $('#' + curAcceptMsgObjDivId).append(chatdiv_info);
            
                    $('<img>').attr({
                        'src': '../static/demo/img/'+curUserId+'.jpg',
                        'width': '40px',
                        'height': '40px',
                        'id': 'rimg',
                        'class':'img-circle'
                    }).appendTo(chatdiv);
                    var text = $("#text").text();
                    var span = $('<span>').appendTo(chatdiv);
                    $('<img>').attr({
                        'src': data.uri+"/"+data.entities[0].uuid,
                        'width': '300px',
                    }).appendTo(span);
                    $('#'+curAcceptMsgObjDivId).append(chatdiv);
                    console.log($('#' + curAcceptMsgObjDivId).prop("scrollHeight"));
                    setTimeout(function(){scrollBottom('#'+curAcceptMsgObjDivId);}, 500);
                },
                success: function () {
                    console.log('Success');
                },
            };
            // for ie8
            try {
                if (!file.filetype.toLowerCase() in allowType) {
                    console.log('file type error')
                    return
                }
            } catch (e) {
                option.flashUpload = WebIM.flashUpload
            }
            msg.set(option);
            conn.send(msg.body);
}//私聊发送图片

var sendGroupPicture = function(obj){
            var id = conn.getUniqueId();
            var msg = new WebIM.message('img', id);
            var input = document.getElementById(obj);               // 选择图片的input
            var file = WebIM.utils.getFileUrl(input);                   // 将图片转化为二进制文件
            var allowType = {
                'jpg': true,
                'gif': true,
                'png': true,
                'bmp': true
            };

            var option = {
                apiUrl: WebIM.config.apiURL,
                file: file,
                to: curAcceptMsgObj,
                roomType: false,
                chatType: 'chatRoom',
                onFileUploadError: function () {
                    console.log('onFileUploadError');
                },
                onFileUploadComplete: function (data) {
                    var chatdiv = $('<div>').attr({
                        'class': 'myMsg'
                    });

                    var chatdiv_info = $('<div>').attr({
                        'class': 'msginfo'
                    });
                    //获取时间
                    listChatTime("ListGroups-"+curAcceptMsgObj) ;   //列表添加时间
                    var today=new Date();
                    var s=today.getFullYear()+"-"+String(Number(today.getMonth())+1)+"-"+today.getDate()+"  "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
                    $('<span>').html("my").attr({'class':'chat-name chat-right'}).appendTo(chatdiv_info);
                    $('<span>').html(s).attr({'class':'chat-time chat-left'}).appendTo(chatdiv_info);
                    $('#' + curAcceptMsgObjDivId).append(chatdiv_info);
            
                    $('<img>').attr({
                        'src': '../static/demo/img/'+curUserId+'.jpg',
                        'width': '40px',
                        'height': '40px',
                        'id': 'rimg',
                        'class':'img-circle'
                    }).appendTo(chatdiv);
                    var text = $("#text").text();
                    var span = $('<span>').appendTo(chatdiv);
                    $('<img>').attr({
                        'src': data.uri+"/"+data.entities[0].uuid,
                        'width': '300px',
                    }).appendTo(span);
                    $('#'+curAcceptMsgObjDivId).append(chatdiv);
                    // 图片延时
                    setTimeout(function(){scrollBottom('#'+curAcceptMsgObjDivId);}, 500);
                },
                success: function () {
                    console.log('Success');
                },
            };
            // for ie8
            try {
                if (!file.filetype.toLowerCase() in allowType) {
                    console.log('file type error')
                    return
                }
            } catch (e) {
                option.flashUpload = WebIM.flashUpload
            }
            msg.set(option);
            msg.setGroup('groupchat');
            conn.send(msg.body);
}//群聊发送图片

var addFriends = function(name,msg) {
    if (name != null && name != "") {
        conn.subscribe({
            to: name,
            // Demo里面接收方没有展现出来这个message，在status字段里面
            message: msg
        });
    }
};// 添加好友
var removeFriends = function (obj) {
    conn.removeRoster({
        to: obj,
        success: function () {  // 删除成功
            conn.unsubscribed({
                to: obj
            });
        },
        error: function () {    // 删除失败
        }
    });
};//删除好友
var createGroups = function(value,info,members,pub,opM,opA){
    var options = {
            subject: value,// 群名称
            description: info,// 群简介
            members: members,// 以数组的形式存储需要加群的好友ID
            optionsPublic: pub,// 是否允许任何人加入
            optionsModerate: opM,// 加入是否需审批
            // optionsMembersOnly: true,                  // 是否允许任何人主动加入
            optionsAllowInvites: opA,// 是否允许群人员邀请
        success: function (respData) {},
        error: function () {}
        };
    conn.createGroup(options);
};//创建群
var joinGroups = function(groupId){
    var options = {
        groupId: groupId,
        success: function(resp) {
            console.log("成功加入群的resp: ", resp);
            // $("#remindMsg").text("成功加入群");
            // $("#remindModal").modal();
            // var id = 'ListGroups-'+message.from;
            // var hidename = message.from;
            // var displayname = hidename;
            // var type = 'chat';
            // var src = "./demo/img/group_normal.png"
            // var chatId = 'ChatGroups-'+message.from;
            // appendListDiv(id,hidename,displayname,type,friendList,src);
            // appendChatDiv(chatId,chatBoxContent);
        },
        error: function(e) {
            if(e.type == 17){
                $("#remindMsg").text("你已经加入了该群");
                $("#remindModal").modal();
            }
        }
    };
    conn.joinGroup(options);
}//添加群
var leaveGroup = function (user,groupid) {
    var option = {
        to: user,
        roomId: groupid,
        success: function () {
            console.log('你成功离开了群!');
        },
        error: function () {
            console.log('离开群失败');
        }
    };
    conn.leaveGroupBySelf(option);
};// 成员主动退出群
var dissolveGroup = function (groupid) {
    var option = {
        groupId: groupid,
        success: function () {
            console.log('Destroy group success!');
        }
    };
    conn.dissolveGroup(option);
};//解散群
var getGroupInfo = function(gid){
    var options = {
    groupId: gid,
    success: function(resp){
        console.log("Response: ", resp);
    },
    error: function(){}
    };
    conn.getGroupInfo(options);
}//获取群组信息
var getGroupAdmin = function(gid){
    var pageNum = 1,
    pageSize = 1000;
    var options = {
        pageNum: pageNum,
        pageSize: pageSize,
        groupId: gid,
        success: function (resp) {
            var a = resp.data[resp.data.length-1].owner;
            curOwner = a;
        },
        error: function(e){}
    };
    conn.listGroupMember(options);
}//获取群组下所有管理员

var listChatTime = function(obj){
        var today=new Date();
        var list_time_info =$('<span>').attr({'id': obj+'left-chat-time' }).attr({'class':'left-chat-time' });
        //var s1=today.getFullYear()+"-"+String(Number(today.getMonth())+1)+"-"+today.getDate()+"  "+today.getHours()+":"+today.getMinutes();
        var s1=today.getHours()+":"+today.getMinutes();
        //console.log("#"+obj)
        $("#"+obj+"left-chat-time").remove();    //先移除
        $('<span1>').html(s1).appendTo(list_time_info);
        $("#"+obj).append(list_time_info);    //再添加
} //用于显示列表旁的聊天时间


/*点击事件*/
var reLoginClick = function(){
    deleteList(); 
    login('admin','123456');
    $(mainPage).removeClass("hide");
    $(serverError).addClass("hide");

};//点击重新登陆事件
var registerClick = function(){
    var a = $("#username").val();
    var b = $("#password").val();
    var c = $("#nickname").val();
    register(a,b,c);
};//点击注册事件
var loginClick = function(){
    var a = $("#user").val();
    var b = $("#pwd").val();
    login(a,b);
};//点击登录按钮事件
var logoutClick = function() {
    logout();
    window.location.reload();
};//点击登出事件
var listMenuClick =function(){
    $(".list-menu ul").toggleClass("hide");
};// 点击列表菜单事件
var addFriendsClick = function(){
    var name = $("#addFriendName").val();
    var msg = $("#addFriendMsg").val();
    addFriends(name,msg);
};//点击添加好友事件
var chatMenuClick = function(){
    $(".chat-box-hd a ul").empty();
    if (curAcceptMsgObjType == "chat") {
        var li = $('<li>').attr({
            "id" : "removeFriends",
            "class" : "list-group-item"
        }).text("删除好友").click(removeFriendsClick);
        $(".chat-box-hd a ul").append(li);
    }else if (curAcceptMsgObjType == "groupchat") {
        if (curOwner == curUserId) {
            var id = $("#"+curAcceptMsgObjDivId.replace(/Chat/,"List")).attr("hidename");
            var lia = $('<li>').attr({
                "class" : "list-group-item"
            }).text("群ID："+id);
            var li = $('<li>').attr({
                "id" : "quitGroups",
                "class" : "list-group-item"
            }).text("解散群组").click(unGroupClick);
            $(".chat-box-hd a ul").append(li);
            $(".chat-box-hd a ul").append(lia);
        }else{
            var id = $("#"+curAcceptMsgObjDivId.replace(/Chat/,"List")).attr("hidename");
            /*var lia = $('<li>').attr({
                "class" : "list-group-item"
            }).text("群ID："+id);*/
            var li = $('<li>').attr({
                "id" : "quitGroups",
                "class" : "list-group-item"
            }).text("退出群组").click(leaveGroupClick);
            $(".chat-box-hd a ul").append(li);
            $(".chat-box-hd a ul").append(lia);
        }
    }
    $(".chat-box-hd a ul").toggleClass("hide");
};// 点击聊天菜单事件
var removeFriendsClick = function(){
    removeFriends(curAcceptMsgObj);
    var a = curAcceptMsgObjDivId.replace(/Chat/,"List");
    $("#"+curAcceptMsgObjDivId).remove();
    $("#"+a).remove();
    $(chatBox).addClass("hide");
    //$(chatCover).removeClass("hide");
    curAcceptMsgObjDivId = null;
    curAcceptMsgObj = null;
    curAcceptMsgObjType = null;
};//点击删除好友事件
var leaveGroupClick = function(){
    var a = curAcceptMsgObjDivId.replace(/Chat/,"List");
    var id = $("#"+a).attr("hidename");
    leaveGroup(curUserId,id);
    $("#"+curAcceptMsgObjDivId).remove();
    $("#"+a).remove();
    $(chatBox).addClass("hide");
    //$(chatCover).removeClass("hide");
    curAcceptMsgObjDivId = null;
    curAcceptMsgObj = null;
    curAcceptMsgObjType = null;
};//点击退出群组事件
var unGroupClick = function(){
    var a = curAcceptMsgObjDivId.replace(/Chat/,"List");
    var id = $("#"+a).attr("hidename");
    dissolveGroup(id);
    $("#"+curAcceptMsgObjDivId).remove();
    $("#"+a).remove();
    $(chatBox).addClass("hide");
   // $(chatCover).removeClass("hide");
    curAcceptMsgObjDivId = null;
    curAcceptMsgObj = null;
    curAcceptMsgObjType = null;
}//点击解散群组事件
var createGroupsClick = function(){
    var value = $("#createGroupName").val();
    var info = $("#createGroupInfo").val();
    var members = [curUserId];
    createGroups(value,info,members,true,true,true);
};//点击创建群事件
var joinGroupsClick = function(){
    var id = $("#addGroupId").val();
    joinGroups(id);
}//点击添加群事件
var faceBoxClick = function(){
    $(".face ul").toggleClass("hide");
};//表情盒子点击事件
var sendClick = function() {
    var html = $("#text").html();
    if (html != null && html != "") {
        if (curAcceptMsgObjType == "chat") {
            sendPrivateText(html, curAcceptMsgObj);
            listChatTime("ListRosters-"+curAcceptMsgObj) ;   //列表添加时间
        }else if(curAcceptMsgObjType == "groupchat"){
            sendGroupText(html, curAcceptMsgObj);
            listChatTime("ListGroups-"+curAcceptMsgObj) ;   //列表添加时间
        }
        // 把发送的消息添加进消息盒子中
        var chatdiv = $('<div>').attr({
            'class': 'myMsg'
        });
        
        var chatdiv_info = $('<div>').attr({
            'class': 'msginfo'
        });

        //获取时间
        var today=new Date();
        var s=today.getFullYear()+"-"+String(Number(today.getMonth())+1)+"-"+today.getDate()+"  "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();


        $('<span>').html("my").attr({'class':'chat-name chat-right'}).appendTo(chatdiv_info);
        $('<span>').html(s).attr({'class':'chat-time chat-left'}).appendTo(chatdiv_info);
        $('#' + curAcceptMsgObjDivId).append(chatdiv_info);

        $('<img>').attr({
            'src': '../static/demo/img/'+curUserId+'.jpg',
            'width': '40px',
            'height': '40px',
            'id':'rimg',
            'class':'img-circle'
        }).appendTo(chatdiv);
        var text = $("#text").html();
        $('<span>').html(text).appendTo(chatdiv);
        $('#'+curAcceptMsgObjDivId).append(chatdiv);
        scrollBottom('#'+curAcceptMsgObjDivId);
        // 清空输入框内容
        $(textMsg).text("");
    }
};// 点击发送按钮处理的事件
var chooseFaceClick =function (li){
    
    var a = $(li).html();
    // console.log(a);
    var text0 = $(li).attr('key');
    var text1 = $("#text").text();
     // $("#text").text(text1+text0+a);
    $("#text").append(a);
    var b =WebIM.utils.parseEmoji(text0);
    console.log(b);
};//选择表情事件

var scrollBottom = function(obj){
    $(obj).scrollTop($(obj).prop("scrollHeight"));
}//让聊天窗口滚动条处于底部
var divHide = function(e) {
	var name = $(e).attr('id');
	var x = name.split("-");


    $("#"+x[0]).addClass("hide");
    $("#" +x[1]).removeClass("hide");
    //$("#" +x[1]).removeClass("right-slide");
    //$("#" +x[1]).removeClass("left-slide");
    $(chatBox).addClass("hide");
    cuttentChooseObj=null


};// (显示好友列表)
var chooseListDivClick = function(li) {

	var chooseObjId = li.id; 
    var chooseObjDivId = chooseObjId.replace(/List/,"Chat");
    cuttentChooseObj=chooseObjDivId            //用来判断是否需要当前在聊天界面收到消息时加红点

    var chooseAcceptMsgObj = $("#"+chooseObjId).attr('hidename');
    if (li.type == "groupchat") {
        getGroupAdmin(chooseAcceptMsgObj);
    }
    // 如果当前接受消息对象id为空
    if (curAcceptMsgObj == null && curAcceptMsgObjDivId == null) { 
        //$(chatCover).addClass("hide");
        $(chatBox).removeClass("hide");
        
    }else{
        $("#"+curAcceptMsgObjDivId.replace(/Chat/,"List")).removeClass("listColor");//影藏上一个焦点背景颜色
        $("#"+curAcceptMsgObjDivId).addClass("hide");//影藏上一个对象聊天div
    }
    if (chooseObjDivId in redPCache) {

        $("#redP-" + chooseObjDivId).remove();//删除红点
        delete redPCache[chooseObjDivId];
    }
    $(chatObj).text($(li).attr("displayName"));//显示当前对象聊天名字
    $("#"+chooseObjId).addClass("listColor");//显示焦点背景颜色
    $("#"+chooseObjDivId).removeClass("hide");//显示当前对象聊天div
    curAcceptMsgObjDivId = chooseObjDivId;
    curAcceptMsgObj = chooseAcceptMsgObj;
    curAcceptMsgObjType = li.type;
    $(chatBox).removeClass("hide");
    $(listgroup).addClass("hide");
    $("#chatTemporaryList-friendList").css("background-position","-220px -96px")   //
    $("#friendList-chatTemporaryList").css("background-position","-150px -96px") //
    getNoReadMessageNum();

};//选择列表事件(选择聊天对象)


var buildCreateGroupsDiv = function(){
}           



var deleteList = function(){
    try
    {
        $("#chatTemporaryList a").remove();
        $("#friendList a").remove();
    }
  catch(err)
    {
    console.log("初次登陆");
    }

} //用于在刷新时删除已有的列表，避免重复


