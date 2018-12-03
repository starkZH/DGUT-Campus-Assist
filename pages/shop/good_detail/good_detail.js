var app = getApp();
var host = app.data.host;
var util=require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    origin: app.data.origin,
    collection:[],
    colors: app.data.colors,
    showPanel:false,
    maskShow:false,
    animation:'',
    bottom:0,
    commentContent:'',
    collected:false
  },
  focus:function(e){
this.setData({bottom:e.detail.height*0.62})
  },
  blur:function(){
    this.setData({bottom:0})
  },
  input:function(e){
this.data.commentContent=e.detail.value;

  },
   homepage: function () { app.redirectTo('/pages/shop/shop'); },
  onLoad: function (options) {
    this.data.msgId=options.id;
 
  },


preview: function (e) {
  var imgUrl=this.data.data.imgUrls;
  wx.previewImage({
    urls: imgUrl,
   current:imgUrl[e.currentTarget.id.substring(3)]
  })
  },
comment:function(e){
  if (app.data.scope_userInfo){
  var id = e.currentTarget.id.substring(1);
  this.data.comment_id = id;
  var placeholder = '说说你的想法...';
  if (id>=0) {
    placeholder = '回复：' + this.data.data.comments[id].commenterName;
  }
  var ani = wx.createAnimation({
    duration: 400,
    timingFunction: 'ease',
  });
  ani.opacity(100).step();
  this.setData({ maskShow: true, animation: ani, showPanel: true, placeholder: placeholder })
}else{app.error2('授权登录后才能操作哦~');}
},
collect:function(){
  var collected = this.data.collected,collection=this.data.collection;
if(collected==true){
for(var x in collection)if(collection[x].id==this.data.data.id){
  collection.splice(x,1);
}
}
else { collection.push(this.data.data); }
  this.setData({ collection: collection, collected: !collected})
wx.setStorage({
  key: 'collection',
  data: collection,
})
}

,
send_comment: function () {
  var uinfo = app.data.userInfo, id = this.data.comment_id,
    params = {
      content: this.data.commentContent,
      commenterAvatar: uinfo.avatarUrl,
      commenterName: uinfo.nickName,
      msgId: this.data.msgId,
      kind: this.data.data.kind
    };
  if (id >= 0) {
    params.replyTo = this.data.data.comments[id].commenterName;
  }
  var pi = ''; 
  if (id == '-1') pi = this.data.msgId;
  else pi = this.data.data.comments[id].uniqueId;
  params.parentId = pi;
  //  console.log(params)
  if (this.data.commentContent) {
    wx.request({
      url: host + 'contact/deliver_comment/',
      method: 'POST',
      header: {
        'Authorization': app.data.token,
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: params,
      success: res => {
        console.log(res)
        if (res.data.code) {
          wx.showToast({
            title: '评论成功',
          });
          wx.request({
            url: host + 'contact/get_comment/' + this.data.msgId,
            method: 'GET',
            header: {
              'Authorization': app.data.token,
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: res => {
              console.log(res)
              if (res.data.code) {
                this.getMoment();
              }
            }
          })
          this.hide();
        } else app.error();
      }
    })
  } else app.error('请填写哦');
},


  delComment: function (e) {
    var uid = '';
    var id = e.currentTarget.id.substring(3);
    var sub = e.currentTarget.dataset.sub, commenter = '';
      uid = this.data.comment[id].uniqueId;
      commenter = this.data.comment[id].commenter;
    
    if (commenter == app.data.userInfo.openid)
      wx.showModal({
        title: '删除此评论',
        content: '',
        success: res => {
          if (res.confirm)
            util.commonGetRequest(host + 'contact/del_comment/' + uid, res => {
              if (res.data.code) {
                this.getMoment();
              } else app.error();
            });
            
        }
      })


  },
getMoment: function () {
  wx.showLoading({
    title: '获取中',
  })
  wx.request({
    url: host + 'contact/get_moment/' + this.data.msgId,
    method: 'GET',
    header: {
      'Authorization': app.data.token,
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      console.log(res)
      var data = res.data,
        date = util.formatTime(new Date());
      date = date.substring(0, date.indexOf(' ')) + ' 00:00:00';
      if (data.code=='1') {
        data = data.data[0];
        var ct = data.createTime;
        ct = ct.replace('T', ' ');
        var index = ct.indexOf('.');
        if (index > 0) ct = ct.substring(0, index);
        var i=ct.indexOf('.');if(i>0)ct=ct.substring(0,i);
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
        data.createTime = dateText;
        data.imgUrls = data.imgUrls.split(',');
        for (var y in data.imgUrls) data.imgUrls[y] = this.data.origin + data.imgUrls[y];
        var info = [];
        info.push(data.watch); info.push(data.likes); info.push(data.comments.length); info.push(data.share);
        data.msginfo = info;
        this.data.openid = data.openid;
        var comment = this.process_comment(data);
        var mt = []; mt[0] = data.share; mt[1] = data.comments.length;
        data.labels=data.labels.split(',');
        this.setData({ data: data, comment: comment, menuText: mt})
      } else if (data.code == '2') {
        wx.showModal({
          title: '该商品已被删除',
          content: '',
          showCancel: false,
          success: res => {
            wx.navigateBack();
          }
        })
      } else {
        app.login();
        wx.showModal({
          title: '请下拉刷新',
          content: '',
        })
      }
    }, complete:cmp=> { wx.hideLoading();
      wx.getStorage({
        key: 'collection',
        success: res => {
          var data = res.data;
          this.data.collection = data;
          for (var x in data) if (data[x].id == this.data.data.id) this.setData({ collected: true })
        },
      })
     }
  })
},

process_comment: function (data) {
  var cms = data.comments,
    modify = [], openid = this.data.openid,
    date = util.formatTime(new Date());
  date = date.substring(0, date.indexOf(' ')) + ' 00:00:00';
  for (var x in cms)  {
    var ct = cms[x].commentTime;
    ct = ct.replace('T', ' ');
    var index = ct.indexOf('.');
    if (index > 0) ct = ct.substring(0, index);
    var i = ct.indexOf('.'); if (i > 0) ct = ct.substring(0, i);
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
    cms[x].commentTime = dateText;
    modify.push(cms[x]);
  }

  return modify;
},

onShow: function () {
  util.commonGetRequest(host + 'contact/watch/' + this.data.msgId);//增加一次访问
  this.getMoment();
  if(!app.data.login)
  app.login().then(()=>{})

},
  hide:function(){

    var ani = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
    }), that = this;
    ani.opacity(0).step();
    this.setData({ animation: ani, noticeShow: false })
    setTimeout(function () { that.setData({ maskShow: false,showPanel:false }) }, 200);

  },
contact:function(){
  wx.showActionSheet({
    itemList: ['电话号码','微信号'],
    success:res=>{
      var index=res.tapIndex;
      wx.showModal({
        title: '提示',
        content: '联系商家时请记得说是在小程序上看到的',
        success:res=>{
          if (!index) {
            wx.makePhoneCall({
              phoneNumber: this.data.data.phone,
            })
          } else {
            wx.setClipboardData({
              data: this.data.data.wxnumber,
              success:res=>{wx.showToast({
                title: '复制成功',
              })}
            })
          }
        }
      })
  
    }
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
    if (!app.data.login)
      app.login().then(() => {})
    this.getMoment();
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
    return {
      title: this.data.data.title,
      path: '/pages/shop/good_detail/good_detail?id=' + this.data.data.id
    }
  }
})