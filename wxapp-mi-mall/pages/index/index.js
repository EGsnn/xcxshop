//index.js
//获取应用实例
import showDetail from "../../modules/showDetail";
import showcDetail from "../../modules/showcDetail";
import util from "../../utils/util";
const app = getApp()

Page({
  data: {
    index_slides:[],
    indicator_dots:true,
    autoplay:true,
    interval:4000,
    duration:1000,
    nav_data:[],
    index_activity:[],
    index_block:[],
    isTap:false,
    isLoading:false,
    curIndex: 0,  //当前显示的view下标
    swiperList: [], //轮播数据列表
    winWidth: 0,  //设备宽度；
    winHeight: 0,   //设备高度；

    itemWidth: 0, //单个轮播图swiper-item的宽度；
    itemHeight: 0,//单个轮播图swiper-item的高度；
    allWidth: 0,  //轮播展示 swiper的总宽度；
    scale: 0.7,   //  缩放大小倍数；

    startClinetX: '', //触摸开始位置；
    startTimestamp: '', //触摸开始时间；

    translateDistance: 0,//动画移动的 距离；
    animationToLarge: {}, //从小变大的动画；
    animationToSmall: {},
  },
  onLoad(){

    
    
    this.animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 500,
      timingFunction: "ease-out",
      delay: 0
    })
  },
  onShow(e){
    var that = this;

    util.httpPost('goods/list', { goods_name: "", cur_page: 1 }).then((res) => {
      // console.log(res.resultList[0])
      this.setData({
        swiperList: res.resultList
      });

      wx.getSystemInfo({
        success: function (res) {

          let w = res.windowWidth, h = res.windowHeight;
          let allWidth = that.data.swiperList.length * (w * 0.9);
          that.setData({
            winWidth: w,
            winHeight: h,
            itemWidth: w * 0.9,
            allWidth: allWidth
          })

        },
      })
    })
    this.setData({
      isTap:false
    });
  },
  //事件处理函数
  toSearch(e){
    this.setData({
      isTap:true
    });
    wx.navigateTo({
      url: "../search/search"
    })
  },
  // showDetail(e){
  //   const id=e.currentTarget.dataset.pid;
  //   console.log(id);
  // }
  showDetail,
  showcDetail,

  //触摸开始的事件
  swiperTouchstart: function (e) {

    // console.log('touchstart',e);
    let startClinetX = e.changedTouches[0].clientX;
    this.setData({
      startClinetX: startClinetX, //触摸开始位置；
      startTimestamp: e.timeStamp, //触摸开始时间；
    })
  },

  //触摸移动中的事件
  swiperTouchmove: function (e) {
    // console.log('touchmove',e);
  },

  //触摸结束事件
  swiperTouchend: function (e) {
    // console.log("触摸结束",e);

    let times = e.timeStamp - this.data.startTimestamp, //时间间隔；
      distance = e.changedTouches[0].clientX - this.data.startClinetX; //距离间隔；
    //判断
    if (times < 500 && Math.abs(distance) > 50) {
      let curIndex = this.data.curIndex;

      let x0 = this.data.itemWidth, x1 = this.data.translateDistance, x = 0;
      if (distance > 0) {

        curIndex = curIndex - 1
        if (curIndex < 0) {
          curIndex = 0;
          x0 = 0;
        }
        x = x1 + x0;
      } else {

        // console.log('+1',x);
        curIndex = curIndex + 1
        if (curIndex >= this.data.swiperList.length) {
          curIndex = this.data.swiperList.length - 1;
          x0 = 0;
        }
        x = x1 - x0;
      }
      this.animationToLarge(curIndex, x);
      this.animationToSmall(curIndex, x);
      this.setData({
        curIndex: curIndex,
        translateDistance: x
      })

    } else {

    }
  },
  // 动画
  animationToLarge: function (curIndex, x) {

    this.animation.translateX(x).scale(1).step()
    this.setData({
      animationToLarge: this.animation.export()
    })
  },
  animationToSmall: function (curIndex, x) {

    this.animation.translateX(x).scale(0.7).step()
    this.setData({
      animationToSmall: this.animation.export()
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
