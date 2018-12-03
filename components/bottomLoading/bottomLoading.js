
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    showLoading: {
      type: Boolean
    },
    loadingTip:{
      type: String, value: '努力加载中...'
    },
    no_data:{
type:Boolean,
observer:function(nv,ov,cp){
var tip='努力加载中...'
if(nv==true){
tip='————　　我是有底线的　　————'
}
  this.setData({ loadingTip:tip})
}
    }
  },

  data: {
    showLoading: {
      type: Boolean
    }, loadingTip:{
      type:String,
      value:'努力加载中...'
    }
  },

  methods: {


  }
})