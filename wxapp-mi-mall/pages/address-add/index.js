var utils = require('../../utils/util.js');
var timer;

//获取应用实例
var app = getApp()
Page({
  data: {
    provinces:[],
    citys:[],
    districts:[],
    selProvinceIndex:0,
    selCityIndex:0,
    selDistrictIndex:0,
    addressData:{},
    region: ['省/市', '市/县', '区'],
    multiArray: [],
    multiIndex:[0,0,0]
  },
  bindMultiPickerChange(e) {
    console.log(e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    });
  },
  //select 地址修改
  bindRegionChange(e) {
    console.log(e.detail.value)
    this.setData({
      region: e.detail.value
    });
  },
  bindCancel:function () {
    wx.navigateBack({})
  },
  showTopTips: function (msg) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
  },
  bindSave: function(e) {
    // console.log(e)
    
    var that = this;
    var username = e.detail.value.username;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    // var code = e.detail.value.code;
    // console.log(!utils.telExp.test(mobile))

    if (username == ""){
      that.showTopTips('请填写联系人姓名');
      return
    }
    if (mobile == ""){
      that.showTopTips('请填写手机号码');
      return
    } else if (!utils.telExp.test(mobile)) {
      that.showTopTips('手机号码不正确');
      return;
    }


    if (address == ""){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel:false
      })
      return
    }

    var data = {
      openid: app.globalData.openId,
      mobile: mobile,
      username: username,
      province: this.data.region[0],
      city: this.data.region[1],
      district: this.data.region[2],
      address: address,
      address_id:this.data.id
      // zipCode: code,
    };
    if (this.data.state === 'edit'){
      data.address_id= this.data.id;
    }
    console.log(data);
    // 获取收货地址 列表
    utils.httpPost( 'address/add'  , data ).then((data) => {
      if (data.code === 200) {
        // 登录错误 
        wx.hideLoading();
        wx.showModal({
          title: '地址保存成功',
          showCancel: false
        })
        
        let pages = getCurrentPages();//当前页面
        let prevPage = pages[pages.length - 2];//上一页面
        prevPage.setData({//直接给上移页面赋值
          addressId: e.target.dataset.id,
          selAddress: 'new'
        });
        setTimeout(function () {
          wx.navigateBack({//返回
            delta: 1
          })
        }, 1000)
        
      }else {
        // 登录错误 
        wx.hideLoading();
        wx.showModal({
          title: '地址保存失败',
          showCancel: false
        })
        return;
      }
    });
  },
  
  onLoad: function (e) {
    var that = this;
    var id = e.id;
    console.log(e.state);
    utils.wxLogin().catch(err => {
      utils.fail();
    });
    if(e.state==='edit'){
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '新增地址'
      })
    }
    that.setData({
      state: e.state
    });
    if (id) {
      that.setData({
        id: id
      });
      // 初始化原数据
      wx.showLoading();
      // 获取收货地址 列表
      utils.httpGet('address/detail', {
        openid: app.globalData.openId,
        address_id: id
      }).then((res) => {
        // wx.hideLoading();
        let { username, mobile, address, province, city, district} = res.resultList[0];
        console.log(res)
        that.setData({
          addressData: { username, mobile, address},
          region: [province, city, district]
        });
        wx.hideLoading()
      });
    }
  },
  
 
  selectCity: function () {
    
  },
  readFromWx : function () {
  // 微信读取地址
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;  
        var data = {
          address: res.detailInfo,
          code: res.postalCode,
          mobile: res.telNumber,
          username: res.userName,
        }

        that.setData({
          addressData: data,
          region: [provinceName, cityName, diatrictName]
        });
      }
    })
  }
})
