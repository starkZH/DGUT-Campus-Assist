const app = getApp();
var util = require('../utils/util.js');  

 //Math.floor(Math.random()*10);时，可均衡获取0到9的随机整数。
Page({

	data:{
   
    title:['莞工校园助手', '校内圈', '莞工校园二手', '个人中心'],
    menus:['首页','校内圈','二手','个人中心'],
    menuIcon: [['home_Dis.png', 'school_Dis.png', 'shop_Dis.png', 'user_Dis.png'],['home.png','school.png','shop.png','user.png']],
    menuLink:['','/pages/social/social','/pages/shop/shop','/pages/me/me'],
    badge:[],
    menuVersion: app.globalData.menuVersion,
    menuIndex:'0',
    refreshIndex:0,
    reachBottomIndex:0,
    base:{},
    count:1
	}
  ,
onLoad:function(options){
  var mi = options.menuIndex;
  if(mi)
  this.setData({ menuIndex: options.menuIndex,menuVersion:'0.0.0'})
}
  ,
  setBase:function(e){
this.setData({base:e.detail.base})
  },
  navigate:function(e){
    wx.setNavigationBarTitle({
      title: this.data.title[e.detail.id],
    })
    this.setData({ menuIndex: e.detail.id})
  },
  makeIndex(){
    
    return this.data.menuIndex;
  },
onShow:function(){
  
  this.setData({ menuIndex:this.makeIndex()});
  app.getMsg().then(() => {
    var  badge = [];
    wx.getStorage({
      key: 'newMsg_num',
      success: res => {
        badge[3] = res.data;
        this.setData({ badge: badge })
      },
    })
  });
},
onPullDownRefresh:function(){
  this.setData({ refreshIndex: this.makeIndex() })
},
onReachBottom:function(){
  this.setData({ reachBottomIndex: this.makeIndex() })
}
});
