<template>
  <div id="wrapper">
    <NavigationLink :linkText="'INTRODUCTION'" :routePath="'/'" />
    <NavigationLink :linkText="'THINKING IN DIMENSIONS'" :routePath="'/'" />
    <NavigationLink :linkText="'2D UNIVERSE'" :routePath="'/2d-universe'" />    
    <NavigationLink :linkText="'3D SLICES'" :routePath="'/3d-to-2d'" />
    <NavigationLink :linkText="'3D PROJECTIONS'" :routePath="'/3d-to-2d'" />
    <NavigationLink :linkText="'4D SPHERES AND CUBES'" :routePath="'/'" />
    <NavigationLink :linkText="'4D CONES AND MORE'" :routePath="'/'" />
  </div>
</template>

<script>
import NavigationLink from './NavigationLink'
export default {
  components: {
    NavigationLink,
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