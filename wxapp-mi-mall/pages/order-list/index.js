var pay = require('../../utils/pay.js');

var app = getApp();
var utils = require('../../utils/util.js');

Page({
  data:{
    statusType: ["全部", "待付款", "待收货", "已完成", "退款"],
    state:0,
    tabClass: ["", "", "", "", "",""],
    orderList:[],
    yunPrice: 0,
    orderInfo: {
      payType: 1,
    },
    papInfo: {}
  },
  statusTap:function(e){
     var state =  e.currentTarget.dataset.index;
     this.setData({
       state:state
     });
     console.log(state)
    if (state === 4){
      wx.navigateTo({
        url: "/pages/refundList/refundList"
      })
    }else {
      this.getOrderLists();      
    }
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    console.log(orderId)
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap:function(e){
    // 取消订单
    var that =this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定取消订单？',
      success: function (res) {
        if (res.confirm) {
          utils.httpPost('order/cancel', {
            openid: app.globalData.openId,
            order_num: orderId
          }).then((data) => {
            if (data.code === 200) {
              // 登录错误 
              wx.showToast({
                title: '取消订单成功',
                icon: 'success'
              })
              that.getOrderLists();
              
            } else {
              wx.showToast({
                title: '取消订单失败',
                icon: 'none'
              })
            }
          });
        }
      }
    });
  },
  rateOrder:function(e){
    // 评价订单
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-rate/index?id=" + orderId
    })
  },
  confirmOrder: function (e) {
    // 确认收货
    wx.showModal({
      title: '提示',
      content: '确定收货后，钱将转入商家账户，是否确认收货？',
      success: function (res) {
        if (res.confirm) {
          utils.httpPost('order/confirm', {
            openid: app.globalData.openId,
            order_num: e.target.dataset.id
          }).then((data) => {
            if (data.code === 200) {
              wx.showToast({
                title: '收货成功',
                icon: 'success'
              })
              that.getOrderLists();
            } else {
              wx.showToast({
                title: '收货失败',
                icon: 'none'
              })
              
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  selectPayType: function (e) {
    var orderInfo = this.data.orderInfo;
    orderInfo.payType = e.currentTarget.dataset.id;
    console.log(this.data.orderInfo)
    this.setData({
      orderInfo: orderInfo
    })
  },
  toPayTap: function (e) {
    var orderInfo = this.data.orderList.filter(obj => { return obj.order_num == e.currentTarget.dataset.id})[0];
    this.setData({
      orderSucceed: true,
      papInfo: orderInfo,
    })
  },
  payNow: function () {
    console.log(this.data.papInfo)
    pay.wxpay({
      order_num: this.data.papInfo.order_num,
      totalPrice: this.data.papInfo.order_price,
      payType: this.data.orderInfo.payType
    },true);
  },
  closeTmpBox: function () {
    var that = this;
    this.setData({
      orderSucceed: false
    });
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    var that = this;
    utils.wxLogin().catch(err => {
      utils.fail();
    });
    
    console.log(options.curType ? options.curType : 0,11111111111)
    this.setData({
      currentType: options.curType ? options.curType : 0 
    });
    this.getOrderLists();
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
 
  },
  getOrderLists:function(){
    // 获取订单列表
    var that = this;

    // 获取订单列表
    utils.httpPost('order/list', {
      openid: app.globalData.openId,
      state: this.data.state -1
    }).then((data) => {
      // console.log(data.filter(obj => { obj.order_status === 8 })[0])
      console.log(data)
      that.setData({
        orderList: data.resultList
      });
    })

  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
 
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
 
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
   
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  
  }
})
