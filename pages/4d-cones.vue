<template>
  <div>
    <h2 class="article-header">4D CONES</h2>
    <div class="main-content">
      <p>To make sure we’ve got the process of understanding new 4D shapes down, let’s go through it one last time. This time we’ll observe a 4D cone.</p>
      <p>As always, let’s start by going back a dimension and working with what we know in 3D. How do you define a 3D cone?</p>
      <p>All you need is a 2D circle and a point. Place the point in the center of the circle and drag it forward a little on the z axis into the third dimension. Now just connect that point to all of the points in the circle and you’re done. In reality there would be an infinite number of points on the circle, but for visibility I've highlighted just a few of them here:</p>
      <img class="img-wide" src="~assets/cone_proj_3d_build.gif" alt="Creating cone from circle and point">
      <!-- <SceneButtonSingle :sceneID="scenes.three.projCone3DAnimation" :text="'LOAD SCENE'" :imgName="'proj_cube.png'"></SceneButtonSingle> -->
      <!-- <SceneButtonSingle :sceneID="scenes.three.projCone3D" :text="'LOAD SCENE'" :imgName="'proj_cube.png'"></SceneButtonSingle> -->
      <p>So how do we do this in 4D?</p>
      <p>Start with the 3D equivalent of a circle: a sphere. Place a point in the center of the sphere and drag it forward a little on the w axis into the fourth dimension. Finally, connect that point to all of the points on the surface of the sphere.</p>
      <p>As we’ve seen before, projections are usually good at showing us the overall structure of a 4D object, so let’s start there. Again, in reality the sphere has an infinite number of points, but I've highlighted only a few here so we can easily see how the points move during rotation.</p>
      <SceneButtonSingle :sceneID="scenes.three.projCone" :text="'LOAD SCENE'" :imgName="'proj_4dcone.png'"></SceneButtonSingle>
      <p>Now we want to make sure we understand the rotations in this projection, so the next step is to compare it with the projection of a 3D cone.</p>
      <p>Rotate on one plane and you see the cone’s tip move in and out of the center.</p>
      <img class="img-wide" src="~assets/cone_proj_1plane.gif" alt="4D and 3D cone projection rotating on 1 plane">
      <p>Specifically rotate the ZW plane from 0° to 90° and you’ll see the 3D sphere get squished into a 2D circle. The analogous rotation with a 3D cone projection squishes a circle into a 1D line.</p>
      <img class="img-wide" src="~assets/cone_proj_3d_circle_line.gif" alt="Rotating 3D projection to 90 degrees to turn the circle into a 1D line">
      <p>Keep the ZW plane at 90° and you’ll notice rotations on other planes are only moving the sphere points around. This is similar to a 3D cone where rotating around the tip only moves the points of the circle around. The difference is that in 4D we have extra planes of rotation so there are 2 planes to move the sphere points around instead of 1.</p>
      <img class="img-wide" src="~assets/cone_proj_3d_spin.gif" alt="4D cone projection and 3d cone projection spinning">
      <p>Once the basic structure of a shape is understood you’re ready to look at its slices. Before looking at slices of the 4D cone, let’s revisit the slices of a 3D cone real quick.</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.coneNoToggle" :text="'LOAD SCENE'" :imgName="'slice_3dcone.png'"></SceneButtonSingle>
      <p>These slices are known as the conic sections. They can be circles, ellipses, parabolas, or hyperbolas depending on the angle at which the slice occurs.</p>      
      <!-- <img class="img-wide" src="~assets/conic_sections.png" alt="Conic sections shown in diagram of a cone"> -->
      <!-- By Magister_Mathematicae - Own work based on: Secciones cónicas.svg, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=18556148 -->
      <div class="img-link-box"><a title="Magister_Mathematicae, CC BY-SA 3.0 &lt;https://creativecommons.org/licenses/by-sa/3.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Conic_Sections.svg" target="_blank"><img class="link-img img-wide" alt="Conic sections shown in diagram of a cone" src="~assets/conic_sections.png"></a></div>
      <p>The shape of a 3D cone’s slice can be determined using only 2 variables: 1) The cone’s distance from the 2D plane and 2) The angle of the cone’s center line (the line tip to base) with the 2D plane.</p>
      <img class="img-wide" src="~assets/cone_2_variables.png" alt="Diagrams of 2 variables needed for cone slice">
      <p>The same is true in 4D. The slice shape is completely determined by the angle of the cone’s center line with the 3D universe, and the cone’s distance along the w axis. This makes it much easier to understand the slices because we only need to consider these 2 variables.</p>
      <p>So what do slices of a 4D cone look like?</p>
      <SceneButtonSingle :sceneID="scenes.three.sliceCone" :text="'LOAD SCENE'" :imgName="'slice_4dcone.png'"></SceneButtonSingle>
      <p>It’s 3D versions of the conic sections! We went from 2D circles, ellipses, parabolas, and hyperbolas to 3D spheres, ellipsoids, paraboloids, and hyperboloids.</p>
      <img class="img-wide" src="~assets/cone_slice_comparison_s.png" alt="Comparing 3D and 4D cone slices">
      <p>Hopefully by this point I’ve proven the power that understanding the slices and projections of a 3D shape gives you in understanding an equivalent 4D shape. It can take a bit of effort, but it allows us to slowly build up insights that put our knowledge on par with any 4D being.</p>
      <p>There are plenty more complex 4D shapes out there to explore, but understanding them should be much easier now that we’ve studied these simpler shapes. 4D cylinder? Just like a 4D cone but instead of a single point moved along the w axis it’s another 3D sphere. <a href="https://en.wikipedia.org/wiki/24-cell" target="_blank">Icositetrachoron</a>? Just an object that’s somewhere between a tesseract and a 4D sphere. 4D doesn’t have to be scary if you take the time to break it up into smaller pieces you can understand.</p>
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