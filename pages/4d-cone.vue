<template>
  <div>
      <h2 class="article-header">4D Cone</h2>
      <div class="main-content">
        <p>cone</p>
      </div>
  </div>
</template>

<script>

export default {
  beforeCreate() {
    let emit = {
      componentToDisplay: "ThreeJs"
    }

    $nuxt.$emit('load-interactive', emit)
  }
}
</script>

<style scoped>
.main-content {
  overflow-y: auto;
}

/* Works on Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: lightgray gray;
}

/* Works on Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 14px;
}

*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 20px;
}

*::-webkit-scrollbar-thumb {
  background-color: gray;
  border-radius: 20px;
}
</style>