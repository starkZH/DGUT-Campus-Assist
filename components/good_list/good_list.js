var app=getApp();
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    data: {
      type: Array
    },
    colors:{
      type:Array,
      value:  app.data.colors
    },
    showUser: {
      type: String
    },
    collect_mode: {
      type: Boolean,
      value: false
    },
    tip: {
      type: String
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    data: {
      type: Array
    },
    showUser: {
      type: Boolean
    }
    
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    _cancel_collect:function(e){
      this.triggerEvent("cancel_collect", { id: e.currentTarget.id.substring(7) }, { bubbles: true, composed: true })

    },
    _touchmove:function(){
      this.triggerEvent("onTouchMove", { }, { bubbles: true, composed: true })
    },
    detail: function (e) {
      if (!(e.target.id.indexOf('collect')>=0))
      wx.navigateTo({
        url: '/pages/shop/good_detail/good_detail?id=' + this.data.data[e.currentTarget.id.substring(6)].id,
      })
    },
    personal: function (e) {
      //   console.log(e)
      wx.navigateTo({
        url: '/pages/shop/personal/personal?openid=' + this.data.data[e.currentTarget.id.substring(4)].openid,
      })
    },

    preview: function (e) {
      var that = this;
      wx.previewImage({
        urls: that.data.data[e.currentTarget.id.substring(3)].imgUrls,
      })
    },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _detail(e) {
      this.triggerEvent("detail", { id: e.currentTarget.id }, { bubbles: true, composed:true})
    },
     _preview(e) {
       this.triggerEvent("preview", { id: e.currentTarget.id }, { bubbles: true, composed:true})
    }
  }
})