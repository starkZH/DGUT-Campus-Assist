Page({

  /**
   * 页面的初始数据
   */
  data: {
    count:0,
    title:'',
    nos:[],
    rds:[],
    list:[],
    pageindex:0,
    showList:[],
    pagenum:0,
    pn:1,
    kw:'',
    site:[],
    mode:false,
    navTo:'',
    top:0
  },
onPullDownRefresh:function(){
  this.onLoad(this.data.options);
}
,
  onLoad: function (options) {
   this.data.options=options;
    var kw = options.kw,
    that = this,
    sl=[];
    wx.setNavigationBarTitle({
      title: '正在搜索 ' + kw,
    })
    wx.showLoading({
      title: '搜索中',
    })
    wx.request({
      url: 'https://www.xxxzh.top',
      data:{
        kw:kw,
        pn:1
      },
      header:{
        'content-type':'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var det = res.data,
          nos = that.data.nos,
          rds = that.data.rds;
        //     console.log(det);
        det = det.substring(det.indexOf("{"), det.lastIndexOf("}") + 1);
        // det = det.replace("", "");
        // det = det.replace("", "");
        // det = det.replace("", "");
        //  console.log(det.substring(15500,15560));
        det = that.parseRes(det);
        console.log(det);
        var list = det.find_ifa_FindFullPage_list1,
          count = det.FindCount;
        for (var x in list) {
          nos.push(list[x].CtrlNo);
          rds.push(list[x].CtrlRd);
          if (x < 15) sl.push(list[x]);
        }
        that.setData({ kw:kw, list: list, nos: nos, rds: rds, showList: sl ,pagenum:Math.ceil(count/15),count:count});
        wx.setNavigationBarTitle({
          title: '共有 ' + count + ' 条结果',
        })
        wx.showToast({
          title: det.errorname,
        })
      },
      fail:function(){
        wx.showToast({
          title: '请检查网络',
          image:'/images/fail.png'
        })
        setTimeout(function(){wx.navigateBack()},1500);
      },
     complete:function(){
       wx.hideLoading()
     }});
   
  },

nextPage:function(e){
  var offset = Number(e.target.dataset.offset);
var pi = Number(this.data.pageindex),
pnum = this.data.pagenum,
pn = this.data.pn,
list = this.data.list,
temp = [],
that = this;
//console.log(offset);
pi+=offset;
if(pi<pnum){
if(((pi+1)*15)<=pn*100){//不用再请求新的数据
for(var i = pi*15;i<(pi+1)*15;i++){
if(list[i])temp.push(list[i]);
}
this.setData({showList:temp,pageindex:pi,top:0});
}else{//请求下一页
wx.showLoading({
  title: '加载中',
  mask:true
})
  wx.request({
    url: 'https://www.xxxzh.top',
    data: {
      kw: that.data.kw,
      pn: ++pn
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      var det = res.data,
        nos = that.data.nos,
        rds = that.data.rds,
        alist = that.data.list;
      //     console.log(det);
      det = det.substring(det.indexOf("{"), det.lastIndexOf("}") + 1);
      // det = det.replace("", "");
      // det = det.replace("", "");
      // det = det.replace("", "");
   //     console.log(det);
    det =that.parseRes(det);
      console.log(det);
      var glist = det.find_ifa_FindFullPage_list1;
      for (var x in list) {
        nos.push(list[x].CtrlNo);
        rds.push(list[x].CtrlRd);
        alist.push(list[x]);
      }
      that.setData({ list: alist, nos: nos, rds: rds ,pn:pn});
      that.nextPage({target:{dataset:{offset:offset}}});
    },
    fail:function(){
      wx.showToast({
        title: '请求失败',
        image: '/images/fail.png'
      })
    },
    complete:function(){
      wx.hideLoading()
    }
    });
}
}
},
lastPage:function(){
  var pi = Number(this.data.pageindex),
    pn = this.data.pn,
    list = this.data.list,
    temp = [];
    if(--pi>-1){
  for (var i = pi * 15; i < (pi + 1) * 15; i++) {
    if (list[i]) temp.push(list[i]);
  }
  this.setData({pageindex:pi,showList:temp,top:0});
    }
},

parseRes:function(res){
  try { res = JSON.parse(res);
  return res;
   } catch (e) {
     e=e.toString();
     console.log(e);
    var pos = Number(e.substring(e.indexOf("position ")+9));
    res = res.substring(0,pos)+res.substring(pos+1);
      return this.parseRes(res);
    }

},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
addbook:function(e){
  var id = e.currentTarget.id.substring(3),
list = this.data.list,
pi = this.data.pageindex,
booklist=[];
var index = Number(pi*15)+Number(id);
  booklist.push(list[index]);
wx.getStorage({
  key: 'booklist',
  success: function(res) {
    var obl = res.data;
    for(var x in obl){
      booklist.push(obl[x]);
    }
  },
  complete:function(){
    wx.setStorage({
      key: 'booklist',
      data: booklist,
    })
    wx.showToast({
      title: '添加成功',
    })
  }
})
},
  guancang:function(e){
  var id = Number(e.currentTarget.id.substring(2)),
  list = this.data.list,
  pi = this.data.pageindex,
  rds = this.data.rds,
  nos = this.data.nos;
  console.log(list[(pi*15)+id].CtrlNo+","+nos[(pi*15)+id]);
 wx.navigateTo({
   url: '../site/site?rds=' + rds[(pi * 15) + id] + '&nos=' + nos[(pi * 15) + id] + '&title=' + list[(pi * 15) + id].Title,
 })

},
getbookinfo:function(e){
  var id = Number(e.currentTarget.id.substring(5)),
  list = this.data.list,
    pi = this.data.pageindex,
    rds = this.data.rds;
  wx.navigateTo({
    url: '../detail/detail?b=' + rds[(pi * 15) + id] + '&title=' + list[(pi * 15) + id].Title,
    
  })
}
,
hide:function(){
  this.setData({mode:false});
}

,
input:function(e){
  this.setData({navTo:e.detail.value});
},
gotoPage:function(){
var nt = Number(this.data.navTo),
pi = this.data.pageindex;

if(!isNaN(nt)&&nt>0&&nt<=this.data.pagenum){
  if(nt-1>=pi)
  this.nextPage({ target: { dataset: { offset: nt-pi-1 } } });
  else{
    this.data.pageindex = nt;
    this.lastPage();
  }
  this.setData({mode:false})
}else{
  wx.showToast({
    title: '输入错误',
    image:'/images/fail.png'
  })
}
}
,
  navToPage:function(){
    this.setData({mode:true});

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})