<template>
  <div>
    <h2 class="article-header">3D PROJECTION</h2>
    <div class="main-content">
      <p>So we’ve tossed a 3D object through a 2D universe, but can’t we do more to help our 2D being? Can we somehow pack more information into a 2D image to give them an even better understanding of a 3D object?</p>
      <p>This is where projection comes in.</p>
      <p>There are many types of projection, but the one we’ll be using is perspective projection. This type of projection is based on distance – the further a point is from the observer, the closer it will shrink towards the center of the projection image. This mimics what happens with our eyes, where objects that are further away appear smaller than objects that are closer.</p>
      <img class="img-wide lighter-image" src="~assets/perspective.png" alt="long hallway showing things that are further away being smaller">
      <p>So what would the perspective projection of a 3D cube to a 2D image look like?</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.projCube" :text="'LOAD SCENE'" :imgName="'proj_3dcube.png'"></SceneButtonSingle>
      <p>If this doesn’t seem that exciting, it’s because this 3D to 2D perspective projection is exactly how we’ve been representing 3D objects on this 2D website the entire time! 🤯 The output is equivalent to the 2D image one of our eyes would capture if we centered ourselves on the gray plane and looked at the cube.</p>
      <p>We’re not done yet though – we can pack in even more information:</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.projEdgeCube" :text="'LOAD SCENE'" :imgName="'proj_3dcube_edge.png'"></SceneButtonSingle>
      <p>Now we can see all the edges of the cube at once! By observing how all the edges connect together, a 2D being could get a good idea of the cube’s overall structure. The only downside to perspective projection is angle distortion. You have to really force yourself to think in 2D for this one, but notice that while all the cube's edges should connect at 90° angles, they very rarely do in the projection image.</p>
      <img class="img-wide" src="~assets/projection_angle.png" alt="square shown with 90 degree angle, cube projection shown with angle greater than 90">
      <p>This angle distortion also affects the cube’s faces. Select “Highlight Face” and rotate the cube to observe how the face changes shape in the projection image. While the actual face is always a square, the face’s projection can be a square, trapezoid, or any 4 sided shape between depending on the cube’s orientation.</p>
      <img class="img-wide" src="~assets/projection_shape.png" alt="square shown, cube projection shown with skewed diamond shape">
      <p>As we've seen so far, getting the most out of a projection image usually involves highlighting different points, edges, or faces to reveal different insights. Look at how when we don't highlight anything, the projection of a solid sphere doesn't appear to change during rotation:</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.projSphere" :text="'LOAD SCENE'" :imgName="'proj_3dsphere.png'"></SceneButtonSingle>
      <p>If instead we highlight points along the surface of the sphere, we can now see how the surface moves during rotation:</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.projSpherePoints" :text="'LOAD SCENE'" :imgName="'proj_3dsphere_points.png'"></SceneButtonSingle>
      <p>Perspective projection won't always create a perfect representation of an object, but it’s a very efficient way of compressing an object down a dimension.</p>
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