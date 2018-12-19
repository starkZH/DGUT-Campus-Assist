var app = getApp();
const util = require('../../utils/util.js');  
const ctx = wx.createCanvasContext('myCanvas');
const canvasScale = 0.7, iconSize=20;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar:'/images/chris.jpg',
    avatarTmp:null,
    iconTmp:[],
    targetIcon:[],
    current:0,
    cap_index:0,
    startX:0,
    startY:0,
    desWidth:300,
    desHeight:300,
    showAd:false,
    showCapAd:false
  },

  tap:function(e){
    var ti = this.data.targetIcon, cap = e.currentTarget.id.substring(3);
    ti.push({ cap_index: cap,px:20,py:20,degree:0,size:80});
    this.setData({ current: ti.length - 1, targetIcon: ti, cap_index:cap});
    this.drawCap();
  },
  sliderchange:function(e){
this.data[e.currentTarget.id]=e.detail.value;
    this.drawCap();
  },
  onLoad: function (options) {
   wx.getSystemInfo({
     success: res=> {
       this.setData({sys:res,height:res.windowWidth*canvasScale,marginLeft:res.windowWidth*0.5*(1-canvasScale)})
     },
   });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    this.drawAvatar(1);
    if (app.data.login) {
     this.getAvatar();
    }
  },
  
choose:function(){
  wx.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album'],
    success: res => {
      wx.getImageInfo({
        src: res.tempFilePaths[0],
        success: res => {
          this.data.desHeight = res.height;
          this.data.desWidth = res.width;
        }
      })
      this.setData({ avatar: res.tempFilePaths[0] });
      this.drawCap()
    },
  })
},
getAvatar:function(){
  var avatar = app.data.userInfo.avatarUrl,that=this;
  let pro=new Promise(function(resolve,reject){
    if (avatar) {
      wx.getImageInfo({
        src: avatar,
        success: res => {
          that.data.desHeight = res.height;
          that.data.desWidth = res.width;
          that.setData({ avatar: res.path });
          that.drawAvatar();
          ctx.draw();
          that.getIcons();
        }
      })
    }
  });
  
},
  login:function(flag){
    if (!app.data.login || this.data.avatar.indexOf('/images/chris') > 0||flag){
      if (!app.data.login)
    app.login().then(()=>{
     this.getAvatar();
    });
      else this.getAvatar();
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
    var base = app.data.base;
    this.setData({ icons: base.caps,showCapAd:base.showCapAd });
    if(!this.data.targetIcon.length)
    this.data.targetIcon.push({ cap_index: 0, px: 20, py: 20, degree: 0, size: 80 });
    this.drawCap();
  }).catch(() => {
    this.onShow();
  });
},
  onShow: function () {
   this.getIcons();
    this.login();
  },
getCapWidth(size){
  return size;
},
getRotatePosition(x,y,rx0,ry0,degree){
  var x0 = (x - rx0) * Math.cos(degree) - (y - ry0) * Math.sin(degree) + rx0,
    y0 = (x - rx0) * Math.sin(degree) + (y - ry0) * Math.cos(degree) + ry0;
    return [Number(x0),Number(y0)];
},
drawCap:function(save){
  var itmp=this.data.iconTmp,that=this,t_icon=this.data.targetIcon;
  //{cap_index:,px:,py:,degree:,size:}
      var hei = this.data.height;
       ctx.clearRect(0,0,hei,hei)
      this.drawAvatar();
        for(var ti in t_icon){//遍历要绘制的帽子
          var obj=t_icon[ti];
          if(!obj)return;
          var px = obj.px, py = obj.py, index = obj.cap_index,
            size = obj.size, degree = obj.degree;
          var wid = this.getCapWidth(size)//帽子的宽高
          var tmp = this.data.iconTmp[index];
          if (!tmp) {//图片未缓存，下载后再重新调用
            wx.getImageInfo({
              src: this.data.icons[index],
              success: res => {
                this.data.iconTmp[index] = res.path;
                this.drawCap();
              }
            });
            return;
          }
          else {//图片已缓存
            degree = degree * Math.PI / 180;
            var ox = px + (wid / 2), oy = py + (wid / 2)
            ctx.translate(ox,oy);
            ctx.rotate(degree );
            ctx.translate(-wid / 2, -wid / 2);
            ctx.drawImage(tmp, 0, 0, wid, wid);
            //为当前选择对象 绘制虚线框
            if (ti == this.data.current&&!save) {
              ctx.setStrokeStyle('#FF6A6A');
              ctx.setLineWidth(3)
              ctx.setLineDash([10, 7], 8);
              ctx.rect(0, 0, wid, wid)
              ctx.stroke();
              ctx.drawImage('/images/delete.png', -iconSize / 2, -iconSize/2, iconSize, iconSize);
              ctx.drawImage('/images/rotate.png', wid - iconSize/2, wid - iconSize/2, iconSize, iconSize);
            }
            ctx.rotate(-degree);
            //计算当前原点绕帽子中心旋转后的坐标
            var rx0=wid/2,ry0=wid/2,x=0,y=0,pos=this.getRotatePosition(x,y,rx0,ry0,degree);
            var x0=pos[0],y0=pos[1];
            //将原点恢复为 0,0
            ctx.translate(-px-x0, -py-y0);
            //
            obj.ox=ox;
            obj.oy=oy;
            this.data.targetIcon[ti]=obj;
            //
          }
        }
  if (!save)
    ctx.draw();
  else {//保存图片
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
              filePath: res.tempFilePath,
              success(res) {
                wx.showToast({
                  title: '保存成功',
                });
                that.setData({ showAd: true })
              }, fail() {
                app.error2('保存失败，请到个人中心重新授权', () => {
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
,
drawAvatar:function(draw){
  var hei=this.data.height;     
  ctx.drawImage(this.data.avatar, 0, 0, hei, hei);
  if (draw) ctx.draw();
},

start:function(e){
// console.log(e)
  var sx = e.changedTouches[0].x, sy = e.changedTouches[0].y,
  t_icon=this.data.targetIcon;
  this.data.current = t_icon.length - 1;
this.data.startX=sx;
this.data.startY =sy;
//防止同时作用于多个帽子
if (this.data.scaleMode)return; 

for(var i=t_icon.length-1;i>=0;i--){//倒序读取，因为后添加的会覆盖在之前添加的上面
  var obj=t_icon[i],wid=Number(this.getCapWidth(obj.size)),px=Number(obj.px),py=Number(obj.py),
  degree=obj.degree*Math.PI/180;
  var pos=this.getRotatePosition(0,0,(wid/2),(wid/2),degree);
  //帽子左上角的坐标px,py;右下角的rx,ry
  px+=pos[0];
  py+=pos[1];
  //console.log(px+' '+py+' '+sx+' '+sy);
  pos=this.getRotatePosition(wid,wid,wid/2,wid/2,degree);
  var rx=pos[0],
  ry=pos[1];
  //删除动作
  var off=iconSize/2;//图标大小的一半
  if (sx >= px - off && sx <= px + off && sy >= py - off && sy <= py + off) {
    this.data.targetIcon.splice(i, 1);
    this.drawCap();
    return;
  }
  //旋转缩放动作
  px = Number(obj.px); py = Number(obj.py);//恢复到旋转前的坐标
  if (sx >= px+rx - off && sx <= px+rx + off && sy >= py+ry - off && sy <= py+ry + off) {
    this.data.scaleMode=1;//按住了缩放
    return;//防止同时作用于多个帽子
  }
  if(sx>=px&&sy>=py&&sx<=(px+wid)&&sy<=(py+wid)){
    //交换位置，把选中的移到最后面，这样才能让其显示在最上面
    [t_icon[i], t_icon[this.data.current]] = [t_icon[this.data.current], t_icon[i]]
    break;
  }
}
},
move: function (e) {
  var nx = e.changedTouches[0].x, ny = e.changedTouches[0].y,
    sx = this.data.startX, sy = this.data.startY;
  var ti=this.data.targetIcon,current=this.data.current;
  if(!this.data.scaleMode){
    var obj = ti[current];
    if(!obj)return;
    var wid = Number(this.getCapWidth(obj.size)), px = Number(obj.px), py = Number(obj.py);
    //触摸到帽子区域
    if (sx >= px && sy >= py && sx <= (px + wid) && sy <= (py + wid)) {
      obj.px += (nx - sx);
      obj.py += (ny - sy);
    }
    ti[current]=obj;
  }else{//缩放模式
    var obj = ti[current],wid=this.getCapWidth(obj.size),px=obj.px,py=obj.py;
    var ox=obj.ox,oy=obj.oy;//px+wid/2
    var old=Math.sqrt((sx-ox)*(sx-ox)+(sy-oy)*(sy-oy)),
    now=Math.sqrt((nx-ox)*(nx-ox)+(ny-oy)*(ny-oy));
    //旧半径，要保持旋转中心不变
    var old_size=ti[current].size;
    ti[current].size=now*Math.SQRT2;
    ti[current].px = ox - ti[current].size/2;
    ti[current].py = oy - ti[current].size/2;
    var [y,x]=[(ny-oy),(nx-ox)],
    tan_a =  y* 1.0 / x, tan_b = 1, 
    origin_degree = Math.atan(tan_a)*180/Math.PI,
    rotate_degree = origin_degree -45 ;
    
    //处理一些特殊情况
    if ((y >= 0 && x < 0) || (y < 0 && x < 0))rotate_degree=135+origin_degree;

    console.log(origin_degree + ' ' + rotate_degree + ' ' + y + ' ' + x)
    ti[current].degree = rotate_degree;
  //  console.log(ox+' now:['+nx+','+ny+'] '+(ny-oy)+' '+(nx-ox)+' '+ti[current].degree)
  }
  this.data.targetIcon = ti;
  this.data.startX = nx;
  this.data.startY = ny;
  this.drawCap();
},
end: function (e) {
  this.data.scaleMode = 0;
  //获取头像
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
    return {
      title: '是时候戴上圣诞帽了~',
      path: '/pages/me/cap/cap'
    }
  }
})