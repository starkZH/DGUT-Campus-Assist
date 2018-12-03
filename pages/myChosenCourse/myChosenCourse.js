// pages/myChosenCourse/myChosenCourse.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  loginInfo:{},
  info:{},
  statusText:["",'','选课成功'],
  tyStatusText:['选课失败','选课成功'],
  regetTime:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  wx.setNavigationBarTitle({
    title: '我的选课',
  });
  var that =this;
  wx.getStorage({
    key: 'loginInfo',
    success: function(res) {
that.setData({loginInfo:res.data});
that.getData();
    },
    fail(){
      wx.switchTab({
        url: '../index/index',
        success(){
          wx.showModal({
            title: '请绑定教务系统账号',
            content: '',
            success(res){
              if(res.confirm){
  wx.switchTab({
    url: '../settings/setting',
  })
              }
            }
          })
        }
      })
    }
  })
  },

getData:function(){
  var li = this.data.loginInfo,
  un = li.username,
  pw = li.password,
  that = this;
  wx.showLoading({
    title: '获取中',
  })
  wx.request({
    url: 'https://www.xxxzh.top/loginJW.jsp',
    method: 'post',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: {
      username: un,
      password: pw,
      toPage: 'ehall'
    },
    success(res) {
var data = res.data;
console.log(data);
if(data.loginRes.code){
that.setData({info:data});
wx.setStorage({
  key: 'myChosenCourse',
  data: data,
})
wx.showToast({
  title: data.zhixing.message,
})
wx.setNavigationBarTitle({
  title: data.loginRes.info.name+' 的选课',
})
}else if(that.data.regetTime++<2){
that.getData();
}
    },
    fail(){
      wx.showModal({
        title: '请检查网络',
        content: '',
        showCancel:false,
        confirmColor:'red'
      });
      wx.getStorage({
        key: 'myChosenCourse',
        success: function(res) {
          that.setData({info:res.data});
        },
      })
    },complete(){wx.hideLoading();
    wx.stopPullDownRefresh()}
    });
},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  this.getData();
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