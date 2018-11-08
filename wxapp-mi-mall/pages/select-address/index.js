//index.js
//获取应用实例
var app = getApp();
var utils = require('../../utils/util.js');

Page({
  data: {
    checkedId:12,
    addressList:[],
    selectA: true,
  },

  selectTap: function (e) {
    // console.log(e)
    
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      addressId: e.target.dataset.id,
      selAddress: 'yes'
    });
    wx.navigateBack({//返回
      delta: 1
    })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/index?state=add"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/index?state=edit&id=" + e.currentTarget.dataset.id
    })
  },


  delAddess: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          utils.httpGet('address/delete', {
            openid: app.globalData.openId,
            address_id: e.target.dataset.id
          }).then((data) => {
            if (data.code === 200) {
              // 登录错误 
              wx.hideLoading();
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
              })
              that.initShippingAddress();
            }else {
              // 登录错误 
              wx.hideLoading();
              wx.showModal({
                title: '删除失败',
                showCancel: false
              })
              return;
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },

  addessDefault: function (e) {
    var that =this;
    console.log(e.detail);

    var data = {
      openid: app.globalData.openId,
      address_id: e.target.dataset.id,
      state: e.detail.value?1:0
    };

    if(e.detail.value){
      that.setData({
        checkedId: e.target.dataset.id
      });
    }else {
      that.setData({
        checkedId: null
      });
    }
    
    // 设置默认地址
    utils.httpGet('address/default', data).then((data) => {
      if (data.code === 200) {
        // 登录错误 
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 1500
        })
        that.initShippingAddress();
        setTimeout(function(){
        },1500)
      }else {
        // 登录错误 
        wx.showModal({
          title: '设置失败',
          showCancel: false
        })
      }
    });
  },
  onLoad: function (option) {
    if(option.state =='select'){
      this.setData({
        selectA:false
      })
    }
    console.log('onLoad')
   
  },
  onShow : function () {
    this.initShippingAddress();
  },
  initShippingAddress: function () {
    var that = this;
    utils.wxLogin().catch(err => {
      utils.fail();
    });
    // 获取收货地址 列表
    utils.httpGet('address/my_address', {
      openid: app.globalData.openId,
    }).then((data) => {
      console.log(data)
      that.setData({
        addressList: data.resultList
      })
    });
  }

})
