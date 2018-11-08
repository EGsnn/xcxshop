<template>
    <div>
        <div style="margin-bottom:30px">	
            <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/admin/order-list' }">订单列表</el-breadcrumb-item>
            <el-breadcrumb-item>订单详情</el-breadcrumb-item>
            </el-breadcrumb>	
        </div>	


        <el-row>
        <el-col :span="24"><div class="grid-content bg-purple-dark "><span class="cldack">订单状态：</span><span class="title">{{formData.state_name}}</span></div></el-col>
        </el-row>
        <el-row>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">订单号: </span>{{formData.order_num}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">下单时间: </span>{{formData.create_time}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">付款时间: </span>{{formData.paid_at}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><el-button @click="reload()" type="success">刷新页面</el-button></div></el-col>
        </el-row>

        <el-row>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">快递单号: </span>{{formData.express_num}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">订单金额: </span>{{formData.order_price}}元</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">实际付款金额: </span>{{formData.actually_paid}}元</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
        </el-row>


        <el-row>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">收件人姓名: </span>{{formData.username}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">手机号: </span>{{formData.mobile}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">收件地址: </span>{{formData.province}} {{formData.city}} {{formData.district}} {{formData.address}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
        </el-row>

        <el-row>
        <el-col :span="6"><div class="grid-content bg-purple"><span class="cldack">备注信息: </span>{{formData.remark}}</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
        </el-row>

        <el-row>
        <el-col :span="24"><div class="grid-content bg-purple-dark "><span class="cldack">购买商品：</span></div></el-col>
        </el-row>

        <el-table
        :data="formData.goods_detail">
            <el-table-column
                prop="goods_id"
                label="商品ID"
                width="100">
            </el-table-column>
            <el-table-column
                prop="goods_name"
                label="商品名称"
                width="230">
            </el-table-column>
            <el-table-column
                prop="goods_price"
                label="价格"
                width="120">
            </el-table-column>
            <el-table-column
                prop="buy_num"
                label="购买数量"
                width="100">
            </el-table-column>
            
            <el-table-column
                label="状态"
                width="120">
                <template scope="scope">
                    <span>{{scope.row.state===1?'申请退款':scope.row.state===2?'退款完成':scope.row.state===3?'拒绝退款':scope.row.state===0?'购买中':''}}</span>
                </template>
            </el-table-column>
            <el-table-column
                prop="refund_time"
                label="申请退款时间"
                width="180">
            </el-table-column>
            <el-table-column
                prop="upData_time"
                label="审核时间"
                width="180">
            </el-table-column>
            <el-table-column label="操作" width="300">
                <template  scope="scope">
                    <el-button
                        size="small"
                        type="success"
                        v-if="scope.row.state === 1"
                        @click="refundOne(scope.row,2)">同意退款
                    </el-button>
                    <el-button
                        size="small"
                        type="danger"
                        v-if="scope.row.state === 1"
                        @click="refundOne(scope.row,3)">拒绝退款
                    </el-button>
                </template>
            </el-table-column>


        </el-table>

        <div class="expressData" >
            <h4>快递信息：</h4>
            <p v-if="expressHas">加载中...</p>
            <p v-if="expressText">{{expressText}}</p>
            <p v-for="item in expressData"  :key="item.id">{{item.context}}</p>
        </div>

    </div>
</template>

<script>
export default {
  name: "list",

  data() {
    return {
        isNew: 1, // 是否是添加
        expressHas:false,
        expressText:'',
        formData: {},
        expressData:[],
        multipleSelection: [],
        load: false // loading
    };
  },
    inject: ['reload'],

  methods: {
    
    onCancel() {
      this.$router.push("/admin/order-list");
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    refundOne(row,state){
        let name = state ===2?'确定同意退款申请？':'确定拒绝退款申请？';
        console.log(row.order_num)

         this.$confirm(name, '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
          .then(() => {
            
            this.func.ajaxPost(this.api.orderRefund, {
                order_num: row.order_num,
                goods_id: row.goods_id,
                state:state
            }, res => {
                if (res.data.code === 200) {
                    this.$message({
                        type: 'info',
                        message: '保存修改'
                    });
                    this.reload();
                }
            });
          })
          .catch(action => {
            this.$message({
              type: 'info',
              message: action === 'cancel'
                ? '放弃保存并离开页面'
                : '停留在当前页面'
            })
          });
        
    },
    express(num){
        if(!num){
            return ;
        }
        this.expressHas = true;

        this.func.ajaxGet(this.api.kuaidi+'?num='+num,
        res => {
            this.expressHas = false;
            if(res.data.status === "200" ){
                this.expressData = res.data.data;
            } else {
                this.expressText =  res.data.message;
            }
            console.log(res.data);
        });
    }
  },
    
  created() {
    let { order_num, openid } = this.$route.query;
    if (order_num) {
      // this.isNew = 0;
        this.func.ajaxPost(this.api.orderDetail,{
            order_num,
            openid
        },
        res => {
            this.formData = res.data.resultList;
            console.log(res.data.resultList.express_num);
            this.express(res.data.resultList.express_num)
            this.load = false;
        });
      
    }
  }
};
</script>
<style>
.title {
    font-size: 26px;
    font-weight: bold;
}
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    /* background: #99a9bf; */
  }
  .bg-purple {
    /* background: #d3dce6; */
  }
  .bg-purple-light {
    /* background: #e5e9f2; */
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    /* background-color: #f9fafc; */
  }
  .cldack {
      color: #666;
  }
  .expressData {
      margin-top: 20px;
  }
</style>