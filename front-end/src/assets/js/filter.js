/**
 * Create by DragonYun on 2018/01/16
 * vue filter
 * @params{yyyy-MM-dd hh:mm:ss 或者 yyyy-MM-dd}
 */
/* eslint-disable */
import Vue from 'vue'
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

function formatDate(date, fmt) {
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

Vue.filter('dateFilter', function (date, fmt) {
  return formatDate(new Date(date), fmt)
})

// 全局的千分位过滤器
Vue.filter('moneyFilter', function (value) {
  if(!value) return value;
  if(value == 0) return 0;
  if(typeof(value) === 'number'){
    return value.toFixed(3).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }else if(typeof(value) === 'string'){
    return value.replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }else{
    return value
  }
})