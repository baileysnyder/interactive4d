<template>
  <div>
    <h2 class="article-header">Welcome</h2>
    <p>Hello! The goal of this website is to give you an intuitive understanding of a 4th spacial dimension. Stay on this page if you'd like to play around with 4D objects. To get a tour of the 4th dimension click on section 1 in the navigation to get started!</p>
  </div>
</template>

<script>
export default {
  components: {

  },
  data() {
    return {

    }
  },
  methods: {

  },
  beforeCreate() {
    let emit = {
      componentToDisplay: "ThreeJs"
    }

    $nuxt.$emit('load-interactive', emit)
  }
}
</script>