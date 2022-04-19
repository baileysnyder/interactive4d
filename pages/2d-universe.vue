<template>
  <div>
    <h2 class="article-header">2D UNIVERSE</h2>
    <div class="main-content">
      <p>The 4th dimension is an alternate dimension we can't directly observe. The 2nd dimension is an alternate dimension we <i>can</i> directly observe. This makes a 2D universe the perfect place to start answering our interdimensional questions.</p>
      <p>Before we do anything though, something a bit problematic needs to be addressed: Our previous representation of a 2D universe was already tainted by the bias of a 3D being. You can see that to get this view of a 2D universe, our observer (the white sphere) is placed somewhere along a third z axis.</p>
      <SceneButtonSingle :sceneID="scenes.threeandcanvas.sideView2D" :text="'LOAD SCENE'" :imgName="'side_view_2d.png'"></SceneButtonSingle>
      <p>What would this world look like to a 2D being who only had access to 2 dimensions? The answer is actually a bit complicated.</p>
      <p>With the way light works in our universe, they would see nothing. Lining yourself up perfectly with a 2D grid would make everything invisible because none of the objects would have any thickness in the 3rd dimension to bounce light back to your eyes.</p>
      <img class="img-wide" src="~assets/side_view_2d.gif" alt="Rotating 2D axis to 90 degrees making 2D objects disappear">
      <p>Kind of annoying to work around. For now let's just create new laws of physics 😃 Consider an alternate universe where light <i>can</i> bounce off the sides of 2 dimensional objects. In this universe we have a 2D being (the white circle) looking at a pink square.</p>
      <img class="img-wide" src="~assets/pink_square_overhead.png" alt="A white circle looking at a pink square">
      <p>From the being's perspective, all they would see is a simple 1D line!</p>
      <img class="img-wide" src="~assets/pink_line.png" alt="A pink line representing a square viewed from first person in 2D">
      <p>That may seem strange, but it's completely analogous to our vision as a 3D being. Our eyes only take in 2D images. We don't see in 3D until our brain does a few tricks like combining images from each eye or noticing how fast objects move in relation to each other.</p>
      <p>As an interdimensional exercise, let's try the same thing in 2D. This scene will place you in a 2D room with 4 gray walls containing 4 different colored shapes. To simulate depth, parts of the room that are further away will appear darker, as if the room were covered in fog. Your 1D line of vision will be stretched vertically so it’s visible on screen.</p>
      <p>See if you can guess what the 4 shapes are by walking around a bit before selecting "Show Overhead Display".</p>
      <SceneButtonSingle :sceneID="scenes.firstperson2d.firstperson2d" :text="'LOAD SCENE'" :imgName="'first_person_2d.png'"></SceneButtonSingle>
      <p>You can learn a lot by questioning the lives of other dimensional beings, but as demonstrated when we broke the laws of physics, it can also get complicated. To make things simpler, let's separate questions about other dimensions into 3 categories:</p>
      <ol>
        <li>Senses - how a being observes their world</li>
        <li>Physics - gravity, light, sound, etc.</li>
        <li>Shape - the space objects take up when stationary, moving, or rotating</li>
      </ol>
      <p>Most of this website will focus on #3. Here we're free to twist the laws of physics around and use any representations we want as long as it gives us more information about an underlying shape. That's why in 2D we're safe to imagine a universe where light bounces off 2D objects, and we're even safe to view 2D worlds from a perspective along the z axis.</p>
      <img class="img-300" src="~assets/z_axis_check.png" alt="2D world viewed from z axis with a checkmark indicating it's okay to use">
      <p>Moving forward, just how we can use different tools than a 2D being to understand 2D shapes, we can use different tools than a 4D being to understand 4D shapes.</p>
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