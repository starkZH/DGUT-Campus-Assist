const app = getApp();
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: [],
    host: app.data.host,
    origin: app.data.origin,
    showLoading: true,
    loadingTip: '正在加载中...'
  },
  edit: function (e) {
    var id = e.currentTarget.id.substring(4), that = this;
    wx.setStorage({
      key: 'temp_moment',
      data: that.data.data[id],
      success: res => {
        wx.navigateTo({
          url: '../../shop/deliver_good/deliver_good?edit=true',
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
  getData: function () {
    this.data.data = [];
    this.getList();
  },
  onShow: function () {
    var that = this;
    if (!app.data.login) {
      app.login();
      setTimeout(function () {
        that.getData();
      }, 1000);
    } else {
      that.getData();
    }
  },
detail: function (e) {
  var id = e.currentTarget.id.substring(6);
  wx.navigateTo({
    url: '/pages/shop/good_detail/good_detail?id=' + this.data.data[id].id,
  })
},
  del: function (e) {
    wx.showModal({
      title: '确认删除',
      content: '不可恢复',
      success: res => {
        if (res.confirm) {
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
                this.data.data = [];
                this.getList();
              }else app.error();
            }, fail() { wx.hideLoading() }
          })
        }
      }
    })

  },
  getList: function (id) {
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
      data: {
        openid: app.data.userInfo.openid,
        kind: 'b'
      },
      success: res => {
        console.log(res)
        var od = this.data.data;
        var data = res.data;
        if (data.code) {
          data = data.data;
          for (var x in data) {
            if (!isNaN(data[x].origin_price)) data[x].discount = ' ' + Number(data[x].price / data[x].origin_price * 10).toFixed(1) + ' 折 ';
            if (data[x].labels.length) data[x].labels = data[x].labels.split(',');
            var imgs = data[x].imgUrls.split(',');
            for (var y in imgs) { imgs[y] = this.data.origin + imgs[y] }
            data[x].imgUrls = imgs;
            if(data[x].sell_out=='1')data[x].sell_text='已卖出';
            else data[x].sell_text = '未卖出';
            od.push(data[x])
          }
          if (data.length == 0) this.setData({ showLoading: true, loadingTip: '没有了，双击顶部可刷新哦~' })
          this.setData({ data: od, showLoading: false})
        } else {
          app.error('获取失败')
          console.log(res)
        }
      }, complete() { wx.stopPullDownRefresh(); wx.hideLoading() }
    })
  },
  
  
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    if (!app.data.login) {
      app.login();
      setTimeout(function () {
        that.getData();
      }, 1000);
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