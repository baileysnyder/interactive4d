<template>
    <div class="top-container">
        <div class="three-container">
            <canvas class="main-canvas" ref="canvas"></canvas>
            <div class="three-overlay">
                <div class="top-right sticky-box">
                    <input v-show="enableShowObject" type="checkbox" id="show-object" v-model="showObject">
                    <label v-show="enableShowObject" for="show-object">Show Object</label>
                    <input v-show="enableHighlightFace" type="checkbox" id="highlight-face" v-model="highlightFace">
                    <label v-show="enableHighlightFace" for="highlight-face">Highlight Face</label>
                </div>
                <div class="bottom-right sticky-box">
                    <div class="slider-row" v-show="slidersEnabled.RESET">
                        <button class="slider-button" @click="setFaceAngle" v-show="enableCubeAligns"><img src="~assets/icons/square_face.png" alt="align cube face first icon"></button>
                        <button class="slider-button" @click="setEdgeAngle" v-show="enableCubeAligns"><img src="~assets/icons/square_edge.png" alt="align cube edge first icon"></button>
                        <button class="slider-button" @click="setPointAngle" v-show="enableCubeAligns"><img src="~assets/icons/square_point.png" alt="align cube point first icon"></button>
                        <button class="slider-button" @click="resetSliderValues"><svg class="reset-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path fill="#e8e8e8" d="M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.84 0-95.17-15.58-134.2-44.86c-14.12-10.59-16.97-30.66-6.375-44.81c10.59-14.12 30.62-16.94 44.81-6.375c27.84 20.91 61 31.94 95.88 31.94C344.3 415.8 416 344.1 416 256s-71.69-159.8-159.8-159.8c-37.46 0-73.09 13.49-101.3 36.64l45.12 45.14c17.01 17.02 4.955 46.1-19.1 46.1H35.17C24.58 224.1 16 215.5 16 204.9V59.04c0-24.04 29.07-36.08 46.07-19.07l47.6 47.63C149.9 52.71 201.5 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z"/></svg></button>
                        <span class="unit-text invisible">°</span>
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
        <canvas v-show="!bottomCamActive && !orthoCamActive" class="bottom-canvas" ref="sliceCanvas"></canvas>
        <canvas v-show="bottomCamActive || orthoCamActive" class="bottom-canvas canvas-border" ref="canvasBottom"></canvas>
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

let delta = 0
let previousTimestamp = 0
let interval = 1000/60
const canvasPercentH = 0.6
const sliceCanvasPercentH = 0.4

const projObjZ = 1.5

let camera
let threeScene
let renderer
let controls
let mainLight
let ambientLight
let bottomLight

let bottomCam
let bottomRend

// let orthoCam
// const orthoS = 0.006

let previousCameraPosition = new THREE.Vector3(0, 0, 0)

const outToInCubes = [4, 2, 5]
let cubeIndex = 0

let frameCount = 0
let debugFlag = false

export default {
    data() {
        return {
            isOrthoActive: false,

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
            showObject: false,
            highlightFace: false,
            canvas: undefined,
            sliceCanvas: undefined,
            objectNeedsUpdate: false,
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
        },
        enableCubeAligns() {
            return this.scene === Constants.scenes.threeandcanvas.solidCube || this.scene === Constants.scenes.threeandcanvas.edgeCube
        },
        enableShowObject() {
            return this.scene === Constants.scenes.threeandcanvas.cone
        },
        enableHighlightFace() {
            return this.scene === Constants.scenes.threeandcanvas.projEdgeCube
        },
        enableOrthoPersp() {
            return this.scene === Constants.scenes.threeandcanvas.projCube
        },
        bottomCamActive() {
            return this.scene === Constants.scenes.threeandcanvas.sideView2D || (this.scene === Constants.scenes.threeandcanvas.projCube && this.isOrthoActive === false) ||
            this.scene === Constants.scenes.threeandcanvas.projSphere || this.scene === Constants.scenes.threeandcanvas.projEdgeCube || this.scene === Constants.scenes.threeandcanvas.projSpherePoints
        },
        orthoCamActive() {
            return this.scene === Constants.scenes.threeandcanvas.projCube && this.isOrthoActive === true
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
                this.undoInits(oldScene)
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
                    this.resetSliderValues()
                    debugFlag = false
                }
                this.initScene(newScene)
            }
        },
        isComponentActive: function(newA, oldA) {
            if (newA && this.scene && this.scene === Constants.scenes.threeandcanvas.sphere ||
            this.scene === Constants.scenes.threeandcanvas.solidCube || this.scene === Constants.scenes.threeandcanvas.edgeCube ||
            this.scene === Constants.scenes.threeandcanvas.cone) {
                camera.position.set(-6.011, 0.447, 3.556)
                controls.update()
            }
            if (newA && this.scene && this.scene === Constants.scenes.threeandcanvas.projCube ||
            this.scene === Constants.scenes.threeandcanvas.projEdgeCube || this.scene === Constants.scenes.threeandcanvas.projSphere ||
            this.scene === Constants.scenes.threeandcanvas.projSpherePoints) {
                camera.position.set(-4.961, 3.505, 3.4747)
                controls.update()
            }
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
        showObject(val) {
            if (this.scene !== Constants.scenes.threeandcanvas.cone) {
                return
            }
            this.state.mainMesh.visible = val
        },
        highlightFace() {
            if (this.scene !== Constants.scenes.threeandcanvas.projEdgeCube) {
                return
            }
            this.objectNeedsUpdate = true
        }
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

            if (this.orthoCamActive) {
                orthoCam.left = -width*orthoS
                orthoCam.right = width*orthoS
                orthoCam.top = bottomHeight*orthoS
                orthoCam.bottom = -bottomHeight*orthoS
                //orthoCam.zoom = Math.min(width/300, bottomHeight/300)
                orthoCam.updateProjectionMatrix()
            }

            this.updateSliceCanvas(width, height)
            this.updateDisplay()

            if (this.scene === Constants.scenes.threeandcanvas.sideView2D) {
                let mainD =  new Util.Dimensions(width, mainCanvasHeight)
                let bottomD = new Util.Dimensions(width, bottomHeight)
                Axes.updateSideViewResolutions(this.state, mainD, bottomD)
            }
        },
        initRenderer(canvas, w, h) {
            let rend = new THREE.WebGLRenderer({
                canvas: canvas,
            })
            rend.setSize(w, h)
            rend.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            return rend
        },
        initThree() {
            let width = this.interactiveSize.w
            let height = this.interactiveSize.h*sliceCanvasPercentH

            threeScene = new THREE.Scene()
            renderer = this.initRenderer(this.canvas, width, height)

            camera = new THREE.PerspectiveCamera(80, width/height, 0.1, 40)
            camera.layers.enable(1)
            camera.position.set(0, 0, 6)
            threeScene.add(camera)

            controls = new OrbitControls(camera, renderer.domElement)
            controls.enablePan = false
            controls.minDistance = 0.15
            this.resetControls()

            mainLight = new THREE.DirectionalLight(0xffffff, 0.5)
            camera.add(mainLight)
            mainLight.position.set(-1.5, 2.5, 0)
            mainLight.layers.set(1)

            ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
            threeScene.add(ambientLight)
        },
        initBottomCamera() {
            let width = this.interactiveSize.w
            let height = this.interactiveSize.h*sliceCanvasPercentH

            bottomRend = this.initRenderer(this.$refs.canvasBottom, width, height)

            bottomCam = new THREE.PerspectiveCamera(80, width/height, 0.1, 20)
            bottomCam.layers.enable(2)
            bottomCam.position.set(-11, 0, 3)
            bottomCam.lookAt(0, 0, 3)
            threeScene.add(bottomCam)

            bottomLight = new THREE.DirectionalLight(0xffffff, 0.5)
            bottomCam.add(bottomLight)
            bottomLight.position.set(-1.5, 2.5, 0)
            //bottomLight.position.set(-0.75, 1.25, 0)
            bottomLight.layers.set(2)
        },
        initOrthoCamera() {
            let width = this.interactiveSize.w
            let height = this.interactiveSize.h*sliceCanvasPercentH

            orthoCam = new THREE.OrthographicCamera(-width*orthoS, width*orthoS, height*orthoS, -height*orthoS, 0.5, 10)
            orthoCam.layers.enable(3)
            orthoCam.position.set(0, 0, -1)
            orthoCam.lookAt(0, 0, 1)
            threeScene.add(orthoCam)

            const light = new THREE.DirectionalLight(0xffffff, 0.5)
            orthoCam.add(light)
            light.position.set(-1.5, 2.5, 0)
            light.layers.set(3)
        },
        updateDisplay() {
            switch (this.scene) {
                case (Constants.scenes.threeandcanvas.sphere):
                    Objects3D.updateSphere(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    //Objects3D.updateSphereRing(this.sillyState, parseFloat(this.angleXZ))
                    break
                case (Constants.scenes.threeandcanvas.solidCube):
                    Objects3D.updateSolidCube(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Constants.scenes.threeandcanvas.edgeCube):
                    Objects3D.updateEdgeCube(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Constants.scenes.threeandcanvas.projCube):
                    Objects3D.transformMesh(this.state.mainMesh, parseFloat(this.angleXZ), parseFloat(this.angleYZ), projObjZ)
                    break
                case (Constants.scenes.threeandcanvas.cone):
                    Objects3D.updateCone(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Constants.scenes.threeandcanvas.sideView2D):
                    Axes.updateZLine(this.state, camera.position)
                    break
                case (Constants.scenes.threeandcanvas.projEdgeCube):
                    Objects3D.updateProjCube(this.state, parseFloat(this.angleXZ), parseFloat(this.angleYZ), projObjZ, this.highlightFace)
                    break
                case (Constants.scenes.threeandcanvas.projSphere):
                    //Objects3D.transformMesh(this.state.mainMesh, parseFloat(this.angleXZ), parseFloat(this.angleYZ), projObjZ)
                    break
                case (Constants.scenes.threeandcanvas.projSpherePoints):
                    Objects3D.updateProjSpherePoints(this.state, threeScene, parseFloat(this.angleXZ), parseFloat(this.angleYZ), projObjZ)
                    break
                case (Constants.scenes.threeandcanvas.squareSlice):
                    Objects3D.updateSingleSquare(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Constants.scenes.threeandcanvas.coneNoToggle):
                    Objects3D.updateCone(this.state, this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
            }
        },
        animate(timestamp) {
            delta += timestamp - previousTimestamp            
            if (delta >= interval) {
                // frameCount++
                // if (this.scene === Constants.scenes.threeandcanvas.projEdgeCube && frameCount%80 === 0) {
                //     Objects3D.colorProjCubeSquare(this.state, outToInCubes[cubeIndex], Constants.projCylColor)
                //     cubeIndex = (cubeIndex+1)%3
                // }

                // if (this.scene === Constants.scenes.threeandcanvas.squareSlice && debugFlag) {
                //     this.angleDegXZ+=1
                // }
                
                //console.log(camera.position.x + ", " + camera.position.y + ", " + camera.position.z)
                
                if (this.objectNeedsUpdate) {
                    //this.translateZ = this.translateZ > 1.5 ? -1.5 : this.translateZ + 0.018
                    this.updateDisplay()
                    this.objectNeedsUpdate = false
                }
                renderer.render(threeScene, camera)

                if (this.bottomCamActive) {
                    if (this.scene === Constants.scenes.threeandcanvas.sideView2D && !previousCameraPosition.equals(camera.position)) {
                        this.updateDisplay()
                        previousCameraPosition.copy(camera.position)
                    }
                    bottomRend.render(threeScene, bottomCam)
                }

                if (this.orthoCamActive) {
                    bottomRend.render(threeScene, orthoCam)
                }
                delta = delta % interval
            }
            if (this.isComponentActive) {
                previousTimestamp = timestamp
                requestAnimationFrame(this.animate)
            }
        },
        updateSliceCanvas(width, totalHeight) {
            this.sliceCanvas.width = width
            this.sliceCanvas.height = totalHeight*sliceCanvasPercentH
        },
        undoInits(oldScene) {
            if (this.state == null) {
                return
            }
            if (oldScene === Constants.scenes.threeandcanvas.sideView2D) {
                camera.remove(this.state.cameraSphere)
            }
            Util.removeThreeJsObjects(threeScene, ...Object.values(this.state))
            this.state = undefined
        },
        initScene(sceneID) {
            mainLight.intensity = 0.5
            ambientLight.intensity = 0.5
            bottomLight.intensity = 0.5
            switch(sceneID) {
                case (Constants.scenes.threeandcanvas.sphere):
                    mainLight.intensity = 0.8
                    ambientLight.intensity = 0.25
                    this.state = Objects3D.initSphere(threeScene)
                    //this.sillyState = Objects3D.initSphereRing(threeScene)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.solidCube):
                    this.state = Objects3D.initSolidCube(threeScene, 0, 0)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.edgeCube):
                    this.state = Objects3D.initEdgeCube(threeScene)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.projCube):
                    bottomCam.position.set(0, 0, -projObjZ)
                    bottomCam.lookAt(0, 0, 0)
                    this.state = Objects3D.initSolidCube(threeScene, -projObjZ, projObjZ)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.cone):
                    mainLight.intensity = 0.7
                    ambientLight.intensity = 0.3
                    this.state = Objects3D.initCone(threeScene, this.showObject)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'YZ', 'Z', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.coneNoToggle):
                    mainLight.intensity = 0.7
                    ambientLight.intensity = 0.3
                    this.state = Objects3D.initCone(threeScene, true)
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

                    bottomCam.position.set(-11, 0, 3)
                    bottomCam.lookAt(0, 0, 3)

                    let mainCanvasHeight = this.interactiveSize.h*canvasPercentH
                    let mainD =  new Util.Dimensions(this.interactiveSize.w, mainCanvasHeight)
                    let bottomHeight = this.interactiveSize.h*sliceCanvasPercentH
                    let bottomD = new Util.Dimensions(this.interactiveSize.w, bottomHeight)
                    this.state = Axes.initSideView2D(threeScene, mainD, bottomD, camera)
                    Util.toggleBoolsInObj(this.slidersEnabled)
                    break
                case (Constants.scenes.threeandcanvas.projEdgeCube):
                    bottomCam.position.set(0, 0, -projObjZ)
                    bottomCam.lookAt(0, 0, 0)
                    bottomCam.updateProjectionMatrix()
                    this.state = Objects3D.initProjCube(threeScene, -projObjZ)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'RESET')
                    
                    // Objects3D.colorProjCubeSquare(this.state, 1, Constants.projCylColor)
                    break
                case (Constants.scenes.threeandcanvas.projSphere):
                    mainLight.intensity = 0.8
                    ambientLight.intensity = 0.25
                    bottomLight.intensity = 0.8
                    bottomCam.position.set(0, 0, -projObjZ)
                    bottomCam.lookAt(0, 0, 0)
                    this.state = Objects3D.initProjSphere(threeScene, -projObjZ, projObjZ)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.projSpherePoints):
                    bottomCam.position.set(0, 0, -projObjZ)
                    bottomCam.lookAt(0, 0, 0)
                    this.state = Objects3D.initProjSpherePoints(threeScene, -projObjZ)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'RESET')
                    break
                case (Constants.scenes.threeandcanvas.squareSlice):
                    this.state = Objects3D.initSingleSquare(threeScene)
                    Util.toggleBoolsInObj(this.slidersEnabled, 'XZ', 'YZ', 'Z', 'RESET')
                    break
            }
            this.objectNeedsUpdate = true
        },
        resetSliderValues() {
            this.angleDegXZ = 0
            this.angleDegYZ = 0
            this.translateZ = 0
            debugFlag = true
        },
        resetControls() {
            controls.minAzimuthAngle = Infinity
            controls.maxAzimuthAngle = Infinity             
            controls.minPolarAngle = 0
            controls.maxPolarAngle = Math.PI
            controls.maxDistance = 30
            controls.update()
        },
        setFaceAngle() {
            if (!this.enableCubeAligns) {
                return
            }
            this.angleDegXZ = 0
            this.angleDegYZ = 0
        },
        setEdgeAngle() {
            if (!this.enableCubeAligns) {
                return
            }
            this.angleDegXZ = 45
            this.angleDegYZ = 0
        },
        setPointAngle() {
            if (!this.enableCubeAligns) {
                return
            }
            this.angleDegXZ = 45
            this.angleDegYZ = 36
        }
    },
    mounted() {
        this.canvas = this.$refs.canvas
        this.sliceCanvas = this.$refs.sliceCanvas
        this.updateSliceCanvas(this.interactiveSize.w, this.interactiveSize.h)

        this.$nuxt.$on('align-face-first', () => this.setFaceAngle())
        this.$nuxt.$on('align-edge-first', () => this.setEdgeAngle())
        this.$nuxt.$on('align-point-first', () => this.setPointAngle())

        this.initThree()
        this.initBottomCamera()
        //this.initOrthoCamera()
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

.canvas-border {
    border-top: 4px solid rgb(40, 40, 40);
    box-sizing: border-box;
}

.reset-icon {
    width: 16px;
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

.top-right-button {
  border: none;
  border-radius: 5px;
  padding-left: 8px;
    padding-right: 8px;
    padding-top: 3px;
    padding-bottom: 3px;
}
</style>