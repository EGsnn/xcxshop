//index.js
//获取应用实例
var app = getApp();
var utils = require('../../utils/util.js');
var pay = require('../../utils/pay.js');

Page({
  data: {
    totalScoreToPay: 0,
    goodsList: [],
    isNeedLogistics:1, // 是否需要物流信息
    totalPrice:0,
    yunPrice:0,
    allGoodsAndYunPrice:0,
    goodsJsonStr:"",
    orderType:"", //订单类型，购物车下单或立即支付下单，默认是购物车，
    hasNoCoupons: true,
    hasNoAddres: false,
    coupons: [{
      money:1,
      name:"满50减1",
      id:1
    },{
      money: 1,
      name: "满50减1",
      id: 1
    }],
    youhuijine:0, //优惠券金额
    curCoupon:null, // 当前选择使用的优惠券
    orderSucceed: false,
    yunPrice: 0,
    orderInfo:{
      payType: 1,
    },
    papInfo:{}
  },
  onShow : function () {
    var that = this;
    var shopList = [];
    // //立即购买下单
    // if ("buyNow"==that.data.orderType){
    //   var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
    //   console.log(buyNowInfoMem,'goodsList')
    //   that.setData({
    //     goodsList: buyNowInfoMem,
    //   });
    // }else{
      
    // }
    //购物车下单
    var shopCarInfoMem = wx.getStorageSync('attr_item');
    // console.log(shopCarInfoMem, 'goodsList')
    shopCarInfoMem = shopCarInfoMem.filter(obj=>{
      return obj.selected;
    })
    that.setData({
      goodsList: shopCarInfoMem,
    });
    
    console.log('goodsList')
    let total_price = 0;
    var goods_detail = that.data.goodsList.map(function (item) {
      total_price += item.goods_price*item.select_num;
    })
    this.setData({
      total_price: total_price
    })
    that.initShippingAddress();
    
  },

  onLoad: function (e) {
    // wx.showLoading({})
    var that = this;
    // wx.checkSession({
    //   success() {
    //     //session_key 未过期，并且在本生命周期一直有效
    //   },
    //   fail() {
    //     // session_key 已经失效，需要重新执行登录流程
    //     //显示收货地址标识
        // utils.wxLogin().catch(err => {
        //   utils.fail();
        // });
    //   }
    // })
    
    // console.log(app.globalData.openId)

  },
  liuyan(e){
    // console.log(e)
    this.setData({
      remark: e.detail.value 
    })
  },
  selectPayType:function(e){
    var orderInfo = this.data.orderInfo;
    orderInfo.payType = e.currentTarget.dataset.id;
    console.log(this.data.orderInfo)
    this.setData({
      orderInfo: orderInfo
    })
  },

  closeTmpBox:function(){
    var that=this;
    this.setData({
      orderSucceed: false
    })
    setTimeout(function () {
      wx.navigateTo({
        url: "/pages/order-details/index?id=" + that.data.papInfo.order_no
      })
    }, 500)
  },
  useCoupons() {
    var me = this;
    this.setData({
      hasNoCoupons: false
    })
  },
  checkCoupons() {
    var me = this;
    this.setData({
      hasNoCoupons: true
    })
  },
  hideCoupons() {
    var me = this;
    this.setData({
      hasNoCoupons: true
    })
  },
  createOrder:function (e) {
    wx.showLoading({});
    var that =this;

    let total_price= 0;
    var goods_detail = that.data.goodsList.map(function (item) {
      let { goods_id, select_num, goods_price, imgs, goods_name } = item;
      total_price += item.goods_price *item.select_num;
      return { goods_id, buy_num: select_num, goods_price, goods_type: 0, imgs, goods_name};
    })



    // console.log(goods_detail,'============goods_detail')
    // 新建订单
    utils.httpPost('order/add', {
      openid: app.globalData.openId,
      address_id: this.data.curAddressData.id,
      total_price: total_price,
      order_price: total_price,
      goods_detail: goods_detail,
      remark: this.data.remark
    }).then((res) => {
      console.log(res)
      var orderInfo = this.data.orderInfo;
      orderInfo.order_no = res.data.order_num;
      orderInfo.order_price = res.data.order_price;
      this.setData({
        orderSucceed: true,
        papInfo: orderInfo
      })
      wx.hideLoading({});
      var list = this.data.goodsList.filter(obj => {
        return !obj.selected
      })
      // console.log(list, 'list')
      wx.setStorageSync('attr_item', [...list]);
      
    });
  },
  payNow:function(){
    console.log(this.data.orderInfo)
    pay.wxpay({
      order_num: this.data.orderInfo.order_no,
      totalPrice: this.data.orderInfo.order_price,
      payType: this.data.orderInfo.payType
    });
  },
  initShippingAddress: function () {
    var that = this;
    utils.wxLogin().catch(err => {
      utils.fail();
    });

    // 获取收货地址 列表
    utils.httpGet('address/my_address', {
      openid: app.globalData.openId,
    }).then((res) => {
      let data = res.resultList;
      if (data.length == 0){
        that.setData({
          hasNoAddres: true
        });
        return;
      }else{
        that.setData({
          hasNoAddres: false
        });
      }
      console.log(data)
      var curAddressData = data.filter(obj => { return obj.state == 1  })[0];
      if (!curAddressData  ){
        curAddressData = data[0];
        console.log(curAddressData)
      }
      that.setData({
        curAddressData: curAddressData
      });
      
    });
  },
  
  addAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url:"/pages/select-address/index"
    })
  },
  
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon:null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})
