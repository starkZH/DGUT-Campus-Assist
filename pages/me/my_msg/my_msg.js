const app = getApp();
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: [],
    host: app.data.host,
    old:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  getData:function(){
    if (!app.data.login) app.login();
   
    this.getList();
  },
  onShow: function () {
    wx.getStorage({
      key: 'msg',
      success: res => {
        var data=res.data;console.log(data)
        this.data.old = data.length;
        this.setData({ data: data.content })
        
      }, complete:res=> { this.getData()}
    })
 
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: this.data.host + 'contact/get_msg',
      method: 'GET',
      header: {
        'Authorization': app.data.token,
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res)
        var od = this.data.data;
        var data = res.data, ms = [],
          date = util.formatTime(new Date());
        date = date.substring(0, date.indexOf(' ')) + ' 00:00:00';
        if (data.code) {
          data = data.data;
            
          var ids=new Set(),map=new Map(),ks=new Map(),ol=0;
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
            var mid = data[x].msgId,kind=data[x].kind;
            if(ids.add(kind+','+mid).size==ol){
              map.set(kind+','+mid, Number(map.get(kind+','+mid))+1);
            }else{
              map.set(kind+','+mid,1);
              ol++;
            }
          }
          var dress=[];
          map.forEach(function(value,key){
            for(var x in data){
           //   console.log(key+' '+value)
              var key=key.toString().split(',');
            if (key[1] == data[x].msgId&&key[0]==data[x].kind) { 
              var title = data[x].text; if (title && title.length > 10) title = title.substring(0, 18) + '...';
              var content = '';
              var name=data[x].name;
              if(name&&name.length>7)name=name.substring(0,5)+'...';
              if (value > 1) content = name + ' 等 ' + value + ' 人';
              else content = data[x].name;
              var kind = data[x].kind;
              if (kind == '6') content += ' 赞了你发布的内容';
              else if (kind.indexOf('a') >= 0) content += ' 回复了你发布的内容';
              else if (kind.indexOf('b') >= 0) {
                title = data[x].title;
                content += ' 回复了你的二手物品';}
              dress.push({ content: content, title: title, avatarUrl: data[x].avatarUrl, msgId: data[x].msgId, kind: data[x].kind, createTime: data[x].createTime,times:value});
              break;
            }}
          });
       var od=this.data.data;
       var s=new Set(),m=new Map();
   //    console.log(od);console.log(dress)
         for(var y in dress){
           dress[y].read=false;
           for (var x in od) {
           if (od[x].msgId == dress[y].msgId&&od[x].kind==dress[y].kind){
             
         if(od[x].times>=dress[y].times)
        {
           if (od[x].read==true)dress[y].read=true;
           }
         break;
           } 
           if(x>=dress.length)break;
           }
         }
          var msg={length:data.length,content:dress};
          wx.setStorage({
            key: 'msg',
            data: msg,
          })
          if (data.length == 0) this.setData({})
          this.setData({ data: dress,old:data.length, showLoading: false })
        
        } else {
          app.login();
          app.error('请下拉重试')
          console.log(res)
        }
      }, complete() { wx.stopPullDownRefresh(); wx.hideLoading() }
    })
  },
go:function(e){
var id=e.currentTarget.id.substring(3),data=this.data.data;
var url='/pages/social/momentDetail/momentDetail?id='+data[id].msgId;
if(data[id].kind.indexOf('b')>=0){
  url = '/pages/shop/good_detail/good_detail?id=' + data[id].msgId;
}
if(!data[id].read){
  wx.getStorage({
    key: 'newMsg_num',
    success: function (res) {
      wx.setStorage({
        key: 'newMsg_num',
        data: res.data - 1,
      })
    },
  })
}
data[id].read=true;
this.setData({data:data})
wx.setStorage({
  key: 'msg',
  data: {content:data,length:this.data.old},
})
wx.navigateTo({
  url: url
});

}
,
  onPullDownRefresh: function () {
    this.getData()
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