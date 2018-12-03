// pages/me/collection/collection.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  cancel_collect: function (e) {
  wx.showModal({
    title: '提示',
    content: '将从您的收藏列表中删除此商品',
    success:res=>{
      if(res.confirm){
        var  collection = this.data.collection;
            collection.splice(e.detail.id, 1);
          this.setData({collection:collection});
          wx.setStorage({
            key: 'collection',
            data: collection,
          })
      }
    }
  })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.getStorage({
      key: 'collection',
      success: res => {
        this.setData({ collection: res.data })
      },
    })
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