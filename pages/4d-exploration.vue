<template>
  <div>
    <h2 class="article-header">4D EXPLORATION</h2>
    <div class="main-content">
      <p>Now that we have a basic understanding of the fourth dimension, where do we go from here?</p>
      <p>For starters, there's plenty to discover by playing with the concepts we already understand. Like did you know rotating a 3D object on a 4D plane allows you to completely flip the 3D object? Rotate this 3D cube to 180° on the ZW plane to see what I mean:</p>
      <SceneButtonSingle :sceneID="scenes.three.rotateCubeIn4D" :text="'LOAD SCENE'" :imgName="'flip_4d.png'"></SceneButtonSingle>
      <p>This means if your body rotated through the fourth dimension, you’d come back with your heart on the right side of your body instead of the left O_O A similar flip occurs when rotating a 2D object through the third dimension.</p>
      <!-- <SceneButtonSingle :sceneID="scenes.threeandcanvas.squareSlice" :text="'LOAD SCENE'" :imgName="'slice_cube.png'"></SceneButtonSingle> -->
      <img class="img-wide" src="~assets/flip_square.gif" alt="Left and right side of square being mirrored after rotation on XZ plane">
      <p>Here’s another pleasing discovery: A being with 4D vision would have a perfect view of everything inside our bodies. This is equivalent to a 3D human seeing the inside of a solid 2D shape, while a 2D being could only see the shape's boundary.</p>
      <img class="img-wide" src="~assets/see_insides.png" alt="Showing square from 3D perspective and 2D perspective">
      <p>But how would light get into our insides? Would the 4D being have a 4D flashlight that could light each atom in our body simultanously? This is where you can start to ask all the more specific questions about how a 4D being would sense their world and what their laws of physics would look like.</p>
      <p>Like would the being’s eyes detect 3D images and their brain then process them into 4D mental images? What would a 4D shape look like when shaded by a 4D light? Could you get pulled along the w axis by a 4D being? If you could then what would you see? Remember, asking the equivalent questions for 2D and 3D can help a lot with answering these 4D questions.</p>
      <p>Outside of questioning what you already know, other methods can help dig even deeper into the fourth dimension.</p>
      <p>First as a PSA, let me assure you that an expensive VR/3D headset probably won’t help much. A VR headset makes us better at viewing the 3rd dimension. If you can already use a 2D image to accurately imagine a 3D shape in your head, then VR won’t provide any new information. However, if a VR game allows you to physically interact with 4D shapes in a way you can’t on a regular phone/computer, <i>then</i> you could start gaining some new insights.</p>
      <p>If you know how to code and want to learn how to program the 3D representations of 4D shapes used on this website, the source code is available on <a href="https://github.com/baileysnyder/4dvisualizer" target="_blank">GitHub</a>.</p>
      <p>There are also plenty of other representations of 4D objects you can find or create yourself. Maybe instead of perspective projection you use <a href="https://en.wikipedia.org/wiki/Stereographic_projection" target="_blank">stereographic projection</a>. Perhaps you unfold the object into a 3D <a href="https://en.wikipedia.org/wiki/Tesseract#Net" target="_blank">net</a>. Maybe you represent the 4D object as a series of connected 3D <a href="https://en.wikipedia.org/wiki/Tetrahedron" target="_blank">tetrahedron</a>, the same way 3D objects are split up into 2D triangles in computer graphics.</p>
      <!-- By derivative work: Pbroks13 (talk)Hypersphere_coord.gif: Claudio Rocchini - Hypersphere_coord.gif, CC BY 3.0, https://commons.wikimedia.org/w/index.php?curid=4362118 -->
      <div class="img-link-box"><a title="derivative work: Pbroks13 (talk) Hypersphere_coord.gif: Claudio Rocchini, CC BY 3.0 &lt;https://creativecommons.org/licenses/by/3.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Hypersphere_coord.PNG" target="_blank"><img class="img-300 link-img" alt="Hypersphere coord" src="~assets/Hypersphere_coord.PNG"></a></div>
      <p>There’s always more to learn, but at this point you’ve got a pretty solid overview of the fourth dimension. Remember your basic 4D shapes and to always consider an equivalent 3D to 2D scenario and you’re basically set. Now that you have an extra dimension at your disposal, anything is possible 👽</p>
      <p class="big-spacer">...Also if you found this website useful please consider donating at the link on the bottom of the page! I believe the content here should remain free, but I’ve put a lot of work into creating it and will continue putting effort into updating and maintaining it. Thank you!</p>
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
      activeScene = scenes.three.rotateCubeIn4D
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

.big-spacer {
  margin-top: 90px;
}
</style>