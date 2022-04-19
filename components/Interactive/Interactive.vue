<template>
<div>
    <div v-show="noneActive" class="placeholder resizable" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}"></div>
    <Three v-show="isThreeActive" :isComponentActive="isThreeActive" class="resizable" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}"/>
    <FirstPerson2D v-show="isFirstPerson2DActive" :isComponentActive="isFirstPerson2DActive" class="resizable" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}"/>
    <ThreeAndCanvas v-show="isThreeAndCanvasActive" :isComponentActive="isThreeAndCanvasActive" class="resizable" :style="{'width': interactiveSize.w + 'px', 'height': interactiveSize.h + 'px'}" />
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
            isThreeActive: false,
            isFirstPerson2DActive: false,
            isThreeAndCanvasActive: false,
        }
    },
    computed: {
        scene() {
            return this.$store.state.sceneID
        },
        noneActive() {
            return this.isThreeActive === false && this.isFirstPerson2DActive === false && this.isThreeAndCanvasActive === false
        },
        interactiveSize() {
            return this.$store.state.interactiveSize
        }
    },
    watch: {
        scene: function(newScene, oldScene) {
            if (this.isSceneInComponent(newScene, Constants.scenes.three)) {
                this.activateComponent(true, false, false)
            } else if (this.isSceneInComponent(newScene, Constants.scenes.firstperson2d)) {
                this.activateComponent(false, true, false)
            } else if (this.isSceneInComponent(newScene, Constants.scenes.threeandcanvas)) {
                this.activateComponent(false, false, true)
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
        },
        activateComponent(three, firstPerson2D, threeAndCanvas) {
            this.isThreeActive = three
            this.isFirstPerson2DActive = firstPerson2D
            this.isThreeAndCanvasActive = threeAndCanvas
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