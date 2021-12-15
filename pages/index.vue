<template>
  <div class="wrapper" ref="wrapper">
      <ThreeJs ref="threejs" class="resizable-box threejs-box" :canvasSize="{width: threejsWidth, height: threejsHeight}" :style="{'width': threejsWidth + 'px'}" />
      <div @mousedown="onMousedownHandler" class="handler" ></div>
      <Article class="resizable-box article-box" articleTitle="Welcome" articleComponentName="WelcomeArticle"/>
  </div>
</template>

<script>
import ThreeJs from '../components/ThreeJs/ThreeJs.vue'
import Article from '../components/Article'

export default {
  components: {
    ThreeJs,
    Article
  },
  props: [
    'contentWidth'
  ],
  data() {
    return {
      isHandlerDragging: false,
      threejsWidth: (window.innerWidth - 150) / 2,
      threejsHeight: window.innerHeight - 200,
    }
  },
  methods: {
    onMousedownHandler(e) {
      this.isHandlerDragging = true;
    }
  },
  mounted() {
    const vueContext = this;
    const boxA = this.$refs.threejs.$el;
    const wrapper = this.$refs.wrapper;
    document.addEventListener('mouseup', function(e) {
      vueContext.isHandlerDragging = false;
    })

    document.addEventListener('mousemove', function(e) {
      // Don't do anything if dragging flag is false
      if (!vueContext.isHandlerDragging) {
        return false;
      }

      // Get offset
      let containerOffsetLeft = wrapper.offsetLeft;

      // Get x-coordinate of pointer relative to container
      let pointerRelativeXpos = e.clientX - containerOffsetLeft;
      
      // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
      let boxAminWidth = 60;

      // Resize box A
      // * 8px is the left/right spacing between .handler and its inner pseudo-element
      let width = Math.max(boxAminWidth, pointerRelativeXpos - 8)
      boxA.style.width = width + 'px';
      vueContext.threejsWidth = width
    })

    this.$nuxt.$on('resize-main-container', e => {
      this.threejsWidth = e.width / 2
    })
  }
}
</script>

<style>
.wrapper {
  display:flex;
  height: 100%;
}

.resizable-box {
  box-sizing: border-box;
}

.threejs-box {
  flex: 0 0 auto;
}

.article-box {
  flex: 1 1 auto;
}

.handler {
  width: 20px;
  padding: 0;
  cursor: ew-resize;
  flex: 0 0 auto;
}

.handler::before {
  content: '';
  display: block;
  width: 4px;
  height: 100%;
  background: rgb(37, 37, 37);
  margin: 0 auto;
}
</style>