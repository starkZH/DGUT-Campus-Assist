var util = require("../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kw:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  input:function(e){
    this.data.kw = e.detail.value;

  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '图书馆',
    })
  },

  go: function () {
    var kw = this.data.kw;
    if(kw)
    wx.navigateTo({
      url: 'result/result?kw='+kw,
    })
    else wx.showToast({
      title: '请输入关键字',
      image:'/images/fail.png'
    })
  },
tolist:function(){
  wx.navigateTo({
    url: 'booklist/booklist',
  })
}

,
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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