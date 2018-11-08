var app = getApp();
var utils = require('../../utils/util.js');
var pay = require('../../utils/pay.js');

Page({
  data:{
    orderId:0,
    goodsList:[],
    orderDetail:{},
    orderSucceed:false,
    yunPrice: 0,
    orderInfo: {
      payType: 1,
    },
    papInfo: {}
  },    
  onLoad:function(e){
    var orderId = e.id;
    this.setData({
      orderId: orderId
    });
    var that = this;
    utils.wxLogin().catch(err => {
      utils.fail();
    });

    // 获取订单列表
    this.getdata();

  },
  getdata: function() {
    var that = this;
    // 获取订单列表
    utils.httpPost('order/detail', {
      openid: app.globalData.openId,
      order_num: that.data.orderId,
    }).then((data) => {
      console.log(data)
      that.setData({
        orderDetail: data.resultList
      });
    })
  },
  onShow:function(){
    // 获取订单列表
    this.getdata();
  },
  refundOrder:function(e){
    // 申请退款
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var goods_id = e.currentTarget.dataset.shopid;
    wx.showModal({
      title: '申请退款',
      content: '稍后会有工作人员进行审核！',
      success: function (res) {
        if (res.confirm) {
          utils.httpPost('order/refund', {
            openid: app.globalData.openId,
            order_num: e.target.dataset.id,
            goods_id: goods_id
          }).then((data) => {
            if (data.code === 200) {
              wx.showToast({
                title: '登记成功',
                icon: 'success'
              })
              that.getdata();
            } else {
              wx.showToast({
                title: '登记失败',
                icon: 'none'
              })

            }
          });
        } 
      }
    })
  },
  onShow : function () {
    
  },
  cancelOrderTap: function (e) {
    // 取消订单
    var that = this;
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
              that.getdata();
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
  rateOrder: function (e) {
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
    this.setData({
      orderSucceed: true,
      papInfo: this.data.orderDetail,
    })
  },
  payNow: function () {
    console.log(this.data.papInfo,'papInfo')
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
  }
})