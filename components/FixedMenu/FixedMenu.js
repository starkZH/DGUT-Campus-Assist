
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    show: {
      type: Boolean,
      value:false
    },
    menuIcon:{
      type:Array
    },
    menuText:{
      type:Array
    },
    badge:{
type:Array
    }
  },

  data: {
    menuIndex:0
  },

  methods: {
    _navigate:function(e){
var id=e.currentTarget.id.substring(4);
this.setData({menuIndex:id});
      this.triggerEvent("switchMenu", { id:id }, { bubbles: true, composed: true });
    }

  }
})