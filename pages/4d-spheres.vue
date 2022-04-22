<template>
  <div>
    <h2 class="article-header">4D SPHERES</h2>
    <div class="main-content">
      <p>Now our journey into the fourth dimension can truly begin. To gain a solid understanding of the fourth dimension, we require a solid understanding of simple 4D shapes. We begin with the 4D sphere.</p>
      <p>Given a generic radius of length <b>R</b>, a 4D sphere is the set of all points that are <b>R</b> distance away from a fixed center point in 4D space. This is analogous to the points of a circle in 2D space, and the points of a regular sphere in 3D space.</p>      
      <img class="img-wide" src="~assets/circle_and_sphere.png" alt="circle with radius R and 3D sphere with radius R">
      <!-- <SceneButtonSingle :sceneID="scenes.three.sphereOutlineRadius" :text="'LOAD SCENE'" :imgName="'slice_4dsphere.png'"></SceneButtonSingle> -->
      <p>Imagining what this 4D sphere looks like can be difficult, but luckily we've got some new visualization techniques up our sleeves 😎</p>
      <p>First let's look at its slices. Slicing 3D objects created 2D slices, so move up a dimension and slicing 4D objects will create 3D slices. In this scene, drag the w slider to move the 4D sphere in and out of our 3D universe:</p>
      <SceneButtonSingle :sceneID="scenes.three.sliceHypersphere" :text="'LOAD SCENE'" :imgName="'slice_4dsphere.png'"></SceneButtonSingle>
      <p>Does this look familiar?</p>
      <p>When the 4D sphere passes through our 3D universe, the slices it creates are 3D spheres whose size change with w distance. It's just like our 3D sphere that passed through a 2D universe, creating circular slices whose size changed with z distance!</p>
      <img class="img-wide" src="~assets/sphere_slices_3d_2d.gif" alt="Animation of 3D sphere being sliced into 2D circles">
      <p>⚠️ WARNING ⚠️ If you find yourself trying to line up these slices in your head – something like this:</p>
      <img class="img-wide" src="~assets/sphere_slices_lined.png" alt="Slices of the hypersphere lined in a row on the x axis">
      <p>Realize that this is the equivalent of a 2D being trying to form a sphere by lining up circle slices like this:</p>
      <img class="img-wide" src="~assets/circle_slices_lined.png" alt="Slices of a 3D sphere lined in a row on the x axis">
      <!-- <SceneButtonSingle :sceneID="scenes.three.sphereSlicesLined" :text="'LOAD SCENE'" :imgName="'slice_4dsphere.png'"></SceneButtonSingle> -->
      <p>The way I like to think about it is that an entire separate 3D universe exists for each slice. This shows that the 3D sphere slices aren't lined up on any of the 3 axes we're familiar with, and also that none of them are intersecting. The lack of intersection may seem strange, but consider again what happens one dimension lower. At each slice of a 3D sphere an entire 2D universe can be defined, and none of the circular slices intersect each other.</p>
      <img class="img-wide" src="~assets/sphere_slices_2d_axes.gif" alt="Animation of circular sphere slices stacking on the z axis with a 2D axis placed on each slice">
      <!-- <SceneButtonSingle :sceneID="scenes.three.sphereSliceAnim" :text="'LOAD SCENE'" :imgName="'slice_4dsphere.png'"></SceneButtonSingle> -->
      <p>We haven’t had to worry about rotations yet because rotating a 4D sphere doesn't affect the shape of its slice, but slices don't always give the full picture. Let’s see what we can learn from perspective projection.</p>
      <SceneButtonSingle :sceneID="scenes.three.projHypersphere" :text="'LOAD SCENE'" :imgName="'proj_4dsphere.png'"></SceneButtonSingle>
      <p>This object was constructed by placing random points on the surface of a 4D sphere. Points that are further away on the w axis will appear closer towards the center of the 3D projection, allowing us to squeeze all of the 4D points into this 3D universe at the same time. Points are colored lighter when closer to the center of the 3D projection (NOT the center of the 4D sphere) just so it’s easier to see where they are in relation to each other.</p>
      <p>Keep in mind, an object does not actually change shape during rotation. Points in the 4D sphere that are 2cm away from the center will remain 2cm away as it rotates. The points only appear to move because the projection changes when we look at the object from different orientations.</p>
      <p>Rotate on each plane individually with the other planes set to 0°. Notice how each causes a similar transformation where it looks like points are shifting from the outside to the inside.</p>
      <img class="img-wide" src="~assets/proj_sphere_4d_highlight.gif" alt="Rotating projection of 4D sphere with 1 point highlighted to show its movement">
      <p>A similar in and out motion can be seen in the projection of a 3D sphere.</p>
      <img class="img-wide" src="~assets/proj_sphere_3d_highlight.gif" alt="Rotating projection of 3D sphere with 1 point highlighted to show its movement">
      <p>Understanding the exact paths these points are taking can be tricky, but the main takeaway is simply that the points do indeed move during rotation. Take a step back and consider how this affects the slices of a 4D sphere. As you slice a rotating 4D sphere, yes the slice shape stays the same, but the points making up the slice will change. Again, we can see something similar one dimension lower.</p>
      <img class="img-wide" src="~assets/slice_sphere_3d_ring.gif" alt="Rotating slice of 3D sphere with points highlighted on sphere's surface to show rotation">
      <p>As we’ve seen a few times now, this idea of moving down a dimension helps a lot when observing 4D objects. Given some question about a 4D object, my general process to answer it looks like this:</p>
      <ol>
        <li>Consider the same scenario with an equivalent 3D object</li>
        <li>Figure out what the slices and projection of the 3D object would look like during movement and rotation</li>
        <li>Use these insights to infer what the slices and projection of the 4D object would look like</li>
      </ol>
      <p>This process can’t answer every question, and it isn’t always easy, but it’s surprisingly effective. This means all we need to do to understand a big chunk of the fourth dimension is get familiar with the slices and projections of other simple 3D and 4D shapes.</p>
    </div>
  </div>
</template>

<script>
import {scenes} from '../scripts/constants'
import SceneButtonSingle from '../components/SceneButtonSingle'

let activeScene = undefined

export default {
  head: {
    title: 'Interactive 4D Handbook - 4D Spheres',
    meta: [
      {
        name: 'description',
        content: 'Interact with the projection and slices of a 4D sphere to learn how they work.'
      }
    ]
  },
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
      activeScene = scenes.three.sliceHypersphere
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>