<template>
<div>
    <div class="three-container">
        <canvas ref="canvas"></canvas>
        <div class="three-overlay">
            <div class="top-right sticky-box">
                <div class="slider-row">
                    <button v-show="scene === rapSceneID" class="top-right-button" :class="{'active': !isPlaneActive, 'inactive': isPlaneActive}" @click="isPlaneActive=false">Axis</button>
                    <button v-show="scene === rapSceneID" class="top-right-button" :class="{'active': isPlaneActive, 'inactive': !isPlaneActive}" @click="isPlaneActive=true">Plane</button>
                    <input v-show="enableColorCubes" type="checkbox" id="color-cubes" v-model="colorCubes">
                    <label v-show="enableColorCubes" for="color-cubes">Color Cubes</label>
                </div>               
                <div class="slider-row">
                    <button v-show="enableOppositeCubeColors" class="top-right-button" :class="{'active': oppCubeIndex === 0, 'inactive': oppCubeIndex !== 0}" @click="oppCubeIndex=0">
                        <div class="color-patch cube0"></div>
                        <div class="color-patch cube7"></div>
                    </button>
                    <button v-show="enableOppositeCubeColors" class="top-right-button" :class="{'active': !oppCubeIndex === 1, 'inactive': oppCubeIndex !== 1}" @click="oppCubeIndex=1">
                        <div class="color-patch cube1"></div>
                        <div class="color-patch cube4"></div>
                    </button>
                    <button v-show="enableOppositeCubeColors" class="top-right-button" :class="{'active': !oppCubeIndex === 2, 'inactive': oppCubeIndex !== 2}" @click="oppCubeIndex=2">
                        <div class="color-patch cube2"></div>
                        <div class="color-patch cube5"></div>
                    </button>
                    <button v-show="enableOppositeCubeColors" class="top-right-button" :class="{'active': !oppCubeIndex === 3, 'inactive': oppCubeIndex !== 3}" @click="oppCubeIndex=3">
                        <div class="color-patch cube3"></div>
                        <div class="color-patch cube6"></div>
                    </button>
                </div>
                
            </div>
            <div class="bottom-right sticky-box">
                <div class="slider-row" v-show="slidersEnabled.RESET">
                    <button class="slider-button" @click="resetSliderValues"><svg class="reset-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path fill="#e8e8e8" d="M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.84 0-95.17-15.58-134.2-44.86c-14.12-10.59-16.97-30.66-6.375-44.81c10.59-14.12 30.62-16.94 44.81-6.375c27.84 20.91 61 31.94 95.88 31.94C344.3 415.8 416 344.1 416 256s-71.69-159.8-159.8-159.8c-37.46 0-73.09 13.49-101.3 36.64l45.12 45.14c17.01 17.02 4.955 46.1-19.1 46.1H35.17C24.58 224.1 16 215.5 16 204.9V59.04c0-24.04 29.07-36.08 46.07-19.07l47.6 47.63C149.9 52.71 201.5 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z"/></svg></button>
                    <span class="unit-text invisible">°</span>
                </div>
                <div class="slider-row" v-show="slidersEnabled.ZW">
                    <label for="angleZW">ZW</label>
                    <input id="angleZW" v-model="angleDegZW" type="range" :min="startSliderAt0 ? 0 : -angleMax" :max="angleMax" value="0" step="1">
                    <input v-model="angleDegZW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider-row" v-show="slidersEnabled.YW">
                    <label for="angleYW">YW</label>
                    <input id="angleYW" v-model="angleDegYW" type="range" :min="-angleMax" :max="angleMax" value="0" step="1">
                    <input v-model="angleDegYW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider-row" v-show="slidersEnabled.XW">
                    <label for="angleXW">XW</label>
                    <input id="angleXW" v-model="angleDegXW" type="range" :min="-angleMax" :max="angleMax" value="0" step="1">
                    <input v-model="angleDegXW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider-row" v-show="slidersEnabled.IN">
                    <label for="angleIN">IN/OUT</label>
                    <input id="angleIN" v-model="angleDegIN" type="range" :min="-angleMax" :max="angleMax" value="0" step="1">
                    <input v-model="angleDegIN" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider-row" v-show="slidersEnabled.W">
                    <label for="translateW">W</label>
                    <input id="translateW" v-model="translateW" type="range" min="-2" max="2" value="0" step="0.01">
                    <input class="slider-text" v-model="translateW" type="text" size="4">
                    <span class="unit-text invisible">°</span>
                </div>
                <div class="slider-row" v-show="slidersEnabled.GEN">
                    <input v-model="angleDegGEN" type="range" :min="-angleMax" :max="angleMax" value="0" step="1">
                    <input class="slider-text" v-model="angleDegGEN" type="text" size="4">
                    <span class="unit-text">°</span>
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
import * as Constants from '../../scripts/constants'
import * as Cone4D from '../../scripts/cone-4d'
import * as Cube4D from '../../scripts/cube-4d'
import * as Sphere4D from '../../scripts/sphere-4d'
import * as Axes from '../../scripts/axes'
import * as Rotations from '../../scripts/rotations' 
import * as Objects3D from '../../scripts/objects-3d'
import * as Cone from '../../scripts/cone'

class SliderState {
    constructor(sceneID, vueContext) {
        this.sceneID = sceneID
        this.angleDegXW = vueContext.angleDegXW
        this.angleDegYW = vueContext.angleDegYW
        this.angleDegZW = vueContext.angleDegZW
        this.angleDegIN = vueContext.angleDegIN
        this.angleGEN = vueContext.angleGEN
        this.translateW = vueContext.translateW
        this.colorCubes = vueContext.colorCubes
    }

    extractValues(vueContext){
        vueContext.angleDegXW = this.angleDegXW
        vueContext.angleDegYW = this.angleDegYW
        vueContext.angleDegZW = this.angleDegZW
        vueContext.angleDegIN = this.angleDegIN
        vueContext.angleGEN = this.angleGEN
        vueContext.translateW = this.translateW
        vueContext.colorCubes = this.colorCubes
    }
}

let camera
let threeScene
let renderer
let controls
let mainLight
let ambientLight

let clock = new THREE.Clock()
let delta = 0
let interval = 1 / 60

let sphereSliceCount = 0
let frameCount = 0

const outToInCubes = [7, 6, 0]
let cubeIndex = 0


export default {
    data() {
        return {
            isPlaneActive: false,
            colorCubes: false,
            oppCubeIndex: 0,

            angleXW: 0.0,
            angleYW: 0.0,
            angleZW: 0.0,
            angleIN: 0.0,
            angleGEN: 0.0,
            angleDegXW: 0,
            angleDegYW: 0,
            angleDegZW: 0,
            angleDegIN: 0,
            angleDegGEN: 0,
            translateW: 0.0,
            slidersEnabled: {
                XW: false,
                YW: false,
                ZW: false,
                IN: false,
                W: false,
                GEN: false,
                RESET: false
            },
            angleMax: 0,

            objectNeedsUpdate: false,
            state: undefined,
            rapSceneID: Constants.scenes.three.rotateAxisPlane
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
        },
        enableColorCubes() {
            return this.scene === Constants.scenes.three.sliceHypercube || this.scene === Constants.scenes.three.projHypercube
        },
        enableOppositeCubeColors() {
            return this.scene === Constants.scenes.three.projHypercube && this.colorCubes
        },
        startSliderAt0() {
            return this.scene === Constants.scenes.three.rotateCubeIn4D
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
            if (Util.isValueInObject(oldScene, Constants.scenes.three)) {
                this.undoInits()
                this.$store.commit('updateSceneSlider', new SliderState(oldScene, this))
                // Keep the same values between cube proj and slice so the user can compare them more easily
                if (oldScene === Constants.scenes.three.sliceHypercube) {
                    this.$store.commit('updateSceneSlider', new SliderState(Constants.scenes.three.projHypercube, this))
                } else if (oldScene === Constants.scenes.three.projHypercube) {
                    this.$store.commit('updateSceneSlider', new SliderState(Constants.scenes.three.sliceHypercube, this))
                }
            }

            // when page is first loaded (oldScene is undefined) let the scene be loaded by mounted() instead
            if (oldScene != null && Util.isValueInObject(newScene, Constants.scenes.three)) {
                let newSliders = this.$store.state.sceneSliders[newScene]
                if (newSliders !== undefined) {
                    newSliders.extractValues(this)
                } else {
                    this.resetSliderValues()
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
        isPlaneActive: function() {
            this.objectNeedsUpdate = true
        },
        colorCubes: function(newVal) {
            this.objectNeedsUpdate = true        
        },
        oppCubeIndex: function(newVal) {
            this.objectNeedsUpdate = true
        },
        angleDegXW: function() {
            this.angleXW = Util.degreeToRadian(this.angleDegXW)
            this.objectNeedsUpdate = true
        },
        angleDegYW: function() {
            this.angleYW = Util.degreeToRadian(this.angleDegYW)
            this.objectNeedsUpdate = true
        },
        angleDegZW: function() {
            this.angleZW = Util.degreeToRadian(this.angleDegZW)
            this.objectNeedsUpdate = true
        },
        angleDegIN: function() {
            this.angleIN = Util.degreeToRadian(this.angleDegIN)
            this.objectNeedsUpdate = true
        },
        angleDegGEN: function() {
            this.angleGEN = Util.degreeToRadian(this.angleDegGEN)
            this.objectNeedsUpdate = true
        },
        translateW: function() {
            this.objectNeedsUpdate = true
        }
    },
    methods: {
        updateResolution(width, height) {
            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.setSize(width, height)

            if (this.state != null && this.state.lineMeshes != null) {
                Util.updateLineResolution(this.state.lineMeshes, width, height)
            }
        },
        initThree() {
            let width = this.interactiveSize.w
            let height = this.interactiveSize.h
            const canvas = this.$refs.canvas
            threeScene = new THREE.Scene()

            renderer = new THREE.WebGLRenderer({
                canvas: canvas
            })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            camera = new THREE.PerspectiveCamera(80, width/height, 0.1, 100)
            camera.layers.enable(1)
            camera.position.set(0, 0, 6)
            threeScene.add(camera)

            controls = new OrbitControls(camera, renderer.domElement)
            controls.enablePan = false;
            controls.update();

            mainLight = new THREE.DirectionalLight(0xffffff, 0.5)
            camera.add(mainLight)
            mainLight.position.set(-1.5, 2.5, 0)

            ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
            threeScene.add(ambientLight)
        },
        animate() {
            delta += clock.getDelta();
            
            if (delta > interval) {
                //frameCount++
                // if (this.scene === Constants.scenes.three.sphereSliceAnim && frameCount%15 === 0) {                   
                //     Objects3D.updateSphereSliceAnim(this.state, sphereSliceCount)
                //     sphereSliceCount = (sphereSliceCount+1)%state.circleMeshes.length
                // }
                // else if (this.scene === Constants.scenes.three.projHypercube && frameCount%80 === 0) {
                //     Cube4D.colorSingleCubeHypProj(this.state, cubeIndex, Constants.cubeColors[cubeIndex])
                //     cubeIndex = (cubeIndex+1)%8
                // }
                // if (this.scene === Constants.scenes.three.projCone3D){
                //     this.angleXZ+=0.017
                //     Cone.updateConeProj3D(this.state, this.angleYZ, this.angleXZ, this.angleXY)
                // }
                // else if (this.scene === Constants.scenes.three.projCone3DAnimation) {
                //     Cone.animateConeProj3D(this.state, frameCount)
                // }
                
                //console.log(camera.position.x + ", " + camera.position.y + ", " + camera.position.z)
                if (this.objectNeedsUpdate) {
                    //this.translateW = this.translateW > 2 ? -2 : this.translateW + 0.024
                    switch (this.scene) {
                        case (Constants.scenes.three.sliceHypercube):
                            Cube4D.updateHypercubeSlice(this.state, parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW), this.colorCubes)
                            break
                        case (Constants.scenes.three.projHypercube):
                            Cube4D.updateHypercubeProjection(this.state, parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), this.colorCubes, this.oppCubeIndex)
                            break
                        case (Constants.scenes.three.sliceHypersphere):
                            Sphere4D.updateSliceHypersphere(this.state, parseFloat(this.translateW))
                            break
                        case (Constants.scenes.three.projHypersphere):
                            Sphere4D.updateProjHypersphere(this.state, parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW))
                            break
                        case (Constants.scenes.three.projCone):
                            Cone4D.updateProjectionCone(this.state, parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                        case (Constants.scenes.three.sliceCone):
                            Cone4D.updateSliceCone(this.state, threeScene, parseFloat(this.angleIN), parseFloat(this.translateW))
                            break
                        case (Constants.scenes.three.rotateAxisPlane):
                            Rotations.updateRotateAxisPlane(this.state, parseFloat(this.angleGEN), this.isPlaneActive)
                            break
                        case (Constants.scenes.three.rotateCubeIn4D):
                            Cube4D.updateRotateCubeIn4D(this.state, parseFloat(this.angleZW))
                            break
                    }
                    this.objectNeedsUpdate = false
                }

                renderer.render(threeScene, camera)
                delta = delta % interval
            }
            if (this.isComponentActive) {
                requestAnimationFrame(this.animate)
            }
        },
        undoInits() {
            if (this.state == null) {
                return
            }
            Util.removeThreeJsObjects(threeScene, ...Object.values(this.state))
            this.state = undefined
        },
        initScene(sceneID) {
            controls.enableRotate = true
            controls.update()
            mainLight.intensity = 0.5
            ambientLight.intensity = 0.5
            switch(sceneID) {
                case (Constants.scenes.three.sliceHypercube):
                    this.angleMax = 180
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XW', 'YW', 'ZW', 'W', 'RESET')
                    this.state = Cube4D.initSliceHypercube(threeScene, this.interactiveSize.w, this.interactiveSize.h) 
                    break
                case (Constants.scenes.three.projHypercube):
                    this.angleMax = 180
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XW', 'YW', 'ZW', 'RESET')
                    this.state = Cube4D.initProjHypercube(threeScene)
                    break
                case (Constants.scenes.three.sliceHypersphere):
                    this.angleMax = 0
                    mainLight.intensity = 0.8
                    ambientLight.intensity = 0.25
                    Util.toggleBoolsInObj(this.slidersEnabled, 'W', 'RESET')
                    this.state = Sphere4D.initSliceHypersphere(threeScene)
                    break
                case (Constants.scenes.three.projHypersphere):
                    this.angleMax = 180
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XW', 'YW', 'ZW', 'RESET')
                    this.state = Sphere4D.initProjHypersphere(threeScene)
                    break
                case (Constants.scenes.three.projCone):
                    this.angleMax = 360
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XW', 'YW', 'ZW', 'RESET')
                    this.state = Cone4D.initProjCone(threeScene)
                    break
                case (Constants.scenes.three.sliceCone):
                    this.angleMax = 360
                    mainLight.intensity = 0.8
                    ambientLight.intensity = 0.25
                    Util.toggleBoolsInObj(this.slidersEnabled, 'IN', 'W', 'RESET')
                    this.state = Cone4D.initSliceCone(threeScene)
                    break
                case (Constants.scenes.three.axesWithCube):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Axes.initAxesWithCube(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    camera.position.set(-0.951, 0.917, 5.853)
                    controls.update()
                    break
                case (Constants.scenes.three.axis1D):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Axes.init1D(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    controls.enableRotate = false
                    controls.reset()
                    break
                case(Constants.scenes.three.axis2D):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Axes.init2D(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    controls.reset()
                    break
                case(Constants.scenes.three.axis3D):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Axes.init3D(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    camera.position.set(0.864, 0.78, 5.886)
                    controls.update()
                    break
                case (Constants.scenes.three.rotateAxisPlane):
                    this.angleMax = 360
                    Util.toggleBoolsInObj(this.slidersEnabled, "GEN", 'RESET')
                    this.state = Rotations.initRotateAxisPlane(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    camera.position.set(-2.674, 3.265, 4.265)
                    controls.update()
                    break
                case (Constants.scenes.three.rotate3D):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Rotations.initPlanes3D(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    camera.position.set(2.903, 2.217, 5.969)
                    controls.update()
                    break
                case (Constants.scenes.three.rotate4D):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Rotations.initPlanes4D(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    camera.position.set(-1.911, 1.862, 5.725)
                    controls.update()
                    break
                case (Constants.scenes.three.sphereSliceAnim):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Objects3D.initSphereSliceAnim(threeScene, this.interactiveSize.w, this.interactiveSize.h)
                    maxSphereSliceCount = this.state.circleMeshes.length
                    break
                case (Constants.scenes.three.sphereOutlineRadius):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Objects3D.initSphereOutlineRadius(threeScene)
                    break
                case (Constants.scenes.three.sphereSlicesLined):
                    mainLight.intensity = 0.8
                    ambientLight.intensity = 0.25
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Objects3D.initSphereSlicesLined(threeScene)
                    break
                case (Constants.scenes.three.projCone3D):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Cone.initConeProj3D(threeScene)
                    this.angleYZ = 0
                    this.angleXZ = 0
                    this.angleXY = 0
                    break
                case (Constants.scenes.three.projCone3DAnimation):
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    this.state = Cone.initConeProj3D(threeScene)
                    break
                case (Constants.scenes.three.rotateCubeIn4D):
                    this.angleMax = 180
                    Util.toggleBoolsInObj(this.slidersEnabled, "ZW", "RESET")
                    this.state = Cube4D.initRotateCubeIn4D(threeScene)
                    break
            }
            this.objectNeedsUpdate = true
        },
        resetSliderValues() {
            this.angleDegXW = 0
            this.angleDegYW = 0
            this.angleDegZW = 0
            this.angleDegIN = 0
            this.angleDegGEN = 0
            this.translateW = 0           
        }
    },
    mounted() {
        this.initThree()
        this.initScene(this.scene)
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

.slider-row {
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


.top-right-button {
  border: none;
  border-radius: 5px;
  padding-left: 8px;
    padding-right: 8px;
    padding-top: 3px;
    padding-bottom: 3px;
}

.inactive {
  background: rgb(60, 60, 60);
  color: rgb(232, 232, 232);
}

.inactive:hover {
  background: rgb(75, 75, 75);
}

.active {
  background: rgb(209, 209, 209);
  color: rgb(30, 30, 30);
}

.slider-button {
    margin-bottom: 6px;
    border: none;
    border-radius: 5px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 4px;
    background: rgb(60, 60, 60);
}

.slider-button:hover {
  background: rgb(75, 75, 75);
}

.color-patch {
    width: 10px;
    height: 10px;
    display: inline-block;
    border: solid 1px;
}
</style>