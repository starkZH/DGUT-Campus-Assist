const app=getApp();
Component({
  options: {
    multipleSlots: true 
  },

  /**
   * 页面的初始数据
   */
  data: {
kind:  app.data.label,
host:app.data.host,
    origin: app.data.origin,
menuIndex:'b',
    data: [],
    colors: app.data.colors,
    animation:'',
    m_animat:'',
    degree:0,
    showFlag:false,
    price_filter:[],
    system:[],
    base:app.data.base,
    show_fix:false,
    last_top:0,
    ready_flag:true
  },


  /**
   * 生命周期函数--监听页面加载
   */

  properties:{
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
        console.log(nv)
        if (nv) {
          this.onReachBottom();
        }
      }
    },
    refresh: {
      type: Boolean,
      value: false,
      observer: function (nv, ov, cp) {
        console.log(nv)
        if (nv) {
          this.onPullDownRefresh();
        }
      }
    }
  },
  methods:{
    ready_: function (options) {

      var kind = {}, label = this.data.kind, data = this.data.data, that = this;
      for (var x in label) if (!x.indexOf('b')) kind[x] = label[x];

      this.setData({ kind: kind });
      wx.getSystemInfo({
        success: res => {
          var that = this;
          var height = res.windowHeight;
          this.data.top_kindPanel = [(height / 640) * 60 + 0.06 * height, (height / 640) * 150 + 0.06 * height];
          this.setData({ margin_left: (res.windowWidth - 90) / 2 })
        },
      })

    },
    new_good: function () {
      wx.navigateTo({
        url: '/pages/shop/deliver_good/deliver_good',
      })
    },
    toPage: function (e) {
      var id = e.detail.id.substring(3), imgs = this.data.base.shop_imgUrls, url = imgs[id].url;
      if (url) wx.navigateTo({
        url: url,
      })
    },
    getGoods: function (e) {
      var id = e.currentTarget.id.substring(4);
      this.data.data = [];
      this.getList(0, id);
      this.setData({ menuIndex: id })
    },
    input: function (e) {
      this.data[e.currentTarget.id] = e.detail.value;
    },
    low_input: function (e) {
      this.data.price_filter[0] = e.detail.value;
    },
    high_input: function (e) {
      this.data.price_filter[1] = e.detail.value;
    },
    /**
     * 生命周期函数--监听页面显示
     */
    getData() {
      this.getList(0, this.data.menuIndex)
      if (!app.data.login)
        app.login().then(() => { })
    },
    onShow: function () {
      if (this.data.ready_flag) {
        this.ready_();
        this.data.ready_flag = false;
      }
      this.getData();
     
    },

    search: function () {
      var kw = this.data.keyword;
      if (kw)
        wx.navigateTo({
          url: '/pages/shop/search/search?keyword=' + kw,
        })

    },
    getList: function (id, kind, min, max) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      var params = {
        id: id,
        kind: kind,
        order: 0,
        time: 0
      };
      if (min && min.length) params.min = min;
      if (max && max.length) params.max = max;
      if (this.data.searchMode) params.keyword = this.data.keyword;
      // console.log(params)

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
          if (id == 0) od = [];
          var data = res.data;
          if (data.code) {
            data = data.data;
            for (var x in data) {
              if (!isNaN(data[x].origin_price)) data[x].discount = ' ' + Number(data[x].price / data[x].origin_price * 10).toFixed(1) + ' 折 ';
              if (data[x].labels.length) data[x].labels = data[x].labels.split(',');
              var imgs = data[x].imgUrls.split(',');
              if (imgs[0].length > 0) {
                for (var y in imgs) { imgs[y] = this.data.origin + imgs[y] }
                data[x].imgUrls = imgs;
              }
              var name = data[x].name;
              if (name && name.length > 4) name = name.substring(0, 3) + '..';
              data[x].name = name;

              od.push(data[x])
            }
            if (data.length == 0) this.setData({ showLoading: true, no_data: true })
            this.setData({ data: od })
          } else {
            app.error('获取失败')
            console.log(res)
          }
        }, complete() { wx.stopPullDownRefresh(); wx.hideLoading() }
      })
    },



    onPageScroll: function (e) {
      var last_top = this.data.last_top;
      var css_kindPanel = 'height:0', show_fix = false;
      if (e.scrollTop >= this.data.top_kindPanel[0]) {
        css_kindPanel = 'position:fixed;top:0px'; show_fix = true;
      }
      if (last_top > e.scrollTop && e.scrollTop < this.data.top_kindPanel[1] || e.scrollTop < 10) show_fix = false;
      if (this.data.show_fix != show_fix) this.setData({ show_fix: show_fix })
      this.data.last_top = e.scrollTop;
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
      this.setData({ searchMode: false })
      this.getData();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      this.setData({ showLoading: true, no_data: false })
      this.getList(this.data.data[this.data.data.length - 1].id, this.data.menuIndex);
    },
  },
 

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})