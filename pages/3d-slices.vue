<template>
  <div>
    <h2 class="article-header">3D SLICES</h2>
    <div class="main-content">
      <p>Previously we’ve visited the 2nd dimension, but there’s still more insight to be gained from these lower dimensions. Our goal is to understand 4D objects, but more specifically our goal is to understand 4D objects as a 3D being. What if we started with a simpler version of the problem and tried to understand 3D objects as a 2D being?</p>
      <p>I’d like to point out that this ends up being extremely useful. This 3D to 2D example is what helps provide the most insight whenever I get stuck trying to understand 4D.</p>
      <p>So what happens when we drag a 3D sphere along the z axis through a 2D universe?</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.sphere" :text="'LOAD SCENE'" :imgName="'slice_3dsphere.png'"></SceneButtonSingle>
      <p>At any given moment, the 2D being can only see the part of the sphere that intersects with their universe. Each intersection, called a "slice", is just a 2D circle of varying size. If you stack these slices together on the z axis you can see the sphere begin to take shape.</p>
      <img class="img-wide" src="~assets/sphere_slices.gif" alt="circular sphere slices being aligned on the z axis">
      <p>An important realization here is that while the 2D being can only see 1 slice at a time, all of these slices actually exist in the object simultaneously, just at different distances on the z axis.</p>
      <p>So far things still seem pretty tame – surely a 2D being has seen a circle grow and shrink before. But what happens if we send a 3D cube through there?</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.solidCube" :text="'LOAD SCENE'" :imgName="'slice_3dcube.png'"></SceneButtonSingle>
      <p>This is where things start to get interesting. Now the shape of the slice will vary depending on the rotation of the cube. Moving the cube on the z axis face first <button class="slider-button" @click="onFaceFirst"><img src="~assets/icons/square_face.png" alt="align cube face first icon"/></button> just makes a square that suddenly appears, remains still, and suddenly disappears. Edge first <button class="slider-button" @click="onEdgeFirst"><img src="~assets/icons/square_edge.png" alt="align cube edge first icon"/></button> you get a rectangle that grows and shrinks. Corner first <button class="slider-button" @click="onPointFirst"><img src="~assets/icons/square_point.png" alt="align cube point first icon"/></button> and you get a combination of triangles and 6 sided shapes (at one point a perfect hexagon!!!)</p>
      <p>I’d recommend playing around with the cube’s rotation and position for a bit to see what different kinds of slice shapes you can make. This will come in handy later for 4D cubes.</p>
      <p>So far we’ve been viewing the slice as a solid shape, but we can squeeze a little more information out of it by focusing on only the edges of the slice.</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.edgeCube" :text="'LOAD SCENE'" :imgName="'slice_3dcube_edge.png'"></SceneButtonSingle>
      <p>Notice that each cube face adds at most a single 1D line to the final slice. The highest number of lines in the slice is 6, which means all 6 faces of the cube are intersecting with the plane. Dragging the cube through edge first you can see that while the slice shape seems to transition smoothly, there’s actually a sudden point where one of the lines is completely replaced with another.</p>
      <img class="img-wide" src="~assets/edge_cube_3d.gif" alt="Slices of edge cube show side change color halfway through">
      <p>Now, lets put your slicing skills to the test and see if you can truly understand the plight of the 2D being. The next scene will show you slices of an invisible 3D object. See if you can determine the object's shape and orientation by rotating and moving it around the scene. Once you have a good guess, select "Show Object" to reveal the object.</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.cone" :text="'LOAD SCENE'" :imgName="'question_mark.png'"></SceneButtonSingle>
      <p>One thing worth mentioning is that these slices are a bit simplified because we’ve been working with 3D shapes whose insides are completely solid or completely hollow. Complex objects with a more detailed inside will have a more detailed slice.</p>
      <img class="img-wide" src="~assets/orange_slice.png" alt="Whole orange, arrow pointing to the right, then a slice of an orange">
      <!-- <SceneButtonSingle :sceneID="scenes.three.sphereSliceAnim" :text="'SPHERE SLICE ANIM'" :imgName="'slice_3dsphere.png'"></SceneButtonSingle> -->
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
      activeScene = scenes.threeandcanvas.sphere
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  },
  methods: {
    onFaceFirst() {
      $nuxt.$emit('align-face-first')
    },
    onEdgeFirst() {
      $nuxt.$emit('align-edge-first')
    },
    onPointFirst() {
      $nuxt.$emit('align-point-first')
    }
  }
}
</script>

<style scoped>
.slider-button {
    border: none;
    border-radius: 5px;
    padding-left: 6px;
    padding-right: 6px;
    padding-top: 4px;
    background: rgb(60, 60, 60);
    margin-left: 3px;
    margin-right: 3px;
    margin-top: 2px;
    margin-bottom: 2px;

    display: inline-block;
}

.slider-button:hover {
  background: rgb(75, 75, 75);
}
</style>