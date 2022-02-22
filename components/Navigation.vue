<template>
  <div id="wrapper">
    <NavigationLink v-for="page in pages" v-bind:key="page.title" :linkText="page.title" :routePath="page.path" />
  </div>
</template>

<script>
import NavigationLink from './NavigationLink'
import {navPages} from '../scripts/util'
export default {
  components: {
    NavigationLink,
  },
  data() {
    return {
      pages: navPages
    }
  }
}
</script>

<style scoped>
.navlink {
  display: inline-block;
}

a:link, a:visited{
  color: white;
  text-decoration: none;
}

a:hover {
  color: rgb(200, 200, 200);
}

.nav-circle {
  display: inline-block;
  width: 12px;
  height: 12px;
  padding-right: 2px;
}
</style>