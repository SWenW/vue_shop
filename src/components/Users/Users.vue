<template>
    <div>
    <!--      面包屑导航区域-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图-->
      <el-card class="box-card">
      <!--搜索区域 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisiable = true">添加用户</el-button>
          </el-col>
        </el-row>
      <!--用户列表区域-->
        <el-table :data="userList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态" width="100px">
            <!--作用域插槽，获取这一行的状态  -->
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.mg_state"
                @change="userStateChange(scope.row)"
                >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
              <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <!--添加用户的对话框-->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisiable"
        width="50%"
        @close="closeDialog"
      >
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisiable = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改用户的对话框-->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisiable"
        width="50%" @close="closeEditDialog">
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisiable = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    // 自定义正则表达式验证用户邮箱
    var checkMail = (rule, value, callback) => {
      var regMail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if(regMail.test(value))
        return callback()
      else
        return callback('请输入合法的邮箱')
    }
    var checkMobile = (rule, value, callback) => {
      var regMobile = /^1[0-9]{10}$/;
      if(regMobile.test(value))
        return callback()
      else
        return callback('请输入合法手机号')
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '' ,
        pagenum: 1 , // 当前的页数
        pagesize: 2,
      },
      userList: [],
      editForm: {},
      total: 0,
      addDialogVisiable: false,
      editDialogVisiable: false,
      addForm : {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'}, {min: 3, max: 10, message: '长度在3到10个字符之间', trigger: 'blur'}],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'}, {min: 6, max: 15, message: '长度在6到15个字符之间', trigger: 'blur'}],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'}, {validator: checkMail, trigger: 'blur'}],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'}, {validator: checkMobile, trigger: 'blur'}]
      },
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const {data: res} = await this.$http.get('users', { params: this.queryInfo })
      if(res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch状态，修改用户启用状态
    async userStateChange(stateInfo) {
      const {data: res} = await this.$http.put(`users/${stateInfo.id}/state/${stateInfo.mg_state}`)
      if(res.meta.status !== 200) {
        stateInfo.mg_state = !stateInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success("更新用户状态成功")
    },
    // 添加用户表单
    closeDialog () {
      this.$refs.addFormRef.resetFields();
    },
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
    },
    // 添加用户前的预校验
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        // 发起增加用户的网络请求
        const {data: res} = await this.$http.post('users', this.addForm)
        console.log(res)
        if(res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        if(res.meta.status === 400) {
          return this.$message.error('用户名已存在')
        }
        else{
          this.$message.success('添加用户成功')
          this.addDialogVisiable = false
          this.getUserList()
        }

      })
    },
    async showEditDialog(id) {
      const {data: res} = await this.$http.get(`users/${id}`)
      if(res.meta.status !== 200){
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisiable = true
    },
    // 修改用户信息并提交
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('users/' + this.editForm.id,
          {email: this.editForm.email, mobile: this.editForm.mobile})
        if(res.meta.status !== 200){
          return this.$message.error('更新失败')
          // console.log(res.meta)
        }
        else{
          return this.$message.success('更新成功')
          this.getUserList()
          this.editDialogVisiable = false
        }
      })
    },
    // 通过id删除用户
    async removeUser(id) {
      const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'}).catch(err => {return err})
      // 如果用户确定删除，返回值为confirm， 取消删除，值为Cancel
      if (res !== 'confirm') return this.$message.info('取消删除')
      else {
        const {data: mess} = await this.$http.delete('users/' + id)
        if(mess.meta.status !== 200) return this.$message.error('删除用户失败')
        else{
          this.$message.success('删除用户成功')
          this.getUserList()
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
