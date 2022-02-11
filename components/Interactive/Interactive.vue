<template>
<div>
    <div v-show="componentToDisplay === undefined" class="placeholder resizable" :style="{'width': canvasSize.width + 'px'}"></div>
    <!-- <FirstPerson2D :is="componentToDisplay" :canvasSize="canvasSize"/>
    <Slices2D :is="componentToDisplay" :canvasSize="canvasSize"/>
    <ThreeJs :is="componentToDisplay" class="resizable" :canvasSize="canvasSize" :style="{'width': canvasSize.width + 'px'}" /> -->
    <keep-alive>
    <component :is="componentToDisplay" class="resizable" :canvasSize="canvasSize" :style="{'width': canvasSize.width + 'px'}" />
    </keep-alive>
</div>
</template>

<script>
import ThreeJs from './ThreeJs'
import FirstPerson2D from './FirstPerson2D'
import Slices2D from './Slices2D'
import Cone from './Cone'

export default {
    components: {
        FirstPerson2D,
        ThreeJs,
        Slices2D,
        Cone
    },
    data() {
        return {
            componentToDisplay: undefined
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