var util=require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  title:'',
  site:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: options.title,
    })
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://www.xxxzh.top',
      data: {
        pb: options.rds,
        pc: options.nos
      },
      success: function (res) {
        var det = res.data;
        //     console.log(det);
        det = JSON.parse(det.substring(det.indexOf("{"), det.lastIndexOf("}") + 1));
        wx.showToast({
          title: det.errorname,
        });
        console.log(det);
        var site = det.find_ifa_GetSite_list1;
        for (var x in site) {
          
          for(var xx in site[x]){
          try{site[x][xx]=util.decode(site[x][xx]);}catch(e){}}
          var status = site[x].RoomStatus;
            if (status && (status.indexOf("可借") >= 0 || status.indexOf("可供") >= 0))
              site[x].color = 'green';
            else site[x].color = 'red';
        }
        that.setData({ site: site, title: options.title });
      },
      complete:function(){
        wx.hideLoading()
      }
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