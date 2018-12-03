const host = getApp().data.host;
var util = require("../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
  un:'',
  pw:'',
  login:false,
  baseInfo:{},
  regetTime:0
  },

inputUn:function(e){
  this.data.un = e.detail.value;
},
inputPw(e){
    this.data.pw = e.detail.value;
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        var li=res.data;
        that.setData({un:li.username,pw:li.password});
      },
    })
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {

        wx.getStorage({
          key: 'baseInfo',
          success: function (res) {
            wx.setNavigationBarTitle({
              title: '个人信息',
            });
            that.setData({ baseInfo: res.data });
          },
          fail() {
            that.setData({ login: true });
            wx.setNavigationBarTitle({
              title: '请绑定教务系统账号',
            })
          }

        })
      },fail(){
wx.switchTab({
  url: '../settings/setting',
  success(){
    wx.showModal({
      title: '请授权登录哦~',
      content: '为了提供更好的服务，请您授权登录哦',
    })
  }
})
      }
    })
    

  },
change:function(){
  this.setData({login:true});
  wx.setNavigationBarTitle({title:'绑定指引'});
},
scan:function(){
  wx.scanCode({
    success:res=>{
      wx.showLoading({
        title: '绑定中',
      })
  wx.login({
    success:logres=>{
      wx.request({
        url: host + 'common/bind',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          uniqueid: res.result,
          wxcode: logres.code
},
success:res=>{
  var data = res.data;
  console.log(data)
  if(data.code){
wx.showToast({
  title: '绑定成功',
})
  }else wx.showToast({
    title: '绑定失败',
    image:'/images/close.png'
  })
},fail(){
  wx.hideLoading()
},
complete(){}
      })
  
    }
  })
    }
  })
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
  
  },
  binding: function (info) {
    if (info) {
      wx.showLoading({
        title: '获取中',
      })
      var Diary = Bmob.Object.extend("kcb");
      var query = new Bmob.Query(Diary);
      query.equalTo("class", info);
      query.first({
        success(res) {
          console.log(res)
          if (res) {
            var kcb = JSON.parse(util.decode(res.get("kcb")));
            console.log(kcb);
            wx.showToast({title:'课表获取成功'});
            wx.setStorage({
              key: 'kcb',
              data: kcb,
              success() {
                wx.setStorage({
                  key: 'class',
                  data: kcb.class,
                  success() {
                    wx.setStorage({
                      key: 'NewClassKcb',
                      data: 'true',
                      success() {
                        wx.switchTab({
                          url: '../index/index',
                        })
                      }
                    })

                  }
                })
              }
            })
          }
       
        },
        error() {
          wx.showToast({
            title: '查无此班级',
            image: '/images/fail.png'
          })
        }
      });
    } 


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