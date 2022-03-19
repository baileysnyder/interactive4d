<template>
  <div>
    <h2 class="article-header">PLANES OF ROTATION</h2>
    <div class="main-content">
      <p>Before we get too far, this is a good time to dip our toes back into the 4th dimension and talk about rotations.</p>
      <p>A common way to describe rotations is in terms of axes. To rotate a single point around an axis, imagine a solid metal beam being glued between the two. Now when the axis spins, the point will spin with it.</p>
      <p>Another way to think of rotations is in terms of 2D planes. Now our imaginary beam is simply glued between the point and plane.</p>
      <p>In this scene you can rotate random points with the slider on the bottom right and switch between the “Plane” and "Axis" buttons to see how the points move in relation to each:</p>
      <SceneButtonSingle :sceneID="scenes.three.rotateAxisPlane" :text="'LOAD SCENE'" :imgName="'rotate_axis_plane.png'"></SceneButtonSingle>
      <p>If we wanted to construct planes of rotation for say, a 3D universe with 3 perpendicular axes, we’d just create a plane of rotation between each pair of axes like this:</p>
      <SceneButtonSingle :sceneID="scenes.three.rotate3D" :text="'LOAD SCENE'" :imgName="'3d_planes.png'"></SceneButtonSingle>
      <p>In practice you'd center all the planes at the origin - I'm only placing them further out because when they're all overlapping it looks like a mess.</p>
      <img class="img-300" src="~assets/3d_planes_squish.png" alt="rotation planes all at origin">
      <p>Seems simple enough though, we've got 3 planes of rotation for 3 axes. But what happens in 4D?</p>
      <SceneButtonSingle :sceneID="scenes.three.rotate4D" :text="'LOAD SCENE'" :imgName="'4d_planes.png'"></SceneButtonSingle>
      <p>6 planes of rotation for 4 axes??? From 2D to 4D this is what we have:</p>
      <ul>
        <li>2D has 1 plane: XY</li>
        <li>3D has 3 planes: XY, YZ, XZ</li>
        <li>4D has 6 planes:  XY, YZ, XZ, XW, YW, ZW</li>
      </ul>
      <p>As you can see things work out nicely in 3D where there are 3 axes and 3 planes of rotation, but that symmetry doesn’t exist in any other dimension. You <i>can</i> rotate around the axes in 4D, but there are multiple valid ways of rotating around each axis. In other words, you can’t just say “rotate around the w axis by 30°” and expect two people to perform the same action.</p>
      <p>To prove this let’s look at the z axis. In 3D the only plane the z axis is perpendicular to is the XY plane. When an axis and plane are perpendicular, rotation along the plane will be equivalent to rotation along the axis.</p>
      <img class="img-wide" src="~assets/z_rotation_3d.png" alt="z axis, y axis, x axis, and xy plane">
      <p>In 4D, the z axis is perpendicular to the XY, XW, and YW planes. You could rotate a point on any of those planes and consider it a z axis rotation because the point could still maintain a solid connection to the z axis. This is tricky to visualize in 3D since our 4D axes will always be skewed away from being perpendicular.</p>
      <img class="img-wide" src="~assets/z_rotation_4d.png" alt="x, y, z, w, axes with xy, xw, yw planes">
      <p>The important point is that in 4D, given the choice between 1 axis and 3 planes, the 3 planes allow us to be more precise. On top of that, tell someone “rotate on the XY plane by 30°” and the same action will be performed for every dimension from 2D to ∞D. For these reasons we'll be describing all future rotations in terms of planes.</p>
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
      activeScene = scenes.three.rotateAxisPlane
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>

<style scoped>
.img-300 {
    margin: auto;
    display: block;
    margin-top: 12px;
    margin-bottom: 26px;
    width: 70%;
    max-width: 300px;
    border: solid 2px rgb(100, 100, 100);
    border-radius: 8px;
    /* box-shadow: 4px 4px 5px rgb(0 0 0 / 50%); */
}
</style>