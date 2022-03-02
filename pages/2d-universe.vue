<template>
  <div>
    <h2 class="article-header">2D Universe</h2>
    <div class="main-content">
      <p>Place</p>
      <p>Holder</p>
      <SceneButtonSingle :sceneID="scenes.firstperson2d.firstperson2d" :text="'Load Scene'" :imgName="'proj_cube.png'"></SceneButtonSingle>
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
      activeScene = scenes.firstperson2d.firstperson2d
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>