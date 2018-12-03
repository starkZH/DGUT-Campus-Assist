const app=getApp();

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    
       
    images: {
      type: Array,
      value:[],
      observer: function (nv, ov, cp) {
         // console.log('nv:'+);
        // console.log('ov:' + );
        // console.log('data:'+this.data.images.toString());
        if (nv.toString() != ov.toString()){
            var imgs = nv, images = [], rs = [], r_state = [];
            for (var x in imgs) {
              rs[x] = app.data.origin+imgs[x]; r_state[x] = 2;
              
            }
            var len = imgs.length;
            if (len < 9) rs[len ] = "/images/addImage.png";
            // console.log(images)
            // console.log(rs)
            // console.log(r_state)
            // console.log(len)
          this.setData({ rowState: r_state,Rows: rs, imageNum: len})
          } 
      }
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    imageNum: 0,
    Rows: ["/images/addImage.png"],
    rowState: [],
    UpHeight: '14%;',
    uploadState: 2,
    images: [],
    imageSize:[]
  },

  ready: function () {
    wx.getSystemInfo({
      success: res=> {
        var height_per=Number(this.data.UpHeight.substring(0,2));
        this.setData({imageSize:[res.windowWidth*0.2]})
      },
    })
  },
  
  methods: {


    tapImage: function (e) {
      var id = e.currentTarget.id.substring(1),
        inum = this.data.imageNum,
        rows = this.data.Rows,
        rs = this.data.rowState,
        that = this;
      if ((Number(id)+1) > inum && inum != 9) {
        if (that.data.uploadState != 1) {
          wx.chooseImage({
            count: 9 - inum,
            sizeType: ['compressed'],
            success: function (res) {
              var tempFilePaths = res.tempFilePaths,si=Number(inum);
              for (var x in tempFilePaths) {
                x = Number(x);
                var i=x+si;
                
                that.data.uploadState = 1;
                var fp = tempFilePaths[x];
                rs[i] = 1;
                rows[i] = tempFilePaths[x];
                inum++;
                if (inum < 9) rows[Number(i) +Number(1)] = "/images/addImage.png";
                that.setData({ rowState: rs, Rows: rows, imageNum: inum });

                app.uploadFile(fp,i).then(function (res) {
                  var rp = res[1], img = res[0];
                  var rs = that.data.rowState;
                  rs[rp] = 2;
                  that.data.images[rp] = img;
                  that.setData({ rowState: rs });
                  that.data.uploadState = 2;
                  var images = [], imgs = that.data.images;
                  for (var x in imgs) if (imgs[x]) images.push(imgs[x]);
                  that.triggerEvent('imgs', { imgs: images }, { bubbles: true, composed: true });
                }, function (res) {
                  var rp = res[0];
                  var rs = that.data.rowState;
                  rs[rp] = 0;
                  that.setData({ rowState: rs });
                  that.data.uploadState = 0;
                });
              }


            },
          })
        } else wx.showToast({
          title: '还在上传哦',
        })
      } else  {
        wx.previewImage({
          urls: [rows[id]],
        })
      }
    },
    uploadImg: function (e) {
      var id = e.currentTarget.id.substring(1), rs = this.data.rowState,
        that = this,
        rows = this.data.Rows;
      
      if (!rs[id]) {
        that.data.uploadState = 1;
        var fp = rows[id];
        app.uploadFile(fp,id).then(function (res) {
          var rp=res[1], img = res[0];
          var rs = that.data.rowState;
          rs[rp] = 2;
          that.setData({ rowState: rs });
          that.data.images[rp] = img;
          that.data.uploadState = 2;
          var images = [], imgs = that.data.images;
          for (var x in imgs) if (imgs[x]) images.push(imgs[x]);
          that.triggerEvent('imgs', { imgs: images }, {});
        }, function (res) {
          var rp = res[0];
          var rs = that.data.rowState;
          rs[rp] = 0;
          that.setData({ rowState: rs });
          that.data.uploadState = 0;
        });

      }
    }
    ,

    delImage: function (e) {
      var id = e.currentTarget.id.substring(1),
        rows = this.data.Rows,
        inum = this.data.imageNum,
        that = this;
      if (inum > 0) {
        this.data.previewMode = false;
        wx.showModal({
          title: '确认',
          content: '是否删除此图片？',
          success(res) {
            if (res.confirm) {
              for (var i = Number(id) ; i < Number(inum) - 1; i++) {
                // console.log(i+"\t");
                rows[i] = rows[i+1];
              }

              that.data.images.splice(id, 1);
              rows[(inum - 1)] = '/images/addImage.png';
              rows[inum] = null;
              console.log(rows);
              var images = [], imgs = that.data.images;
              for (var x in imgs) if (imgs[x]) images.push(imgs[x]);
              imgs = images;
              that.setData({ Rows: rows, imageNum: inum - 1, previewMode: true });
              that.triggerEvent('imgs', { imgs: imgs }, { bubbles: true, composed: true });
            }
          }
        })

      }
    }

  }
})