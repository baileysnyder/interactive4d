<template>
    <div class="top-container">
        <div class="three-container">
            <canvas class="main-canvas" ref="canvas"></canvas>
            <div class="three-overlay">
                <div class="top-right sticky-box">
                </div>
                <div class="bottom-right sticky-box">
                    <div class="slider-row" v-show="slidersEnabled.RESET">
                        <button class="slider-button" @click="resetUI">Reset</button>
                    </div>                    
                    <div class="slider-row" v-show="slidersEnabled.XZ">
                        <label for="angleXZ">XZ</label>
                        <input id="angleXZ" v-model="angleDegXZ" type="range" min="-360" max="360" value="0" step="1">
                        <input v-model="angleDegXZ" class="slider-text" type="text" size="4">
                        <span class="unit-text">°</span>
                    </div>
                    <div class="slider-row" v-show="slidersEnabled.YZ">
                        <label for="angleYZ">YZ</label>
                        <input id="angleYZ" v-model="angleDegYZ" type="range" min="-360" max="360" value="0" step="1">
                        <input v-model="angleDegYZ" class="slider-text" type="text" size="4">
                        <span class="unit-text">°</span>
                    </div>
                    <div class="slider-row" v-show="slidersEnabled.Z">
                        <label for="translateZ">Z</label>
                        <input id="translateZ" v-model="translateZ" type="range" min="-1.5" max="1.5" value="0" step="0.01">
                        <input v-model="translateZ" class="slider-text" type="text" size="4">
                        <span class="unit-text invisible">°</span>
                    </div>
                </div>
            </div>
        </div>
        <canvas v-show="this.scene !== sideView2DSceneID" class="bottom-canvas" ref="sliceCanvas"></canvas>
        <canvas v-show="this.scene === sideView2DSceneID" class="bottom-canvas canvas-border" ref="canvas2"></canvas>
    </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as Objects3D from '../../scripts/objects-3d'
import * as Constants from '../../scripts/constants'
import * as Util from '../../scripts/util'
import * as Axes from '../../scripts/axes'

class SliderState {
    constructor(sceneID, vueContext) {
        this.sceneID = sceneID
        this.angleDegXZ = vueContext.angleDegXZ
        this.angleDegYZ = vueContext.angleDegYZ
        this.translateZ = vueContext.translateZ
    }

    extractValues(vueContext){
        vueContext.angleDegXZ = this.angleDegXZ
        vueContext.angleDegYZ = this.angleDegYZ
        vueContext.translateZ = this.translateZ
    }
}

let previousTimestamp = 0
let interval = 1000/60
const canvasPercentH = 0.6
const sliceCanvasPercentH = 0.4

let camera
let threeScene
let renderer
let controls

let bottomCam
let bottomRend

let previousCameraPosition = new THREE.Vector3(0, 0, 0)

export default {
    data() {
        return {
            angleXZ: 0.0,
            angleYZ: 0.0,
            angleDegXZ: 0,
            angleDegYZ: 0,
            translateZ: 0.0,
            slidersEnabled: {
                XZ: false,
                YZ: false,
                Z: false,
                RESET: false
            },
            canvas: undefined,
            sliceCanvas: undefined,
            objectNeedsUpdate: false,
            sideView2DSceneID: Constants.scenes.threeandcanvas.sideView2D,
            state: undefined
        }
    },
    props: {
        isComponentActive: Boolean
    },
    computed: {
        scene() {
            return this.$store.state.sceneID
        },
        interactiveSize() {
            return this.$store.state.interactiveSize
        }
    },
    watch: {
        interactiveSize: function(newD, oldD) {
            if (newD.w === oldD.w && newD.h === oldD.h) {
                return
            }

            if (this.isComponentActive) {
                this.updateResolution(newD.w, newD.h)
            }
        },
        scene: function(newScene, oldScene) {
            if (Util.isValueInObject(oldScene, Constants.scenes.threeandcanvas)) {
                this.undoInits()
                this.$store.commit('updateSceneSlider', new SliderState(oldScene, this))
                // Keep the same values between cube proj and slice so the user can compare them more easily
                if (oldScene === Constants.scenes.threeandcanvas.edgeCube) {
                    this.$store.commit('updateSceneSlider', new SliderState(Constants.scenes.threeandcanvas.solidCube, this))
                } else if (oldScene === Constants.scenes.threeandcanvas.solidCube) {
                    this.$store.commit('updateSceneSlider', new SliderState(Constants.scenes.threeandcanvas.edgeCube, this))
                }

                if (oldScene === Constants.scenes.threeandcanvas.sideView2D) {
                    this.resetControls()
                }
            }

            // when page is first loaded (oldScene is undefined) let the scene be loaded by mounted() instead
            if (oldScene != null && Util.isValueInObject(newScene, Constants.scenes.threeandcanvas)) {
                let newSliders = this.$store.state.sceneSliders[newScene]
                if (newSliders !== undefined) {
                    newSliders.extractValues(this)
                } else {
                    this.resetUI()
                }
                this.initScene(newScene)
            }
        },
        isComponentActive: function(newA, oldA) {
            if (oldA === false && newA) {
                this.updateResolution(this.interactiveSize.w, this.interactiveSize.h)
                requestAnimationFrame(this.animate)
            }
        },
        angleDegXZ: function() {
            this.angleXZ = this.angleDegXZ*(Math.PI/180)
            this.objectNeedsUpdate = true
        },
        angleDegYZ: function() {
            this.angleYZ = this.angleDegYZ*(Math.PI/180)
            this.objectNeedsUpdate = true
        },
        translateZ: function() {
            this.objectNeedsUpdate = true
        },
    },
    methods: {
        updateResolution(width, height) {
            let mainCanvasHeight = height*canvasPercentH
            camera.aspect = width/mainCanvasHeight
            camera.updateProjectionMatrix()
            renderer.setSize(width, mainCanvasHeight)

            let bottomHeight = height*sliceCanvasPercentH
            bottomCam.aspect = width/bottomHeight
            bottomCam.updateProjectionMatrix()
            bottomRend.setSize(width, bottomHeight)

            this.updateSliceCanvas(width, height)
            this.updateDisplay()

            if (this.scene === Constants.scenes.threeandcanvas.sideView2D) {
                let mainD =  new Util.Dimensions(width, mainCanvasHeight)
                let bottomD = new Util.Dimensions(width, bottomHeight)
                Axes.updateSideViewResolutions(this.state, mainD, bottomD)
            }
        },
        initThree() {
            let width = this.interactiveSize.w
            let height = this.interactiveSize.h*canvasPercentH
            threeScene = new THREE.Scene()

            renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
            })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            camera = new THREE.PerspectiveCamera(80, width/height, 0.1, 100)
            camera.layers.enable(1)
            camera.position.set(0, 0, 6)
            threeScene.add(camera)

            controls = new OrbitControls(camera, renderer.domElement)
            controls.enablePan = false
            controls.minDistance = 0.15
            this.resetControls()

            const mainLight = new THREE.DirectionalLight(0xffffff, 0.5)
            camera.add(mainLight)
            mainLight.position.set(-1.5, 2.5, 0)

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
            threeScene.add(ambientLight)
        },
        initBottomCamera() {
            let width = this.interactiveSize.w
            let height = this.interactiveSize.h*sliceCanvasPercentH

            bottomRend = new THREE.WebGLRenderer({
                canvas: this.canvas2,
            })
            bottomRend.setSize(width, height)
            bottomRend.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            bottomCam = new THREE.PerspectiveCamera(80, width/height, 0.1, 100)
            bottomCam.layers.enable(2)
            bottomCam.position.set(-11, 0, 3)
            bottomCam.lookAt(0, 0, 3)
            threeScene.add(bottomCam)
        },
        updateDisplay() {
            switch (this.scene) {
                case (Constants.scenes.threeandcanvas.sphere):
                    Objects3D.updateSphere(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Constants.scenes.threeandcanvas.solidCube):
                    Objects3D.updateSolidCube(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Constants.scenes.threeandcanvas.edgeCube):
                    Objects3D.updateEdgeCube(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                case (Constants.scenes.threeandcanvas.projCube):
                    break
                case (Constants.scenes.threeandcanvas.cone):
                    Objects3D.updateCone(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Constants.scenes.threeandcanvas.sideView2D):
                    Axes.updateZLine(this.state, camera.position)
                    break
            }
        },
        animate(timestamp) {
            let delta = timestamp - previousTimestamp
            if (delta >= interval) {
                if (this.objectNeedsUpdate) {
                    this.updateDisplay()
                    this.objectNeedsUpdate = false
                }
                renderer.render(threeScene, camera)

                if (this.scene === Constants.scenes.threeandcanvas.sideView2D) {
                    if (!previousCameraPosition.equals(camera.position)) {
                        this.updateDisplay()
                        previousCameraPosition.copy(camera.position)
                    }                    
                    bottomRend.render(threeScene, bottomCam)
                }

                previousTimestamp = timestamp
            }
            if (this.isComponentActive) {
                requestAnimationFrame(this.animate)
            }
        },
        updateSliceCanvas(width, totalHeight) {
            this.sliceCanvas.width = width
            this.sliceCanvas.height = totalHeight*sliceCanvasPercentH
        },
        undoInits() {
            if (this.state == null) {
                return
            }
            Util.removeThreeJsObjects(threeScene, ...Object.values(this.state))
            this.state = undefined
        },
        initScene(sceneID) {
            switch(sceneID) {
                case (Constants.scenes.threeandcanvas.sphere):
                    this.state = Objects3D.initSphere(threeScene)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.solidCube):
                    this.state = Objects3D.initSolidCube(threeScene)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.edgeCube):
                    this.state = Objects3D.initEdgeCube(threeScene)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.projCube):
                    break
                case (Constants.scenes.threeandcanvas.cone):
                    this.state = Objects3D.initCone(threeScene)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'YZ', 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.sideView2D):
                    camera.position.set(0, 0, 6.5)
                    let offset = 0.15
                    controls.minAzimuthAngle = (-Math.PI/2)+offset
                    controls.maxAzimuthAngle = (Math.PI/2)-offset               
                    controls.minPolarAngle = offset
                    controls.maxPolarAngle = Math.PI - offset
                    controls.maxDistance = 7
                    controls.update()

                    let mainCanvasHeight = this.interactiveSize.h*canvasPercentH
                    let mainD =  new Util.Dimensions(this.interactiveSize.w, mainCanvasHeight)
                    let bottomHeight = this.interactiveSize.h*sliceCanvasPercentH
                    let bottomD = new Util.Dimensions(this.interactiveSize.w, bottomHeight)
                    this.state = Axes.initSideView2D(threeScene, mainD, bottomD, camera)
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    break
            }
            this.objectNeedsUpdate = true
        },
        resetUI() {
            this.angleXZ = this.angleDegXZ = 0
            this.angleYZ = this.angleDegYZ = 0
            this.translateZ = 0
        },
        resetControls() {
            controls.minAzimuthAngle = Infinity
            controls.maxAzimuthAngle = Infinity             
            controls.minPolarAngle = 0
            controls.maxPolarAngle = Math.PI
            controls.maxDistance = 30
            controls.update()
        }
    },
    mounted() {
        this.canvas = this.$refs.canvas
        this.sliceCanvas = this.$refs.sliceCanvas
        this.canvas2 = this.$refs.canvas2
        this.updateSliceCanvas(this.interactiveSize.w, this.interactiveSize.h)

        this.initThree()
        this.initBottomCamera()
        this.initScene(this.scene)
        requestAnimationFrame(this.animate)
    }
}
</script>

<style>
.top-container {
    width: 100%;
    height: 100%;
}

.main-canvas {
    position: absolute;
}

.bottom-canvas {
    display: inline-block;
}

.three-container {
    position: relative;
    width: 100%;
    height: 60%
}

.three-overlay {
    width:100%;
    height:100%;
    position: absolute;
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

.slider-row {
    text-align: right;
}

.slider-text {
    border-radius: 4px;
    border: none;
    text-align: center;
}

.unit-text {
    color: lightgray
}

.invisible {
    color: transparent;
}

.slider-button {
    margin-bottom: 3px;
}

.canvas-border {
    border-top: 4px solid rgb(40, 40, 40);
}
</style>