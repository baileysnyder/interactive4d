<template>
  <div>
      <h2 class="article-header">2D Flatland</h2>
      <div class="main-content">
        <p>We are 3D beings hoping to catch a glimpse of a 4D world. We may not be able to directly experience a 4th spatial dimension (yet?), but what we can do is master the ability to move from one dimension to the next. When other techniques fail this is always the one I come back to, so it’s worth putting in the time to explore. In order to understand what a 4D object would look like in 3D, we must first learn how a 3D object looks in 2D.</p>
        <p>So let’s build a 2D world. Start with 1D, which is a single line extending infinitely in both directions. Then to get to 2D we add another axis perpendicular to the first one. With this grid we now have the space to create any 2D object. Squares, triangles, circles, jpegs.</p>
        <p>This is a 2D world, but we’ve actually already been viewing it through the bias of a foolish 3D being. How would a 2D being see these objects? That question is actually harder to answer than it may seem.</p>
        <p>With the way light works in our reality, they would see nothing. Lining yourself up perfectly with the 2D grid would make everything in the grid invisible because none of the objects would have any thickness in the z direction to bounce light back to your eyes.</p>
        <p>A real 2D being would need to take in their surroundings through some other method like touch. You could imagine a bunch of feelers being sent out in straight lines from the being and then the being creating a mental image based on how far each feeler went. Since I can’t give you a bunch of feelers and you’re reading this through a screen, we’ll just have to approximate what that mental image would look like by assigning a pixel to each feeler and making it lighter the further the feeler travels.</p>
        <p>It’s useful to think of how the senses change between dimensions like this, but most of the time it just unnecessarily complicates things so I’ll give you the cheat code: Assume that the being in your world is skilled enough to fully view the world’s objects. In the best case for a human, we can see through a transparent object and immediately know the shape of its border and what all of it’s contents look like.</p>
        <p>That means when we’re thinking of how a 3D shape would look in 2D, we don’t need to consider this weird hypothetical first person, but can instead just consider a 2D grid viewed from the 3rd dimension where we can see all of the shape at once.</p>
      </div>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    let emit = {
      componentToDisplay: "FirstPerson2D"
    }

    $nuxt.$emit('load-interactive', emit)
  }
}
</script>

<style scoped>
.main-content {
  overflow-y: auto;
}

/* Works on Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: lightgray gray;
}

/* Works on Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 14px;
}

*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 20px;
}

*::-webkit-scrollbar-thumb {
  background-color: gray;
  border-radius: 20px;
}
</style>