<template>
  <div>
    <h2 class="article-header">3D Projection</h2>
    <div class="main-content">
      <p>Place</p>
      <p>Holder</p>
      <LoadSceneButton :sceneID="scenes.three.projHypercube" :text="'4D Cube Projection'" :imgName="'proj_cube.png'"></LoadSceneButton>
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
      activeScene = scenes.threeandcanvas.projCube
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>