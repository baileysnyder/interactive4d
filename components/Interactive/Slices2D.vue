<template>
    <div class="top-container">
        <div class="three-container">
            <canvas class="main-canvas" ref="canvas"></canvas>
            <div class="three-overlay">
                <div class="top-right sticky-box">
                    <button @click="initSphere">Sphere</button>
                </div>
                <div class="bottom-right sticky-box">
                    <div class="slider">
                        <label for="angleXZ">XZ</label>
                        <input id="angleXZ" v-model="angleXZ" type="range" min="-3.14" max="3.14" value="0" step="0.001">
                        <input class="slider-text" type="text" size="4">
                    </div>
                    <div class="slider">
                        <label for="angleYZ">YZ</label>
                        <input id="angleYZ" v-model="angleYZ" type="range" min="-3.14" max="3.14" value="0" step="0.001">
                        <input class="slider-text" type="text" size="4">
                    </div>
                    <div class="slider">
                        <label for="translateZ">Z</label>
                        <input id="translateZ" v-model="translateZ" type="range" min="-2" max="2" value="0" step="0.01">
                        <input class="slider-text" type="text" size="4">
                    </div>
                </div>
            </div>
        </div>
        <canvas class="slice-canvas" ref="sliceCanvas"></canvas>
    </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as Util from '../../scripts/util';

let previousTimestamp = 0;
let interval = 1000/60;
const canvasPercentH = 0.6
const sliceCanvasPercentH = 0.4

let camera;
let scene;
let renderer;

export default {
    data() {
        return {
            angleXZ: 0.0,
            angleYZ: 0.0,
            translateZ: 0.0,
            canvas: undefined,
            sliceCanvas: undefined,
            objectNeedsUpdate: false,
            displayObject: undefined,
            displayObjects: {
                sphere: 0,
                cube: 1,
                cone: 2,
                projCube: 3,
            },
        }
    },
    props: {
        canvasSize: Object,
    },
    watch: {
        canvasSize: function(newD, oldD) {
            let width = newD.width
            let height = newD.height

            let mainCanvasHeight = height*canvasPercentH
            camera.aspect = width / mainCanvasHeight
            camera.updateProjectionMatrix()
            renderer.setSize(width, mainCanvasHeight)

            this.updateSliceCanvas(width, height)
        },
        angleXZ: function() {
            this.objectNeedsUpdate = true
        },
        angleYZ: function() {
            this.objectNeedsUpdate = true
        },
        translateZ: function() {
            this.objectNeedsUpdate = true
        },
    },
    methods: {
        initThree() {
            let width = this.canvasSize.width
            let height = this.canvasSize.height*canvasPercentH
            scene = new THREE.Scene()

            renderer = new THREE.WebGLRenderer({
                canvas: this.canvas
            })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            camera = new THREE.PerspectiveCamera(80, width/height, 0.1, 100)
            camera.position.set(0, 0, 4)
            scene.add(camera)

            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enablePan = false;
            controls.update();

            const mainLight = new THREE.DirectionalLight(0xffffff, 0.5)
            camera.add(mainLight)
            mainLight.position.set(-1.5, 2.5, 0)

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
            scene.add(ambientLight)
        },
        animate(timestamp) {
            let delta = timestamp - previousTimestamp
            if (delta >= interval) {
                if (this.objectNeedsUpdate) {
                    switch (this.displayObject) {
                        case (this.displayObjects.sphere):
                            updateSphere(parseFloat(this.translateZ))
                            updateCircleSlice(this.sliceCanvas, parseFloat(this.translateZ))
                            break
                        case (this.displayObjects.cube):
                            break
                        case (this.displayObjects.projCube):
                            break
                        case (this.displayObjects.cone):
                            break
                    }
                    this.objectNeedsUpdate = false
                }
                renderer.render(scene, camera)
                previousTimestamp = timestamp
            }
            requestAnimationFrame(this.animate);
        },
        updateSliceCanvas(width, totalHeight) {
            this.sliceCanvas.width = width
            this.sliceCanvas.height = totalHeight*sliceCanvasPercentH
        },
        initSphere() {
            undoAllInits()
            initSphere()

            this.displayObject = this.displayObjects.sphere
            this.objectNeedsUpdate = true
        },
    },
    mounted() {
        this.canvas = this.$refs.canvas
        this.sliceCanvas = this.$refs.sliceCanvas
        this.updateSliceCanvas(this.canvasSize.width, this.canvasSize.height)

        this.initThree()
        initPlane()
        this.initSphere()
        this.animate(0)
    }
}

const planeColor = '#1B1B1B'
const sphereColor = '#14F314'

let sphereMesh = undefined
let planeMesh = undefined
const sphereRadius = 1
const planeWidth = 4

function undoAllInits() {
    scene.remove(sphereMesh)

    sphereMesh = undefined
}

function initPlane() {
    const geometry = new THREE.PlaneGeometry(planeWidth, planeWidth)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.color = new THREE.Color(planeColor)

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    planeMesh = mesh
}

function initSphere() {
    const geometry = new THREE.SphereGeometry(sphereRadius)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(sphereColor)
    //material.transparent = true
    //material.opacity = 0.6

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    sphereMesh = mesh
}

function updateSphere(translateZ) {
    sphereMesh.position.z = translateZ
}

function updateCircleSlice(canvas, translateZ) {
    let ctx = canvas.getContext("2d")
    updateSliceCanvas(canvas)

    let squareLength = Math.min(canvas.width, canvas.height)
    let startX = (canvas.width-squareLength) / 2
    let startY = (canvas.height-squareLength) / 2

    let radius = Util.getSphereIntersectionRadius(sphereRadius, translateZ)

    let canvasRadius = (radius/planeWidth)*squareLength

    ctx.beginPath()
    ctx.arc(canvas.width/2, canvas.height/2, canvasRadius, 0, 2*Math.PI)
    ctx.fillStyle=sphereColor;
    ctx.fill()
}

function updateSliceCanvas(canvas) {
    let ctx = canvas.getContext("2d")
    ctx.fillStyle=planeColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height)
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

.slice-canvas {
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

.slider {
    text-align: right;
}

.slider-text {
    border-radius: 4px;
    border: none;
    text-align: center;
}
</style>