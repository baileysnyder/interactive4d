<template>
<div ref="topContainer">
    <h1>Interactive 4D Visualizer</h1>
    <h2>From Flatland to the Fourth Dimension</h2>
    <div id="main-content" :style="{'width': mainWidth + 'px', 'height': mainHeight + 'px'}">
          <div class="wrapper" ref="wrapper">
            <Interactive ref="interactive" class="resizable-box interactive-box" :canvasSize="{width: interactiveWidth, height: interactiveHeight}" :style="{'width': interactiveWidth + 'px'}" />
            <div @mousedown="onMousedownHandler" class="handler" >
                <svg class="handler-grip">
                    <rect x="21%" y="0" width="18%" height="100%" rx="4px" fill="rgb(56, 56, 56)" />
                    <rect x="61%" y="0" width="18%" height="100%" rx="4px" fill="rgb(56, 56, 56)" />
                </svg>
            </div>
            <nuxt ref="article" class="resizable-box article-box"/>
        </div>
    </div>
    <Navigation ref="navigation" id="navigation"/>
    <p>Donate</p>
</div>
</template>

<script>
import Navigation from '../components/Navigation'
import Interactive from '../components/Interactive/Interactive'

const navigationWidth = 180
const headerFooterHeight = 200
const minInteractiveWidth = 0.2

export default {
    components: {
        Navigation,
        Interactive
    },
    data() {
        return {
            mainWidth: window.innerWidth - navigationWidth,
            mainHeight: window.innerHeight - headerFooterHeight,

            isHandlerDragging: false,
            interactiveWidth: (window.innerWidth - navigationWidth) / 2,
            interactiveHeight: window.innerHeight - headerFooterHeight,
        }
    },
    mounted() {
        window.addEventListener('resize', this.onResize)

        const vueContext = this
        const interactive = this.$refs.interactive.$el
        const topContainer = this.$refs.topContainer
        const wrapper = this.$refs.wrapper
        document.addEventListener('mouseup', function(e) {
            vueContext.isHandlerDragging = false
            topContainer.removeEventListener('mousemove', preventEvent)
        })

        document.addEventListener('mousemove', function(e) {
            // Don't do anything if dragging flag is false
            if (!vueContext.isHandlerDragging) {
                return false
            }

            // Get offset
            let containerOffsetLeft = wrapper.offsetLeft

            // Get x-coordinate of pointer relative to container
            let pointerRelativeXpos = e.clientX - containerOffsetLeft
            
            // Arbitrary minimum width set on box A, otherwise its inner content will collapse to width of 0
            let minWidth = vueContext.mainWidth * minInteractiveWidth
            let maxWidth = vueContext.mainWidth - minWidth

            // Resize box A
            // * 8px is the left/right spacing between .handler and its inner pseudo-element
            let width = pointerRelativeXpos - 8
            if (width < minWidth) {
                width = minWidth
            } else if (width > maxWidth) {
                width = maxWidth
            }

            interactive.style.width = width + 'px'
            vueContext.interactiveWidth = width
        })
    },
    methods: {
        onMousedownHandler(e) {
            this.isHandlerDragging = true
            const topContainter = this.$refs.topContainer

            topContainter.addEventListener('mousemove', preventEvent)
        },
        onResize() {
            this.mainWidth = window.innerWidth - navigationWidth
            this.mainHeight = window.innerHeight - headerFooterHeight

            this.interactiveWidth = this.mainWidth / 2
            this.interactiveHeight = this.mainHeight
        }
    }
}

let preventEvent = function(e) {
    e.preventDefault()
}

</script>

<style scoped>
h1 {
    margin-bottom: 0;
}

h2 {
    margin-top: 0;
    font-style: italic;
}

#main-content {
    display: inline-block;
    border-radius: 16px;
    overflow: hidden;
    /* box-shadow: 6px 6px 3px rgba(0, 0, 0, 0.5); */
}

#navigation {
    display: inline-block;
    vertical-align: top;
    position: fixed;
    padding-left: 6px;
    margin-top: 16px;
}

.wrapper {
  display:flex;
  height: 100%;

  background: rgb(32, 32, 32);
}

.resizable-box {
  box-sizing: border-box;
}

.interactive-box {
  flex: 0 0 auto;
}

.article-box {
    display: flex;
    flex-flow: column;
    flex: 1 1 auto;

    background: rgb(24, 24, 24);
}

.handler {
  width: 18px;
  padding: 0;
  cursor: ew-resize;
  flex: 0 0 auto;

  display: flex;
  align-items: center;
}

/* .handler::before {
  content: '';
  display: block;
  height: 100%;
  margin: 0 auto;
} */

.handler-grip {
    width: 100%;
    height: 4%;
}

</style>

<style>
/* global styling */
body {
    background: rgb(44, 44, 44);
    color: rgb(232, 232, 232);
    font-family: 'IBM Plex Sans';
}

.article-header {
    text-align: center;
}

.article-box p {
    margin: 20px;
}
</style>