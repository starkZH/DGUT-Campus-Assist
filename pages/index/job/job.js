var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  nodes:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  wx.request({
    url: app.data.host+'contact/get_ad',
    method: 'GET',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success:res=>{
      if(res.data.code){ 
        var data=res.data.data  ;
        wx.setNavigationBarTitle({
          title: data[2].value,
        })
        this.setData({ nodes: data[1].value })
      }
     
    }
  })
  },
  tap: function () {
    var text = this.data.nodes;
    text = text.substring(text.indexOf("img"));
    var link = text.substring(text.indexOf("src=\"") + 5, text.indexOf("/>")).replace(/ /g, "").replace("\"", "");
    console.log(link)
    wx.previewImage({
      urls: [link],
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