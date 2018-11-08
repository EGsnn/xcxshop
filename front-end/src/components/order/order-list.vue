<template>
    <div class="admin-list">
		
		
		<div style="margin-bottom:30px">	
	<el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>订单管理</el-breadcrumb-item>
  <el-breadcrumb-item>订单列表</el-breadcrumb-item>
 
</el-breadcrumb>	
		
	</div>		
		
		
<el-form :inline="true"  class="demo-form-inline">
	
	 <el-form-item label="订单状态">
    <el-select v-model="state" @change="search" placeholder="请选择订单状态">
      <el-option label="全部" value="-1"></el-option>
      <el-option label="加入购物车" value="0"></el-option>
      <el-option label="已付款/待发货" value="1"></el-option>
      <el-option label="已发货" value="100"></el-option>
	 <el-option label="已完成" value="2"></el-option>
	 <el-option label="已取消" value="4"></el-option>
    </el-select>
  </el-form-item>
	
	
	
	
	
	
  <el-form-item >
    <el-input v-model="order_num" placeholder="筛选订单号"></el-input>
  </el-form-item>
	  <el-form-item >
    <el-button type="primary" @click="search">查询</el-button>
  </el-form-item>
		
		
    <el-button @click="reload()" type="success">刷新</el-button>
		
	
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
                prop="order_id"
                width=80
                label="序号">
            </el-table-column>

			<el-table-column
                prop="order_num"
                width="200"
                label="订单号">
            </el-table-column>
			
            <el-table-column
                prop="username"
                label="收件人">
            </el-table-column>
			
				
		   <el-table-column
                prop="order_price"
                label="订单价格（元）">
            </el-table-column>

			<el-table-column
                prop="actually_paid"
                label="实际支付（元）">
            </el-table-column>
			


            <el-table-column
                width="220"
               label="下单时间">
                <template scope="scope">
                    <el-icon name="time"></el-icon>
                    <span style="margin-left: 10px">{{ scope.row.create_time  }}</span>
                </template>
            </el-table-column>

            
			<el-table-column
                prop="express_num"
                width="180"
                label="快递单号">
            </el-table-column>
			
			
			
			<el-table-column
                prop="state_name"
                width="100"
                label="订单状态">
            </el-table-column>
			
			
			
            

            <el-table-column
                width="220"
               label="发货时间">
                <template scope="scope">
                    <el-icon name="time"></el-icon>
                    <span style="margin-left: 10px">{{ scope.row.express_time  }}</span>
                </template>
            </el-table-column>


            <el-table-column label="操作" fixed="right" width="300">
                <template scope="scope">
                    <el-button
                        v-if="scope.row.state ===1"
                        size="small"
                        type="primary"
                        @click="expressInput(scope.row)">{{scope.row.express_num?'修改快递单号':'发货'}}
                    </el-button>
                    <el-button
                        size="small"
                        @click="editGoods(scope.row)">查看订单
                    </el-button>
                    <el-button
                        size="small"
                        type="danger"
                        @click="handleDelete(scope.row)">删除订单
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
				state: '',
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
					state:this.state,
					order_num:this.order_num,
                    cur_page :this.cur_page
				};
		console.log(this.state);
                this.func.ajaxPost(this.api.orderList,reqParams,res => {
                    
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