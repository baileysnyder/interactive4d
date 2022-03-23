<template>
  <div>
    <h2 class="article-header">3D PROJECTION</h2>
    <div class="main-content">
      <p>So we’ve tossed a 3D object through a 2D universe, but can’t we do more to help our 2D being? Can we somehow pack more information into a 2D image to give them an even better understanding of a 3D object?</p>
      <p>This is where projection comes in.</p>
      <p>There are many types of projection, but the one we’ll be using is perspective projection. This type of projection is based on distance – the further a point is from the observer, the closer it will shrink towards the center of the projection image. This mimics what happens with our eyes, where objects that are further away appear smaller than objects that are closer.</p>
      <img class="img-wide lighter-image" src="~assets/perspective.png" alt="long hallway showing things that are further away being smaller">
      <p>So what would the perspective projection of a 3D cube look like?</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.projCube" :text="'LOAD SCENE'" :imgName="'proj_cube.png'"></SceneButtonSingle>
      <p>If this doesn’t seem that exciting, it’s because this 3D to 2D perspective projection is exactly how we’ve been representing 3D objects on this 2D website the entire time! 🤯 For reference, select the “Orthographic” button to see how the cube would look if we didn’t shrink the further points towards the center. Either way the human brain is often pretty good at using a 2D image to infer what a 3D object would look like because that’s exactly what it does with the 2D images from our eyes.</p>
    </div>
  </div>
</template>

<script>
import {scenes} from '../scripts/constants'
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
      activeScene = scenes.threeandcanvas.projCube
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>

<style scoped>
.lighter-image {
  border: solid 2px rgb(232, 232, 232);
}
</style>