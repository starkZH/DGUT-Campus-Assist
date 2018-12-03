const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  keyword:'',
  data:[],
  host:app.data.host,
  menu: [{ text: '价格', select: '/images/select_down.png', un_select: '/images/unselect_down.png'},{text:'热度'}],
  subMenu: ['不限','从低到高','从高到低','价格区间'],
  menuIndex:0,
  subMenuIndex:0,
  showList:false,
  params : {
    id: 0,
    kind: 'b',
    order: 0,
    time: 0
  }
  },

showMenu:function(){
  var that=this;
      var ani = wx.createAnimation({
        duration: 300,
        timingFunction: "ease",
        delay: 0
      });
      ani.opacity(100).height(300).step();
      wx.getSystemInfo({
        success: res=> {
          wx.createSelectorQuery().select('#filter').boundingClientRect(rect => {
            this.setData({ margin_top: 'top:' + ((rect.top + 220) * res.windowHeight / 750) + 'px;', showList: true })
          }).exec()
        },
      })
      setTimeout(()=>{this.setData({ animation: ani, css:'height:300rpx'})},200);
     
},
hideMenu:function(e){
 // console.log(e)
  var that=this;
  var ani = wx.createAnimation({
    duration: 300,
    timingFunction: "ease",
    delay: 0
  });
  ani.opacity(0).height(0).step();
  this.setData({ animation: ani});
 if(e&&e.type)this.setData({maskShow:false});
 setTimeout(function () { that.setData({ showList: false})},300);
},
  tapMenu(e){
var id=e.currentTarget.id.substring(4),showList=id==0;
    if (showList) this.showMenu();
    else {this.hideMenu();
      this.data.params = { kind: 'b',id: 0, order: 0, time: 2 };
      this.getList();
    }
   // if(this.data.showList){this.hideMenu();showList=false;}
this.setData({menuIndex:id,maskShow:showList})
  },
  tapSub(e) {
    var id = e.currentTarget.id.substring(3), maskShow = false;
  //  console.log(e)
    if (id == '0') {
      this.data.params = { id: 0, order: 0, time: 0,kind: 'b'};
    }else if(id=='1'){
      this.data.params = { kind: 'b',id: 0, order: 1, time: 3 };
    } else if (id == '2') {
      this.data.params = { kind: 'b',id: 0, order: 0, time: 3 };
    }
    if ((id == '3' && e.target.id != 'submit') || (e.target.id == 'submit' && !this.price_filter())) { maskShow = true; }
    else {this.hideMenu(); this.getList();}
    this.setData({ subMenuIndex: id, maskShow: maskShow })
  },
  onLoad: function (options) {
    this.setData({keyword:options.keyword});
    this.search();
  },
  input: function (e) {
    var key = e.detail.key;
    if(!key)key=e.currentTarget.id;
    if(key=='keyword')this.data.params.keyword=e.detail.value;
    this.data[key] = e.detail.value;
  },
  search: function (e) {
    if (this.data.keyword) {
      this.data.params.id=0;
      this.data.data = [];
      this.getList()
    }
  },
 
  price_filter:function(){
    var legal=false;
    var min=this.data.min,max=this.data.max;
    if ((min||max)&&((isNaN(min)&&!min)||(isNaN(max)&&!max))) {
      this.data.data = [];
      legal=true;
     this.data.params={id:0,order:0,time:0,kind:'b'};
     if (min) this.data.params.min=min;
     if (max) this.data.params.max = max;
    }
    else app.error2('请输入至少一个且保证为数字');
    return legal;
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    var params = this.data.params;
    if (this.data.keyword) params.keyword = this.data.keyword;
     console.log(params)
    if (!app.data.login) {
      app.login().then(() => {
        this.getList();
      });
      return;
    }
    wx.request({
      url: this.data.host + 'contact/get_list',
      method: 'POST',
      header: {
        'Authorization': app.data.token,
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: params,
      success: res => {
        //  console.log(params)
        console.log(res)
        var od = this.data.data;
        if (params.id == 0) od = [];
        var data = res.data;
        if (data.code) {
          data = data.data;
          for (var x in data) {
            if (!isNaN(data[x].origin_price)) data[x].discount = ' ' + Number(data[x].price / data[x].origin_price * 10).toFixed(1) + ' 折 ';
            if (data[x].labels.length) data[x].labels = data[x].labels.split(',');
            var imgs = data[x].imgUrls.split(',');
            if (imgs[0].length > 0) {
              for (var y in imgs) { imgs[y] = this.data.host + imgs[y] }
              data[x].imgUrls = imgs;
            }
            var name = data[x].name;
            if (name&&name.length > 5) name = name.substring(0, 3) + '..';
            data[x].name = name; 
            var new_data = true;
            for (var xx in od) if (od[xx].id == data[x].id) new_data = false;
            if (new_data)
            od.push(data[x])
          }
          if (data.length == 0) this.setData({ showLoading: false, no_data:true })
          wx.setNavigationBarTitle({
            title: '共有 '+od.length+' 条搜索结果',
          })
          this.setData({ data: od });
        } else {
          app.error('获取失败')
        }
      }, complete() { wx.stopPullDownRefresh(); wx.hideLoading() }
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
  this.onLoad({keyword:this.data.keyword});
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({ showLoading: true, no_data:false })
    var params = this.data.params;
    if (params.order == 0 && params.time == 0 && params.min && params.max)params.id = this.data.data[this.data.data.length - 1].id ;
    else params.id-=1;
    this.data.params=params;
    this.getList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})