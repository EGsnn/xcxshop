import mock from "./utils/mock";

//app.js
App({
  onLaunch: function () {
    Object.assign(this.globalData)
    // console.log(this.globalData);
  },
  globalData: {
    userInfo: null,
    // baseUrl: 'http://192.168.199.107:9999/api/'
  }
})