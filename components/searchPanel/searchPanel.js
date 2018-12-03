
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    inputStyle: {
      type: String
    },
    placeholder: {
      type: String
    },
    blur_placeholder: {
      type: String
    }
  },

  data: {
    inputStyle: {
      type: String
    },
    blur_placeholder: {
      type: String
    }, placeholder: {
      type: String
    },
  },
  ready:function(){
    var that=this;
    this.setData({ placeholder: that.data.blur_placeholder})
  },
  methods: {
    _input: function (e) {
      this.triggerEvent("input", { value: e.detail.value, key: e.currentTarget.id }, { bubbles: true, composed: true })
    },
    tapInput: function () {
      this.setData({ inputStyle: 'text-align:left;' ,placeholder:'搜索'})
    },
    blurInput: function () {
      var that=this;
      this.setData({ inputStyle: 'text-align:center;', placeholder:that.data.blur_placeholder})
    },
    _search: function () {
      this.triggerEvent("search", {}, { bubbles: true, composed: true });
    },
  }
})