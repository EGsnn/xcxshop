const crypto = require('crypto');
const xml2js = require('xml2js');
var request = require('request');
const getClientPayConfig = (prepay_id)=>{
    let obj = {
        appId: '',
        timeStamp: String(Math.floor(Date.now()/1000)),
        nonceStr: get_nonce_str(32),
        package: 'prepay_id=' + prepay_id,
        signType: 'MD5'
    }
    let arr = Object.keys(obj).sort().map(item => {
        return `${item}=${obj[item]}`;
    });
    // 拼接商户key并对齐进行签名
    let str = arr.join('&') + '&key=' + '';//appId=wxf8600b48303b5dfb&nonceStr=0x3jm47en8hy6zx9d3a6qqevhf8dzeqf&package=prepay_id=wx2017110411492613492815520529050900&signType=MD5&timeStamp=1509767366&key=Lzy12345678901112131415161718192
    obj.paySign = getSign(str);
    return obj;
}
const prepay = async ({openid,orderId,desc,totalPrice,spbill_create_ip},callBack)=> {
    // 通过查阅文档,调用统一下单有10个参数是必须的
    let obj = {
        appid: '',
        mch_id:'',
        nonce_str: get_nonce_str(32),
        body: desc,
        out_trade_no: orderId,
        total_fee: parseInt(totalPrice * 100),
        spbill_create_ip,
        notify_url:'https://www.marssnow.com/qly/api/order/pay/notify',
        trade_type:'JSAPI',
        openid
    }
    // console.log(obj)
    // js的默认排序即为ASCII的从小到大进行排序(字典排序)
    let arr = Object.keys(obj).sort().map(item => {
        return `${item}=${obj[item]}`;
    });
       // 这里拼接签名字符串的时候一定要注意: 商户的key是要单独拿出来拼在最后面的
    let str = arr.join('&') + '&key=' + '';
    // appid=wxf8600b***b5dfb&body=德胜村&mch_id=1490909372&nonce_str=plfbp2bhr0id1z6aktmndfot94hkewcv&notify_url=https://server.***.cn/wechat/pay_notify&openid=oFm4h0WvnQWB4ocFmdPzsWywlE8c&out_trade_no=20150806125346&spbill_create_ip=127.0.0.1&total_fee=56600&trade_type=JSAPI&key=Lzy1234567890111***5161718192
    
    obj.sign = getSign(str);
    let res;
    try{
        // 调用微信统一下单接口拿到 prepay_id
        res = await wechatPay(obj);
        let {prepay_id} = res;
        if(prepay_id){
            res = getClientPayConfig(prepay_id)
        }
        // console.log(res);
    }catch(e){
        res = e;
        // console.log(e);
    }
    // console.log(res);
    callBack(res);
}


/**
 * 统一下单 prepay_url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
 * @param {Object} obj 调用统一下单的必须参数
 */ 
const wechatPay = (obj)=>{
    let xml = json2xml(obj);
    // console.log(xml)
    return new Promise((resolve,reject)=>{
        // 这里用了reques库,不熟悉的同学可以看看相关文档 https://github.com/request/request
        // 总之就是向微信的统一下单接口提交一个xml
        request({method:'POST',url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',body: xml},(err,res, body)=>{
            if(err){
                reject(err);
            }else{
                //如果成功即可得到微信返回参数
                let obj = parseXml(body).xml;
                console.log(obj,'1111111111');
                resolve(obj);
            }
        });
    });
}


/**
 * 对指定字符串进行md5加密
 * @param {String} str 
 */
const getSign = (str)=>{
    console.log(str)
    let hash = crypto.createHash('md5').update(str,'utf8');
    return hash.digest('hex').toUpperCase();
}

/**
 * 转化xml用了xml2js库  
    https://github.com/Leonidas-from-XIV/node-xml2js
 * @param {Object} obj 
 */
const json2xml = (obj)=>{
    let builder = new xml2js.Builder({
        headless:true,
        allowSurrogateChars: true,
        rootName:'xml',
        cdata:true
    });
    var xml = builder.buildObject(obj);
    return xml;
}



const parseXml = (xml)=>{
    let {parseString} = xml2js;
    let res;
    parseString(xml,  {
        trim: true,
        explicitArray: false
    }, function (err, result) {
        res = result;
    });
    return res;
} 



/**
 * 生成指定长度的随机数
 * @param {*int} len 
 */
const get_nonce_str = (len)=>{
    let str = '';
    while(str.length < len){
        str +=  Math.random().toString(36).slice(2);
    }
    return str.slice(-len);
}


module.exports = prepay;