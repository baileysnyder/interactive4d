<template>
    <div>
        <svg class="nav-circle">
            <circle v-show="isActivePath" cx="50%" cy="50%" r="45%" fill="lightgray" />
            <circle v-show="!isActivePath" cx="50%" cy="50%" r="20%" fill="gray" />
        </svg>
        <NuxtLink :to="routePath" class="navlink">{{linkText}}</NuxtLink>
    </div>
</template>

<script>
export default {
    props: {
        linkText: String,
        routePath: String
    },
    computed: {
      isActivePath() {
        return this.$route.path === this.routePath
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