<template>
<div>
    <Three v-show="isThreeActive" :isComponentActive="isThreeActive" class="resizable" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}"/>
    <FirstPerson2D v-show="isFirstPerson2DActive" :isComponentActive="isFirstPerson2DActive" class="resizable" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}"/>
    <ThreeAndCanvas v-show="isThreeAndCanvasActive" :isComponentActive="isThreeAndCanvasActive" class="resizable" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}" />
</div>
</template>

<script>
import Three from './Three'
import FirstPerson2D from './FirstPerson2D'
import ThreeAndCanvas from './ThreeAndCanvas'

export default {
    components: {
        Three,
        FirstPerson2D,
        ThreeAndCanvas
    },
    props: {
        isThreeActive: Boolean,
        isFirstPerson2DActive: Boolean,
        isThreeAndCanvasActive: Boolean,
    },
    computed: {
        interactiveSize() {
            return this.$store.state.interactiveSize
        }
    },
}
</script>

<style scoped>
.resizable {
    height: 100%;
}
</style>