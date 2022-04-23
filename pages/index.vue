<template>
  <div>
    <h2 class="article-header">INTRODUCTION</h2>
    <div class="main-content">
      <p>"The fourth dimension is uhhhh... time! Right??" 🤮</p>
      <p>I mean probably, but no thanks. On this website, my goal is to give you an intuitive understanding of a 4th spatial dimension. To achieve this, we'll first brush up on simple 2D and 3D space, then using that knowledge we'll observe the most fundamental 4D shapes.</p>
      <p>To begin, try interacting with these six 4D objects below. Once you’re sufficiently mesmorized, tap the Next button to learn how these objects work!</p>
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
  head: {
    title: 'Interactive 4D Handbook',
    meta: [
      {
        hid: 'description',
        name: 'description',
        content: 'Interact with 4D shapes and learn about 4D universes!'
      }
    ]
  },
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
  beforeMount() {
    if (!activeScene) {
      activeScene = scenes.three.projHypercube
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>