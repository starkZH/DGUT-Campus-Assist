// pages/LevelExam/LevelExam.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  info:{},
  loginInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '等级考试成绩',
    });
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({ loginInfo: res.data });
        wx.getStorage({
          key: 'LevelExam',
          success: function(res) {
            that.setData({info:res.data});
          }
        })
        that.getData();
      },
      fail() {
        wx.switchTab({
          url: '../index/index',
          success() {
            wx.showModal({
              title: '请绑定教务系统账号',
              content: '',
              success(res) {
                if (res.confirm) {
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

  getData: function () {
    var li = this.data.loginInfo,
      un = li.username,
      pw = li.password,
      that = this;
  //    console.log(un+"\n"+pw);
    wx.showLoading({
      title: '获取中',
    })
    wx.request({
      url: 'https://www.xxxzh.top/loginJW.jsp',
      method: 'get',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        username: un,
        password: pw,
        LevelExam:true
      },
      success(res) {
        var data = res.data;
        console.log(data);
        if (data.loginRes){
        if (data.loginRes.valid) {
          that.setData({ info: data });
          wx.setStorage({
            key: 'LevelExam',
            data: data,
          })
        } else if (that.data.regetTime++ < 2) {
          that.getData();
        }
      }else{
       wx.showModal({
         title: '登录失败',
         content: '请重新绑定中央认证系统账号',
         success(res){
  if(res.confirm){
wx.redirectTo({
  url: '../loginJW/loginJW',
})
  }
         }
       })
      }
      },
      fail() {
        wx.showModal({
          title: '请检查网络',
          content: '',
          showCancel: false,
          confirmColor: 'red'
        });
        wx.getStorage({
          key: 'LevelExam',
          success: function (res) {
            that.setData({ info: res.data });
          },
        })
      }, complete() {
        wx.hideLoading();
        wx.stopPullDownRefresh()
      }
    });
  },
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