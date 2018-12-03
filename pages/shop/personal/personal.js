var app=getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  openid:'',
  host:app.data.host,
  origin: app.data.origin,
  data:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  this.data.openid=options.openid;
  wx.getSystemInfo({
    success: res => {
      this.setData({ margin_left: (res.windowWidth - 90) / 2 })
    },
  })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  this.getList();
  },

  getInfo: function () {
    wx.request({
      url: this.data.host + 'contact/get_person_base/'+this.data.openid,
      method: 'GET',
      header: {
        'Authorization': app.data.token,
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
  console.log(res)
  var data=res.data;
  if(data.code){
    var info=data.data[0];
    var distance = Math.abs(util.DateDistan(util.formatTime(new Date()),info.createTime));
    var intro='来莞工二手 ';
    var year = Math.floor(distance / 12 / 30 / 24 / 3600), month = Math.floor(distance / 30 / 24 / 3600), day = Math.floor(distance/24/3600)+1;
    console.log(distance+''+year+' '+month+' '+day)
    if (year > 0) { intro += year + '年 '; if ((month = (month - year * 12))>0)intro+=month+' 个月'}
else if (month>0) intro += month + ' 个月';
else if(day>=0)intro+=day+' 天';
intro+='了，共发布了 '+this.data.data.length+' 件宝贝';
info.introduce=intro;
if(!info.gender)info.gender=0;
    this.setData({info:info})
  }
      }
      });
  },

  getList: function (id) {
    wx.showLoading({
      title: '加载中',
    })
if(!app.data.login){
app.login().then(()=>{
  this.getList();
});
return;}

    wx.request({
      url: this.data.host + 'contact/personal_moment',
      method: 'POST',
      header: {
        'Authorization': app.data.token,
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid:  this.data.openid,
        kind: 'b'
      },
      success: res => {
        console.log(res)
        var od = this.data.data;
        if (!id)od=[];
        var data = res.data;
        if (data.code) {
          data = data.data;
          for (var x in data) {
            if (!isNaN(data[x].origin_price)) data[x].discount = ' ' + Number(data[x].price / data[x].origin_price * 10).toFixed(1) + ' 折 ';
            if (data[x].labels.length) data[x].labels = data[x].labels.split(',');
            var imgs = data[x].imgUrls.split(',');
            for (var y in imgs) { imgs[y] = this.data.origin + imgs[y] }
            data[x].imgUrls = imgs;
            if (data[x].sell_out == '1') data[x].sell_text = '已卖出';
            else data[x].sell_text = '未卖出';
            od.push(data[x])
          }
          if (data.length == 0) this.setData({ showLoading: true, loadingTip: '没有了，双击顶部可刷新哦~' })
          this.setData({ data: od, showLoading: false })
        

          this.getInfo();
        } else {
          app.error('获取失败')
          console.log(res)
        }
      }, complete() { wx.stopPullDownRefresh(); wx.hideLoading() }
    })
  },


  onReachBottom: function () {
    this.setData({ showLoading: true, loadingTip: '努力加载中...' })
    this.getList(this.data.data[this.data.data.length - 1].id, this.data.menuIndex);
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
    this.getList();
    this.getInfo();
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