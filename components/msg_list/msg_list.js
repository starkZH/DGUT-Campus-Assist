var app=getApp();
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    data:{
      type:Array
    },
    imgSize: {
      type: String
    }
  },

ready:function(){
  wx.getSystemInfo({
    success: res => {
      var leftPer = 0, ww = res.windowWidth;
      leftPer = (ww / 4 + ww * 0.03) * 2;
      this.setData({ imgSize: Math.round( ww * 0.88 / 3), leftPer: leftPer, windowWidth: ww, margin_left: (res.windowWidth - 90) / 2 })
    },
  });
},
  data: {
    menuIcon: ['/images/watch.png', '/images/like.png', '/images/comment.png'],
    menuEvent: ['watch', 'like', '_comment'],
    host:app.data.host,
    label: app.data.label,
  },

  methods: {
    preview: function (e) {
      var id = e.currentTarget.id.substring(3).split(','),
        imgs = this.data.data[id[0]].imgUrls;
      wx.previewImage({
        urls: imgs,
        current: imgs[id[1]]
      })
    },
    detail: function (e) {
      var id = e.currentTarget.id.substring(3);
      wx.navigateTo({
        url: '/pages/social/momentDetail/momentDetail?id=' + this.data.data[id].id,
      })
    }, 
    _comment:function(e){
this.triggerEvent('comment',{id:e.currentTarget.id},{});
    }
    ,like: function (e) {
      if (app.data.scope_userInfo){
      wx.showLoading({
        title: '',
      })
      var id = e.currentTarget.id.substring(1);
      if (!this.data.data[id].like_flag) {
        wx.request({
          url: this.data.host + 'contact/like_/' + this.data.data[id].id,
          method: 'GET',
          header: {
            'Authorization': app.data.token,
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: res => {
            console.log(res);
            if (res.data.code) {

              var data = this.data.data;
              data[id].like_flag = 1;
              data[id].likes = Number(data[id].likes) + 1;
              data[id].msginfo[1] = data[id].likes;

              this.setData({ data: data })
            } else if(res.statusCode==401) { app.login(); app.error('请重新操作') }
          }, complete() { wx.hideLoading() }
        })
      } else {
        wx.request({
          url: this.data.host + 'contact/dislike/' + this.data.data[id].id,
          method: 'GET',
          header: {
            'Authorization': app.data.token,
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: res => {
            if (res.data.code) {
              var data = this.data.data;
              data[id].like_flag = 0;
              data[id].likes = Number(data[id].likes) - 1;
              data[id].msginfo[1] = data[id].likes;
              this.setData({ data: data })
            } else { app.login(); app.error('请重新操作') }
          }, complete() { wx.hideLoading() }
        })

      }
      }else app.error2('请先授权登录哦');
    }
  }
})