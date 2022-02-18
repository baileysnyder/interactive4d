<template>
  <div>
    <h2 class="article-header">Introduction</h2>
    <div class="main-content">
      <p>Hello! The goal of this website is to give you an intuitive understanding of a 4th spatial dimension. Our universe is generally considered to have 3 spatial dimensions with the 4th dimension being time, but how would things behave if we added an extra dimension of space?</p>
      <p>To get your first glimpse, tap the buttons below to load different 4D objects into the interactive scene and see what you can discover. Once you’re sufficiently confused, tap the next button below to learn how these objects work!</p>
      <LoadSceneButton :clickAction="initProjHypercube" :text="'4D Cube Projection'" :imgName="'proj_cube.png'"></LoadSceneButton>
      <LoadSceneButton :clickAction="initSliceHypercube" :text="'4D Cube Slices'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :clickAction="initProjHypersphere" :text="'4D Sphere Projection'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :clickAction="initSliceHypersphere" :text="'4D Sphere Slices'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :clickAction="initProjCone" :text="'4D Cone Projection'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :clickAction="initSliceCone" :text="'4D Cone Slices'" :imgName="'slice_cube.png'"></LoadSceneButton>
    </div>
  </div>
</template>

<script>
import * as Util from '../scripts/util'
import LoadSceneButton from '../components/LoadSceneButton'
export default {
  components: {
    LoadSceneButton
  },
  data() {
    return {

    }
  },
  methods: {
    emitScene(sceneID) {
      let emit = {
        scene: sceneID
      }
      $nuxt.$emit('load-interactive', emit)
    },
    initProjHypercube() {
      this.emitScene(Util.scenes.three.projHypercube)
    },
    initSliceHypercube() {
      this.emitScene(Util.scenes.three.sliceHypercube)
    },
    initSliceHypersphere() {
      this.emitScene(Util.scenes.three.sliceHypersphere)
    },
    initProjHypersphere() {
      this.emitScene(Util.scenes.three.projHypersphere)
    },
    initProjCone() {
      this.emitScene(Util.scenes.three.projCone)
    },
    initSliceCone() {
      this.emitScene(Util.scenes.three.sliceCone)
    },
  },
  beforeCreate() {
    let emit = {
        scene: Util.scenes.three.sliceHypercube
      }
      $nuxt.$emit('load-interactive', emit)
  }
}
</script>

<style scoped>

</style>