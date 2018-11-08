<template>
    <div class="admin-list">
		
		
		<div style="margin-bottom:30px">	
	<el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>订单管理</el-breadcrumb-item>
  <el-breadcrumb-item>退款列表</el-breadcrumb-item>
 
</el-breadcrumb>	
		
	</div>		
		
		
<el-form :inline="true"  class="demo-form-inline">
	
	 <el-form-item label="订单状态">
    <el-select v-model="state" @change="search" placeholder="请选择订单状态">
      <el-option label="全部" value="-1"></el-option>
      <el-option label="申请中" value="1"></el-option>
      <el-option label="退款完成" value="2"></el-option>
	 <el-option label="退款失败" value="3"></el-option>
    </el-select>
  </el-form-item>
	
	
	
	
	
	
  <el-form-item >
    <el-input v-model="order_num" placeholder="筛选订单号"></el-input>
  </el-form-item>
	  <el-form-item >
    <el-button type="primary" @click="search">查询</el-button>
    <el-button type="success" @click="reload()">刷新</el-button>
  </el-form-item>
		
		
		<el-text type="success">退款需要和客户联系,进行线下转账</el-text>
	
</el-form>
		
        <el-table
            v-loading='load'
            ref="multipleTable"
            @selection-change="handleSelectionChange"
            :data="tableData"
            border
            tooltip-effect="dark"
            style="width: 100%">
            <el-table-column
                type="selection">
            </el-table-column>

			<el-table-column
                prop="order_num"
                width="200"
                label="订单号">
            </el-table-column>


            <el-table-column
                prop="state_name"
                width="100"
                label="退款状态">
            </el-table-column>

			<el-table-column
                prop="goods_name"
                width="200"
                label="商品名称">
            </el-table-column>


            <el-table-column
                prop="goods_price"
                width="100"
                label="单价">
            </el-table-column>

            <el-table-column
                prop="buy_num"
                label="数量">
            </el-table-column>

            <el-table-column
                prop="refund_time"
                width="200"
                label="申请日期">
            </el-table-column>
            
            
            <el-table-column
                prop="upData_time"
                width="200"
                label="审核日期">
            </el-table-column>
        

            <el-table-column label="操作" fixed="right" width="300">
                <template scope="scope">
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
                    <el-button
                        size="small"
                        @click="editGoods(scope.row)">查看订单
                    </el-button>
                </template>
            </el-table-column>

        </el-table>
    
<div class="pagination">
	
	<el-pagination @current-change="handleCurrentChange" layout="prev, pager, next" :total="500">
	</el-pagination>
</div>

    </div>
</template>

<script>

    export default {
        name: 'list',
        data() {
            return {
               tableData: [],
				cur_page: 1,
				state: '1',
				order_num:'',
                multipleSelection: [],

                load: false, // loading
            }
        },
        inject: ['reload'],
        methods: {
          
			fetchList() {
		
                this.load = true;
                    var reqParams ={
                        goods_id:this.goods_id,
                        order_num:this.order_num,
                        cur_page :this.cur_page,
                        state :this.state,
                    };
                    console.log(this.state);
                this.func.ajaxPost(this.api.refundList,reqParams,res => {
                    
                    this.tableData = res.data.resultList;
                    console.log( res.data.resultList)
                    this.load = false;
                });
				
		
			},
			
		//分页
			handleCurrentChange(val) {
				this.cur_page = val;
				this.fetchList();
			},

			//搜索
			search() {
                // this.reload();
				this.fetchList();
			},
  // 删除
            handleDelete(row) {
                this.func.ajaxPost(this.api.orderDelete, {order_id: row.order_id}, res => {
                    if (res.data.code === 200) {
                        let index = this.tableData.indexOf(row);
                        this.tableData.splice(index, 1);
                        this.$message.success('删除成功');
                    }
                });
            },


            // 修改
            editGoods (row) {
                this.$router.push({path: '/admin/order-form', query: {order_num: row.order_num,openid: row.openid}});
            },


            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            expressInput(row){
                this.$prompt('请输入快递单号', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                }).then(({ value }) => {
                    this.func.ajaxPost(this.api.orderExpress, {
                            order_num: row.order_num,
                            express_num:value
                        }, res => {
                            if (res.data.code === 200) {
                                this.$message({
                                    type: 'info',
                                    message: '保存修改'
                                });
                                this.reload();
                            }
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消输入'
                    });       
                });
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
                        ? '取消修改'
                        : '取消修改'
                    })
                });
                
            },
        },

		
		created() {
			this.fetchList();
		},
      //时间格式化
        dateFormat:function(row, column) {
               var date = row[column.property];
          if (date == undefined) {
             return "";
          }
          return moment(date).format("YYYY-MM-DD HH:mm:ss");
        }

    }
</script>