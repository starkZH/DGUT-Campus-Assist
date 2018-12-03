const app = getApp();
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    host: app.data.host,
    origin: app.data.origin,
    data: [],
    compare_time: '',
    imgSize: '',
    label: app.data.label,
    windowWidth: 0,
    menuIcon: ['/images/watch.png', '/images/like.png', '/images/comment.png'],
    menuEvent: ['watch', 'like', 'comment'],
    showLoading: true, no_data:false
  },
  detail: function (e) {
    var id = e.currentTarget.id.substring(3);
    wx.navigateTo({
      url: '../momentDetail/momentDetail?id=' + this.data.data[id].id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        var leftPer = 0, ww = res.windowWidth;
        leftPer = (ww / 4 + ww * 0.03) * 2;
        this.setData({ imgSize: ww * 0.88 / 3, leftPer: leftPer, windowWidth: ww, margin_left: (res.windowWidth - 64) / 2})
      },
    });

  wx.setNavigationBarTitle({
    title: options.title,
  });
  var s_type=options.type;
if(s_type=='0'){
  this.data.kind=options.kind;
  this.getList(0,options.kind);
}
else {
  this.data.keyword=options.keyword;
  this.getList(0, 'a');}
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
  getList: function (id, kind) {
    wx.showLoading({
      title: '',
    })
    if (!kind) kind = 'a';
    var params = {
      id: id,
      kind: kind,
      order: 0,
      time: 0
    };
    var kw=this.data.keyword;
    if(kw)params.keyword=kw;
    util.commonPostRequest(this.data.host + 'contact/get_list', params,(res)=>{
      console.log(res)
      var od = this.data.data;
      var data = res.data, ms = [],
        date = util.formatTime(new Date());
      date = date.substring(0, date.indexOf(' ')) + ' 00:00:00';
      if (data.code) {
        data = data.data;
        for (var x in data) {
          var ct = data[x].createTime;
          ct = ct.replace('T', ' ');
          var index = ct.indexOf('.');
          if (index > 0) ct = ct.substring(0, index);
          var dd = util.DateDistan(date, ct);
          var dateText = ct.substring(ct.indexOf(' ') + 1, ct.lastIndexOf(':'));
          if (dd < 0) {
            dateText = '今天 ' + dateText;
          }
          else if (dd < 24 * 3600) {
            dateText = '昨天 ' + dateText;
          } else if (dd < 48 * 3600) {
            dateText = '前天 ' + dateText;
          } else {
            ct = ct.split(' ')[0].split('-');
            dateText = Number(ct[1]) + '月' + Number(ct[2]) + '日 ' + dateText;
          }
          data[x].createTime = dateText;
          if (data[x].imgUrls.length) {
            data[x].imgUrls = data[x].imgUrls.split(',');
            for (var y in data[x].imgUrls) data[x].imgUrls[y] = this.data.origin + data[x].imgUrls[y];
          }
          var info = [];
          info.push(data[x].watch); info.push(data[x].likes); info.push(data[x].comments.length);
          data[x].msginfo = info;
          od.push(data[x]);
        }

        this.setData({ data: od, showLoading: false })
      } else {
        app.error('获取失败')
        console.log(res)
      }    
    },()=>{wx.hideLoading();wx.stopPullDownRefresh()});
  
  },
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
    this.setData({ showLoading: true, loadingTip: '努力加载中' })
    this.getList(this.data.data[this.data.data.length - 1].id,this.data.kind);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})