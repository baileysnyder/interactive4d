<template>
<div>
    <div class="three-container">
        <canvas ref="canvas"></canvas>
        <div class="three-overlay">
            <div class="top-right sticky-box">
            </div>
            <div class="bottom-right sticky-box">
                <div class="slider">
                    <label for="angleXW">XW</label>
                    <input id="angleXW" v-model="angleDegXW" type="range" min="-90" max="90" value="0" step="1">
                    <input v-model="angleDegXW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="angleYW">YW</label>
                    <input id="angleYW" v-model="angleDegYW" type="range" min="-90" max="90" value="0" step="1">
                    <input v-model="angleDegYW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="angleZW">ZW</label>
                    <input id="angleZW" v-model="angleDegZW" type="range" min="-90" max="90" value="0" step="1">
                    <input v-model="angleDegZW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="angleIN">IN/OUT</label>
                    <input id="angleIN" v-model="angleDegIN" type="range" min="-360" max="360" value="0" step="1">
                    <input v-model="angleDegIN" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="translateW">W</label>
                    <input id="translateW" v-model="translateW" type="range" min="-2" max="2" value="0" step="0.01">
                    <input class="slider-text" v-model="translateW" type="text" size="4">
                    <span class="unit-text invisible">°</span>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as Util from '../../scripts/util'
import * as Cone4D from '../../scripts/cone4D'
import * as Cube4D from '../../scripts/cube4D'
import * as Sphere4D from '../../scripts/sphere4D'

let camera;
let threeScene;
let renderer;

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;

export default {
    data() {
        return {
            angleXW: 0.0,
            angleYW: 0.0,
            angleZW: 0.0,
            angleIN: 0.0,
            angleDegXW: 0,
            angleDegYW: 0,
            angleDegZW: 0,
            angleDegIN: 0,
            translateW: 0.0,
            objectNeedsUpdate: false,
            activeScene: undefined
        }
    },
    props: {
        canvasSize: Object,
        scene: undefined
    },
    watch: {
        canvasSize: function(newD, oldD) {
            let width = newD.width
            let height = newD.height

            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.setSize(width, height)

            Cube4D.updateLineResolution(width, height)
        },
        scene: function(newScene, oldScene) {
            this.undoInits()
            this.initScene(newScene)
        },
        angleDegXW: function() {
            this.angleXW = this.angleDegXW*(Math.PI/180)
            this.objectNeedsUpdate = true
        },
        angleDegYW: function() {
            this.angleYW = this.angleDegYW*(Math.PI/180)
            this.objectNeedsUpdate = true
        },
        angleDegZW: function() {
            this.angleZW = this.angleDegZW*(Math.PI/180)
            this.objectNeedsUpdate = true
        },
        angleDegIN: function() {
            this.angleIN = this.angleDegIN*(Math.PI/180)
            this.objectNeedsUpdate = true
        },
        translateW: function() {
            this.objectNeedsUpdate = true
        },
    },
    methods: {
        initThree() {
            let width = this.canvasSize.width
            let height = this.canvasSize.height
            const canvas = this.$refs.canvas
            threeScene = new THREE.Scene()

            renderer = new THREE.WebGLRenderer({
                canvas: canvas
            })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            camera = new THREE.PerspectiveCamera(80, width/height, 0.1, 100)
            camera.position.set(0, 0, 4)
            threeScene.add(camera)

            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enablePan = false;
            controls.update();

            const mainLight = new THREE.DirectionalLight(0xffffff, 0.5)
            camera.add(mainLight)
            mainLight.position.set(-1.5, 2.5, 0)

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
            threeScene.add(ambientLight)
        },
        animate() {
            delta += clock.getDelta();
            if (delta > interval) {
                if (this.objectNeedsUpdate) {
                    switch (this.activeScene) {
                        case (Util.scenes.three.sliceHypercube):
                            Cube4D.updateHypercubeSlice(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                        case (Util.scenes.three.projHypercube):
                            Cube4D.updateHypercubeProjection(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                        case (Util.scenes.three.sliceHypersphere):
                            Sphere4D.updateSliceHypersphere(parseFloat(this.translateW))
                            break
                        case (Util.scenes.three.projHypersphere):
                            Sphere4D.updateProjHypersphere(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW))
                            break
                        case (Util.scenes.three.projCone):
                            Cone4D.updateProjectionCone(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                        case (Util.scenes.three.sliceCone):
                            Cone4D.updateSliceCone(threeScene, parseFloat(this.angleIN), parseFloat(this.translateW))
                            break
                    }
                    this.objectNeedsUpdate = false
                }

                renderer.render(threeScene, camera)
                delta = delta % interval;
            }
            if (!this._inactive) {
                requestAnimationFrame(this.animate)
            }
        },
        undoInits() {
            Cube4D.undoInits(threeScene)
            Sphere4D.undoInits(threeScene)
            Cone4D.undoInits(threeScene)
        },
        initScene(sceneID) {
            switch(sceneID) {
                case (Util.scenes.three.sliceHypercube):
                    Cube4D.initSliceHypercube(threeScene, this.canvasSize.width, this.canvasSize.height) 
                    break
                case (Util.scenes.three.projHypercube):
                    Cube4D.initProjHypercube(threeScene)
                    break
                case (Util.scenes.three.sliceHypersphere):
                    Sphere4D.initSliceHypersphere(threeScene)
                    break
                case (Util.scenes.three.projHypersphere):
                    Sphere4D.initProjHypersphere(threeScene)
                    break
                case (Util.scenes.three.projCone):
                    Cone4D.initProjCone(threeScene)
                    break
                case (Util.scenes.three.sliceCone):
                    Cone4D.initSliceCone(threeScene)
                    break
            }
            this.activeScene = sceneID
            this.objectNeedsUpdate = true
        }
    },
    mounted() {
        this.initThree()
        this.initScene(this.scene)
    },
    activated() {
        requestAnimationFrame(this.animate)
    }
}
</script>

<style scoped>
.three-container {
  position: relative;
  width: 100%;
  height: 100%;
}
.three-container canvas, .three-overlay {
  position: absolute;
}

.three-overlay {
    width:100%;
    height:100%;
    pointer-events: none;
}

.top-right {
    position: absolute;
    right: 0;
}

.bottom-right {
    position: absolute;
    right: 0;
    bottom: 0;
}

.sticky-box {
    padding: 4px;
    pointer-events: auto;
}

.slider {
    text-align: right;
}

.slider-text {
    border-radius: 4px;
    border: none;
    text-align: center;
}

.invisible {
    color: transparent;
}
</style>