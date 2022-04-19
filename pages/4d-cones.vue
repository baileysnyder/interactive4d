<template>
  <div>
    <h2 class="article-header">4D CONES</h2>
    <div class="main-content">
      <p>Now that we've observed what I would consider the two most fundamental 4D shapes, let's test our skills and throw in a wildcard. What would a 4D cone look like?</p>
      <p>As always, let’s start by going back a dimension and working with what we know in 3D. How do you define a 3D cone?</p>
      <p>All you need is a 2D circle and a point. Place the point in the center of the circle, drag it into the third dimension, then connect it to all of the circle's points and you’re done. In reality there would be an infinite number of points on the circle, but for visibility I've highlighted just a few of them here:</p>
      <img class="img-wide" src="~assets/cone_proj_3d_build.gif" alt="Creating cone from circle and point">
      <!-- <SceneButtonSingle :sceneID="scenes.three.projCone3DAnimation" :text="'LOAD SCENE'" :imgName="'proj_cube.png'"></SceneButtonSingle> -->
      <!-- <SceneButtonSingle :sceneID="scenes.three.projCone3D" :text="'LOAD SCENE'" :imgName="'proj_cube.png'"></SceneButtonSingle> -->
      <p>So how do we do this in 4D?</p>
      <p>Start with the 3D equivalent of a circle: a sphere. Place a point in the center of the sphere, drag it into the fourth dimension, then connect it to all of the points on the surface of the sphere.</p>
      <p>We've seen that projection is good at showing the overall structure of a 4D object, so let's start there. Again, in reality the sphere has an infinite number of points, but I've highlighted only a few here so we can see how they move during rotation.</p>
      <SceneButtonSingle :sceneID="scenes.three.projCone" :text="'LOAD SCENE'" :imgName="'proj_4dcone.png'"></SceneButtonSingle>
      <p>Hmmm I find these rotations quite perplexing... Crazy new idea - what if to make sense of this 4D shape I compare it to an equivalent 3D shape? 🧐</p>
      <p>Rotate on one plane and you see the cone’s tip move in and out of the center.</p>
      <img class="img-wide" src="~assets/cone_proj_1plane.gif" alt="4D and 3D cone projection rotating on 1 plane">
      <p>Specifically rotate the ZW plane from 0° to 90° and you’ll see the 3D sphere get squished into a 2D circle. The analogous rotation with a 3D cone projection squishes a circle into a 1D line.</p>
      <img class="img-wide" src="~assets/cone_proj_3d_circle_line.gif" alt="Rotating 3D projection to 90 degrees to turn the circle into a 1D line">
      <p>Keep the ZW plane at 90° and you’ll notice rotations on other planes are only moving the sphere points around. This is similar to a 3D cone where rotating around the tip only moves the points of the circle around. The difference is in 4D we have extra planes of rotation perpendicular to the cone's tip.</p>
      <img class="img-wide" src="~assets/cone_proj_3d_spin.gif" alt="4D cone projection and 3d cone projection spinning">
      <p>That should be enough to understand the cone's basic structure, which means it's slice time. Before looking at slices of the 4D cone, let’s revisit the slices of a 3D cone real quick.</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.coneNoToggle" :text="'LOAD SCENE'" :imgName="'slice_3dcone.png'"></SceneButtonSingle>
      <p>These slices are known as the conic sections. They can be circles, ellipses, parabolas, or hyperbolas depending on the angle at which the slice occurs.</p>      
      <div class="img-link-box"><a title="Magister_Mathematicae, CC BY-SA 3.0 &lt;https://creativecommons.org/licenses/by-sa/3.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Conic_Sections.svg" target="_blank"><img class="link-img img-wide" alt="Conic sections shown in diagram of a cone" src="~assets/conic_sections.png"></a></div>
      <p>The shape of a 3D cone’s slice can be determined using only 2 variables: 1) The cone’s distance from the 2D slicing plane and 2) The angle of the cone’s center line (the line tip to base) with the 2D slicing plane.</p>
      <img class="img-wide" src="~assets/cone_2_variables.png" alt="Diagrams of 2 variables needed for cone slice">
      <p>The same is true in 4D. The slice shape is completely determined by the cone’s distance from the 3D universe, and the angle of the cone’s center line with the 3D universe. This makes it easier to understand the slices because we only need to consider these 2 variables.</p>
      <p>So what do slices of a 4D cone look like?</p>
      <SceneButtonSingle :sceneID="scenes.three.sliceCone" :text="'LOAD SCENE'" :imgName="'slice_4dcone.png'"></SceneButtonSingle>
      <p>It’s 3D versions of the conic sections! We went from 2D circles, ellipses, parabolas, and hyperbolas to 3D spheres, ellipsoids, paraboloids, and hyperboloids.</p>
      <img class="img-wide" src="~assets/cone_slice_comparison_s.png" alt="Comparing 3D and 4D cone slices">
      <p>Hopefully by this point I've proven how useful it is to compare slices and projections between dimensions. Understand them in 3D and you nearly understand them in 4D. Understand them in 4D and you nearly understand the entire 4D shape.</p>
      <p>Now that we've gone through this process with our basic shapes, working with any other 4D shape will be much easier. 4D cylinder? Just like a 4D cone but instead of a single point dragged into the fourth dimension it’s a 3D sphere. <a href="https://en.wikipedia.org/wiki/24-cell" target="_blank">Icositetrachoron</a>? Just an object that’s somewhere between a tesseract and a 4D sphere. 4D doesn’t have to be scary if you break things into small manageable pieces.</p>
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
      activeScene = scenes.three.projCone
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>

<style scoped>
.img-link-box {
  text-align: center;
}

.link-img {
  display: inline-block;
}
</style>