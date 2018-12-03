// pages/EcardFare/EcardFare.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  info:[],
  loginInfo:{}
  },
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '饭卡消费',
    });
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({ loginInfo: res.data });
        
        that.getData('EcardFare','true');
        that.getData('CurrentOne', 'true');
        that.getData('CountWeek', 'true');
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

  getData: function (param,value) {
//console.log(param+"\t"+value);
    var li = this.data.loginInfo,
      un = li.username,
      that = this,
      info = this.data.info;
    //    console.log(un+"\n"+pw);
    wx.showLoading({
      title: '获取中',
    })
    wx.request({
      url: 'https://www.xxxzh.top/?username='+un+'&'+param+'='+value,
      method: 'get',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
    //    console.log(un+"\t"+param+"\t"+value+"\n"+res.data);
        var data = res.data;
        data = JSON.parse(data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1));
       var i=0;
       if(param.indexOf("Current")>=0)i=1;
       if (param.indexOf("Week") >= 0) i = 2;
        info[i]= data;
        that.setData({ info: info });
        wx.showToast({
          title: data.exceptionMsg,
        })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.info=[];
    this.getData('EcardFare', 'true');
    this.getData('CurrentOne', 'true');
    this.getData('CountWeek', 'true');
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