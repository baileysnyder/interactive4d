<template>
  <div>
      <ThreeJs />
      <Article articleTitle="2D Flatland" articleComponentName="TwoDFlatlandArticle"/>
  </div>
</template>

<script>
import ThreeJs from '../components/ThreeJs/ThreeJs.vue'
import Article from '../components/Article'

export default {
  components: {
    ThreeJs,
    Article
  }
}
</script>