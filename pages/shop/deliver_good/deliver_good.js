var app = getApp();
var host = app.data.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {

    kind: app.data.label,
    index: 'b1',
    images: [],
    upLoadImage: '',
    
    baseInfo: {},
    userInfo: {},
    openid: '',
    text: '',
    previewMode: true,

    imageNum: 0,
    Rows: [["/images/addImage.png"], [], []],
    rowState: [[], [], []],
    uploadState: 2,
    images: [],
    imageSize: [],
    
    colors:app.data.colors,
    labels:['九成新','一口价','良品','可议价','物美价廉'],
    label_index:[],
    label_state:[],
    range:[],
    index:0,
    edit:false
  },
change:function(e){
this.setData({index:e.detail.value})
}
,
add_label:function(){
  var ls = this.data.labels, nl = this.data.new_label;
if(ls.length<40&&nl){
ls.push(nl);
this.setData({labels:ls})
}else if(!nl)
wx.showToast({
  title: '请输入',
  image: '/images/close.png'
})
else wx.showToast({
  title: '标签已达上限',
  image:'/images/close.png'
})
}
  , input: function (e) {
    var id = e.currentTarget.id, val = e.detail.value;
    if(id=='new_label')id=id.replace(/,/g,'');
    this.data[id] = val;
  }
,
  get_imgs:function(e){
    this.data.images=e.detail.imgs;
  }
 ,
  onLoad: function (options) {
    var il = [], kind = this.data.kind,edit=options.edit;
    this.data.edit=edit;
    for (var x in kind)
      if (x.indexOf('b') == 0&&x.length>1) {
        il.push(kind[x]);
      } else delete kind[x];
      this.setData({range:il,kind:kind})
      if (edit) {
        wx.getStorage({
          key: 'temp_moment',
          success: res => {
            var data = res.data, labels = data.labels,label_state=[],label_index=[], imgs = data.imgUrls, r_state = [[],[],[]], images = [], r_index = 0;
            this.data.id=data.id;
            for (var x in kind) if (x == data.kind) { for (var y in il) { if (kind[x] == il[y]) { r_index = y; break; } } break; }
            for(var x in labels){label_index.push(x);label_state.push(true)}
            for(var x in imgs)images.push(imgs[x].substring(imgs[x].indexOf('/images/')));
            this.setData({  detail: data.text, images: images, id: data.id, index: r_index,  title: data.title, price: data.price, origin_price: data.origin_price,phone:data.phone,wxnumber:data.wxnumber,labels:labels,label_state:label_state,label_index:label_index})
          },
        })
      }
  }
  ,
select:function(e){
var id=e.currentTarget.id.substring(1);
var li=this.data.label_index,ls=this.data.label_state;
if(ls[id]){
  for(var x in li)if(li[x]==id)li.splice(x,1);
  ls[id] = !ls[id];
}else if(li.length<4){li.push(id);
ls[id]=!ls[id];}
this.setData({ label_index: li, label_state:ls})
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  if(!app.data.login){wx.showLoading({ title: '',}); app.login().then();}
  },


send: function () {

  var title=this.data.title,
  text=this.data.detail,
  imgs=this.data.images,
  kind = this.data.kind,
  phone=this.data.phone,
  wxnumber=this.data.wxnumber,
  price=this.data.price,
  origin_price=this.data.origin_price,
  labels=this.data.labels,ls=this.data.label_index,
  index = this.data.index, range = this.data.range, url = host + 'contact/deliver_moment';
  
  if (this.data.edit) url = host + 'contact/update_moment/' + this.data.id;
  for(var x in kind)if(kind[x]==range[index]){kind=x;break;}
var nls=[];
for(var x in ls)nls.push(labels[ls[x]]);
labels=nls.toString();
if(!title||!text)app.error2('请输入物品的标题和详情');
else if(!price)app.error('请填写价格');
else if(Number(price)>Number(origin_price))app.error2('二手价不能大于原价哦');
else if(!wxnumber&&!phone)app.error('请填写联系方式');
else if (!app.data.scope_userInfo) { app.toastAuthorize();}
else{
  wx.showLoading({
    title: '发布中',
    mask: true
  })
  wx.request({
    url: url,
    method: 'POST',
    header: {
      'Authorization': app.data.token,
      'content-type': 'application/x-www-form-urlencoded'
    },
    data:{
title:title,
text:text,
imgUrls:imgs,
kind:kind,
origin_price:origin_price,
price:price,
wxnumber:wxnumber,
phone:phone,
labels:labels
    },
    success:res=>{
console.log(res)
if(res.data.code){
  wx.showToast({
    title: '发布成功',
  })
  wx.navigateBack()
}else app.error();
    },fail(){app.error()}
  })
}
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
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