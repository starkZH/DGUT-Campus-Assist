const app = getApp();
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    host: app.data.host,
    origin: app.data.origin,
    data: {},
    label: app.data.label,
    comment:[],
    menuIcon: [ '/images/comment.png', '/images/like.png'],
    menuText:['评论',0],
    menuEvent:['comment','like'],
    menuColor:[,,,],
    msgId:0,
    commentContent:'',
    placeholder:''
  },
  homepage: function () { app.redirectTo('/pages/social/social'); },
  focus: function (e) {
    this.setData({ bottom: e.detail.height * 0.62 })
  },
  blur: function () {
    this.setData({ bottom: 0 })
  },
  input_c: function (e) {
    this.data.commentContent = e.detail.value;
  },
  onLoad: function (options) {
this.data.msgId=options.id;

  },
  preview:function(e){
var id=e.currentTarget.id.substring(3),
imgs=this.data.data.imgUrls;
wx.previewImage({
  urls: imgs,
  current:imgs[id]
})
  },
  comment: function (e) {
  //  console.log(e)
    var id = e.currentTarget.id.substring(3);
    this.data.comment_id = id;
    var placeholder='说说你的想法...';
    var sub=e.currentTarget.dataset.sub;
    if(sub=='1'){
      id=id.split(',');
      placeholder='回复：'+this.data.comment[id[0]].comment[id[1]].commenterName;
    }
    var ani = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    });
    ani.opacity(100).step();
    this.setData({ maskShow: true, animation: ani, showPanel: true, placeholder: placeholder})
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData();
  },
  send_comment: function () {
    wx.showLoading({
      title: '',
    })
    var uinfo = app.data.userInfo, id = this.data.comment_id.split(','),
      params = {
        content: this.data.commentContent,
        commenterAvatar: uinfo.avatarUrl,
        commenterName: uinfo.nickName,
        msgId: this.data.msgId,
        kind: this.data.data.kind
      };
if(id[1]>=0){
params.replyTo=this.data.comment[id[0]].comment[id[1]].commenterName;
}
      var pi='';id=id[0];
      if (id == '-1') pi = this.data.msgId;
      else pi=this.data.comment[id].uniqueId;
      params.parentId=pi;
    //  console.log(params)
    if (this.data.commentContent) {
      util.commonPostRequest(this.data.host + 'contact/deliver_comment/', params, res => {
        console.log(res)
        if (res.data.code) {
          wx.showToast({
            title: '评论成功',
          });
          util.commonGetRequest(this.data.host + 'contact/get_comment/' + this.data.msgId, res => {
            console.log(res)
            if (res.data.code) {
              this.getMoment();
            }
          });
          
          this.hide();
        } else app.error();
      },()=>{ wx.hideLoading() });
    
    } else app.error('请填写哦');
  },
  like: function (e) {
    wx.showLoading({
      title: '',
    })
    var id = e.currentTarget.id.substring(1);
    if (!this.data.data.like_flag) {
      util.commonGetRequest(this.data.host + 'contact/like_moment/' + this.data.data.id,
        res => {
          console.log(res);
          if (res.data.code) {
            var data = this.data.data;
            data.like_flag = 1;
            data.likes = Number(data.likes) + 1;
            var mt = this.data.menuText, mc = [];
            mt[1] = data.likes;
            mc[1] = 'red';
            this.setData({ data: data, menuText: mt, menuColor: mc })
          } else app.error();
        }, ()=>{ wx.hideLoading() });
     
    } else {
      util.commonGetRequest(this.data.host + 'contact/dislike/' + this.data.data.id, res => {
        if (res.data.code) {
          var data = this.data.data;
          data.like_flag = 0;
          data.likes = Number(data.likes) - 1;
          var mt = this.data.menuText, mc = [];
          mt[1] = data.likes;
          mc[1] = '';
          this.setData({ data: data, menuText: mt, menuColor: mc })
        }
      }, ()=>{ wx.hideLoading() });
    }
  }
  ,
  delComment:function(e){
    var uid = '';
    var id = e.currentTarget.id.substring(3).split(',');
    var sub = e.currentTarget.dataset.sub,commenter='';
    if (sub == 1) {
      uid = this.data.comment[id[0]].comment[id[1]].uniqueId;
      commenter = this.data.comment[id[0]].comment[id[1]].commenter;
    } else {
      uid = this.data.comment[id[0]].uniqueId;
      commenter = this.data.comment[id[0]].commenter;
    }
    if(commenter==app.data.userInfo.openid)
    wx.showModal({
      title: '删除此评论',
      content: '',
      success:res=>{
        if(res.confirm)
          util.commonGetRequest(this.data.host + 'contact/del_comment/' + uid, res => {
            if (res.data.code) {
              this.getMoment();
            } else app.error();
          });
        
      }
    })

 
  },
  hide: function () {

    var ani = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
    }), that = this;
    ani.opacity(0).step();
    this.setData({ animation: ani, noticeShow: false })
    setTimeout(function () { that.setData({ maskShow: false, showPanel: false }) }, 200);

  },

getMoment: function () {
  wx.showLoading({
    title: '',
  });
  util.commonGetRequest(this.data.host + 'contact/get_moment/' + this.data.msgId, res => {
    console.log(res)
    var data = res.data,
      date = util.formatTime(new Date());
  
    date = date.substring(0, date.indexOf(' ')) + ' 00:00:00';
    if (data.code == '1' && data.data.length > 0) {
      data = data.data[0];
      var ct = data.createTime;
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
      data.createTime = dateText;
      if (data.imgUrls.length) {
        data.imgUrls = data.imgUrls.split(',');
        for (var y in data.imgUrls) data.imgUrls[y] = this.data.origin + data.imgUrls[y];
      }
      var info = [];
      info.push(data.watch); info.push(data.likes); info.push(data.comments.length); info.push(data.share);
      data.msginfo = info;
      this.data.openid = data.openid;
      var comment = this.process_comment(data);
      var mt = this.data.menuText; mt[1] = data.likes;
      var mc = [], mi = this.data.menuIcon;
      if (data.like_flag) {
      mc[1] = 'red';
      }
      this.setData({ data: data, comment: comment, menuText: mt, menuColor: mc })
    } else if (res.statusCode==401) {
      app.login();
      wx.showModal({
        title: '请下拉刷新',
        content: '',
      })
     
    }
    else {
      wx.showModal({
        title: '该内容已被删除',
        content: '',
        showCancel: false,
        success: res => {
          wx.navigateBack();
        }
      })
    }
  }, ()=>{ wx.hideLoading() });
  
  },

process_comment:function(data){
  var cms = data.comments,
    modify = [], openid = this.data.openid,
    date = util.formatTime(new Date());
  date = date.substring(0, date.indexOf(' ')) + ' 00:00:00';
  for (var x in cms) if (cms[x].parentId == this.data.msgId) {
    var ct = cms[x].commentTime;
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
    cms[x].commentTime = dateText;
    modify.push(cms[x]);
  }
  for (var y in modify) {
    var cter = modify[y].uniqueId;
    var len=cms.length-1;
    for (var x in cms) {
      if (cms[len-x].parentId == cter) {
        if (!modify[y].comment) modify[y].comment = [];
        modify[y].comment.push(cms[len-x]);
      }
    }
  }
  return modify;
},
  operate:function(e){
    var list = ['回复'];
    var id = e.currentTarget.id.substring(3).split(',');
    var sub = e.currentTarget.dataset.sub, commenter = '';
    if (sub == 1) {
      commenter = this.data.comment[id[0]].comment[id[1]].commenter;
    } else {
      commenter = this.data.comment[id[0]].commenter;
    }
    if (commenter == app.data.userInfo.openid) list = ['回复', '删除'];
    wx.showActionSheet({
      itemList: list,
      success:res=>{
        if(res.tapIndex){
this.delComment(e);
        }else{
this.comment(e);
        }
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
  getData(){
    if (!app.data.login)
      app.login().then(() => {  })
    this.getMoment();
    util.commonGetRequest(this.data.host + 'contact/watch/' + this.data.msgId);
  },
  onPullDownRefresh: function () {
   this.getData();
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
      path: '/pages/momentDetail/momentDetail?id=' + this.data.data.id
    }
  }
})