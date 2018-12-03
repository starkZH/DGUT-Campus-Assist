var classTime = [["7:20", "8:00"], ["8:30", "9:15"], ["9:25", "10:10"], ["10:25", "11:10"], ["11:15", "12:00"],
["14:30", "15:15"], ["15:25", "16:10"], ["16:25", "17:10"], ["17:15", "18:00"], ["19:30", "20:15"], ["20:25", "21:10"], ["21:15", "22:00"]];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['一', '二', '三', '四', '五', '六', '日'],
    dur: [],
    index: 0,//星期几
    kcid: -1,
    dur_1: -1,
    dur_2: -1,
    disabled: false,
    chosen: false,
    kcb: [],
    tiptext: ['课程', '学分', '周数', '教师', '地点'],
    imagesrc: ['/images/course.png', '/images/credit.png', '/images/sections.png', '/images/teacher.png', '/images/spot.png'],
    content: ['', '', '', '', ''],
    duration: '[ - ]周',
    jieshu: ' - ',
    whatday: ''
  },

  bindMulPickerChange: function (e) {
    var val = e.detail.value,
      dur = this.data.dur,
      kcb = this.data.kcb,
      kcid = this.data.kcid,
      daycourse = kcb[this.data.index],
      temp = { name: '' };
    //  console.log(val);
    var dur_1 = val[0], dur_2 = val[2], valid = true;
    if (dur_1 == this.data.dur_1 && dur_2 == this.data.dur_2)
      this.setData({ jieshu: dur_1 + '-' + dur_2 });
    else if (daycourse != null && (valid = (dur_1 <= dur_2) ? true : false)) {
      this.checkInsert(daycourse, val);
    } else wx.showToast({ title: '课程格式错误', image: '/images/error.png' })

  },

  getAvail: function (daycourse) {
    var jieshu = '0-0',
      has = [], all = [];
    for (var j = 0; j < 12; j++) { all.push(j) }
    for (var x in daycourse) {
      var js = daycourse[x].jieshu.split("-");
      for (var j = Number(js[0]); j < Number(js[1]) + 1; j++) {
        all[j] = -1;
      }
    }
    //console.log(all);
    for (var i in all) {
      i = Number(i);
      if (all[i] != -1) {
        jieshu = i + '-' + i
        break;
      }
    }
    return jieshu;
  },

  checkDay: function (daycourse) {
    var i = 0, valid = true;
    for (var x in daycourse) {
      var js = daycourse[x].jieshu.split("-");
      i += Number(js[1]) - Number(js[0]) + 1;
    }
    if (i > 11) valid = false;
    //console.log(i);
    return valid;
  }
  ,
  checkInsert: function (daycourse, val) {//检查插入的课程是否冲突
    var valid = true, temp;
    var dur_1 = val[0], dur_2 = val[2];
    for (var x in daycourse) {//遍历当天的课程
      temp = daycourse[x];
      //  console.log(daycourse[x]);
      var xdur = daycourse[x].jieshu.split("-");
      var x1 = xdur[0], x2 = xdur[1];
      //   console.log("x1="+x1+"  x2="+x2);
      for (var i = Number(x1); i <= Number(x2); i++) {
        //  console.log("i="+i+"  dur_1="+dur_1+"  dur_2="+dur_2);
        for (var j = dur_1; j <= dur_2; j++) {
          if (!valid) { break; }
          valid = (Number(i - j) == 0) ? false : true;
          //  console.log("i= "+i+"  j="+j);
        }
        //  console.log("valid="+valid);
        if (!valid) { break; }
      }
      if (!valid) { break; }
    }
    if (valid)
      this.setData({ jieshu: dur_1 + '-' + dur_2, chosen: true });
    else wx.showModal({ title: '哎呀', content: '与 ' + temp.course + ' 的课冲突了喔', showCancel: false })
    return valid;
  },

  bindPickerChange: function (e) {
    var val = e.detail.value;
    if (this.checkDay(this.data.kcb[val])) {
      if (this.data.disabled) {
        var jieshu = this.getAvail(this.data.kcb[val]),
          js = jieshu.split("-");
        console.log(js);
        this.setData({
          index: val, disabled: false, chosen: true, jieshu: jieshu,
          dur_1: js[0], dur_2: js[1]
        })
      } else this.setData({ index: val });
    }
    else wx.showToast({
      title: '星期' + this.data.array[val] + "满课了哦~",
      image: '/images/fail.png'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var jieshu = [];
    for (var i = 0; i < 12; i++) {
      jieshu.push(i);
    }
    var arg = options.arg;
    var that = this;
    wx.getStorage({
      key: 'kcb',
      success: function (res) {
        var kcb = res.data;
        if (arg != null) {
          var de = arg.split(",");

          var course = kcb[de[0]][de[1]], content = [];
          var jies = course.jieshu.split("-");
          that.setData({
            content: [course.course, course.credit, course.duration, course.teacher, course.spot],
            jieshu: course.jieshu, index: de[0], dur: [jieshu, '-', jieshu], disabled: true
            , kcb: kcb, kcid: de[1], dur_1: jies[0], dur_2: jies[1]
          });

        } else that.setData({ dur: [jieshu, '-', jieshu], kcb: kcb });
      }
    });



  },


  input: function (e) {
    //    console.log(e);
    var id = e.currentTarget.id.substring(5),
      val = e.detail.value,
      content = this.data.content;
    content[id] = val;
    this.setData({ content: content });
  }

  ,
  saveCourse: function () {
    var sdur = this.data.jieshu.split("-");
    var index = this.data.index,
      ndur_1 = this.data.dur_1,
      ndur_2 = this.data.dur_2,
      content = this.data.content,
      duration = this.data.duration,
      jieshu = this.data.jieshu,
      kcb = this.data.kcb,
      daycourse = {
        course: content[0],
        credit: content[1],
        duration: content[2],
        teacher: content[3],
        spot: content[4],
        jieshu: jieshu,
        beginTime: ''
      },
      valid = false;

    if (this.data.disabled) {//在原有的课程上编辑
      daycourse.beginTime = classTime[jieshu.split("-")[0]][0];
      var dur = jieshu.split("-");
      var tkcb = [];
      for (var x in kcb[index]) {
        if (x != this.data.kcid) tkcb.push(kcb[index][x]);
      }
      kcb[index] = tkcb;
      if (kcb[index].length > 0)
        for (var i in kcb[index]) {
          var nd = kcb[index][i].jieshu.split("-");
          //       console.log(nd);
          if ((Number(dur[0]) < Number(nd[0])) || i == kcb[index].length - 1) {
            kcb[index].splice(i, 0, daycourse);
            break;
          }
        }
      else kcb[index].push(daycourse);
      valid = true;
    }
    else if (this.data.chosen) {//是添加课程
      valid = daycourse.course? true:false;
      daycourse.beginTime = classTime[jieshu.split("-")[0]][0];
      var dur = jieshu.split("-");
      //  console.log(dur);
      if (kcb[index].length > 0)
        for (var i in kcb[index]) {
          var nd = kcb[index][i].jieshu.split("-");
          //       console.log(nd);
          if ((Number(dur[0]) < Number(nd[0])) || (Number(dur[0]) > Number(nd[0]) && i == kcb[index].length - 1&& ++i)) {
            kcb[index].splice(i, 0, daycourse);
            break;
          }
        }
      else kcb[index].push(daycourse);
      console.log(kcb[index]);
    }
    if (valid)
      wx.setStorage({
        key: 'kcb',
        data: kcb,
        success: function () {
          wx.showToast({
            title: '保存成功',
            mask: true
          });
          wx.setStorage({
            key: 'refresh',
            data: true
          });
          setTimeout(function () {
           wx.navigateBack()
          }, 1500);


        }
      })
    else wx.showModal({ title: '嘿', content: '请将信息填写完整哦', showCancel: false })
  }

  ,
  deleteCourse: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '请确认删除此课程',
      confirmColor: 'red',
      confirmText: '删除',
      success: function (res) {
        if (res.confirm) {

          var kcid = that.data.kcid,
            index = that.data.index,
            kcb = that.data.kcb,
            tkcb = [],
            daycourse = kcb[index];
          for (var x in daycourse) {
            if (x != kcid)
              tkcb.push(daycourse[x]);
          }
          kcb[index] = tkcb;
          wx.setStorage({
            key: 'kcb',
            data: kcb
          });
          wx.setStorage({
            key: 'refresh',
            data: true
          });
          wx.showToast({
            title: '删除成功'
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 1500)

        }
      }
    })

  }

})