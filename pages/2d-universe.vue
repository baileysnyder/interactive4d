<template>
  <div>
    <h2 class="article-header">2D Universe</h2>
    <div class="main-content">
      <p>Before visiting the 4th dimension, let's develop the general skill of moving between dimensions by visiting somewhere much simpler: the 2nd dimension.</p>
      <p>Our previous representation of a 2D universe was already tainted by the bias of a 3D being. You can see that to get this view of a 2D universe, our observer (the white sphere) is placed somewhere along a third z axis.</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.sideView2D" :text="'Load Scene'" :imgName="'proj_cube.png'"></SceneButtonSingle>
      <p>What would this world look like to a 2D being who only had access to 2 dimensions? The answer is actually a bit complicated.</p>
      <p>With the way light works in our universe, they would see nothing. Lining yourself up perfectly with a 2D grid would make everything invisible because none of the objects would have any thickness in the 3rd dimension to bounce light back to your eyes.</p>
      <img src="" alt="">
      <p>But considering how different animals on Earth have different senses to navigate the world, you could imagine plenty of ways 2D beings could compensate for a lack of vision. For example: Imagine a being that could extend out color-tasting tentacles in straight lines. The being could create a 2D mental image of the space in front of them based on how far each tentacle went and what it tasted.</p>
      <img src="" alt="">
      <p>Although the being’s consciousness displays a 2D image, the sense data being retrieved by these tentacles can be represented by a 1D line.</p>
      <img src="" alt="">
      <p>This is analogous to the human eye in our universe which only sees in 2D images. It’s our brain’s job to combine the images from each eye and make a few other inferences to create the final 3D image.</p>
      <p>Now for the fun part: Let’s simulate what it’s like to be a 2D being. This scene will place you in a room with 4 gray walls containing 4 different colored shapes. To simulate depth, parts of the room that are further away will appear darker, as if the room were covered in fog. We’ll take the 1D line sensed by the being and stretch it vertically so it’s easier to see on screen.</p>
      <p>See if you can guess what the 4 shapes are by walking around a bit before tapping the Toggle Overhead Display button.</p>
      <SceneButtonSingle :sceneID="scenes.firstperson2d.firstperson2d" :text="'Load Scene'" :imgName="'proj_cube.png'"></SceneButtonSingle>
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
      activeScene = scenes.threeandcanvas.sideView2D
    }
    this.$store.commit('updateScene', activeScene)
  },
  beforeDestroy() {
    activeScene = this.$store.state.sceneID
  }
}
</script>