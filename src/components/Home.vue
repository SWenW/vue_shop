<template>
  <el-container class="home-container">
<!--    头部区域-->
    <el-header >
      <div>
        <img src="../assets/heima.png" alt="logo">
        <span>超市管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--      页面主题区域-->
    <el-container>
<!--      侧边栏-->
      <el-aside :width="isCollapse ? '64px': '200px'">
        <div class="toggle-button" @click="toggleMenu">><</div>
        <!--侧边栏菜单区域-->
        <el-menu
          background-color="#333744" text-color="#fff" active-text-color="#ffd04b"
          unique-opened :collapse="isCollapse" :collapse-transition="false"
          :router="true" :default-active="activePath"
        >
<!--          一级菜单-->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
<!--            一级菜单的模板区域-->
            <template slot="title">
<!--              图标-->
              <i :class="iconObj[item.id]"></i>
<!--              文本-->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children"
                          :key="subItem.id" @click="saveNavStatus('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧主体-->
      <el-main>
<!--        路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuList: [],
      iconObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-lock_fill',
        '101': 'iconfont icon-tijikongjian',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  // 被创建时就执行created生命周期函数
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200)
        return this.$message.error(res.meta.error)
      else
        this.menuList = res.data
      console.log(res)
    },
    // 点击按钮切换菜单折叠与展开
    toggleMenu () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态，把route放到session中，设置跳转卡高亮
    saveNavStatus(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #EAEDF1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4A5064;
    font-size: 20px;
    line-height: 24px;
    color: white;
    text-align: center;
    cursor: pointer;
  }
</style>
