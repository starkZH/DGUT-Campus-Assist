
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgPath:'',
    classInfo:'',
    login:false,
    loginJW:false,
    nickName:'登录',
    avatarUrl:'/images/user.png',
    tip:'点击绑定教务账号',
    baseInfo:{}
  },

scoreRank:function(){
  wx.navigateTo({
    url: 'index/index',
  });

}

,
wxlogin:function(){
  wx.login({
    success: function (res) {
  //    console.log(res.code);
      if (res.code) {
        //发起网络请求
        wx.request({
          url: 'https://www.xxxzh.top/',
          data: {
            code: res.code
          },
          success:function(res){
            var data = res.data;
      //      console.log(data);
            data= JSON.parse(data.substring(data.indexOf("{"),data.lastIndexOf("}")+1));
      //      console.log(data);
            wx.setStorage({
              key: 'openid',
              data: data.openid,
            })
          }
          
        })
      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    },complete(){wx.hideLoading()}
  });

},
getinfo:function(){
  var that = this;
  wx.getUserInfo({
    success: function (res) {
 //     console.log(res);
      var userInfo = res.userInfo
      var nickName = userInfo.nickName
      var avatarUrl = userInfo.avatarUrl
      var gender = userInfo.gender //性别 0：未知、1：男、2：女
      var province = userInfo.province
      var city = userInfo.city
      var country = userInfo.country
      wx.setStorage({
        key: 'userInfo',
        data: userInfo,
      });
      that.setData({nickName:userInfo.nickName,avatarUrl:userInfo.avatarUrl,login:true})
     
    },
    complete(){wx.hideLoading()}
  })
}
,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    wx.setNavigationBarTitle({
      title: '个人中心',
    })
    var that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        var uinfo = res.data;
        that.setData({ nickName: uinfo.nickName, avatarUrl: uinfo.avatarUrl, login: true });

      },
    })
    wx.checkSession({
      success() {
       
      },
      fail() {
        that.login();
      }
    })

    wx.getStorage({
      key: 'baseInfo',
      success: function(res) {
        that.setData({baseInfo:res.data,loginJW:true});
      },
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
wx.getStorage({
  key: 'baseInfo',
  success: function(res) {
    var classInfo = wx.getStorageSync("class");
    that.setData({baseInfo:res.data,loginJW:true,classInfo:classInfo});
  },
})
  },

toJW:function(){
  wx.navigateTo({
    url: '../loginJW/loginJW?login=true',
  })
}
,
 login:function(){
   var that = this;
   wx.authorize({
     scope: 'scope.userInfo',
     success() {
       wx.showLoading({
         title: '登录中',
       })
       that.wxlogin();
       that.getinfo();
       if (!that.data.loginJW) that.toJW();
     },
     fail() {
       wx.showModal({
         title: '请重新授权',
         content: '本小程序不会窃取您的任何信息，授权后方可绑定教务系统账号。',
         success(res) {
           if (res.confirm) {
             wx.openSetting({
               success: (res) => {
                 console.log(res.authSetting["scope.userInfo"]);
                 if (res.authSetting["scope.userInfo"])
                   that.login();
               }
             })
           }
         }
       })

     },
     complete() { wx.hideLoading() ;
     wx.stopPullDownRefresh()}
   })
 },
 
 

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.login();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

feedback:function(){
  wx.navigateTo({
    url: '/pages/feedback/feedback'
  })


}

,
myscore:function(){


}
,
changeClass:function(){
  wx.navigateTo({
    url: '/pages/index/kcb/kcb'
  });


}
,
about:function(){
  wx.navigateTo({
    url: '/pages/about/about',
  })
}
,
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

   
  }
})
