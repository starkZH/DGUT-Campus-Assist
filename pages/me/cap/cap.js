var app = getApp();
const util = require('../../utils/util.js');  
const ctx = wx.createCanvasContext('myCanvas');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar:'/images/chris.jpg',
    avatarTmp:null,
    iconTmp:[],
    cap_index:0,
    size:50,
    angle:0,
    px:20,
    py:20,
    startX:0,
    startY:0,
    desWidth:300,
    desHeight:300
  },

  tap:function(e){
this.setData({cap_index:e.currentTarget.id.substring(3)});
this.drawCap();
  },
  sliderchange:function(e){
this.data[e.currentTarget.id]=e.detail.value;
    this.drawCap();
  },
  onLoad: function (options) {
   wx.getSystemInfo({
     success: res=> {
       this.setData({sys:res,height:res.windowWidth*0.6})
     },
   });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.drawAvatar();
    ctx.draw();
  },
choose:function(){
  wx.showActionSheet({
    itemList: ['从本地选择', '获取自己的头像（较模糊）'],
    success: res => {
      if (res.tapIndex == 0) {
        wx.chooseImage({
          count: 1,
          sizeType: ['original', 'compressed'],
          sourceType: ['album'],
          success: res => {
            wx.getImageInfo({
              src: res.tempFilePaths[0],
              success:res=>{
                this.data.desHeight = res.height;
                this.data.desWidth = res.width;
              }
            })
            this.setData({ avatar: res.tempFilePaths[0] });
            this.drawAvatar();
          },
        })
      } else this.login(1);
    }
  })
},
  login:function(flag){
    if (!app.data.login || this.data.avatar.indexOf('/images/chris') > 0||flag){
    app.login().then(()=>{
      var avatar = app.data.userInfo.avatarUrl;
      if(avatar){
        wx.getImageInfo({
          src: avatar,
          success:res=>{
            this.data.desHeight=res.height;
            this.data.desWidth=res.width;
            this.setData({ avatar:res.path});
            this.drawAvatar();
            ctx.draw();
            this.getIcons();
           
          }
        })
      }
      else{
        wx.showToast({
          title: '',
        })
      }
    })
  }
  /*
  if(flag)
  {
    this.setData({ avatar: app.data.userInfo.avatarUrl });
    this.drawAvatar();
  }
  */
},
getIcons:function(){
  app.get_base().then(() => {
    this.setData({ icons: app.data.base.caps });
    this.drawCap();
  }).catch(() => {
    this.onShow();
  });
},
  onShow: function () {
    this.getIcons();
    this.login();
  },

drawCap:function(save){
  var itmp=this.data.iconTmp;
      var hei=this.data.height,size=this.data.size,angle=this.data.angle;
      ctx.clearRect(0, 0, hei, hei);
      this.drawAvatar();
        var wid = hei * 0.5 * (size / 50.0);
  var px = this.data.px, py = this.data.py, index = this.data.cap_index;
  var tmp=this.data.iconTmp[index];
    if(!tmp)
       wx.getImageInfo({
         src: this.data.icons[index],
         success:res=>{
          this.data.iconTmp[index]=res.path;
          this.drawCap();
         }
       });
       else{
      ctx.translate(px + (wid/2), py + (wid/2));
      ctx.rotate(angle * Math.PI / 180);
      ctx.drawImage(tmp, -wid/2, -wid/2, wid, wid);
      if(!save)
      ctx.draw();
      else{
        ctx.draw(false,
          () => {
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: this.data.height,
              height: this.data.height,
              destWidth: this.data.desWidth,
              destHeight: this.data.desHeight,
              canvasId: 'myCanvas',
              success(res) {
                console.log(res.tempFilePath);
                wx.saveImageToPhotosAlbum({
                  filePath:res.tempFilePath,
                  success(res) {
                    wx.showToast({
                      title: '保存成功',
                    })
                   },fail(){
                     app.error2('保存失败，请到个人中心重新授权',()=>{
                       wx.navigateTo({
                         url: '/pages/index/index?menuIndex=3',
                       })
                     })
                   }
                })
                
              }
            })
          }
        );
      }
       }
}
,
drawAvatar:function(){
  var hei=this.data.height;     
  ctx.drawImage(this.data.avatar, 0, 0, hei, hei);
   
},

start:function(e){
this.data.startX=e.changedTouches[0].x;
this.data.startY = e.changedTouches[0].y;
},
move: function (e) {
  var nx = e.changedTouches[0].x, ny = e.changedTouches[0].y;
  this.data.px+=(nx-this.data.startX);
  this.data.py+=(ny-this.data.startY);
  this.data.startX=nx;
  this.data.startY=ny;
  this.drawCap();
},
end: function (e) {
  if (this.data.avatar.indexOf('/images/chris')>0)
this.login();
},

save:function(){
  this.drawCap(1);
},


  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})