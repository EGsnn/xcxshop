var app = getApp();
var utils = require('../../utils/util.js');
// pages/refundList/refundList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.wxLogin().catch(err => {
      utils.fail();
    });
    this.getRefundLists()
  },
  getRefundLists: function () {
    var that = this;
    // 获取退款列表
    utils.httpPost('order/refund_list', {
      openid: app.globalData.openId,
    }).then((data) => {
      console.log(data.resultList)
      that.setData({
        refundList: data.resultList
      });
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})