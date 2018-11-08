var utils = require('../../utils/util.js');
// pages/kuaidi/kuaidi.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kuaidinum:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取订单列表
    var num = options.num || '9893408007637';
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    utils.httpGet('kuaidi', {
      num: num 
    }).then((res) => {
      wx.hideLoading()
      that.setData({
        kuaidiDetail: res.data,
        kuaidinum: num
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