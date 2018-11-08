var request = require('request');
const wxLogin= async (req,res)=>{
    request.get({
        uri: `https://api.weixin.qq.com/sns/jscode2session`,
        json: true,
        qs: {
            grant_type: ``,
            appid:'',
            secret: '',
            js_code: req.query.code
        }
    }, (err, response, data) => {
        res(err, response, data);
    });
}
module.exports = wxLogin;