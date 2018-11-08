let express = require('express');

let user = require('../controls/user');
let member =require('../controls/member');
let goodstype = require('../controls/goodstype');
let goods = require('../controls/goods');
let order = require('../controls/order');
let address = require('../controls/address');

let api = require('../api');
let upload = require('../utils/upload');


let router = express.Router();




// orders
router.post(api.orderList, order.fetchAll); //订单列表

router.post(api.orderDetail, order.fetchById); //订单详情
router.post(api.orderAdd, order.addOne);       //新增订单
router.post(api.orderDelete, order.deleteOne); //订单删除
router.post(api.orderCancel, order.cancelOne); //订单取消
router.post(api.orderConfirm, order.confirmOne); //确认收货

router.post(api.orderRefund, order.refundOne); //申请退款
router.post(api.refundList, order.fetchAllRefund); //获取退款列表

router.post(api.orderExpress, order.updataOne); //获取退款列表



router.post(api.orderPay, order.get_prepayid); //获取微信支付参数
router.post(api.orderNotify, order.notifyFun); //微信支付成功回调



// kuaidi
router.get(api.kuaidi , order.kuaidiDetail); //快递信息





// user
router.post(api.userList, user.fetchAll);
router.get(api.userLogout, user.logout);
router.get(api.userAutoLogin, user.autoLogin); // 自动登录

router.post(api.userAdd, user.addOne);
router.post(api.userDelete, user.deleteOne);
router.post(api.userDeleteMulti, user.deleteMulti);
router.post(api.userLogin, user.login); // 登录
router.post(api.userChangeRole, user.controlVisit, user.changeRole); // 更改权限






// members  //小程序用户
router.post(api.memberList, member.fetchAll);
router.post(api.memberDetail, member.fetchById);
router.post(api.memberAdd, member.addOne);
router.post(api.memberDelete, member.deleteOne);
router.post(api.memberDeleteMulti, member.deleteMulti);
router.post(api.memberChangeRole,  member.changeRole); // 更改会员等级

// members 小程序
router.get(api.memberEnter, member.enter); // 小程序登录




// address
router.get(api.addressList, address.fetchAll);
router.get(api.addressDetail, address.fetchById);
router.post(api.addressAdd, address.addOne);
router.get(api.addressDelete, address.deleteOne);
router.get(api.addressDefault, address.defaultOne);





// goodstype
router.post(api.goodstypeList, goodstype.fetchAll);
router.post(api.goodstypeDetail, goodstype.fetchById);
router.post(api.goodstypeAdd, goodstype.addOne);
router.post(api.goodstypeDelete, goodstype.deleteOne);





// goods
router.post(api.goodsList, goods.fetchAll);
router.post(api.goodsType, goods.fetchType);
router.post(api.goodsDetail, goods.fetchById);
router.post(api.goodsAdd, goods.addOne);
router.post(api.goodsDelete, goods.deleteOne);
router.post(api.goodsDeleteMulti, goods.deleteMulti);

// router.post(api.goodsUploadImg, upload.single('avatar'), goods.uploadGoodsImg); // 图片上传
router.post(api.goodsUploadImg, goods.uploadGoodsImg); // 图片上传











module.exports = router;