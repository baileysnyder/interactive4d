<template>
<div>
    <div v-show="componentToDisplay === 'Placeholder'" class="placeholder resizable" :style="{'width': canvasSize.width + 'px'}"></div>
    <FirstPerson2D v-show="componentToDisplay === 'FirstPerson2D'" :canvasSize="canvasSize"/>
    <Slices2D v-show="componentToDisplay === 'Slices2D'" :canvasSize="canvasSize"/>
    <ThreeJs v-show="componentToDisplay === 'ThreeJs'" ref="threejs" class="resizable" :canvasSize="canvasSize" :style="{'width': canvasSize.width + 'px'}" />
</div>
</template>

<script>
import ThreeJs from './ThreeJs'
import FirstPerson2D from './FirstPerson2D'
import Slices2D from './Slices2D'

export default {
    components: {
        FirstPerson2D,
        ThreeJs,
        Slices2D
    },
    data() {
        return {
            componentToDisplay: 'Placeholder'
        }
    },
    props: {
        canvasSize: Object,
    },
    beforeCreate() {
        this.$nuxt.$on('load-interactive', e => {
            this.componentToDisplay = e.componentToDisplay
        })
    }
}
</script>

<style scoped>
.placeholder {
    background-color: black;
}

.resizable {
    height: 100%;
}
</style>