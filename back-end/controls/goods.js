let sql = require('../sql/sql');
let moment = require('moment');
let func = require('../sql/func');
let qiniuUpload = require('../utils/qiniu');
let path = require('path');
// var multipart = require('connect-multiparty');
const fs = require('fs');
var multiparty = require('multiparty');



function formatData(rows) {
	return rows.map(row => {
		let date = moment(row.create_time).format('YYYY-MM-DD');
		return Object.assign({}, row, {
			create_time: date
		});
	});
}
// 删除文件
function deleteFolder(path) {
	var files = [];
	if( fs.existsSync(path) ) {
		files = fs.readdirSync(path);
		files.forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolder(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

module.exports = {
		//图片上传
		uploadGoodsImg(req, res) {
			console.log('-------------',req.query,'qiniu')

			var form = new multiparty.Form(); //新建表单
			//设置编辑
			form.encoding = 'utf-8';
			//设置图片存储路径
			form.uploadDir = "./images";
			form.keepExtensions = true; //保留后缀
			//表单解析
			form.parse(req, function (err, fields, files) {
				// var filesTmp = JSON.stringify(files, null, 2);
				
				function isType(str) {
					if (str.indexOf('.') == -1) {
						return '-1';
					} else {
						var arr = str.split('.');
						return arr.pop();
					}
				}

				if (err) {
					console.log(new Date().toString());
					console.log(err);
					var u = {
						"error": 1,
						"message": '请上传5M以下图片'
					};
					res.end(JSON.stringify(u));
					return false;
				} else {
					console.log(files)
					var inputFile = files.file[0];
					var uploadedPath = inputFile.path;
					var type = isType(inputFile.originalFilename);
					/*var dstPath = './public/files/' + inputFile.originalFilename;//真实文件名*/
					var name = new Date().getTime() + '.' + type; /*以上传的时间戳命名*/
					var dstPath = './images/' + name; /*路径需要对应自己的项目更改*/
					console.log("type---------" + type);

					if (type == "jpg" || type == "png" || type == "exe") {
						console.log('可以上传');
						//重命名为真实文件名
						fs.rename(uploadedPath, dstPath, function (err) {
							if (err) {
								console.log('rename error: ' + err);
							} else {
								console.log('上传成功')
								qiniuUpload(dstPath).then(qnData => {
									
									// console.log(qnData.url, req)
									if(qnData.key === name){
										func.connPool('UPDATE goods SET imgs = ? WHERE goods_id = ?', [qnData.url,  req.query.id], (err, rows) => {
											// rows = formatData(rows);
											console.log(rows);
											// deleteFolder(dstPath);
											fs.unlink(dstPath);
											res.json({
												code: 200,
												msg: 'ok',
												resultList: "上传成功"
											});
											// res.end(JSON.stringify(res));
										});
									} else {
										var data = {
											"code": 0,
											"msg": "上传失败"
										};
										res.end(JSON.stringify(data));
									}
								});
							}
						});
						
						// console.log(JSON.stringify(data))
						


					} else {
						fs.unlink(uploadedPath, function (err) {
							if (err) {
								return console.error(err);
							}
							console.log("文件删除成功！");
						});

						console.log('不能上传' + inputFile.originalFilename);
						res.writeHead(200, {
							'content-type': 'text/plain;charset=utf-8'
						});
						var data = {
							"code": 0,
							"msg": "上传失败"
						};
						res.end(JSON.stringify(data));

					}
				}
			});

			// let absolutePath = path.resolve(__dirgoods_name, req.file.path);
			// let a = 2;
			// res.send({
			// 	code: 200,
			// 	msg: 'done',
			// 	url: absolutePath
			// });

				


			},
			// 获取商品列表
			fetchAll(req, res) {
					let cur_page = req.body.cur_page;
					let goods_name = req.body.goods_name;
					let sql, arr, endLimit, startLimit;

					console.log(req.body.cur_page);


					endLimit = cur_page * 10;
					startLimit = endLimit - 10;
					if (goods_name) {

						sql = 'select * from goods where goods_name LIKE ?';
						arr = [goods_name+'%'];

					} else {

						sql = 'select * from goods  limit ?, ?';
						arr = [startLimit, endLimit];
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




				//商品类型

				fetchType(req, res) {

					let sql = 'select * from goodstype  ';

					func.connPool(sql, (err, rows) => {
						rows = formatData(rows);
						res.json({
							code: 200,
							msg: 'ok',
							resultList: rows
						});

					});



				},




				// 获取商品详情

				fetchById(req, res) {
					let goods_id = req.body.goods_id;

					let sql = 'select * from goods WHERE goods_id = ?';
					let arr = [goods_id];

					func.connPool(sql, arr, (err, rows) => {

						rows = formatData(rows);

						// rows[0].imgs = [{url:rows[0].imgs}]

						console.log(rows);

						res.json({
							code: 200,
							msg: 'ok',
							resultList: rows[0]
						});
					});


				},




				// 添加|更新 商品
				addOne(req, res) {
					let goods_id = req.body.goods_id;
					console.log(goods_id);
					let goods_name = req.body.goods_name;
					let goods_price = req.body.goods_price;
					let goods_type = req.body.goods_type;
					let goods_typename = req.body.goods_typename;
					let inventory = req.body.inventory;

					let imgs = req.body.imgs;
					let onsale = req.body.onsale;
					let goods_details = req.body.goods_details;



					let sql, arr;



					if (goods_id) {
						// 更新
						sql = 'UPDATE goods SET goods_name=?, goods_price=? ,goods_type =? ,goods_typename =? ,inventory =? ,imgs =?,onsale=?,goods_details =?  WHERE goods_id=?';
						arr = [goods_name, goods_price, goods_type, goods_typename, inventory, imgs, onsale, goods_details, goods_id];
					} else {
						// 新增
						sql = 'INSERT INTO goods(goods_name, goods_price,goods_type,goods_typename,inventory,imgs,onsale, goods_details) VALUES(?,?,?,?,?,?,?,?)';
						arr = [goods_name, goods_price, goods_type, goods_typename, inventory, imgs, onsale, goods_details];

					}



					func.connPool(sql, arr, (err, rows) => {
						res.json({
							code: 200,
							msg: 'done'
						});
					});




				},


				// 删除商品


				deleteOne(req, res) {

					let goods_id = req.body.goods_id;

					let sql = 'DELETE  from goods WHERE goods_id = ?';
					let arr = [goods_id];

					func.connPool(sql, arr, (err, rows) => {
						res.json({
							code: 200,
							msg: 'done'
						});
					});

				},




				// 批量删除
				deleteMulti(req, res) {
					let goods_id = req.body.goods_id;

					let sql = 'DELETE  from goods WHERE goods_id in ?';
					let arr = [
						[goods_id]
					];

					func.connPool(sql, arr, (err, rows) => {
						res.json({
							code: 200,
							msg: 'done'
						});
					});



				},




		};