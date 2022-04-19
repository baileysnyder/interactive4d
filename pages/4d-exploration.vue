<template>
  <div>
    <h2 class="article-header">4D EXPLORATION</h2>
    <div class="main-content">
      <p>So, we've got a basic understanding of the fourth dimension. Now what?</p>
      <p>For starters, there's plenty to discover by playing around with the concepts we've already learned. Like did you know rotating a 3D object on a 4D plane allows you to completely flip the 3D object? Rotate this 3D cube to 180° on the ZW plane to see what I mean:</p>
      <SceneButtonSingle :sceneID="scenes.three.rotateCubeIn4D" :text="'LOAD SCENE'" :imgName="'flip_4d.png'"></SceneButtonSingle>
      <p>This means if your body rotated through the fourth dimension, you’d come back with your heart on the right side of your body instead of the left O_O A similar flip occurs when rotating a 2D object through the third dimension.</p>
      <!-- <SceneButtonSingle :sceneID="scenes.threeandcanvas.squareSlice" :text="'LOAD SCENE'" :imgName="'slice_cube.png'"></SceneButtonSingle> -->
      <img class="img-wide" src="~assets/flip_square.gif" alt="Left and right side of square being mirrored after rotation on XZ plane">
      <p>Here’s another pleasing discovery: A being with 4D vision would have a perfect view of everything inside your body. This is equivalent to a 3D human seeing the inside of a solid 2D shape, while a 2D being could only see the shape's boundary.</p>
      <img class="img-wide" src="~assets/see_insides.png" alt="Showing square from 3D perspective and 2D perspective">
      <p>But how would light get inside our bodies? Would the 4D being have a 4D flashlight that could light each atom in our body simultaneously? This is where we can finally start asking about 4D physics and 4D beings.</p>
      <p>Like would the being’s eyes detect 3D images and their brain then process them into 4D mental images? What would a 4D shape look like when shaded by a 4D light? Could you get pulled along the w axis by a 4D being? If you could, then what would you see? Remember, asking the equivalent questions for 2D and 3D helps a lot!</p>
      <p>Questioning what you already know is a good start, but what if you want to dig even deeper into 4D?</p>
      <p>First as a PSA, let me assure you that an expensive VR/3D headset probably isn't necessary. A VR headset makes us better at viewing the 3rd dimension. If you can already use a 2D image to accurately imagine a 3D object, then the headset won’t provide any new information. Now, what about a VR game with unique ways to interact with 4D, not possible on any other device? That could get interesting.</p>
      <p>If you know how to code and want to learn how the 4D shapes on this website work, the source code is available on <a href="https://github.com/baileysnyder/4dvisualizer" target="_blank">GitHub</a>.</p>
      <p>There are also plenty of other 4D object representations you can find or create yourself. Maybe instead of perspective projection you use <a href="https://en.wikipedia.org/wiki/Stereographic_projection" target="_blank">stereographic projection</a>. Perhaps you unfold the object into a 3D <a href="https://en.wikipedia.org/wiki/Tesseract#Net" target="_blank">net</a>. Maybe you represent the 4D object as a series of connected 3D <a href="https://en.wikipedia.org/wiki/Tetrahedron" target="_blank">tetrahedron</a>, the same way 3D objects are split up into 2D triangles for computer graphics.</p>
      <!-- By derivative work: Pbroks13 (talk)Hypersphere_coord.gif: Claudio Rocchini - Hypersphere_coord.gif, CC BY 3.0, https://commons.wikimedia.org/w/index.php?curid=4362118 -->
      <div class="img-link-box"><a title="derivative work: Pbroks13 (talk) Hypersphere_coord.gif: Claudio Rocchini, CC BY 3.0 &lt;https://creativecommons.org/licenses/by/3.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Hypersphere_coord.PNG" target="_blank"><img class="img-300 link-img" alt="Hypersphere coord" src="~assets/Hypersphere_coord.PNG"></a></div>
      <p>There’s always more to learn, but at this point you've accomplished a lot in 4D! If you remember your basic 4D shapes and to always consider an equivalent 3D/2D scenario, I'd say you’re doing pretty good. Now that you have an extra dimension at your disposal, anything is possible 👽</p>
      <p class="big-spacer">...Also if you found this website useful please consider donating with the link at the bottom of the page! I believe the content here should remain free, but I’ve put a lot of work into creating it and will continue putting effort into updating and maintaining it. Thank you!</p>
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