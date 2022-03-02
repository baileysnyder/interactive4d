<template>
  <div class="button-row">
      <LoadSceneButton :sceneID="sceneID" :text="text" :imgName="imgName"/>
  </div>
</template>

<script>
import LoadSceneButton from './LoadSceneButton.vue'
export default {
    components: {
        LoadSceneButton
    },
    props: {
        sceneID: Number,
        text: String,
        imgName: String,
    },
}
</script>

<style scoped>
.button-row {
  display: flex;
  justify-content: center;
  margin: 8px;
}
</style>