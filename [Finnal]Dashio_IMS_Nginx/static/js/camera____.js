const width=300;
const height=300;

const video = document.getElementById('video');
const button = document.getElementById('button');
const select = document.getElementById('select');
const scan = document.getElementById('scan');
const scanCss = document.getElementById('scanCss');
const qrBox = document.getElementById('qrBox');
const qrBoxSpan = document.getElementById('qrBoxSpan');

var noneResultFlagNum=0;
let currentStream;

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

function gotDevices(mediaDevices) {
  select.innerHTML = '';
  select.appendChild(document.createElement('option'));
  let count = 1;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      select.appendChild(option);
    }
  });
}

function initFuc(){
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }
  const videoConstraints = {};
  if (select.value === '') {
    videoConstraints.facingMode = 'environment';
  } else {
    videoConstraints.deviceId = { exact: select.value };
  }
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch(error => {
    });
}

button.addEventListener('click', event => {
  initFuc();
});


navigator.mediaDevices.enumerateDevices().then(gotDevices);


function takepicture() {                            //获取视频流里的一帧
  var context = canvas.getContext('2d');
  var screenH=window.screen.height ;         
  var screenW=document.body.clientWidth;

  $(scan).css("width",screenW)
  $(scan).css("height",screenH)
  
  $(video).css("height",screenH)



  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    var data = canvas.toDataURL('image/png');

    qrcode.decode(data);                //解析二维码路径
    qrcode.callback = function (imgMsg) {
      if(imgMsg!="error decoding QR Code")
      {
        noneResultFlagNum=0;
        $("#result").html(imgMsg);
        window.location.href='./panel_2';
        //sessionStorage.setItem('Dev_ID',imgMsg);
        var cookie = document.cookie;
        document.cookie = imgMsg;
        BSL.Vibrator();
        BSL.msgRing();
      }
      else{
        noneResultFlagNum+=1;
        //window.location.href='./panel_2';
        //sessionStorage.setItem('Dev_ID',"999");
        //var cookie = document.cookie;
        //document.cookie ="999";
        console.log(999);
        if(noneResultFlagNum>8)
        {
          $("#result").html("");
          noneResultFlagNum=0
        }
      }
    }                                   //解析二维码内容，imgMsg为解析出来的内容
  } 
}
var int=self.setInterval("takepicture()",5);

/*
function myfuc(){
  num++;
  if (num<2){
    $("#result").html("识别中.");}
  if (2<=num  && num<4){
    $("#result").html("识别中..");}
  if (4<=num && num<6){
    $("#result").html("识别中...");}
    if (6<=num && num<8){
      $("#result").html("识别中....");}
  if(8<=num){
    num=0;}
}
*/
window.addEventListener('load', initFuc, false);
