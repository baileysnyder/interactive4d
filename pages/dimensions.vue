<template>
  <div>
    <h2 class="article-header">THINKING IN DIMENSIONS</h2>
    <div class="main-content">
      <p>To understand 4 dimensions, let’s start by simply creating a 4 dimensional universe 👍 The building blocks for our universe will be axes, where a singular axis is just a line.</p>
      <p>Starting from nothingness, add one axis and we've got a 1D universe. The only objects that fit in here are lines along the axis. This simple scene shows an entire 1D universe containing 4 colored lines:</p>
      <SceneButtonSingle :sceneID="scenes.three.axis1D" :text="'LOAD SCENE'" :imgName="'axis1d.png'"></SceneButtonSingle>
      <p>Let's build further. The rule when adding a new axis to a universe is that it must be perpendicular (have a 90° angle) with all existing axes. When all the axes are perpendicular, moving directly along one axis will not affect how far you are along the other axes.</p>
      <p>So, add a second axis perpendicular to the first and we've got a 2D universe. Two well placed lines and now we have the space for any complex 2D shape.</p>
      <SceneButtonSingle :sceneID="scenes.three.axis2D" :text="'LOAD SCENE'" :imgName="'axis2d.png'"></SceneButtonSingle>
      <p>Add one more perpendicular axis and it's a 3D universe. Here we can describe any of the shapes our senses are used to interacting with – even the device you’re reading this on could be described in terms of its length, width, and height!!</p>
      <SceneButtonSingle :sceneID="scenes.three.axis3D" :text="'LOAD SCENE'" :imgName="'axis3d.png'"></SceneButtonSingle>
      <p>It’s time. Add a final axis perpendicular to all previous three and we’ve got a 4D universe! Take a moment and really try to imagine what this would look like.</p>
      <p>One trick for visualization is to squish all 4 axes into a 3D space. Let’s see what that looks like with the 4 axes labeled x, y, z, w, and also a 3D cube for reference:</p>
      <SceneButtonSingle :sceneID="scenes.three.axesWithCube" :text="'LOAD SCENE'" :imgName="'axis4d.png'"></SceneButtonSingle>
      <p>It’s a good start, but the problem here is that everything gets stretched out of proportion. Since we’ve squished all the axes into 3D the angle between each is no longer 90°, meaning they are no longer perpendicular. The true fourth axis is angled in some direction we can’t see no matter how much we move and rotate around in 3D. That means adding the fourth axis would actually look like nothing to us.</p>
      <img class="img-wide" src="~assets/3d4d_no_difference.png" alt="3D axes and 4D axes shown to look identical in 3D">
      <p>In other words, observing 4D as a 3D being can get pretty tricky. But fear not! In the next few sections we'll build up a solid understanding of simpler dimensions that makes this all much easier.</p>
    </div>
  </div>
</template>

<script>
import {scenes} from '../scripts/constants'
import SceneButtonSingle from '../components/SceneButtonSingle'

let activeScene = undefined

export default {
  head: {
    title: 'Interactive 4D Handbook - Thinking in Dimensions',
    meta: [
      {
        hid: 'description',
        name: 'description',
        content: 'Interactive scenes moving from a 1D universe to a 4D universe.'
      }
    ]
  },
  components: {
    SceneButtonSingle
  },
  data() {
    return {
      scenes: scenes
    }
  },
  beforeMount() {
    if (!activeScene) {
      activeScene = scenes.three.axis1D
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>