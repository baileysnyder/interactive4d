<template>
<div>
    <div v-show="componentToDisplay === undefined" class="placeholder resizable" :style="{'width': canvasSize.width + 'px'}"></div>
    <keep-alive>
    <component :is="componentToDisplay" class="resizable" :canvasSize="canvasSize" :style="{'width': canvasSize.width + 'px'}" />
    </keep-alive>
</div>
</template>

<script>
import * as Constants from '../../scripts/constants'
import Three from './Three'
import FirstPerson2D from './FirstPerson2D'
import ThreeAndCanvas from './ThreeAndCanvas'

export default {
    components: {
        Three,
        FirstPerson2D,
        ThreeAndCanvas
    },
    data() {
        return {
            componentToDisplay: undefined,
        }
    },
    props: {
        canvasSize: Object,
    },
    computed: {
        scene() {
            return this.$store.state.sceneID
        }
    },
    watch: {
        scene: function(newScene, oldScene) {
            if (this.isSceneInComponent(newScene, Constants.scenes.three)) {
                this.componentToDisplay = "Three"
            } else if (this.isSceneInComponent(newScene, Constants.scenes.firstperson2d)) {
                this.componentToDisplay = "FirstPerson2D"
            } else if (this.isSceneInComponent(newScene, Constants.scenes.threeandcanvas)) {
                this.componentToDisplay = "ThreeAndCanvas"
            }
        }
    },
    methods: {
        isSceneInComponent(scene, sceneParent) {
            for (const key in sceneParent) {
                if (Object.hasOwnProperty.call(sceneParent, key)) {
                    if (scene === sceneParent[key]) {
                        return true 
                    }                
                }
            }
            return false
        }
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