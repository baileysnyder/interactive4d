<template>
  <div>
      <h2>{{articleTitle}}</h2>
      <component :is="articleComponentName"></component>
  </div>
</template>

<script>
import WelcomeArticle from './Articles/WelcomeArticle.vue'
import TwoDFlatlandArticle from './Articles/TwoDFlatlandArticle'


export default {
    props: {
        articleComponentName: String,
        articleTitle: String
    },
    components: {
        WelcomeArticle,
        TwoDFlatlandArticle
    }
}
</script>

<style>

</style>