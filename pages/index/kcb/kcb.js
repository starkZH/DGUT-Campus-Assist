const app = getApp();
var util = require('../../utils/util.js');  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:'',
    host: app.data.host,
    classes:[],
    znpp:[]
  },


input:function(e){
  this.data.info = e.detail.value;
  this.pipei();
},
chooseClass:function(e){
var id = e.currentTarget.id.substring(5),
znpp = this.data.znpp;
this.setData({info:znpp[id],znpp:[]});
}
,
pipei:function(){
  var info = this.data.info,
  classes = this.data.classes,
  pr = [];
  if(classes.length>0){
    for(var x in classes){
      if(classes[x].indexOf(info)>=0){
        pr.push(classes[x]);
      }
    }
    this.setData({znpp:pr});
  }else{
    this.getIndex();
  }
}
,
binding:function(){
  var info = this.data.info;
  if(info){
    wx.showLoading({
      title: '获取中',
    })
    wx.request({
      url: this.data.host + 'common/get_kcb',
      method: 'POST',
      header: {
        'Authorization': app.data.token,
        'content-type': 'application/x-www-form-urlencoded'
      },
      data:{
        "class": info
      },
      success: res => {
        console.log(res);
        var data=res.data,kcb=[];
        if(data.length>0){
          wx.showToast({
            title: '获取成功',
          })
          for(var x in data){
            var detail = data[x].detail
            kcb.push(detail)
          }
        wx.setStorage({
          key: 'class',
          data: this.data.info,
          success(){
            wx.setStorage({
              key: 'kcb',
              data: kcb,
              success() {
                wx.setStorage({
                  key: 'NewClassKcb',
                  data: 'true',
                  success() {
                    wx.navigateBack();
                  }
                })

              }
            })
          }
        })
   
        }else{
          app.error('查无此班级');
        }
      },complete(){wx.hideLoading()}
    })
  }

},
getIndex:function(){
wx.request({
  url: this.data.host+'common/get_classes',
  method:'GET',
  header: {
    'Authorization': app.data.token,
    'content-type': 'application/x-www-form-urlencoded'
  },
  success:res=>{
    console.log(res);
    if(res.statusCode=='401')
    wx.showModal({
      title: '请下拉刷新',
      content: 'token无效或已过期',
      showCancel:false,
      complete(){wx.stopPullDownRefresh()}
    })
    else
    this.setData({classes:res.data})
  }
})
}
,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '获取班级课表',
    });
    if(!app.data.login)
    app.login().then(()=>{
      this.getIndex();
    });
    else this.getIndex();
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
    app.login().then(() => {
      this.getIndex();
    });
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