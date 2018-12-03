var util = require("../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
  info:{count:0},
  regetTime:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '借书记录',
    });
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({ loginInfo: res.data });
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
      that = this;
    //    console.log(un+"\n"+pw);
    wx.showLoading({
      title: '获取中',
    })
    wx.request({
      url: 'https://www.xxxzh.top/',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        username: un,
        BorrowBooks: true
      },
      success(res) {
        var data = res.data;
        data = JSON.parse(data.substring(data.indexOf("{"),data.lastIndexOf("}")+1));
        console.log(data);
        wx.showToast({
          title: data.exceptionMsg
        });
        var rl = data.resultList;
        for(var x in rl){
          for(var y in rl){
            if(y>x){
              if(rl[y].book_name==rl[x].book_name){
                rl[x].operate_date+=" | "+rl[y].operate_date;
                rl.splice(y,1);
              }
            }
          }
        }
        data.resultList=rl;
        that.setData({info:data});
      },
      fail() {
        wx.showModal({
          title: '请检查网络',
          content: '',
          showCancel: false,
          confirmColor: 'red'
        });
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