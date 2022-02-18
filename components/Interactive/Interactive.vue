<template>
<div>
    <div v-show="componentToDisplay === undefined" class="placeholder resizable" :style="{'width': canvasSize.width + 'px'}"></div>
    <keep-alive>
    <component :is="componentToDisplay" class="resizable" :scene="scene" :canvasSize="canvasSize" :style="{'width': canvasSize.width + 'px'}" />
    </keep-alive>
</div>
</template>

<script>
import * as Util from '../../scripts/util'
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
            scene: undefined
        }
    },
    props: {
        canvasSize: Object,
    },
    beforeCreate() {
        this.$nuxt.$on('load-interactive', e => {
            if (this.isSceneInComponent(e.scene, Util.scenes.three)) {
                this.componentToDisplay = "Three"
            } else if (this.isSceneInComponent(e.scene, Util.scenes.firstperson2d)) {
                this.componentToDisplay = "FirstPerson2D"
            } else if (this.isSceneInComponent(e.scene, Util.scenes.threeandcanvas)) {
                this.componentToDisplay = "ThreeAndCanvas"
            }
            this.scene = e.scene
        })
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