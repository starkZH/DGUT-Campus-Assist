// pages/search/booklist/booklist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  booklist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
wx.setNavigationBarTitle({
  title: '我的书单',
})

  var that = this;
  wx.getStorage({
    key: 'booklist',
    success: function(res) {
      var data = res.data;
      if(data.length>0)
      that.setData({booklist:data});
      else {
        wx.showToast({
          title: '空空如也~',
          image: '/images/fail.png',
        })
        setTimeout(function () { wx.navigateBack() }, 1500);
      }
    },
    fail:function(){
    wx.showToast({
      title: '空空如也~',
      image:'/images/fail.png',
    })
    setTimeout(function(){wx.navigateBack()},1500);
    }
  })
  },

guancang:function(e){
  var id = e.currentTarget.id.substring(2),
  bl = this.data.booklist;
  wx.navigateTo({
    url: '../site/site?rds='+bl[id].CtrlRd+'&nos='+bl[id].CtrlNo+'&title='+bl[id].Title,
  })

}
,

delbook:function(e){
var id = e.currentTarget.id.substring(3),
bl = this.data.booklist,
nbl = [];
for(var x in bl){
  if(x!=id)nbl.push(bl[x]);
}
this.setData({booklist:nbl});
wx.setStorage({
  key: 'booklist',
  data: nbl,
})
},
getbookinfo:function(e){
  var id = e.currentTarget.id.substring(5),
  bl = this.data.booklist;
  wx.navigateTo({
    url: '../detail/detail?b='+bl[id].CtrlRd+'&title='+bl[id].Title,
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