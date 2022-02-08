<template>
<div>
    <div class="three-container">
        <canvas ref="canvas"></canvas>
        <div class="three-overlay">
            <div class="top-right sticky-box">
                <button @click="initProjectionCone">Projection</button>
                <button @click="initSliceCone">Slice</button>
            </div>
            <div class="bottom-right sticky-box">
                <div class="slider">
                    <label for="angleXW">XW</label>
                    <input id="angleXW" v-model="angleDegXW" type="range" min="-180" max="180" value="0" step="1">
                    <input v-model="angleDegXW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="angleYW">YW</label>
                    <input id="angleYW" v-model="angleDegYW" type="range" min="-180" max="180" value="0" step="1">
                    <input v-model="angleDegYW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="angleZW">ZW</label>
                    <input id="angleZW" v-model="angleDegZW" type="range" min="-180" max="180" value="0" step="1">
                    <input v-model="angleDegZW" class="slider-text" type="text" size="4">
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
import * as Util from '../../scripts/util';

let camera;
let scene;
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
            angleDegXW: 0,
            angleDegYW: 0,
            angleDegZW: 0,
            translateW: 0.0,
            displayObject: undefined,
            displayObjects: {
                projectionCone: 0,
                sliceCone: 1,
            },
            objectNeedsUpdate: false
        }
    },
    props: {
        canvasSize: Object,
    },
    watch: {
        canvasSize: function(newD, oldD) {
            let width = newD.width
            let height = newD.height

            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.setSize(width, height)
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
        translateW: function() {
            this.objectNeedsUpdate = true
        },
    },
    methods: {
        initThree() {
            let width = this.canvasSize.width
            let height = this.canvasSize.height
            const canvas = this.$refs.canvas
            scene = new THREE.Scene()

            renderer = new THREE.WebGLRenderer({
                canvas: canvas
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
        animate() {
            delta += clock.getDelta();
            if (delta > interval) {
                if (this.objectNeedsUpdate) {
                    switch (this.displayObject) {
                        case (this.displayObjects.projectionCone):
                            updateProjectionCone(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                        case (this.displayObjects.sliceCone):
                            updateSliceCone(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                    }
                    this.objectNeedsUpdate = false
                }
               
                renderer.render(scene, camera)
                delta = delta % interval;
            }
            requestAnimationFrame(this.animate);
        },
        initShape(initFunction, displayObjectId) {
            undoInits()
            initFunction()

            this.displayObject = displayObjectId
            this.objectNeedsUpdate = true
        },
        initProjectionCone() {
            this.initShape(initProjectionCone, this.displayObjects.projectionCone)
        },
        initSliceCone() {
            this.initShape(initSliceCone, this.displayObjects.sliceCone)
        }
    },
    mounted() {
        this.initThree()
        this.initProjectionCone()
        this.animate()
    }
}

function generateSpherePoints(n, multiplier) {
	let goldenRatio = 1 + Math.sqrt(5) / 4
	let angleIncrement = Math.PI * 2 * goldenRatio

    let points = []
	for (let i = 0; i < n; i++) {
		let distance = i / n
		let incline = Math.acos(1 - 2 * distance)
		let azimuth = angleIncrement * i

		let x = Math.sin(incline) * Math.cos(azimuth) * multiplier
		let y = Math.sin(incline) * Math.sin(azimuth) * multiplier
		let z = Math.cos(incline) * multiplier

		points.push([x, y, z, 0])
    }
    return points
}

function getConeEdges(n) {
    let edges = []
    for (let i = 1; i <= n; i++) {
        edges.push([0, i])        
    }
    return edges
}

const projectionPointRadius = 0.09
const cylinderScaleFactor = 0.04
const projectionDistance4D = 2
const scaleFactor = 3
const sphereRadius = 1
const coneColor = '#F31414'
const sphereColor = '#269E26'
const planeColor = '#1B1B1B'
const lineColor = '#62DDE5'

const spherePointCount = 32
let conePoints = [[0, 0, 0, 1]]
let spherePoints = generateSpherePoints(spherePointCount, sphereRadius)
conePoints = conePoints.concat(spherePoints)

const edgeIndices = getConeEdges(spherePointCount)

let sphereMeshes = []
let cylinderMeshes = []
let projSpherePoints4D = []
let projectionSphereMesh = undefined
let coneSliceMesh = undefined

function undoInits() {
    Util.removeThreeJsObjects(scene, sphereMeshes, cylinderMeshes, projSpherePoints4D, projectionSphereMesh, coneSliceMesh)

    sphereMeshes = []
    cylinderMeshes = []
    projSpherePoints4D = []
    projectionSphereMesh = undefined
    coneSliceMesh = undefined
}

function initProjectionCone() {
    initSpheres()
    initCylinders()
}

function initSpheres() {
    for (let i = 0; i < conePoints.length; i++){
        let radius = projectionPointRadius
        let color = lineColor
        if (i !== 0) {
            radius = projectionPointRadius/1.5
            color = sphereColor
        }

        const geometry = new THREE.SphereGeometry(radius)
        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(color)

        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        sphereMeshes.push(mesh)
    }
}

function initCylinders() {
    for (let i = 0; i < edgeIndices.length; i++){
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16, 1, true)
        geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)

        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(lineColor)
        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        cylinderMeshes.push(mesh)
    }
}

function initSliceCone() {
    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(new Float32Array(0), 3)
    positionAttribute.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', positionAttribute)

    const material = new THREE.MeshStandardMaterial()
    // material.transparent = true
    // material.opacity = 0.97
    material.color = new THREE.Color(0xF31414)
    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    coneSliceMesh = mesh
}

function initProjectionSphere() {
    const geometry = new THREE.SphereGeometry(sphereRadius)
    geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)
    const material = new THREE.MeshStandardMaterial()
    material.side = THREE.DoubleSide
    //material.wireframe = true
    material.transparent = true
    material.opacity = 0.7

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    projectionSphereMesh = mesh
    let points = geometry.getAttribute("position").array
    for (let i = 0; i < points.length; i+=3) {
        projSpherePoints4D.push([points[i], points[i+1], points[i+2], 0])
    }
}

function updateProjectionCone(angleXW, angleYW, angleZW, translateW) {
    let rotatedPoints = Util.rotate4D(conePoints, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)
    Util.drawSpherePoints(finalPoints, sphereMeshes)
    Util.drawCylinders(finalPoints, cylinderMeshes, edgeIndices, cylinderScaleFactor)
}

function drawProjectionSphere(angleXW, angleYW, angleZW) {
    let rotatedPoints = Util.rotate4D(projSpherePoints4D, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, scaleFactor)

    let a = projectionSphereMesh.geometry.getAttribute("position")
    let meshPoints = a.array
    for (let i = 0; i < meshPoints.length; i++) {
        meshPoints[i] = finalPoints[Math.floor(i/3)][i%3]
    }
    a.needsUpdate = true
}

function updateSliceCone(angleXW, angleYW, angleZW, translateW){

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