const app = getApp();
var util = require('../../utils/util.js');
var monthdays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var classTime = [["7:20", "8:00"], ["8:30", "9:15"], ["9:25", "10:10"], ["10:25", "11:10"], ["11:15", "12:00"],
["14:30", "15:15"], ["15:25", "16:10"], ["16:25", "17:10"], ["17:15", "18:00"], ["19:30", "20:15"], ["20:25", "21:10"], ["21:15", "22:00"]];
var degree = 0, height = 2000;
//Math.floor(Math.random()*10);时，可均衡获取0到9的随机整数。
Component({
  options: {
    multipleSlots: true
  },

  data: {
    host: app.data.host,
    base: [],
    bottomStyle: [],
    menuName: ['通用服务', '学生服务'],
    menuItems: [[['完整课表', '校历'], ['图书馆藏', '更换背景'], ['获取课表']]],//,[['通讯录<->获取课表','饭卡消费'],['借书记录','我的成绩'],['我的选课','等级考试'],['网费情况']]],
    menuIcons: [[["/images/AllCourse.png", "/images/b_xiaoli.png"], ["/images/lib.png", "/images/change_bg.png"], ['/images/getKcb.png']], [["/images/contactbook.png", "/images/ecard.png"], ['/images/borrowbooks.png', '/images/score.png'], ["/images/myChosenCourse.png", "/images/LevelExam.png"], ['/images/networkFare.png']]],
    menuTap: [[['fullKcb', 'showXiaoli'], ['toLib', 'changeBG'], ['getKcb']], [['getKcb', 'EcardFare'], ['BorrowBooks', 'myscore'], ['myChosenCourse', 'LevelExam'], ['networkFare']]],

    weatherIcon: '/images/weather/Unknown.png',
    weatherInfo: {},


    soDate: [[9, 1, 2017], [3, 4, 2018]],//月-日-年 开学日期
    noticeShow: false,

    state: false,
    update: null,
    data: [],
    day: 0,
    date: [],
    time: '',
    zhoushu: '',
    bgPath: '',
    notices: [],
    noticeId: 0,
    title: ['莞工校园助手', '校内圈', '校园二手', '个人中心'],
    menus: ['首页', '校内圈', '二手', '个人中心'],
    menuIcon: [['home_Dis.png', 'school_Dis.png', 'shop_Dis.png', 'user_Dis.png'], ['home.png', 'school.png', 'shop.png', 'user.png']],
    menuLink: ['', '/pages/social/social', '/pages/shop/shop', '/pages/me/me'],
    badge: [],
    menuVersion: app.globalData.menuVersion,
    menuIndex: 0,
    ad_img: '',
    ad_show: false,
    ad_text: '我要考公务员',
    showComp: false
  }
  ,

  properties: {
    compId:{
      type:String
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
    refresh: {
      type: Boolean,
      value: false,
      observer: function (nv, ov, cp) {

        if (nv) {
          this.onPullDownRefresh();
        }
      }
    }
  },
  ready: function (msg) {
    wx.setNavigationBarTitle({
      title: '莞工校园助手',
    });
    var that = this;
    this.getAd();
    //console.log(util.formatTime(new Date()));
    var jieshu = [], xingqi = [];
    for (var i = 0; i < 12; i++) {
      jieshu[i] = i;
    }

    

    var ft = util.formatTime(new Date()).split(" ")[0].split("-");
    var day = new Date().getDay();
    day = day > 0 ? day - 1 : 6;

    wx.getStorage({
      key: 'soDate',
      success: res => {
        this.data.soDate = res.data;
      }, complete: () => {
        var zs = util.getWeek(this.data.soDate, monthdays);
        this.setData({
          zhoushu: zs, jieshu: jieshu, date: ft, day: day
        });
      }
    })

    wx.getStorage({
      key: 'NewClassKcb',
      success: function (res) {
        that.onShow();
      }, fail() {

        that.init();
      },
      complete: function () {
      }
    })
    wx.getSystemInfo({
      success: res => {
        that.setData({
          marginLeft: (res.windowWidth - 36) / 2
        });
      }
    })
  }
  ,
  methods:{
    makeCap(){
      wx.navigateTo({
        url: '/pages/me/cap/cap',
      })
    },
    job: function () {
      wx.navigateTo({
        url: 'job/job',
      })
    },
    get_base: function () {
      var that = this, version = '';
      wx.getStorage({
        key: 'version',
        success: function (res) { version = res.data },
      })
      app.get_base().then(
        function () {
          var attrs = app.data.base;
          version = attrs.kcb_version;
          var re = attrs.school_open;
          //    console.log(re);
          re = re.split(";");
          re[0] = re[0].split(",");
          re[1] = re[1].split(",");
          var date = util.formatTime(new Date()).split(" ")[0].split("-");
          var year = Number(date[0]), month = Number(date[1]);
          if (month >= Number(re[1][0]) && month < Number(re[0][0])) {//是第二学期
            re[0][2] = Number(year) - 1;
            re[1][2] = year;
          } else {//第一学期
            re[0][2] = year;
            re[1][2] = Number(year) + 1;
          }
          console.log(re);
          that.data.soDate = re;
          wx.setStorage({ key: 'soDate', data: re });
          that.setData({ base: attrs });
          that.triggerEvent("base",{base:attrs});
    
        }, function () {
          var date = util.formatTime(new Date()).split(" ")[0].split("-");
          var year = Number(date[0]), month = Number(date[1]);
          if (month >= Number(re[1][0]) && month < Number(re[0][0])) {//是第二学期
            re[0][2] = year - 1;
            re[1][2] = year;
          } else {
            re[0][2] = year;
            re[1][2] = year + 1;
          }
          that.data.soDate = re;
          wx.setStorage({ key: 'soDate', data: re });
        }
      )
    },
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
    myscore() {

      wx.navigateTo({
        url: '../myscore/myscore',
      })
    },
    myChosenCourse: function () {
      wx.navigateTo({
        url: '../myChosenCourse/myChosenCourse',
      })

    }


    ,
    getAd: function () {
      wx.request({
        url: app.data.host + 'contact/get_ad',
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          console.log(res);
          if (res.data.code) {
            var data =res.data.data;
            this.setData({
              ad_img: data[0].value, ad_show: data[3].value, ad_text: data[4].value
            })
          }
        }
      })
    },
    onShow: function () {
      var that = this;
      if (!app.data.login) {
        app.login().then(() => {
          this.onShow();
        });
      } else {
        if (this.data.notices.length == 0) this.get_base();
       

      }
      wx.getStorage({
        key: 'NewClassKcb',
        success: function (res) {
          console.log("Begin to get class kcb");
          that.analyzeKcb();
          wx.removeStorage({
            key: 'NewClassKcb',
            success: function (res) { },
          })
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
              that.setTodayCourse();
            }

          });
          wx.removeStorage({
            key: 'refresh',
            success: function (res) { },
          })
        },
      })




    }


    ,
    setTodayCourse: function () {//设置今天的课程
      var kcb = this.data.kcb,
        day = this.data.day,
        zhoushu = Number(this.data.zhoushu),
        tc = [], tct = [];
      console.log(kcb)
      console.log(kcb[day]);
      for (var x in kcb[day]) {
        var dur = kcb[day][x].duration;
        var jieshu = kcb[day][x].jieshu.split("-");
        if (dur) {
          if (dur.indexOf("周") > 0) dur = dur.substring(0, dur.indexOf("周"));
          if (dur.indexOf(" ") < 0 || (dur.indexOf(" 单") > 0 && zhoushu % 2 != 0) || (dur.indexOf(" 双") > 0 && zhoushu % 2 == 0)) {
            if (dur.indexOf(" ") > 0) dur = dur.substring(0, dur.indexOf(" "));
            dur = dur.split("-");
            if (Number(dur[0]) <= zhoushu && zhoushu <= Number(dur[1])) {
              tc.push(kcb[day][x]);
              tct.push(classTime[jieshu[0]][0]);
            }
          }
        } else {
          tc.push(kcb[day][x]);
          tct.push(classTime[jieshu[0]][0]);
        }
      }
      this.setData({ todaycourse: tc, todayCourseTime: tct });
      this.forcastCourse();
    }
    ,
    init: function (ver) {//初始化数据
      //  this.analyzeKcb();
      var that = this, day = this.data.day;

      wx.getStorage({
        key: "bgPath",
        success: function (res) {
          that.setData({ bgPath: res.data });
          console.log(res);
        }
      });

      wx.getStorage({//获取本地存储的课程表
        key: 'kcb',
        success: function (res) {
          var data = res.data;
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
                      that.setTodayCourse();
                    }
                  })
                }
              })
            },
            fail: function () {


            }
          })
          console.log(data);
        },
        fail: function () {

        }
      });
      //  that.refreshText();
      wx.hideLoading();

    }
    ,
    analyzeKcb: function () {
      var that = this;
      wx.getStorage({
        key: 'class',
        success: function (res) {
          wx.showLoading({ title: '分析中' });
          var cl = res.data;
          var grade = cl.substring(0, 4);
          wx.getStorage({
            key: 'kcb',
            success: function (res) {
              var kcb = res.data,
                skcb = [];

              console.log((kcb));
              var add = false;
              for (var x in kcb) {

                add = true;
                var course = kcb[x];
                var cts = [];


                for (var y in course) {
                  var cc = course[y];
                  if (cc.course) {
                    var duration = cc.duration, jieshu = cc.jieshu;
                    var dsz = "";
                    if (duration.indexOf(" ") > 0 && duration.indexOf("[") == -1) dsz = duration.substring(duration.indexOf(" "));
                    if (duration.indexOf("[") >= 0)
                      duration = duration.substring(duration.indexOf("[") + 1, duration.indexOf("]"));
                    duration += dsz;
                    //   console.log(duration);
                    if (jieshu.indexOf("节") > 0) jieshu = jieshu.substring(0, jieshu.indexOf("节"));
                    if (jieshu.lastIndexOf(" ") >= 0) jieshu = jieshu.substring(jieshu.lastIndexOf(" ") + 1);
                    cc.jieshu = jieshu;
                    cc.duration = duration;
                    cts.push(cc);
                  }
                }

                skcb.push(cts);
              }
              that.data.kcb = skcb;
              that.saveKcb();
              that.kcbTextCut();
              that.composeKcb();
              that.kcbTextCut();
              that.setTodayCourse();
              console.log(skcb);


            },
          })


        }, complete() { wx.hideLoading() }
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
          cbg[x][y] = "cbg_" + bgindex + " cbg_common";
          cbgHeight[x][y] = "height:" + 52 * (cz + 1) + "px;";
          if (x > 3) console.log(y);
          if (y == 0) {
            cbgHeight[x][y] += "margin-top:" + Number(dur[0] == 0 ? 3 : dur[0] * 52 + 3) + "px;";
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
    }
    ,
    forcastCourse: function () {//对即将上的课程进行下划线
      var tc = this.data.todaycourse,
        ul = [];
      if (tc.length > 0) {
        for (var x in tc) {
          //   console.log(kcb[day][x]);
          var ft1 = classTime[tc[x].jieshu.split("-")[0]][0],
            ft2 = classTime[tc[x].jieshu.split("-")[1]][1];
          var date = util.formatTime(new Date());
          date = date.substring(0, date.indexOf(" ") + 1) + ft1;
          var ndate = util.formatTime(new Date()),
            date2 = date.substring(0, date.indexOf(" ") + 1) + ft2;
          var dis1 = Number(util.getDateDis(ndate, date)),
            dis2 = Number(util.getDateDis(ndate, date2));
          //      console.log(date+"\t"+date2+"\t"+dis1+"\t"+dis2);
          if ((dis1 >= 0 && dis2 < 0) || (dis1 < 0)) {
            ul[x] = 'border-left:5px solid #0ABA07;';
            break;
          }
        }
        this.setData({ bottomStyle: ul });
        setTimeout(this.forcastCourse, 10000);
      }
    }
    ,
    todayPanel: function () {//显示或隐藏今天的课程面板
      var that = this;
      var roll = wx.createAnimation({
        duration: 200,
        timingFunction: "ease"
      }),
        tp = wx.createAnimation({
          duration: 800,
          timingFunction: "ease"
        });

      if (that.data.showToday)
        setTimeout(function () { that.setData({ showToday: false }) }, 500);
      else this.setData({ showToday: true });

      roll.rotate(degree = degree == 0 ? 180 : 0).step();
      tp.height(height = height == 0 ? 2000 : 0).step();
      this.setData({ rollAnimat: roll, todayAnimat: tp });
    }
    ,
    refreshText: function () {//刷新置顶信息
      var ft = util.formatTime(new Date()).split(" ")[1].split(":");
      var day = this.data.day;
      var hour = ft[0], min = ft[1], tt = this.data.timeTable[day];
      var ms = hour * 60 + min;
      var text = "好开心哦，今天的课上完了呢~";
      var temp = this.data.kcb[day];

      for (var x in tt) {
        x = Number(x);
        var t = tt[x], t3 = tt[Number(x > tt.length - 2 ? tt.length - 2 : x) + 1];
        var t1 = t[0].split(":"),
          t2 = t[1].split(":");

        // console.log(ft+"\tt1:"+t1+"\tt2:"+t2+"\tt3[0]:"+t3[0]);

        t1 = t1[0] * 60 + t1[1];
        t2 = t2[0] * 60 + t2[1];

        var t31 = t3[0].split(":");//下一节课开始时间
        t31 = t31[0] * 60 + t31[1];

        // console.log(ms+"\tt1:"+t1+"\tt2:"+t2+"\tt31:"+t31+"x:"+x);

        if (temp != null) {
          //  console.log(temp[x]);
          if ((ms - t1 >= 0 && ms - t2 < 0) || ms == t31) {//正在上课
            //   console.log("It's 之间");
            var tx = ms == t31 ? temp[x + 1] : temp[x];
            if (this.checkRange(tx)) {
              if (tx != null && tx.name != "") {
                text = "正在 " + (tx.spot != null ? tx.spot : "未知地点 ") + " 上" + tx.name;
              }
            } else {
              text = "这一节没课哦~";
            }
            break;
          } else if ((ms - t2 >= 0 && ms - t31 <= 0) || (x == 0 && (ms - t1 < 0))) {//即将上课
            text = "下一节没课了呢~";
            var td = temp[(x == 0 && (ms - t1 < 0)) ? 0 : (x + 1)];
            //    console.log(td);
            if (this.checkRange(td)) {
              if (td != null && td.name != "" && td.name != null) {
                text = ((x == 0 && ms < t1) ? t[0] : t3[0]) + "将在 " + (td.spot != null ? td.spot : "未知地点 ") + " 上 " + td.name;
              }
            }

            //     console.log((ms-t2>=0&&ms-t31<=0)+text);
            break;
          }
          else {
            text = "好开心哦，今天的课上完了呢~";
            //   console.log(ms>t2);
          }
        }

      }

      wx.setTopBarText({
        text: text
      })

      setTimeout(this.refreshText, 6000);
      //  console.log(ft+"\t"+text);
      // console.log(this.data.kcb);
      // ////console.log(this.data.day);
    }
    ,
    checkRange: function (course) {//检查当前课程是否在已经上课
      var res = false, week = this.data.zhoushu;
      if (course != null) {
        var cn = course.duration, index = 0;
        if ((cn.indexOf("单周") >= 0 && week % 2 != 0) || (cn.indexOf("双周") >= 0 && week % 2 == 0) || (cn.indexOf("单周") < 0) && (cn.indexOf("双周") < 0)) {
          res = true;
        }
        if ((index = cn.indexOf("[")) >= 0) {
          cn = cn.substring(index + 1, cn.lastIndexOf("]")).split("-");
          if (cn[1] != null && (week >= cn[0] && week <= cn[1]) && res) {
            res = true;
          } else { res = false; }
        } else {
          res = true;
        }
      }

      return res;
    },

    getKcb: function () {
      wx.navigateTo({
        url: 'kcb/kcb',
      })
    }
    ,
    requestKcb() {
      var that = this;
      wx.getStorage({
        key: 'loginInfo',
        success: function (res) {
          wx.showLoading({
            title: '获取中',
          })
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
                var addnum = 0;
                for (var x in kcb) {
                  var daycourse = kcb[x].detail;
                  if (userCode.indexOf("2017") == 0 && x < 5)
                    tdc.push({ course: '早读', jieshu: '0-0' });
                  for (var y in daycourse) {
                    if (daycourse[y].duration.indexOf(" ") > 0)
                      daycourse[y].course += " " + daycourse[y].duration.split(" ")[1] + "周";
                    tdc.push(daycourse[y]);
                    addnum++;
                  }
                  if (userCode.indexOf("2017") == 0 && x < 5)
                    tdc.push({ course: '晚修', jieshu: '9-10' });
                  skcb.push(tdc);
                  tdc = [];
                }
                console.log(skcb);
                if (addnum > 0) {//若课表获取成功
                  wx.showToast({ title: "获取成功" });
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
                    setTimeout(function () { that.requestKcb(); }, 1000);
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
                title: '请检查网络',
                image: "/images/fail.png"
              })
            },
            complete() {
              setTimeout(function () { wx.hideLoading() }, 1000);
            }
          })
        }, fail() {
          wx.showModal({
            title: '请先绑定教务系统账号',
            content: '',
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '../settings/setting'
                });
              }
            }
          });
        }
      })
    },
    getJWKcb() {

    }
    ,
    fullKcb: function () {
      wx.navigateTo({
        url: '../allCourse/allCourse'
      });
    }
    ,
    signInOut: function () {
      wx.navigateTo({
        url: '../SignIn_Out/SignIn_Out'
      });

    }
    ,
    EcardFare() {
      wx.navigateTo({ url: '/pages/EcardFare/EcardFare' });
    },
    BorrowBooks() {
      wx.navigateTo({ url: '/pages/BorrowBooks/BorrowBooks' });
    }
    ,
    LevelExam() {
      wx.navigateTo({
        url: '../LevelExam/LevelExam'
      });
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
      //  this.getJWKcb();
      this.getAd();
      this.get_base();
      wx.stopPullDownRefresh();
    },
    onShareAppMessage: function () {
      return {
        title: '莞工校园助手',
        path: '/pages/index/index',
      }
    }
    ,

    changeBG: function () {
      var that = this;
      wx.showActionSheet({
        itemList: ['拉伸', '左对齐', '右对齐', '恢复默认'],
        success: function (res) {
          var mode = ['scaleToFill', 'left', 'right'];
          var index = res.tapIndex;
          if (index != 3) {
            wx.setStorage({
              key: 'imageMode',
              data: mode[index],
            })
            wx.chooseImage({
              count: 1,
              sizeType: ['original', 'compressed'],
              success: function (res) {
                wx.removeSavedFile({//先移除原来的文件
                  filePath: that.data.bgPath,
                  success: function (res) { console.log(res); }
                });

                var tf = res.tempFilePaths[0];
                wx.saveFile({
                  tempFilePath: tf,
                  success: function (res) {
                    var fp = res.savedFilePath;
                    wx.setStorage({
                      key: 'bgPath',
                      data: fp
                    });
                    that.setData({ bgPath: fp });
                    wx.showToast({
                      title: '操作成功',
                    })
                    //    console.log(res);
                  }
                });

              }
            });
          } else {
            wx.removeStorage({ key: 'bgPath' });
            that.setData({ bgPath: '' })
          }
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })


    }
    ,
    changeNotice(e) {
      //  console.log(e)
      var ni = this.data.noticeId;
      this.setData({ noticeId: Number(ni) + Number(e.currentTarget.dataset.num) });
    },
    notice_tap: function () {
      var imgs = this.data.notices[this.data.noticeId].content.split("<img src="),
        urls = [];
      if (imgs.length > 1) {
        for (var x in imgs) {
          if (x > 0) {
            imgs[x] = imgs[x].replace(/\\\"/g, "\"");
            console.log(imgs[x]);
            urls.push(imgs[x].substring(imgs[x].indexOf("\"") + 1, imgs[x].indexOf("/>")).replace(/ /g, "").replace("\"", ""));
          }
        }
        console.log(urls)
        wx.previewImage({
          urls: urls
        })
      }
    },
    showNotice: function (e) {
      var id = e.currentTarget.id.substring(6);
      if (this.data.base.school_notices.length > 0) {
        var ani = wx.createAnimation({
          duration: 400,
          timingFunction: 'ease',
        });
        ani.opacity(100).step();
        this.setData({ maskShow: true, noticeId: id })
        this.setData({ noticeId: id, animation: ani, noticeShow: true })
      }
    },
    hide: function () {
      var ani = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease',
      }), that = this;
      ani.opacity(0).step();
      this.setData({ animation: ani, noticeShow: false })
      setTimeout(function () { that.setData({ maskShow: false }) }, 200);
    }
    ,
    showXiaoli: function () {
      var data = this.data.base.school_calendar;
      wx.showActionSheet({
        itemList: data.nameList,
        success(res) {
          wx.previewImage({
            urls: [data.images[res.tapIndex]],
          });
        }
      });


    }
    ,
    toLib: function () {
      wx.navigateTo({
        url: '../search/search',
      })

    }
  }
  ,
});
