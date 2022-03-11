<template>
  <div>
    <h2 class="article-header">INTRODUCTION</h2>
    <div class="main-content">
      <p>Hello! The goal of this website is to give you an intuitive understanding of a 4th spatial dimension. Our universe is generally considered to have 3 spatial dimensions with the 4th dimension being time, but how would things behave if we added an extra dimension of space?</p>
      <p>To get your first glimpse, tap these 6 buttons below. Each loads a different 4D object into the interactive scene that you can manipulate using the sliders at the bottom right. Once you’re sufficiently confused, tap the Next button below to learn how these objects work!</p>
      <SceneButtonGrid :buttonData="buttonData" />
    </div>
  </div>
</template>

<script>
import {scenes} from '../scripts/constants'
import LoadSceneButton from '../components/LoadSceneButton'
import SceneButtonGrid from '../components/SceneButtonGrid'

let activeScene = undefined

export default {
  components: {
    LoadSceneButton,
    SceneButtonGrid
  },
  data() {
    return {
      buttonData: [
        {sceneID: scenes.three.projHypercube, text: '4D Cube Projection', imgName: 'proj_cube.png'},
        {sceneID: scenes.three.sliceHypercube, text: '4D Cube Slices', imgName: 'slice_cube.png'},
        {sceneID: scenes.three.projHypersphere, text: '4D Sphere Projection', imgName: 'proj_4dsphere.png'},
        {sceneID: scenes.three.sliceHypersphere, text: '4D Sphere Slices', imgName: 'slice_4dsphere.png'},
        {sceneID: scenes.three.projCone, text: '4D Cone Projection', imgName: 'proj_4dcone.png'},
        {sceneID: scenes.three.sliceCone, text: '4D Cone Slices', imgName: 'slice_4dcone.png'},
      ]
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