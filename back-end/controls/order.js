let sql = require('../sql/sql');
let moment = require('moment');
let func = require('../sql/func');
let wxpay = require('../utils/wxpay');
let payCheck = require('../utils/payCheck');
let kuaidi = require('../utils/kuaidi');
let path = require('path');
const xml2js = require('xml2js').parseString;





function formatData(rows) {
	return rows.map(row => {
		let date;
		if(row.create_time){
			date = moment(row.create_time).format('YYYY-MM-DD hh:mm:ss');
		}
		let imgList ;
		if(row.goodsImgs){
			imgList = row.goodsImgs.split(',') ;
		}
		return Object.assign({}, row, {
			create_time: date,
			goodsImgs: imgList
		});
	});
}

function newNowDate (){
	let nowTime = new Date().getTime();
	 return moment(nowTime).format('YYYY-MM-DD hh:mm:ss');
}



module.exports = {

	// 获取订单列表

	fetchAll(req, res) {

		let {cur_page,state,openid,order_num} = req.body;
		let sql, arr, endLimit, startLimit;
		// state = state==-1? '*' : state;
		// console.log(state);


		startLimit = (cur_page-1) * 10;


		// console.log( openid)

		if ( openid) {
			var s = state==-1? '':'and a.state= ?';
			sql = 'select a.create_time,a.order_num,a.order_price,a.state,a.state_name,GROUP_CONCAT(c.imgs) as goodsImgs, COUNT(c.goods_id) as goodsCont '+
			'from orders as a LEFT JOIN order_detail as c on a.order_num = c.order_num '+
			'WHERE a.openid = ? '+ s +' GROUP BY a.order_num  order  by a.create_time DESC ';

			
			arr = state==-1?[openid]:[openid,state];
			func.connPool(sql, arr, (err, rows) => {
				console.log(rows)
				rows = formatData(rows);
				res.json({
					code: 200,
					msg: 'ok',
					resultList: rows
				});
	
			});
			return;

		} else if (order_num) {

			sql = 'select  a.*,c.username from orders  as a LEFT JOIN address as c on a.address_id = c.id   where a.order_num =?  order by a.create_time DESC';
			arr = [order_num];


		}  else if (state == 100) {

			sql = 'select  a.*,c.username from orders  as a LEFT JOIN address as c on a.address_id = c.id where a.state =? and a.express_num <> ?  order by a.create_time DESC limit ?, ?';
			arr = [1,'',startLimit, 10];


		}else if (state && state !== -1) {

			sql = 'select  a.*,c.username from orders  as a LEFT JOIN address as c on a.address_id = c.id where a.state =?  order by a.create_time DESC limit ?, ?';
			arr = [state,startLimit, 10];


		} else {

			sql = 'select a.*,c.username from orders  as a LEFT JOIN address as c on a.address_id = c.id order by a.create_time DESC limit ?, ?';
			arr = [startLimit, 10];
		}



		func.connPool(sql, arr, (err, rows) => {
			console.log(arr)
			rows = formatData(rows);
			res.json({
				code: 200,
				msg: 'ok',
				resultList: rows
			});

		});

	},



	// 获取  退款 列表

	fetchAllRefund(req, res) {
		let {openid, cur_page,state} = req.body;
		let sql ,arr ;

		startLimit = (cur_page-1) * 10;

		if(openid){
			sql = 'select * from order_detail  WHERE openid = ? and state <> ?  ';
			arr = [openid, 0];
		} else if(state && state !== '-1' ){
		console.log(state && state !== -1)
		sql = 'select * from order_detail  WHERE state = ?  order by refund_time DESC limit ?, ?';
			arr = [state,startLimit,10];
		}else{
		console.log(state,'dddddddddddddddd')
		sql = 'select * from order_detail  WHERE state <> ?  order by refund_time DESC limit ?, ?';
			arr = [0,startLimit,10];
		}


		func.connPool(sql, arr, (err, rows) => {
			rows = formatData(rows);
			res.json({
				code: 200,
				msg: 'ok',
				resultList: rows
			});
		});


	},



	// 获取小程序支付  所需参数prepayid等
	get_prepayid(req, res){
		let orderData = req.body;
		let {order_num,order_price,openid} = orderData;

		 wxpay({openid, orderId:order_num, desc:'全粮愈-消费', totalPrice:order_price, spbill_create_ip:'47.97.204.219'},function(resData){
			res.json({
				code: 200,
				msg: 'done',
				data:resData
			});
		});
		
	},


	

	//check 支付是否完成 
	notifyFun(req, res){
		let orderData = req.body;
		for(var key in orderData){
			orderData = key;
		}
		// console.log(orderData);//这里的json便是xml转为json的内容
		xml2js(orderData, function (err, json) {
			let {cash_fee,transaction_id,time_end,out_trade_no,openid,fee_type,result_code} = json.xml;
			console.log(transaction_id[0]);
			if(result_code[0] === 'SUCCESS'){
				result_code[0] = '支付成功';
			} else {
				result_code[0] = '支付异常';
			}
			let sql = 'UPDATE orders SET transaction_id= ?, paid_at=?,actually_paid=?,paid_remark=?,state=?,state_name=? WHERE openid = ? and order_num = ?';

			let arr = [transaction_id[0],time_end[0],cash_fee[0]/100,result_code[0],1,'正在打包', openid[0] , out_trade_no[0]];

			func.connPool(sql, arr, (err, rows) => {
				res.setHeader('content-type', 'application/x-www-form-urlencoded');
				res.send('<xml> <return_code><![CDATA[SUCCESS]]></return_code> <return_msg><![CDATA[OK]]></return_msg> </xml>');
				res.end();
			});
		});
		
	},



	// 更新订单 发货
	updataOne(req, res){
		let {openid,express_num,order_num} = req.body;

		let sql = 'UPDATE orders SET express_num = ?,express_time = ?,state_name = ? WHERE order_num=? ';

		let arr = [express_num,newNowDate () ,'已发货',order_num];
		console.log(arr);
		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});

	},


	// 添加|更新 订单
	addOne(req, res) {
		let orderData = req.body;
		
		let sql, arr;
		let {goods_detail,total_price,order_price,openid,address_id,remark} = orderData;
		// console.log(goods_detail);
		
		let nowtime = new Date(); 
		let order_num = nowtime.getFullYear()+'' + nowtime.getMonth() + nowtime.getDate() + Math.floor(nowtime.getTime()/1000) ;
		let create_time = nowtime.getTime();
		let state_name = '等待支付';




		sql = 'INSERT INTO orders(order_num,create_time,total_price,order_price,openid,address_id,state_name,remark) VALUES (?,?,?,?,?,?,?,?)';
		arr = [order_num,create_time,total_price,order_price,openid,address_id,state_name,remark];



		
		sql1 = 'INSERT INTO order_detail(order_num,goods_id,goods_name,buy_num,goods_price,imgs,openid) VALUES ?';
		var detailList = [];
		goods_detail.map(obj=>{
			let {goods_id,buy_num,goods_price,goods_name,imgs} = obj;
			detailList.push([order_num,goods_id,goods_name,buy_num,goods_price,imgs,openid]);
		});



		// console.log(detailList)
		// console.log(arr)
		func.connPool(sql, arr, (err, rows) => {
			func.connPoolArr(sql1, detailList, (err, rows) => {
				res.json({
					code: 200,
					msg: 'done',
					data:{
						order_num,
						order_price,
					}
				});
	
			});

		});

	},



	// 获取  订单详情

	fetchById(req, res) {
		let openid = req.body.openid;
		let order_num = req.body.order_num;
		console.log(order_num)
		let sql = 'select a.create_time,a.order_num,a.order_price,a.actually_paid,a.paid_at,a.state,a.state_name,a.remark,a.express_num,c.username,c.mobile,c.province,c.city,c.district,c.address from orders as a  LEFT JOIN address as c on a.address_id = c.id  WHERE a.openid = ? and a.order_num = ? ';
		let arr = [openid,order_num];

		let sql1 = 'select * from order_detail WHERE order_num = ?';
		let arr1 = [order_num];
		let orderDetail ;
		func.connPool(sql, arr, (err, rows) => {

			orderDetail = formatData(rows)[0];
			func.connPool(sql1, arr1, (err, rows1) => {
				orderDetail['goods_detail'] = formatData(rows1);
				console.log(orderDetail)
				res.json({
					code: 200,
					msg: 'ok',
					resultList: orderDetail
				});
			});
		});


	},




	



	// 删除订单

	deleteOne(req, res) {

		let member_id = req.body.member_id;
		let sql = 'DELETE  from members WHERE member_id =?';

		let arr = [member_id];

		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});

	},






	// 确认收货 订单
	confirmOne(req, res) {

		let {openid,order_num} = req.body;

		let sql = 'UPDATE orders SET state = ?,state_name = ? WHERE order_num=? and openid = ?';

		let arr = [2,'已完成',order_num, openid];

		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});


	},





	// 申请退款  单个商品

	refundOne(req, res) {

		let {goods_id,order_num,state} = req.body;
		let sqlTime = state?'upData_time =?':'refund_time =?';
		let sql = 'UPDATE order_detail SET state = ? ,state_name = ?, '+sqlTime+' WHERE order_num=? and goods_id = ?';
		let state_name;
		state_name= state=== 2?'退款完成':state===3?'退款失败':'申请中';
		state = state? state: 1;

		let arr = [state,state_name ,newNowDate () , order_num, goods_id];


		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});


	},




	// 取消 订单
	cancelOne(req, res) {

		let {openid,order_num} = req.body;

		let sql = 'UPDATE orders SET state = ?,state_name = ? WHERE order_num=? and openid = ?';

		let arr = [4,'已取消',order_num, openid];

		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});


	},

	// 快递详情
	kuaidiDetail(req, res){
		let {num} = req.query;

		kuaidi(num,function(data){
			res.json(data);
		})
	}
};
