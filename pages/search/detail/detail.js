Page({

  /**
   * 页面的初始数据
   */
  data: {
    nodes:'',
    node2:'',
    first:true,
    show:'',
    img:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.title,
    })
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    wx.request({
      url: "https://www.xxxzh.top",
      data:{
        b:options.b
      },
      success:function(res){
        var det = res.data;
        det = det.substring(det.indexOf("Info\":\"") + 7, det.lastIndexOf("\",\"DetailIsoList")).replace(/\\\"/g, "\"").replace(/\\n/g, "").replace("\",\"DetailIntro\":\"", "").replace("\",\"DetailContents\":\"","");
        var img = det.substring(det.indexOf("src=\"")+5,det.indexOf("\">"));
        console.log(det+"\n"+img);

        var n2 = det.replace(/<br \/>/g, "<<br<<").replace(/<[^>]+>/g, "").replace(/{[^>]+}/g, "").replace(/&[^>]+;/g, "").replace(/<<br<</g,"<br />");
        that.setData({nodes:det,img:img,node2:n2,show:det});
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  },

  
  change: function () {
    var fir =this.data.first,
    nodes = this.data.nodes,
    n2 = this.data.node2;
    if(fir)this.setData({show:n2,first:!fir})
    else this.setData({show:nodes,first:!fir})
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