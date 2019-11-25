//声明变量
var emailobj;
var eamilMsg;
var usernameobj;
var usernameMsg;
var passwordobj;
var passwordMsg;
var rpasswordobj;
var confirmMsg;
//获取页面的对象
window.onload = function(){
	emailobj = document.getElementById("email");
	emailMsg = document.getElementById("emailMsg");
	usernameobj = document.getElementById("username");
	usernameMsg = document.getElementById("usernameMsg");
	passwordobj = document.getElementById("password");
	passwordMsg = document.getElementById("passwordMsg");
	repasswordobj = document.getElementById("rpassword");
	confirmMsg = document.getElementById("confirmMsg");	
	};
//判断表单参数
function checkForm(){
    var form = document.register;
    if(checkUserName(form.username.value,"usernameMsg")&&checkPassword(form.password.value,"passwordMsg")&&checkRePassword(form.repassword.value,"confirmMsg")&&checkEmail(form.email.value,"emailMsg")&&checkSex(form,"sex_warn"))
    {
        alert("恭喜，注册成功！");
        window.location.href="register_success"
    }
    else{
        alert("注册失败，请按提示输入信息！");
        return (false);
    }
}
//剔除空格
function trim(){
    return this.replace(/(^s*)|(s*$)/g, "");
    }


//显示错误提示
function showWarn(uid,msg){
    document.getElementById(uid).innerHTML=msg;
    document.getElementById(uid).style.display="";
}
//清空错误提示
function clearWarn(uid){
    document.getElementById(uid).style.display="none";
}
//邮箱的验证
function checkEmail(emailobj,uid){
    var em = emailobj.trim();
    var reg3 = /^[a-zA-Z0-9_-]{5,}@([a-zA-Z0-9_-]{2,})+.+(com|gov|net|com.cn|edu.cn)$/;
    if(reg3.test(em)==true)
    {
        var msg="<font color='#0F0'></font>";
        showWarn(uid,msg);
        return (true);
    }
    else
    {
        msg="<font color='#F00'>邮箱地址输入不规范！</font>";
        showWarn(uid,msg);
        return (false);
    }
}
//用户名的验证
function checkUserName(usernameobj,uid){
    var um = usernameobj.trim();
    var reg1 = /^[\u4E00-\u9FA5a-zA-Z0-9_]{3,20}$/;
    if(reg1.test(um)==true)
    {
        var msg="<font color='#0F0'></font>";
        showWarn(uid,msg);
        return (true);
    }
    else
    {
        msg="<font color='#F00'>用户名输入不规范！</font>";
        showWarn(uid,msg);
        return (false);
    }
}
//验证密码
function checkPassword(passwordobj,uid){
    var pwd = passwordobj.trim();
    var reg2 = /^[a-zA-Z0-9]{6,20}$/;
    if(reg2.test(pwd)==true)
    {
        var msg="";
        showWarn(uid,msg);
        return (true);
    }
    else
    {
        msg="<font color='#F00'>密码输入不规范!</font>";
        showWarn(uid,msg);
        return (false);
    }
}
//验证确认密码
function checkRePassword(repwd,uid){
    var pwd = repwd.trim();
    var repas = document.getElementById("password").value.trim();
    if(repas==pwd)
    {
        var msg="<font color='#0F0'></font>";
        showWarn(uid,msg);
        return (true);
    }
    else
    {
        msg="<font color='#F00'>密码与上次输入不一致！</font>";
        showWarn(uid,msg);
        return (false);
    }
}