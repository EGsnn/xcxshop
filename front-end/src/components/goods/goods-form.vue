<template>
    <el-form ref="form" :model="form" label-width="80px" class="form-contain">

        <el-form-item label="商品名称">
            <el-input v-model="form.goods_name"></el-input>
        </el-form-item>

        <el-form-item label="商品价格">
            <el-input placeholder="请输入内容" v-model="form.goods_price" type='number'>
                <template slot="append">元</template>
</el-input>
</el-form-item>


<el-form-item label="商品库存">
	<el-input-number v-model="form.inventory" :min="0"></el-input-number>
</el-form-item>

  <el-form-item label="商品类型">	  
	 <el-select v-model="form.goods_typename"     placeholder="请选择商品类型">
    <el-option
      v-for="item in goodsTpyeList"
      :key="item.goods_typename"
      :label="item.goods_typename"
      :value="item.goods_typename">
    </el-option>
  </el-select>    
  </el-form-item>
	  


<el-form-item label="商品状态">
	<el-radio-group v-model="form.onsale">
		<el-radio :label="0">下架</el-radio>
		<el-radio :label="1">上架</el-radio>

	</el-radio-group>
</el-form-item>


<el-form-item label="商品详情">
	<el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="form.goods_details">
	</el-input>

</el-form-item>



<el-form-item label="上传图片">
<el-upload
  :action= "UploadUrl()"
  list-type="picture-card"
  :on-preview="handlePictureCardPreview"
  :on-success="UploadSuccess"
  :file-list="imgList"
  :on-remove="handleRemove">
  <i class="el-icon-plus"></i>
</el-upload>
<el-dialog v-model="dialogVisible" size="tiny">
  <img width="100%" :src="dialogImageUrl" alt="">
</el-dialog>

</el-form-item>


<el-form-item>
	<el-button type="primary" @click="onSubmit">{{isNew ? '添加商品' : '修改商品'}}</el-button>
	<el-button @click="onCancel">取消</el-button>
</el-form-item>

</el-form>
</template>

<script>
export default {
  name: "form",

  data() {
    return {
      isNew: 1, // 是否是添加
      imgUpload: "",
      form: {
        goods_id: undefined,
        goods_name: "",
        goods_price: 0,
        onsale: "",
        inventory: 0,
        imgs: '',
        goods_type: "",
        goods_typename: ""
	  },
	  imgList:[],
      goodsTpyeList: "",
      dialogImageUrl: "",
      dialogVisible: false
    };
  },

  methods: {
    onSubmit() {
      if (!this.form.goods_name) {
        this.$message.warning("请填写完整信息");
        return;
      }

      this.func.ajaxPost(this.api.goodsAdd, this.form, res => {
        if (res.data.code === 200) {
          this.$message.success("操作成功");
          this.$router.push("/admin/goods-list");
        }
      });
    },

    goodsType() {
      this.func.ajaxPost(this.api.goodsType, this.form, res => {
        if (res.data.code === 200) {
          this.goodsTpyeList = res.data.resultList;
          console.log(res.data.resultList);
        }
      });
    },

    onCancel() {
      this.$router.push("/admin/goods-list");
    },

    UploadUrl: function() {
      return "http://localhost:9999/api/goods/upload-img?id=" + this.$route.query.goods_id;
    },

    handleRemove(file, fileList) {
      console.log(file, fileList,'1111111111111');
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.form.imgs = file.url;
      //       this.dialogVisible = true;
	},
	UploadSuccess(file, fileList){
      console.log(file, fileList,'12131231212');

	}
  },

  created() {
    let goods_id = this.$route.query.goods_id;

    if (goods_id) {
      this.isNew = 0;

      this.func.ajaxPost(
        this.api.goodsDetail,
        {
          goods_id
        },
        res => {
          console.log(res.data.resultList,1212);

          this.form = res.data.resultList;
          this.form.goods_id = res.data.resultList.goods_id;
          this.imgUpload = "" + res.data.resultList.goods_id;
          //   this.dialogImageUrl = res.data.resultList.imgs;
          // this.form.imgs = res.data.resultList.imgs[0].url;
          this.imgList = [{url:res.data.resultList.imgs}];
        }
      );
    }

    this.goodsType();
  }
};
</script>
