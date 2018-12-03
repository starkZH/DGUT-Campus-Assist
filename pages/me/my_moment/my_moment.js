const app = getApp();
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:[],
    origin: app.data.origin,
    host: app.data.host,
    imgSize: '',
    label: app.data.label,
    windowWidth: 0,
    menuIcon: ['/images/watch.png', '/images/like.png', '/images/comment.png'],
    menuEvent: ['watch', 'like', 'comment'],
    showLoading:true,
    loadingTip:'正在加载中...'
  },
  detail: function (e) {
    var id = e.currentTarget.id.substring(3);
    wx.navigateTo({
      url: '/pages/social/momentDetail/momentDetail?id=' + this.data.data[id].id,
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
        this.setData({ imgSize: ww * 0.88 / 3, leftPer: leftPer, windowWidth: ww, margin_left: (res.windowWidth - 90) / 2 })
      },
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },


  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: this.data.host + 'contact/personal_moment',
      method: 'POST',
      header: {
        'Authorization': app.data.token,
        'content-type': 'application/x-www-form-urlencoded'
      },
      data:{
        openid:app.data.userInfo.openid,
        kind:'a'
      },
      success: res => {
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
            if (data[x].top == 1)
              od.splice(0, 0, data[x]);
            else
              od.push(data[x]);
          }
          if (data.length == 0) this.setData({   })
          this.setData({ data: od, showLoading: false })
        } else {
          app.login();
          app.error('请下拉重试')
          console.log(res)
        }
      }, complete() { wx.stopPullDownRefresh(); wx.hideLoading() }
    })
  },
del:function(e){
  wx.showModal({
    title: '确认删除',
    content: '不可恢复',
    success:res=>{
      if(res.confirm){
        wx.showLoading({
          title: '删除中',
        })
        var id = e.currentTarget.id.substring(3);
        wx.request({
          url: this.data.host + 'contact/del_moment/' + this.data.data[id].id,
          method: 'GET',
          header: {
            'Authorization': app.data.token,
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: res => {
            console.log(res)
            if (res.data.code) {
              wx.showToast({
                title: '删除成功',
              });
              this.data.data=[];
              this.getList();
            } else app.error();
          },fail(){wx.hideLoading()}
        })
      }
    }
  })

},
getData:function(){
  this.data.data = [];
  this.getList();
},
  onShow: function () {
    var that=this;
    this.getData();
    if(!app.data.login){
      app.login().then(()=>{
        this.setData({
          nickName: app.data.userInfo.nickName,
          avatarUrl: app.data.userInfo.avatarUrl
        })
      });
    }else      
    this.setData({
      nickName: app.data.userInfo.nickName,
      avatarUrl: app.data.userInfo.avatarUrl
    })
    
  },

  
  
  
  edit: function (e) {
  var id=e.currentTarget.id.substring(4),that=this;
  wx.setStorage({
    key: 'temp_moment',
    data: that.data.data[id],
    success:res=>{
      wx.navigateTo({
        url: '../../social/makeMsg/makeMsg?edit=true',
      })
    }
  })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    if (!app.data.login) {
      app.login().then(() => { that.getData();});
    } else {
      that.getData();
    }
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