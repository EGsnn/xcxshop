var app = getApp();
const telExp = /^[1][0-9][0-9]{9}$/;

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

//登录请求
const wxLogin = (userRes) => {
  return new Promise((resolve, reject) => {
    var openId = wx.getStorageSync('openId'); //获取用户资料
    console.log(userRes, '--------userRes')
    if (!openId && userRes) {
      // console.log(1111111111111111)
      wx.login({
        success: function (loginRes) {
          var code = loginRes.code;
          if (userRes.errMsg === 'getUserInfo:ok') { //用户点击同意，获取用户资料
            // console.log(loginRes,2222222222);
            app.globalData.userInfo = userRes.userInfo;
            wx.setStorageSync("userInfo", userRes.userInfo);
            wx.showLoading({});
            wx.request({
              url: app.globalData.baseUrl + 'user/enter',
              type: 'GET',
              data: {
                code: code,
                nickname: userRes.userInfo.nickName,
                pic: userRes.userInfo.avatarUrl,
                country: userRes.userInfo.country,
                province: userRes.userInfo.province,
                city: userRes.userInfo.city,
              },
              success: function (res) {
                console.log(res, 1111111111)
                wx.hideLoading()
                if (res.statusCode === 200) {
                  wx.setStorageSync("openId", res.data);
                  app.globalData.openId = res.data;
                  resolve(res.data);
                }
              },
              fail: function (err) {
                wx.hideLoading();
                // console.log(err, 3333333333)
              }
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '授权失败，是否重新授权？',
              showCancel: true,
              success: function (res) {
                if (res.cancel) {
                  wx.switchTab({
                    url: '/pages/index/index'
                  })
                }
              }
            })
          }
        }
      })
    } else if (openId) {  //如果缓存中已经存在  那就是已经登录过
      console.log('已经登陆')
      app.globalData.openId = openId.openid
      // resolve(openId);
    } else {
      reject();
    }
  })
}

const fail = () => {
  wx.navigateTo({
    url: '/pages/authorize/index'
  })
}


const httpPost = (url, data) => {
  console.log(data, '这里是---httpGet---携带的数据（in utils.js）')

  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.baseUrl + url,
      method: 'POST',
      data: data,
      success: function (res) {
          console.log(res,'这里是---后台---里面返回的数据（in utils.js）')
        if (res.statusCode === 200) {
          resolve(res.data);
        }
      }
    })
  })
}
const httpGet = (url, data) => {
  console.log(data, '这里是---httpGet---携带的数据（in utils.js）')

  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.baseUrl + url,
      type: 'GET',
      data: data,
      success: function (res) {
        console.log(res, '这里是---后台---里面返回的数据（in utils.js）')
        if (res.statusCode === 200) {
          resolve(res.data);
        }
      }
    })
  })
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
module.exports = {
  formatTime: formatTime,
  httpPost: httpPost, 
  httpGet: httpGet, 
  telExp: telExp,
  wxLogin: wxLogin,
  fail: fail
}
