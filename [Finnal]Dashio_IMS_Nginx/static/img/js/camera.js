const width=240;
const height=240;

const video = document.getElementById('video');
const button = document.getElementById('button');
const select = document.getElementById('select');
const scan = document.getElementById('scan');
const scanCss = document.getElementById('scanCss');
const qrBox = document.getElementById('qrBox');
const qrBoxSpan = document.getElementById('qrBoxSpan');
var   cameraID=new Array();
var   execute_flag=0;

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
      
      cameraID.push(mediaDevice.deviceId)
    }
  });
  console.log(cameraID)
  console.log(select.value)
  
  if (execute_flag==0){
    execute_flag=1;
    select.value=cameraID[0]
    initFuc();
  }
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
  console.log(select.value )
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
  
  var videoH = video.videoHeight;
  var videoW = video.videoWidth;

  var h=screenH/videoH

  $(scan).css("width",screenW)
  $(scan).css("height",screenH)
  
  $(video).css("height",screenH)


  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, (screenW/2-width/2)/h, (screenH/2-height/2)/h, width/h, height/h,0,0, width, height);
    var data = canvas.toDataURL('image/png');
    

    qrcode.decode(data);                //解析二维码路径
    qrcode.callback = function (imgMsg) {
      if(imgMsg!="error decoding QR Code")
      {
        noneResultFlagNum=0;
        $("#result").html(imgMsg);
        var cookie = document.cookie;
        document.cookie = imgMsg;
        BSL.Vibrator();
        BSL.msgRing();
        window.location.href='./panel_2';
      }
      else{
        noneResultFlagNum+=1;
        if(noneResultFlagNum>8)
        {
          //window.location.href='test.html';
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
