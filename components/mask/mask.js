
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    top:{
      type:String,
      value:'top:0px;'
    },
    maskShow: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {
        var ani = '' ,that = this;
        if (newVal==false){ani = wx.createAnimation({
            duration: 400,
            timingFunction: 'ease',
          });
          ani.opacity(0).step();
        }else{
  ani= wx.createAnimation({
            duration: 400,
            timingFunction: 'ease',
          });
          ani.opacity(100).step();
        }
          this.setData({ animation: ani })
          setTimeout(function () { that.setData({ maskShow: newVal }) }, 400);
      },
      value: false
    }
  },

  data: {
    maskShow: {
      type: String
    },
    animation:{
      type:Object
    }
  },

  methods: {

_hide:function(){
  this.triggerEvent('hide', {}, { bubbles: true, composed: true });
}
  }
})