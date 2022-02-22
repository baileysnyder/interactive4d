<template>
  <div>
    <h2 class="article-header">3D Slices</h2>
    <div class="main-content">
      <p>Place</p>
      <p>Holder</p>
      <LoadSceneButton :sceneID="scenes.threeandcanvas.sphere" :text="'Sphere'" :imgName="'proj_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.threeandcanvas.solidCube" :text="'cube'" :imgName="'proj_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.threeandcanvas.edgeCube" :text="'cube edge'" :imgName="'proj_cube.png'"></LoadSceneButton>
      <LoadSceneButton :sceneID="scenes.threeandcanvas.cone" :text="'cone'" :imgName="'proj_cube.png'"></LoadSceneButton>
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
      activeScene = scenes.threeandcanvas.sphere
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>