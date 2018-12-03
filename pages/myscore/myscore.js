var util = require("../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
  xn:0,
  xq:0,
  reget:0,
  allScore:[],
  allInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  //  console.log("[sad]".replace(/\[\/?.+?\]/g, ""));
  wx.setNavigationBarTitle({
    title: '我的成绩',
  })
  var range = [],that  =this,
  value = 0 ,current,
  dataSet = [];
  wx.getStorage({
    key: 'loginInfo',
    success: function(res) {
      var ll = res.data,
      un = ll.username,
      pw = ll.password,
      xn;
      var time = util.formatTime(new Date()).split(" ")[0].split("-");
      var year = time[0], month = Number(time[1]);
      xn = year - 1;
   
      console.log(xn+"\t");

    that.getScore(un,pw,Number(xn)+1);
    },fail(){
      wx.showToast({
        title: '请重新绑定教务账号',
        image:'/images/fail.png'
      })
    }
  })
  },

  
 getScore: function (un,pw,xn1) {
   wx.showLoading({
     title: '获取中',
   })
   var that = this;
   wx.request({
     url: "https://www.xxxzh.top/loginJW.jsp",
     method: 'get',
     header: {
       'content-type': 'application/x-www-form-urlencoded'
     },
     data: {
       username: un,
       password: pw,
       sjxz: 'sjxz1',
       zx: 1,
       fx: 1,
       xn1: xn1,
       toPage:'jw'
     },
     success(res) {
       wx.hideLoading()
       var data = res.data.score;
       console.log(data);
       if(data.xh!=null){
       for(var x in data.detail){
          for(var y in data.detail[x].detail){
            var subject = data.detail[x].detail[y].subject.replace(/\[\/?.+?\]/g, "");
            data.detail[x].detail[y].subject = subject;
          }
       }
       wx.setNavigationBarTitle({
         title: data.name+" 的成绩",
       })
       that.setData({ allScore: data.detail ,allInfo:data});
       }else if(that.data.reget++>2){
        wx.showToast({
          title: '成绩获取失败',
          image:'/images/fail.png'
        })
       }else {
         setTimeout(function () { that.getScore(un, pw, xn1);},1000);
       wx.showLoading({
         title: '重新获取中',
       })}
     },
     fail(){
       wx.showToast({
         title: '请检查网络',
         image:'/images/fail.png'
       })
     }
   })
  }
,
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
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