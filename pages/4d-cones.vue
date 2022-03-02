<template>
  <div>
    <h2 class="article-header">4D Cones and More</h2>
    <div class="main-content">
      <p>Place</p>
      <p>Holder</p>
      <SceneButtonSingle :sceneID="scenes.three.projHypercube" :text="'4D Cube Projection'" :imgName="'proj_cube.png'"></SceneButtonSingle>
    </div>
  </div>
</template>

<script>
import {scenes} from '../scripts/util'
import SceneButtonSingle from '../components/SceneButtonSingle'

let activeScene = undefined

export default {
  components: {
    SceneButtonSingle
  },
  data() {
    return {
      scenes: scenes,
    }
  },
  beforeCreate() {
    if (!activeScene) {
      activeScene = scenes.three.projCone
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>