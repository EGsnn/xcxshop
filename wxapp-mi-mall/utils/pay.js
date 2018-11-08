var utils = require('./util.js');
var app = getApp();

function showTip(text, order_num, notJump){
  wx.showToast({
    title: text,
    icon: 'none',
    mask: true
  });
  if (notJump){
    return false;
  }
  if (order_num){
    setTimeout(function () {
      wx.navigateTo({
        url: "/pages/order-details/index?id=" + order_num
      })
    }, 2000)
    
  } else {
    setTimeout(function () {
      wx.navigateBack({
        delta: 2
      })
    }, 2000)
  }
  
}


function wxpay(obj, notJump) {
  // 微信支付
  var order_num = obj.order_num;
  var order_price = obj.totalPrice;
  var freight = obj.yunPrice;
  wx.showLoading({});
  // 获取支付信息
  utils.httpPost('order/pay/get_prepayid', {
    openid: app.globalData.openId,
    order_price: order_price,
    freight: freight,
    order_num: order_num,
  }).then((res) => {
    // console.log(res.data,'测试')
    wx.hideLoading({});
    if (res.code === 200) {
      wx.requestPayment({
        'timeStamp': res.data.timeStamp.toString(),
        'nonceStr': res.data.nonceStr,
        'package': res.data.package,
        'signType': 'MD5',
        'paySign': res.data.paySign,
        'success': function (res) {
          console.log(res.errMsg === "requestPayment:ok")
          if (res.errMsg === "requestPayment:ok") {
            // 回传
            console.log('支付成功')
            showTip('支付成功', false, false);

          } else {
            showTip('支付失败', order_num, notJump);
          }
        },
        'fail': function (res) {
          console.log(res)
          // if (res.errMsg == "requestPayment:fail cancel") {
            showTip('支付失败！', order_num, notJump);
          // } else {
          //   showTip('支付异常！', order_num, notJump);
          // }
        }
      })
    } else if (data.code === -1){
      wx.showToast({
        title: data.msg,
        icon: "loading",
        duration: 2000,
      });
    }else {
      wx.showToast({
        title: '支付异常！',
        icon: "loading",
        duration: 2000,
      });
    }
  });
}

function xxpay(obj, notJump) {
  // 线下支付
  var order_num = obj.order_num;
  var order_price = obj.totalPrice;
  var freight = obj.yunPrice;
  utils.httpGet('order/offline_pay', {
    openid: app.globalData.openId,
    order_price: order_price,
    freight: freight ,
    order_num: order_num,
  }).then((res) => {
    console.log(res)
    if (res.code == 1) {
      showTip('申请成功,等待后台审核', order_num, notJump);
    } else if (res.code === -1) {
      showTip(res.msg, order_num, notJump);
    } else {
      wx.showToast({
        title: '支付异常！',
        icon: "loading",
        duration: 2000,
      });
    }
  })
}

function yepay(obj, notJump) {
  // 余额支付
  var order_num = obj.order_num;
  var order_price = obj.totalPrice;
  var freight = obj.yunPrice;
  utils.httpGet('order/balance_pay', {
    openid: app.globalData.openId,
    order_price: order_price,
    freight: freight ,
    order_num: order_num,
  }).then((res) => {
    // console.log(res == "requestPayment:fail cancel")
    if(res.code == 1){
      showTip('支付成功', order_num, notJump);
    } else if (res.code === -1) {
      showTip(res.msg, order_num, notJump);
    } else {
      wx.showToast({
        title: '支付异常！',
        icon: "loading",
        duration: 2000,
      });
    }
  })
}

function payFun(obj,notJump){
  // console.log(obj,'in payFun')
  if (obj.payType == 1){
    wxpay(obj, notJump)
  } else if (obj.payType == 2) {
    yepay(obj, notJump)
  } else if (obj.payType == 3) {
    xxpay(obj, notJump)
  }
}

module.exports = {
  wxpay: payFun
}
