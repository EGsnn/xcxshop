// http://www.kuaidi100.com/autonumber/autoComNum?resultv2=1&text=9893408007637
// http://www.kuaidi100.com/query?type=youzhengguonei&postid=9893408007637

var request = require('request');
const getKuaidi= async (num,callBack)=>{
    request.get({
        uri: `http://www.kuaidi100.com/autonumber/autoComNum?resultv2=1&text=`+num,
        json: true,
    }, (err, response, data) => {
        // console.log(data,response,err)
        request.get({
            uri: ` http://www.kuaidi100.com/query?type=`+data.auto[0].comCode+`&postid=`+num,
            json: true,
        }, (err, response, res) => {
            callBack(res)
        // console.log(res)
        });
    });
}
module.exports = getKuaidi;