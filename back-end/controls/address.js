let moment = require('moment');
let func = require('../sql/func');



function formatData(rows) {
	return rows.map(row => {
		let date = moment(row.create_time).format('YYYY-MM-DD');
		return Object.assign({}, row, {
			create_time: date
		});
	});
}



module.exports = {
		
	// 获取商品列表
	
	fetchAll (req, res) {
		let openid =req.query.openid;
		let sql, arr ;
        console.log(openid,'openid')
        // console.log(req.qury,'openid')
	

        sql ='select * from address where openid =? and isdelet=?';
        arr = [openid,0];


        func.connPool(sql, arr, (err, rows) => {
            console.log(rows,openid,'openid')
            res.json({
                code: 200,
                msg: 'ok',
                resultList: rows
            });

        });
	
	},
	

	
	
	
	// 获取地址详情

	fetchById(req, res) {
		let openid = req.query.openid;
		let address_id = req.query.address_id;
        console.log(res.query)
		let sql = 'select * from address WHERE openid = ? and id=?';
		let arr = [openid,address_id];

		func.connPool(sql, arr, (err, rows) => {

			res.json({
				code: 200,
				msg: 'ok',
				resultList: rows
			});
		});


	},

	
	

	// 添加|更新 地址
	addOne(req, res) {
		let address_id = req.body.address_id;
		// console.log(member_id);

        let {username,mobile,province,city, district,address, openid} = req.body;

		let sql, arr;

		sql = 'INSERT INTO address(username,mobile,province,city, district,address,openid) VALUES(?,?,?,?,?,?,?)';
		arr = [username,mobile,province,city, district,address,openid];

		func.connPool(sql, arr, (err, rows) => {
			if (address_id) {
				// 更新
				sql = 'UPDATE address SET isdelet =?  WHERE id=? and openid=?';
				arr = [1,address_id,openid];
				func.connPool(sql, arr, (err, rows) => {
					res.json({
						code: 200,
						msg: 'done'
					});
				});

			}else {
				res.json({
					code: 200,
					msg: 'done'
				});
			}
		});


	},


	// 删除

	deleteOne(req, res) {

		let address_id = req.query.address_id;
        let openid = req.query.openid;
        let sql = 'UPDATE address SET isdelet= ? WHERE openid = ? and id=?' ;
        // let sql = 'DELETE  from address WHERE address_id =?,openid=?';
        
	
		let arr = [1,openid,address_id];

		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});

    },
    
    // 设置默认地址

	defaultOne(req, res) {

		let {address_id,openid,state} = req.query;
        let sql = 'UPDATE address SET state= ? WHERE openid = ? and state ' ;
		let arr = [0,openid,1];

        let sql1 = 'UPDATE address SET state= ? WHERE openid = ? and id=?' ;
        let arr1 = [state,openid,address_id];
	

		func.connPool(sql, arr, (err, rows) => {
            
            func.connPool(sql1, arr1, (err, rows) => {
                res.json({
                    code: 200,
                    msg: 'done'
                });
            });
		});

	},



	// 批量删除
	deleteMulti(req, res) {
		let member_id = req.body.member_id;

		let sql = 'DELETE  from members WHERE member_id in ?';
		let arr = [[member_id]];

		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});



	},



	// 权限变更
	changeRole(req, res) {
		let change_role = req.body.change_role;

		let member_id = req.body.member_id;
		
	
		
		
			let sql = 'UPDATE members SET membership_level= ? WHERE member_id = ?' ;
		
		let arr = [change_role,member_id];
		
		func.connPool(sql, arr, (err, rows) => {
			res.json({
				code: 200,
				msg: 'done'
			});
		});


	},

};
