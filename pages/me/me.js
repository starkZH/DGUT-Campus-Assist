var app=getApp();
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 页面的初始数据
   */
  data: {
    login: app.data.scope_userInfo,
  info:app.data.userInfo,
  tip:'点击授权登录',
    menuItem: ['我的消息', '制作我的圣诞帽','我发布的','我的二手','我的收藏'],
    menuIcon: ['/images/msg.png','/images/cap.png', '/images/fabu.png','/images/ershou.png','/images/un_collect.png'],
    url: ['/pages/me/my_msg/my_msg', '/pages/me/cap/cap','/pages/me/my_moment/my_moment', '/pages/me/my_goods/my_goods', '/pages/me/collection/collection'],
    new_msg: 0,
    showComp: false
  },
  properties: {
    compId: {
      type: String
    },
    show: {
      type: Boolean,
      value: false,
      observer: function (nv, ov, cp) {
        if (nv) {
          this.onShow();
        }
      }
    },
    refresh: {
      type: Boolean,
      value: false,
      observer: function (nv, ov, cp) {
        if (nv) {
          this.onPullDownRefresh();
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  ready_: function (options) {
    app.data.me=true;
  
  },
  methods:{

    navigate: function (e) {
      wx.navigateTo({
        url: this.data.url[e.currentTarget.id],
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
      var that = this;
      if (!app.data.login) {
        app.login().then(() => {
          this.onShow();
        }).catch(()=>{
          this.setData({info:{}})
        });
      } else {

        app.getMsg().then(() => {
          wx.getStorage({
            key: 'newMsg_num',
            success: res => {
              if (res.data <= 0) wx.removeTabBarBadge({ index: 2 });
              this.setData({ new_msg: res.data })
            },
          })
        }); this.setData({ login: true, info: app.data.userInfo })
      }


    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
      app.data.me = false;
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
      app.data.me = false;
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
      this.onShow();
    },
  }
})