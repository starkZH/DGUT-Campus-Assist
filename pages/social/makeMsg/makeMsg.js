
var util = require('../../utils/util.js');  
var app=getApp();
var host=app.data.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
   
    kind:app.data.label,
    index:'a0',
  images:[],
  upLoadImage:'',
  imageNum:0,
  Rows:[["/images/addImage.png"],[],[]],
  rowState:[[],[],[]],
  UpHeight:'14%;',
  baseInfo:{},
  userInfo:{},
  openid:'',
  text:'',
  previewMode:true,
  LimitLast:5,
  imageSize:[],
  p1:0,p2:0,
uploadState:2,
range: [],
r_index: 0,
edit:false
  },
input:function(e){
  this.data.text = e.detail.value;
  },
  change: function (e) {
    this.setData({ r_index: e.detail.value })
  }
  ,
get_imgs: function (e) {
    this.data.images = e.detail.imgs;
  }
,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var il = [], kind = this.data.kind,
    edit=options.edit;
    this.data.edit=edit;
    for (var x in kind)
      if (x.indexOf('a') == 0 && x.length > 1) {
        il.push(kind[x]);
      } else delete kind[x];
    this.setData({ range: il, kind: kind })
  wx.setNavigationBarTitle({
    title: '尽情吐槽吧',
  })
if(edit){
wx.getStorage({
  key: 'temp_moment',
  success: res=> {
    var  data=res.data,rs=[[],[],[]],r_state=[[],[],[]],imgs=data.imgUrls,images=[],r_index=0;
    for (var x in kind) if (x == data.kind) { for (var y in il) {  if (kind[x]==il[y]){r_index=y;break;}} break;}
for(var x in imgs){
  var p1 = Math.floor(x / 4);
  rs[p1][x % 4] = imgs[x]; r_state[p1][x % 4]=2;
  images.push(imgs[x].substring(imgs[x].indexOf('/images/')));
}
var len=imgs.length;
    if (len < 9) rs[Math.floor( len / 3)][len % 4] = "/images/addImage.png";
  this.setData({text:data.text,images:images,Rows:rs,id:data.id,r_index:r_index,rowState:r_state,imageNum:len})
  },
})
}
if(!app.data.login){
app.login();
}else console.log(app.data.userInfo)
  },
  send:function(){
   
    var rows = this.data.Rows,
    oid= app.data.userInfo.openid,
    images = this.data.images,
    kind='',k_text=this.data.range[this.data.r_index],a_k=this.data.kind,
    that = this, url = host + 'contact/deliver_moment';
    if (this.data.edit) url = host + 'contact/update_moment/'+this.data.id;
for(var x in a_k)if(a_k[x]==k_text)kind=x;
console.log(app.data)
 if (!app.data.userInfo.avatarUrl) {
  app.toastAuthorize();
}else if(!that.data.text){app.error2('写点什么呗');}
else{
   wx.showLoading({
     title: '发布中',
     mask: true
   });
   util.commonPostRequest(url, {
     imgUrls: images,
     kind: kind,
     text: that.data.text
   }, (res) => {
     console.log(res)
     if (res.data.code) {
       wx.showToast({
         title: '发布成功',
         mask: true
       });
       wx.navigateBack();
     } else {
       app.error('发布失败');
     }
   }, ()=>{
       wx.hideLoading()
     });

  }
  }

,
  onShow: function () {
  
  },

 onPullDownRefresh:function(){
   wx.stopPullDownRefresh()
 },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})