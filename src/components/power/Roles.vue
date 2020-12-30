<template>
  <div>
    <!--      面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <!--顶部按钮栏目-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1===0 ? 'bdtop': '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!--渲染二级权限-->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="18">
                    <el-tag v-for="(item3, i3) in item2.children"
                            type="warning" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightVisiable"
      width="50%">
      <el-tree :data="rightList" :props="treeProps" ref="treeRef"
               show-checkbox node-key="id" default-expand-all :default-checked-keys="checkedKeys">

      </el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightVisiable = false">取 消</el-button>
    <el-button type="primary" @click="allotRights" >确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        roleList: [],
        setRightVisiable: false,
        rightList: [], // 所有权限数据
        treeProps: { // 树形控件绑定对象
          label: 'authName',
          children: 'children'
        },
        checkedKeys: [], // 控件默认勾选的数组
        roleId: '', // 即将分配权限的角色id
      }
    },
    created () {
      this.getRoleList()
    },
    methods: {
      async getRoleList() {
        const {data: res} = await this.$http.get('roles');
        if(res.meta.status !== 200)
          return this.$message.error('获取角色列表失败')
        else
          this.roleList = res.data
          //console.log(this.roleList)
      },
      // 根据用户id删除指定权限
      async removeRightById(role, rightId) {
        const res = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'}).catch(err => {return err})
        // 如果用户确定删除，返回值为confirm， 取消删除，值为Cancel
        if (res !== 'confirm') return this.$message.info('取消删除')
        else {
          const {data: mess} = await this.$http.delete('roles/' + role.id + '/rights/' + rightId)
          if(mess.meta.status !== 200)
            return this.$message.error('删除权限失败')
          else{
            this.$message.success('删除权限成功')
            role.children = mess.data
          }
        }
      },
      // 展示分配权限的对话框
      async showSetRightDialog(role) {
        this.roleId = role.id
        const {data: res} = await this.$http.get('rights/tree')
        if(res.meta.status !== 200)
          return this.$message.error('获取权限信息失败')
        else{
          this.rightList = res.data
          this.checkedKeys = []
          this.getLeafKeys(role, this.checkedKeys)
        }
        this.setRightVisiable = true
      },
      getLeafKeys(node, arr) { // 通过递归形式获取角色下所有三级角色id
        if(!node.children)
          return arr.push(node.id)
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      async allotRights(id) {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data: res} = await this.$http.post(
          `roles/${ this.roleId }/rights`, { rids: idStr })
        if(res.meta.status !== 200)
          return this.$message.error('更新用户权限失败')
        else{
          this.getRoleList()
          this.setRightVisiable = false
          return this.$message.success('更新用户权限成功')
        }
      }
    }

  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
