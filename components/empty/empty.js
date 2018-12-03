
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  
  properties: {
    show: {
      type: Boolean
    },
 tip:{
   type:String
 }
  },

  
  ready:function(){
    wx.getSystemInfo({
      success: res => {
        this.setData({ margin_left: (res.windowWidth - 90) / 2 })
      },
    })
  },

  data: {
  },

  methods: {


  }
})