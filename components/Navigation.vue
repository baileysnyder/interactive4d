<template>
  <div id="wrapper">
      <NuxtLink to="/" class="navlink">SANDBOX</NuxtLink>
      <NuxtLink to="/2d-flatland" class="navlink">2D FLATLAND</NuxtLink>
      <NuxtLink to="/3d-to-2d" class="navlink">3D OBJECTS IN 2D</NuxtLink>
      <NuxtLink to="/" class="navlink">4D OBJECTS IN 3D</NuxtLink>
      <NuxtLink to="/4d-cone" class="navlink">4D CONE</NuxtLink>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.navlink {
  display: block;
}

a:link, a:visited{
  color: white;
  text-decoration: none;
}



a:hover {
  color: rgb(200, 200, 200);
}
</style>