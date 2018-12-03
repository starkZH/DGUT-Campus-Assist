
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; 

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function DateDistan(first , second){
  second=second.replace('T',' ');
  var index=second.indexOf('.');
  if(index>0)second=second.substring(0,index);
  var dt1 = first.split(" "),
      dt2 = second.split(" ");
  var date1=dt1[0].split("-"),
      date2=dt2[0].split("-"),
      time1=dt1[1].split(":"),
      time2=dt2[1].split(":");
  
  return (Date.UTC(date1[0],date1[1],date1[2],time1[0],time1[1])-
    Date.UTC(date2[0], date2[1], date2[2], time2[0], time2[1]))/1000
}

function getWeek(soDate,md){
  var ft=formatTime(new Date()).split(" ")[0].split("-");
  var month=Number(ft[1]),year=Number(ft[0]),date=Number(ft[2]),sum=0;
  var so1=soDate[0],so2=soDate[1];
  if(month>=so1[0]||month<so2[0]){
    soDate=so1;
  }else{
    soDate=so2;
  }
  
  var head=0,zs=1;// new Date(2017,month-1,11).getDay();//求日期当天星期几
  var soM=soDate[0],soD=soDate[1],soY=soDate[2];
  console.log(soDate+"\tmonth:"+month+"\tsoM:"+soM);
  month=month<soM?12+month:month;
  
  for(var i=soM;i<month;i++){//先算两个日期间的天数
    if(i>12){
      sum+=md[i-13];
    }else{
    sum+=md[i-1];
    }
}
sum-=(soD-1)-date;//得到实际天数
while(new Date(soY,soM-1,soD).getDay()!=1){//跳到第一个为星期一的日期
  head++;
  soD++;
}
sum-=head;//减去头几天，到星期一开始算
zs=Math.ceil(sum/7);//向上取整
  console.log(sum+"\thead:"+head+"\tdate"+date);
  console.log(ft+"周数："+zs+"月数："+month);
  return zs;
}

function request(url,method ,data, callback,complete){
  var app=getApp()
  wx.request({
    url: url,
    method:method,
    data: data,
    header: {
      'Authorization': app.data.token,
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: res => typeof callback == 'function' && callback(res),
    complete: com =>{ typeof complete=='function'&& complete()}
  })
}

function commonGetRequest(url, callback, complete) {
  request(url, 'GET',{}, callback, complete);
}
function commonPostRequest(url, data, callback, complete) {
  request(url, 'POST', data, callback, complete);
}
// public method for decoding 
function decode(input) {
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++));
    enc2 = _keyStr.indexOf(input.charAt(i++));
    enc3 = _keyStr.indexOf(input.charAt(i++));
    enc4 = _keyStr.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }
  }
  output = _utf8_decode(output);
  return output;
}
// private method for UTF-8 decoding 
function _utf8_decode(utftext) {
  var string = "";
  var i = 0;
  var c, c1, c2 = 0, c3;
  c = c1 = c2;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return string;
} 

module.exports = {
  formatTime: formatTime,
  getWeek: getWeek,
  DateDistan: DateDistan,
  getDateDis: DateDistan,
  decode: decode,
  commonGetRequest: commonGetRequest,
  commonPostRequest: commonPostRequest
}
