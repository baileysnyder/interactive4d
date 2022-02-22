<template>
  <div>
    <h2 class="article-header">INTRODUCTION</h2>
    <div class="main-content">
      <p>Hello! The goal of this website is to give you an intuitive understanding of a 4th spatial dimension. Our universe is generally considered to have 3 spatial dimensions with the 4th dimension being time, but how would things behave if we added an extra dimension of space?</p>
      <p>To get your first glimpse, tap the buttons below to load different 4D objects into the interactive scene and see what you can discover. Once you’re sufficiently confused, tap the Next button below to learn how these objects work!</p>
      <LoadSceneButton :sceneID="scenes.three.projHypercube" :text="'4D Cube Projection'" :imgName="'proj_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.three.sliceHypercube" :text="'4D Cube Slices'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.three.projHypersphere" :text="'4D Sphere Projection'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.three.sliceHypersphere" :text="'4D Sphere Slices'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.three.projCone" :text="'4D Cone Projection'" :imgName="'slice_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.three.sliceCone" :text="'4D Cone Slices'" :imgName="'slice_cube.png'"></LoadSceneButton>
    </div>
  </div>
</template>

<script>
import {scenes} from '../scripts/util'
import LoadSceneButton from '../components/LoadSceneButton'

let activeScene = undefined

export default {
  components: {
    LoadSceneButton
  },
  data() {
    return {
      scenes: scenes,
    }
  },
  beforeCreate() {
    if (!activeScene) {
      activeScene = scenes.three.sliceHypercube
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>