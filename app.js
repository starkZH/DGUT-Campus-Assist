const util = require('/pages/utils/util.js');
App({
  globalData:{
    menuVersion:'2.1.8'
  },
data:{
  host:'https://www.xxxzh.top/assist/',
  origin:'https://www.xxxzh.top',
  label:{a0:'闲聊',a1:'咨询',a2:'吐槽',a3:'征友',a4:'卖舍友',a5:'寻物',a6:'失物招领',a7:'求购'
  ,b:'全部',b1:'图书音像',b2:'运动户外',b3:'家用电器',b4:'电子产品',b5:'手机',b6:'电脑',b7:'办公用品',b8:'其它'
  },
  colors: ['#FFA500', '#FF7F24', '#FF7256', '#FF7256'],
  userInfo:{},
  token:null,
  login:false,
  navigate:true,
  scope_userInfo:false
},
/**
 *  {
      "selectedIconPath": "/images/main.png",
      "iconPath": "/images/main_Dis.png",
      "pagePath": "pages/index/index",
      "text": "首页"
    },
 */
error:function(text){
  if(text==null)text='操作失败';
  wx.showToast({
    title: text,
    image:'/images/close.png'
  })
},
error2: function (text,callback) {
  if (text == null) text = '操作失败';
 wx.showModal({
   title: '提示',
   content: text,
   showCancel:false,
   success:res=>{
     typeof callback=='function' && callback();
   }
 })
},
toastAuthorize:function(){
  wx.showModal({
    title: '提示',
    content: '授权登录后才能发布哦~',
    success: res => {
      if (res.confirm)
        wx.navigateTo({
          url: '/pages/index/index?menuIndex=3',
        })
    }
  })
},
login:function(){
  wx.showLoading({
    title: '加载中',
  })
  var that=this,old=this.data.userInfo;
  let pro=new Promise(function (resolve, reject) {

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          var update = false;
          wx.getUserInfo({
            success: res => {
              that.data.scope_userInfo = true;
              var userInfo = res.userInfo
              var nickName = userInfo.nickName
              var avatarUrl = userInfo.avatarUrl
              var gender = userInfo.gender //性别 0：未知、1：男、2：女
              var province = userInfo.province
              var city = userInfo.city
              var country = userInfo.country;
              wx.setStorage({
                key: 'userInfo',
                data: userInfo,
              });
             
              for (var x in that.data.userInfo) if (that.data.userInfo[x] != userInfo[x]) { update = true; break;}
              if (that.data.userInfo.length == 0) update = true;
              that.data.userInfo = userInfo;
              
            }, fail: f => { console.log(f) },
            complete() {
              wx.login({
                success: res => {
                  if (res.code) {
                    util.commonGetRequest(that.data.host + 'common/get_token/' + res.code, (res) => {
                      console.log(res);
                      var data = res.data;
                      if (data.code) {
                        that.data.userInfo.openid = data.openid;
                        that.data.token = data.token;
                        that.data.login = true;
                        if (update) that.update_base();
                        console.log(data)
                        resolve();
                        that.getMsg().then(() => { that.get_base(); });
                      }
                    });

                  }
                },complete(){
                  wx.hideLoading()
                }
              })
             
             
            }
          })
        } else {
          wx.hideLoading()
          if (!that.data.me){
            var page = getCurrentPages();
            if (page[page.length - 1].route.indexOf('/index') < 0)
            wx.showModal({
              title: '提示',
              content: '请到底栏-我-授权登录，以获得更好的服务',
              success: res => {
                if (res.confirm) {
                  wx.removeStorage({
                    key: 'userInfo',
                    success: res => {
                      that.data.userInfo={};
                        wx.navigateTo({
                          url: '/pages/index/index?menuIndex=3',
                        })
                    }
                  })

                }
              }
            })
            reject();
          }
        }
      }, complete() { }
    })
  });
  return pro;
}
  ,
  update_base:function(){
    var that=this;
    var info=this.data.userInfo;
    console.log('Begin to update the base msg...')
    util.commonPostRequest(this.data.host + 'contact/update_base',{
      avatarUrl: info.avatarUrl,
      name: info.nickName,
      gender: info.gender,
      native: info.country + ' ' + info.province + ' ' + info.city
    },(res)=>{
      console.log(res)
      if (!res.data.code)
        console.log(res);
      else console.log('Updated user base information ')
    });

  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
   var userInfo=wx.getStorageSync('userInfo');
    if (userInfo && userInfo.avatarUrl){
      this.data.userInfo = userInfo;
     this.data.scope_userInfo = true;
   }
  },

getMsg:function(){
  var that=this;
  let pro = new Promise(function (resolve, reject) {
    util.commonGetRequest(that.data.host + 'contact/get_msg', (res) => {
      //   console.log(res)
      if (res.data.code) {
        var nd = res.data.data.length, od = 0;
        wx.getStorage({
          key: 'msg',
          success: function (res) {
            od = Number(res.data.length);
          }, complete() {
            var cz = nd - od;
            if (cz > 0) {
              wx.setTabBarBadge({
                index: 2,
                text: cz + '',
              });
            } wx.setStorage({
              key: 'newMsg_num',
              data: cz > 99 ? '99+' : cz + '',
            })
            resolve();
          }
        })
      }
    });
 
  });
  return pro;
}
  ,
get_base: function () {
  var that = this;
  let pro = new Promise(function (resolve, reject) {
    util.commonGetRequest(that.data.host + 'contact/get_basic',(res)=>{
      var data = res.data, attrs = {};
      if (data.code) {
        data = data.data;
        for (var x in data) {
          //     console.log(data[x])
          var val = data[x].value;
          try { val = JSON.parse(val); } catch (e) { }
          attrs[data[x].attribute] = val;
        }
        that.data.base = attrs;
        console.log(attrs)
      }
      resolve();
    });
 
  });
  return pro;
}
,
  uploadFile: function (fp, x) {
    wx.showLoading({
      title: '上传中',
    })
    var that = this;
    let pro = new Promise(function (resolve, reject) {
      wx.getNetworkType({
        success: function (res) {
          if (res.networkType != 'none') {
            wx.uploadFile({
              url: that.data.host + 'common/upload',
              header: { 'Authorization': that.data.token },
              filePath: fp,
              formData: { 'type': fp.substring(fp.lastIndexOf('.') + 1) },
              name: 'file',
              success: res => {
                console.log(res.data);
                var data = JSON.parse(res.data);
                if (data.code) {
                  var res = [data.data, x]
                  resolve(res);

                } else {
                  that.login()
                  reject([x]);
                }

              },
              fail: f => {
                console.log(f)
                reject([x]);
              }
            })
          } else {
            that.error('请检查网络')
            reject([x]);
          }

        }, complete() { wx.hideLoading() }
      })
    });
    return pro;
  },
  onShow: function (options) {
 
  },
  redirectTo:function(url){
wx.redirectTo({
  url: url,
})
  },
  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})


   
