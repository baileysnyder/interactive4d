<template>
  <div id="wrapper">
      <div>
        <svg class="nav-circle">
          <circle v-show="$route.path === '/'" cx="50%" cy="50%" r="45%" fill="lightgray" />
          <circle v-show="$route.path !== '/'" cx="50%" cy="50%" r="20%" fill="gray" />
        </svg>
        <NuxtLink to="/" class="navlink">HOME</NuxtLink>
      </div>
      <div>
        <svg class="nav-circle">
          <circle v-show="$route.path === '/2d-flatland'" cx="50%" cy="50%" r="45%" fill="lightgray" />
          <circle v-show="$route.path !== '/2d-flatland'" cx="50%" cy="50%" r="20%" fill="gray" />
        </svg>
        <NuxtLink to="/2d-flatland" class="navlink">2D FLATLAND</NuxtLink>
      </div>
      <div>
        <svg class="nav-circle">
          <circle v-show="$route.path === '/3d-to-2d'" cx="50%" cy="50%" r="45%" fill="lightgray" />
          <circle v-show="$route.path !== '/3d-to-2d'" cx="50%" cy="50%" r="20%" fill="gray" />
        </svg>
        <NuxtLink to="/3d-to-2d" class="navlink">3D OBJECTS IN 2D</NuxtLink>
      </div>
      <div>
        <svg class="nav-circle">
          <circle v-show="$route.path === '/4d-to-3d'" cx="50%" cy="50%" r="45%" fill="lightgray" />
          <circle v-show="$route.path !== '/4d-to-3d'" cx="50%" cy="50%" r="20%" fill="gray" />
        </svg>
        <NuxtLink to="/" class="navlink">4D OBJECTS IN 3D</NuxtLink>
      </div>
      <div>
        <svg class="nav-circle">
          <circle v-show="$route.path === '/4d-cone'" cx="50%" cy="50%" r="45%" fill="lightgray" />
          <circle v-show="$route.path !== '/4d-cone'" cx="50%" cy="50%" r="20%" fill="gray" />
        </svg>
        <NuxtLink to="/4d-cone" class="navlink">4D CONE</NuxtLink>
      </div>
  </div>
</template>

<script>
export default {

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