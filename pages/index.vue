<template>
  <div>
      <ThreeJs />
      <Article articleTitle="Welcome" articleComponentName="WelcomeArticle"/>
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