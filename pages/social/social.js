const app=getApp();
const util=require('../utils/util.js');
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 页面的初始数据
   */
  data: {
    host:app.data.host,
    origin: app.data.origin,
    data: [],
  compare_time:'',
  imgSize:'',
  label:app.data.label,
  windowWidth:0,
  ready_flag:true,
  
    content_labels: [['闲聊', '咨询', '吐槽', '征友', '卖舍友'],['寻物','失物招领','求购']],
    label_icons: [['xianliao.png', 'zixun.png', 'tucao.png', 'zhengyou.png', 'maiyou.png'], ['xunwu.png', 'shiwu.png', 'qiugou.png']],
    showComp: false
  
  }
  
  ,
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
    reachBottom: {
      type: Boolean,
      value: false,
      observer: function (nv, ov, cp) {
        if (nv) {
          this.onReachBottom();
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
 
  methods: {
    ready_: function (options) {

      wx.getSystemInfo({
        success: res => {
          var leftPer = 0, ww = res.windowWidth;
          leftPer = (ww / 4 + ww * 0.03) * 2;
          this.setData({ imgSize: ww * 0.88 / 3, leftPer: leftPer, windowWidth: ww })
        },
      });
      app.get_base().then(() => {
        this.setData({ base: app.data.base })
      });

      if (!app.data.login) app.login().then(() => { });
      wx.hideLoading()


    },
    new_msg: function () {
      wx.navigateTo({
        url: '/pages/social/makeMsg/makeMsg',
      })
    }
    ,
    msg: function (e) {
      console.log(e)
    },
    focus: function (e) {
      this.setData({ bottom: e.detail.height * 0.62 })
    },
    blur: function () {
      this.setData({ bottom: 0 })
    },
    input: function (e) {
      this.data[e.detail.key] = e.detail.value;
    },
    input_c: function (e) {
      this.data.commentContent = e.detail.value;
    },
    comment: function (e) {
      if (app.data.scope_userInfo) {
        this.data.comment_id = e.detail.id.substring(1);
        this.setData({ maskShow: true, showPanel: true })
      }
      else { app.error2('授权登录后才能操作哦~'); }
    },


    search: function () {
      if (this.data.keyword)
        wx.navigateTo({
          url: '/pages/social/result/result?keyword=' + this.data.keyword + '&type=1&title=搜索结果',
        })
    },
    toPage: function (e) {
      var id = e.detail.id.substring(3), imgs = this.data.base.imgUrls, url = imgs[id].url;
      if (url) wx.navigateTo({
        url: url,
      })
    },
    navigate: function (e) {
      var id = e.currentTarget.id.substring(5).split(','), ls = this.data.label,
        val = this.data.content_labels[id[0]][id[1]], kind;
      for (var x in ls) if (ls[x] == val) kind = x;
      wx.navigateTo({
        url: '/pages/social/result/result?kind=' + kind + '&type=0&title=' + val,
      })
    },
    getData: function () {
      if(this.data.ready_flag){
        this.ready_();
        this.data.ready_flag=false;
      }
      if (app.data.scope_userInfo && !app.data.login) {
        app.login().then(() => {
          this.getData();
        });
      }
      this.getList(0);
    },
    onShow: function () {
      this.getData();
    },
    send_comment: function () {
      var uinfo = app.data.userInfo, id = this.data.comment_id,
        params = {
          content: this.data.commentContent,
          commenterAvatar: uinfo.avatarUrl,
          commenterName: uinfo.nickName,
          msgId: this.data.data[id].id,
          parentId: this.data.data[id].id,
          kind: this.data.data[id].kind
        };
      //  console.log(params)
      if (this.data.commentContent) {
        util.commonPostRequest(this.data.host + 'contact/deliver_comment/', params, (res) => {
          console.log(res)
          if (res.data.code) {
            wx.showToast({
              title: '评论成功',
            });
            this.hide();
            var ms = this.data.data;
            ms[id].comments.splice(0, 0, params);
            ms[id].msginfo[2] += 1;
            this.setData({ data: ms })
          } else app.error();
        });

      } else app.error('请填写哦');
    },

    onPageScroll() {
      this.setData({ showPanel: false, maskShow: false })
    },

    hide: function () {
      this.setData({ showPanel: false, maskShow: false })

    },

    getList: function (id, kind) {
      wx.showLoading({
        title: '加载中',
      })
      var od = this.data.data;
      if (id == 0) od = [];
      if (!kind) kind = 'a';
      util.commonGetRequest(this.data.host + 'contact/get_top', (res) => {
        console.log(res)
        if (res.data.code) {
          for (var x in od) {
            if (od[x].top == 1) od.splice(x, 1);
          }
          var top = res.data.data;
          util.commonPostRequest(this.data.host + 'contact/get_list', {
            id: id,
            kind: kind,
            order: 0,
            time: 0
          }, (res) => {
            console.log(res)
            var data = res.data, ms = [],
              date = util.formatTime(new Date());
            date = date.substring(0, date.indexOf(' ')) + ' 00:00:00';
            if (data.code) {
              data = data.data;
              for (var x in top) data.splice(0, 0, top[x]);
              console.log(data)
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
                if (!data[x].name) data[x].name = '佚名';
                if (!data[x].avatarUrl) data[x].avatarUrl = '/images/talk.png';
                if (data[x].imgUrls.length) {
                  data[x].imgUrls = data[x].imgUrls.split(',');
                  for (var y in data[x].imgUrls) data[x].imgUrls[y] = this.data.origin + data[x].imgUrls[y];
                }
                var info = [];
                info.push(data[x].watch); info.push(data[x].likes); info.push(data[x].comments.length);
                data[x].msginfo = info;
                if (data[x].top == 0) od.push(data[x]);
                else od.splice(0, 0, data[x]);
              }
              console.log(data)
              if (data.length == top.length) this.setData({ showLoading: true, no_data: true })
              this.setData({ data: od })
            } else {
              app.login();
              app.error('请下拉重试哦');
              console.log(res)
            }
          }, () => { wx.hideLoading(); wx.stopPullDownRefresh() });


        }
      });



    },




    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
      app.get_base().then(() => {
        this.setData({ base: app.data.base })
      });
      this.getData();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      this.setData({ showLoading: true, no_data: false })
      this.getList(this.data.data[this.data.data.length - 1].id);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {
      var id = e.target.id.substring(5);
      var imgs = this.data.data[id].imgUrls;
      return {
        title: this.data.data[id].text,
        path: '/pages/social/momentDetail/momentDetail?id=' + this.data.data[id].id,
        imageUrl: imgs.length > 0 ? imgs[0] : 'https://www.xxxzh.top/base/share.jpg'
      }
    }

},

})