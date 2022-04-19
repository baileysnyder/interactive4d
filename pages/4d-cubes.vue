<template>
  <div>
    <h2 class="article-header">4D CUBES</h2>
    <div class="main-content">
      <p>4D spheres were a good introduction, but 4D cubes (also known as 4D hypercubes or tesseracts) are worth taking the time to really sit with. They're simple enough to understand, yet complex enough to reveal most of the strangeness found in 4D.</p>
      <p>To build a 4D cube, let’s start all the way back with a simple 1D line.</p>
      <img class="img-wide" src="~assets/white_line.png" alt="White 1D line">
      <p>Drag that line along the y axis to create a 2D square.</p>
      <img class="img-300" src="~assets/line_to_square.gif" alt="1D line being stretched into a square">     
      <p>Drag that square along the z axis to create a 3D cube.</p>
      <img class="img-300" src="~assets/square_to_cube.gif" alt="square being stretched into a cube">
      <p>And finally, drag that cube along the w axis to create a 4D hypercube!</p>
      <img class="img-300" src="~assets/cube_to_tesseract.gif" alt="cube being stretched into a tesseract">
      <p>An interesting pattern can be observed here: a line had 2 points, a square had 4 lines, and a cube had 6 squares, so it follows that our tesseract will have 8 cubes.</p>
      <img class="img-300" src="~assets/colored_tesseract_cubes.gif" alt="Tesseract with all 8 cubes being highlighted one by one">
      <p>But don't worry too much about deciphering this squished image – this visualization is beneath us. Behold the world’s most famous 4D object: the projection of a 4D hypercube!</p>
      <SceneButtonSingle :sceneID="scenes.three.projHypercube" :text="'LOAD SCENE'" :imgName="'proj_cube.png'"></SceneButtonSingle>
      <p>To start, just play around with all the rotation sliders to see how the projection morphs around.</p>
      <p>Remember that due to projection, points that are further away on the w axis will shrink towards the center of the 3D image. To see how this affects the tesseract’s 8 cubes, set all the rotation sliders to 0°. The outer cube appears larger because it's near us on the w axis, and the inner cube appears smaller because it's further away.</p>
      <img class="img-wide" src="~assets/near_far_cubes.png" alt="Near and far cubes on tesseract highlighted">
      <p>All 6 connecting cubes are moving from near to far so they get skewed into trapezoidal prisms along the way. This is all analogous to the 2 squares connected by trapezoids you see in the projection of a 3D cube.</p>
      <img class="img-wide" src="~assets/proj_cube_out_to_in.gif" alt="Highlighting outer cube, connecting cube, then inner cube in 4D and 3D">
      <p>Rotate on one plane and you see the cubes growing and shrinking as they move in and out of the center. Again, a similar motion can be seen with squares in a 3D cube projection.</p>
      <img class="img-wide" src="~assets/proj_cube_1plane.gif" alt="Rotating 4D and 3D cubes on 1 plane with one cube or face highlighted">
      <p>Now that we’re familiar with the basic structure of the 4D cube, we're ready to observe its slices. This is what a 4D cube would look like if it moved through our 3D universe! 😮</p>
      <SceneButtonSingle :sceneID="scenes.three.sliceHypercube" :text="'LOAD SCENE'" :imgName="'slice_cube.png'"></SceneButtonSingle>
      <p>Again, just go crazy playing with all the sliders for a bit. Does anything seem familiar?</p>
      <p>The first big realization is that the object you’re looking at is just a bunch of 2D slices of the tesseract's 8 cubes stuck together!</p>
      <img class="img-300" src="~assets/slice_8_cubes.gif" alt="Highlight each face of the tesseract slice 1-8">
      <p>..But if we're viewing in 3D, why would the 3D cubes get sliced to 2D?</p>
      <p>This is due to the cubes being situated somewhere along the w axis. You could give a cube the slightest twist into the fourth dimension and all that would remain in our 3D universe is a 2D slice. The same can be seen one dimension lower where a square rotating into the third dimension instantly turns into a 1D slice.</p>
      <!-- <SceneButtonSingle :sceneID="scenes.threeandcanvas.squareSlice" :text="'LOAD SCENE'" :imgName="'slice_cube.png'"></SceneButtonSingle> -->
      <img class="img-wide" src="~assets/square_rotate_plane.gif" alt="A 2D square rotating into a 2D plane creating a 1D line as a slice">
      <p>Of course if a cube is too far from us on the w axis, then not even a slice will appear in our 3D universe. Observe the slice created when all the sliders are set to 0. Even though the tesseract has 8 potential cubes to slice, the final image appears to be a normal cube with only 6 faces.</p>
      <img class="img-300" src="~assets/normal_cube.png" alt="Tesseract slice with sliders set to 0">
      <p>This makes sense when you realize the 2D slice of a 3D cube in the same position is just a square with 4 sides, even though the cube has 6 faces. The 3D cube has two faces that aren’t intersecting with the 2D universe, and the 4D hypercube has two cubes that aren’t intersecting with the 3D universe.</p>
      <img class="img-300" src="~assets/slice_3d_cube_at_0.png" alt="Slice of 3D cube when the sliders are set to 0 is a square">
      <p>Here are some more direct parallels with the 2D slices of a 3D cube.</p>
      <p>Moving face first:</p>
      <img class="img-wide" src="~assets/face_first.gif" alt="Comparing slices of 3D and 4D cubes with 0 rotation">
      <p>Moving edge first:</p>
      <img class="img-wide" src="~assets/edge_first.gif" alt="Comparing slices of 3D and 4D cubes with 45° rotation one plane">
      <p>Moving corner first:</p>
      <img class="img-wide" src="~assets/corner_first.gif" alt="Comparing slices of 3D and 4D cubes with 45° rotation one plane and 36° rotation on another">
      <p>There’s also insight to be gained by comparing the tesseract’s slices directly to its projection. Here you’ll want to select “Color Cubes” so you can keep track of the cubes between visualizations. Note: in the projection we can’t color all 8 cubes at once because they share edges, so only 2 are highlighted at a time.</p>
      <p>Look what happens when you rotate on only ZW by 45°.</p>
      <img class="img-300" src="~assets/colored_slice.png" alt="Colored slice of 4D cube rotated 45° on ZW">
      <p>The slice has 2 square faces and 4 rectangular faces. According to what we learned when slicing a 3D cube, this means 2 of the tesseract’s cubes are moving through the 3D universe face first while 4 others are edge first.</p>
      <p>Look over to the projection image and this is the exact alignment you’ll see. The cubes colored <span class="color-box cube2"></span> and <span class="color-box cube0"></span> have their faces pointed inwards while the <span class="color-box cube6"></span>, <span class="color-box cube4"></span>, <span class="color-box cube3"></span>, and <span class="color-box cube1"></span> cubes have their edges pointed inwards.</p>
      <img class="img-wide" src="~assets/face_vs_edge_in.gif" alt="Highlights cubes in the tesseract projection with their faces or edges pointing in">
      <p>There’s really no limit to the amount of insights you can gain from these tesseract representations, but at this point we’ve covered all the core concepts. In fact, you’re probably much more capable of understanding the fourth dimension than you realize. Think of all the 3D objects that can be approximated as just a stretched sphere or cube. You now have the tools to understand the equivalent objects in 4D by representing them as a stretched 4D sphere or 4D hypercube!</p>
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
      activeScene = scenes.three.projHypercube
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>

<style scoped>
.color-box {
  margin-left: 2px;
  margin-right: 2px;

  width: 10px;
  height: 10px;
  display: inline-block;
  border: solid 1px rgb(232, 232, 232);
}
</style>