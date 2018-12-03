
var util = require('../utils/util.js');
var monthdays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var classTime = [["7:20", "8:00"], ["8:30", "9:15"], ["9:25", "10:10"], ["10:25", "11:10"], ["11:15", "12:00"],
["14:30", "15:15"], ["15:25", "16:10"], ["16:25", "17:10"], ["17:15", "18:00"], ["19:30", "20:15"], ["20:25", "21:10"], ["21:15", "22:00"]];
var degree = 0, height = 2000;
//Math.floor(Math.random()*10);时，可均衡获取0到9的随机整数。
Page({

  data: {
    classMsg: '',
    class_code: '',
    topBarText: '',
    jieshu: [],

    cbg: [],
    cbgHeight: [],
    textMargin: [],
    bottomStyle: [],

    weatherIcon: '/images/weather/Unknown.png',
    weatherInfo: {},

    week: ["一", "二", "三", "四", "五", "六", "日"],
    editContent: ['持续节数', '课程名称', '授课教师', '地点'],
    timeTable: [],

    todayAnimat: '',
    rollAnimat: '',

    soDate: [[9, 3, 2017], [3, 4, 2018]],//月-日-年 开学日期

    todaycourse: [],
    todayCourseTime: [],
    kcb: [],
    temp: [],
    state: false,
    update: null,
    showToday: true,
    kcID: '',
    data: [],
    day: 0,
    regetTime: 0,
    date: '',
    time: '',
    zhoushu: '',
    bgPath: '',
    imageMode: '',
    baseInfo:{}
  }
  ,

  kcbTextCut: function () {
    var kcb = this.data.kcb,
      temp = [];
    for (var x in kcb) {
      var ct = [];
      for (var y in kcb[x]) {
        var course = kcb[x][y].course;
        if (course) {
          if (course.length > 10) {
            course = course.substring(0, 10) + "...";
          }
          ct.push(course);
        }
      }
      temp.push(ct);
    }
    this.setData({ temp: temp });
  }
  ,

  onLoad: function (msg) {

    var that = this;
    //console.log(util.formatTime(new Date()));
    var jieshu = [], xingqi = [];
    for (var i = 0; i < 12; i++) {
      jieshu[i] = i;
    }
  this.init();
  this.setData({jieshu:jieshu});
  wx.setNavigationBarTitle({
    title: '完整课表',
  })
  }
  ,
  onShow: function () {
    var that = this;
    wx.getStorage({
      key: 'refresh',
      success: function (res) {
        wx.getStorage({
          key: 'kcb',
          success: function (res) {
            var kcb = res.data;
            that.data.kcb = kcb;
            that.kcbTextCut();
            that.composeKcb();
          }

        });

      },
    })

    var mode = wx.getStorageSync("imageMode");
    wx.getStorage({
      key: "bgPath",
      success: function (res) {
        that.setData({ bgPath: res.data, imageMode: mode });
        console.log(res);
      }
    });
  }

,
  init: function () {//初始化数据
    //  this.analyzeKcb();
    var that = this;


    wx.getStorage({
      key: "bgPath",
      success: function (res) {
        that.setData({ bgPath: res.data });
        console.log(res);
      }
    });

    wx.getStorage({//获取本地存储的课程表
      key: 'kcb',
      success: res=>{
        var data = res.data;

            wx.hideNavigationBarLoading()
            wx.getStorage({
              key: 'cbg',
              success: function (res) {
                var cbg = res.data;
                wx.getStorage({
                  key: 'cbgHeight',
                  success: function (res) {
                    var cbgHeight = res.data;
                    wx.getStorage({
                      key: 'textMargin',
                      success: function (res) {
                        var textMargin = res.data;
                        that.setData({ kcb: data, cbg: cbg, cbgHeight: cbgHeight, textMargin: textMargin });
                        that.kcbTextCut();
                      }
                    })
              },
              fail: function () {
                var kcb = [];
                for (var i = 0; i < 7; i++) {
                  kcb.push([]);
                }
                wx.setStorage({
                  key: 'kcb',
                  data: kcb,
                  success(res) {
                    wx.redirectTo({
                      url: '/pages/edit_course/editCourse',
                    })
                  }
                })
              }
            })
          }
        });

        that.setData({ mode: true });
        console.log(data);
      },
      fail: function () {
        var kcb = [];
        for (var i = 0; i < 7; i++) {
          kcb.push([]);
        }
        wx.setStorage({
          key: 'kcb',
          data: kcb,
          success(res) {
            wx.redirectTo({
              url: '/pages/edit_course/editCourse',
            })
          }
        })
      }
    });
    //  that.refreshText();
    wx.hideLoading();

  }

  ,

  editCourse: function () {
    wx.navigateTo({
      url: '/pages/edit_course/editCourse'
    })


  },

  composeKcb: function () {//对课程进行排版
    var kcb = this.data.kcb,
      textMargin = [],
      cbgHeight = [],
      cbg = [],
      cbgset = [];
    var courseName = [];
    var index = Number(Math.floor(Math.random() * 13));//随机选择颜色索引
    for (var x in kcb) {
      var daycourse = kcb[x], last = 0;

      cbg[x] = [];
      cbgHeight[x] = [];
      textMargin[x] = [];

      for (var y in daycourse) {
        var dur = daycourse[y].jieshu;
        dur = dur.split("-");
        var name = daycourse[y].course,
          bgindex = index;
        ;

        var nc = true;
        for (var i in courseName) {
          if (courseName[i] != null && courseName[i].indexOf(name) >= 0) {
            nc = false;
            bgindex = cbgset[i];
            break;
          }
        }
        if (nc) {
          if (Number(index++) > 11) index = 0;
          courseName.push(name);
          cbgset.push(index);
          bgindex = index;
          //  console.log(courseName)
          //  console.log(cbgset)
        }

        var cz = dur[1] - dur[0];
        cbg[x][y] = "cbg_" + bgindex+" cbg_common";
        cbgHeight[x][y] = "height:" + 52 * (cz + 1) + "px;";
        if(x>3)console.log(y);
        if (y == 0){
          cbgHeight[x][y] += "margin-top:"+Number(dur[0]==0?3:dur[0]*52+3)+"px;";
        //  cbgHeight[x][y] += "margin-top:" + Number(Number(dur[0] * 52) + 1 * (dur[1] == 0 ? 1 : dur[1])) + "px;";
        }
        else {
          cbgHeight[x][y] += "margin-top:" + Number(Number(dur[0] - last - 1) * 52 + Number(0 * (dur[0] - last))) + "px;";
        }

        last = dur[1];

        textMargin[x][y] = "margin-top:" + (cz > 1 ? 25 : 5) + "px";
      }
    }
    this.setData({ cbg: cbg, cbgHeight: cbgHeight, textMargin: textMargin, kcb: kcb });
    this.saveComposing();
  }

  ,

  saveComposing: function () {
    var that = this;
    wx.setStorage({ key: 'cbg', data: that.data.cbg });
    wx.setStorage({ key: 'cbgHeight', data: that.data.cbgHeight });
    wx.setStorage({ key: 'textMargin', data: that.data.textMargin });
    console.log("保存成功");
  }


  ,
  edit: function (e) {
    var id = e.currentTarget.id.substring(6);//多个组件嵌套要获取id要通过currentTarget

    wx.navigateTo({
      url: '/pages/edit_course/editCourse?arg=' + id

    });

    console.log("id:\t" + id + "\t");
  }

  ,
  saveKcb: function () {
    var that = this;
    wx.setStorage({
      key: "kcb",
      data: that.data.kcb
    });
    console.log("Saved the kcb");
  },
  saveTimeTable: function () {
    var that = this;
    wx.setStorage({
      key: "timeTable",
      data: that.data.timeTable
    });
    console.log("Saved the timeTable");
  },

  getJWKcb() {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        var un = res.data.username,
          pw = res.data.password;
        var time,
          xn = '2017', xq = '1';
        try {
          time = util.formatTime(new Date()).split(" ")[0].split("-");
          if (time[1] < 2 || time[1] >= 9) xq = 0
          if (time[1] < 9) xn = Number(time[0]) - 1;
          else xn = time[0];
        } catch (e) { }
        console.log(xn + ' ' + xq);
        wx.request({
          url: 'https://www.xxxzh.top/loginJW.jsp',
          method: 'post',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            username: un,
            password: pw,
            kb: 1,
            xn: xn,
            xq: xq,
            toPage: 'jw'
          },
          success(res) {
            var data = res.data;
            console.log(data);
            //    console.log(data.kcb.replace(/\\\"/g, "\"").replace(/\"{/g, "{").replace(/}\"/g, "}"));
            if (data.kcb != null) {
              var kcb = JSON.parse(data.kcb.replace(/\\\"/g, "\"").replace(/\"{/g, "{").replace(/}\"/g, "}")),
                skcb = [],
                tdc = [],
                userCode = kcb.userCode;
              kcb = kcb.kcb.detail;
              var need=xq==0?xn:xn+1;
              var addnum = 0;
              for (var x in kcb) {
                var daycourse = kcb[x].detail;
                if (userCode.indexOf(need) == 0 && x < 5)
                  tdc.push({ course: '早读', jieshu: '0-0' });
                for (var y in daycourse) {
                  if (daycourse[y].duration.indexOf(" ") > 0)
                    daycourse[y].course += " " + daycourse[y].duration.split(" ")[1] + "周";
                  tdc.push(daycourse[y]);
                  addnum++;
                }
                if (userCode.indexOf(need) == 0 && x < 5)
                  tdc.push({ course: '晚修', jieshu: '9-10' });
                skcb.push(tdc);
                tdc = [];
              }
              console.log(skcb);
              if (addnum > 0) {//若课表获取成功
                wx.showToast({ title: "更新成功" });
                wx.setStorage({ key: 'refresh', data: true });
                wx.setStorage({
                  key: 'userCode',
                  data: userCode
                });
                wx.setStorage({ key: 'kcb', data: skcb });
                that.data.kcb = skcb;
                that.composeKcb();
              } else {
                if (that.data.regetTime++ > 2) {
                  wx.showToast({ title: '课表暂未更新' });
                } else {
                  wx.showLoading({ title: '正在重新获取' });
                  setTimeout(function () { that.getJWKcb(); }, 1000);
                }
              }
            } else {
              wx.showModal({
                title: '登录失败',
                content: '请重新绑定教务账号',
                showCancel: false,
                confirmColor: 'red'
              });

            }
          },
          fail() {
            wx.showToast({
              title: '连接失败',
              image: "/images/fail.png"
            })
          },
          complete() { wx.hideLoading() }
        })
      },
    })

  }

  ,
  regetKcb: function () {
    wx.showLoading({
      title: '更新中',
    })
    //this.getSoDate();
    //this.analyzeKcb();
    this.getJWKcb();
    console.log("课表开始更新");
    wx.hideLoading()
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function () {
    return {
      title: '莞工课表',
      path: '/pages/index/index',
    }
  }
});
