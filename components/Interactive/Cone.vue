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
import * as Cone from '../../scripts/cone'

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
            angleIN: 0.0,
            angleDegXW: 0,
            angleDegYW: 0,
            angleDegZW: 0,
            angleDegIN: 0,
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
                            updateSliceCone(parseFloat(this.angleIN), parseFloat(this.translateW))
                            break
                    }
                    this.objectNeedsUpdate = false
                }
               
                renderer.render(scene, camera)
                delta = delta % interval;
            }
            if (!this._inactive) {
                requestAnimationFrame(this.animate)
            }
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
    },
    activated() {
        requestAnimationFrame(this.animate)
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
const pointColor = '#D2F3F5'

const coneRadius = 1
const coneHeight = coneRadius*Math.tan(Math.PI/3)
const latheSegments = 32

const spherePointCount = 32
let conePoints = [[0, 0, 0, 1]]
let spherePoints = generateSpherePoints(spherePointCount, sphereRadius)
conePoints = conePoints.concat(spherePoints)

const edgeIndices = getConeEdges(spherePointCount)

let sphereMeshes = []
let cylinderMeshes = []
let projSpherePoints4D = []
let projectionSphereMesh = undefined
let latheMesh = undefined
let baseCutoffMesh = undefined

function undoInits() {
    Util.removeThreeJsObjects(scene, sphereMeshes, cylinderMeshes, projSpherePoints4D, projectionSphereMesh, latheMesh, baseCutoffMesh)

    sphereMeshes = []
    cylinderMeshes = []
    projSpherePoints4D = []
    projectionSphereMesh = undefined
    latheMesh = undefined
    baseCutoffMesh = undefined
}

function initProjectionCone() {
    initSpheres()
    initCylinders()
    //initProjectionSphere()
}

function initSpheres() {
    for (let i = 0; i < conePoints.length; i++){
        let radius = projectionPointRadius
        let color = lineColor
        if (i !== 0) {
            radius = projectionPointRadius/1.5
            color = pointColor
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
    initLathe()
    initBaseCutFace()
}

function initLathe() {
    
}


function initBaseCutFace() {
    const geometry = new THREE.BufferGeometry()
    let bufferSize = (latheSegments-2)*9
    const positionAttribute = new THREE.BufferAttribute(new Float32Array(bufferSize), 3)

    const normals = new Float32Array(bufferSize)
    for (let i = 0; i < normals.length; i+=3) {
        normals[i+1] = 1 // pointing up in y direction
    }
    const normalAttribute = new THREE.BufferAttribute(normals, 3)

    positionAttribute.setUsage(THREE.DynamicDrawUsage)
    normalAttribute.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('normal', normalAttribute)

    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    baseCutoffMesh = mesh
}


function initProjectionSphere() {
    const geometry = new THREE.SphereGeometry(sphereRadius, 24, 12)
    geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)
    const material = new THREE.MeshStandardMaterial()
    material.side = THREE.DoubleSide
    //material.wireframe = true
    material.transparent = true
    material.opacity = 0.3

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
    //drawProjectionSphere(angleXW, angleYW, angleZW)
}

function drawProjectionSphere(angleXW, angleYW, angleZW) {
    let rotatedPoints = Util.rotate4D(projSpherePoints4D, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)

    let a = projectionSphereMesh.geometry.getAttribute("position")
    let meshPoints = a.array
    for (let i = 0; i < meshPoints.length; i++) {
        meshPoints[i] = finalPoints[Math.floor(i/3)][i%3]
    }
    a.needsUpdate = true
}

function updateSliceCone(angleIN, translateW){
    let transformedCone = new Cone.Cone(coneHeight, coneRadius, angleIN, translateW)
    switch(Cone.getSliceType(angleIN)) {
        case (Cone.sliceType.parabola):
            drawLatheSolid(Cone.coneToParabola(angleIN, transformedCone), false)
            break
        case (Cone.sliceType.hyperbola):
            drawLatheSolid(Cone.coneToHyperbola(angleIN, transformedCone), false)
            break
        case (Cone.sliceType.ellipse):
            drawLatheSolid(Cone.coneToEllipsePoints(angleIN, transformedCone), true)
            break
    }
}

function drawLatheSolid({points, isBaseCutUp}, isHalf) {
    if (points === undefined || points.length === 0) {
        baseCutoffMesh.visible = false
        scene.remove(latheMesh)
        return
    }
    
    let vec2s = []
    if (isHalf) {
        for (let i = 0; i < points.length; i++) {
            vec2s.push(new THREE.Vector2(points[i][0], points[i][1]))          
        }
    } else {
        if (isBaseCutUp) {
            for (let i = Math.floor(points.length/2); i < points.length; i++) {
                vec2s.push(new THREE.Vector2(points[i][0], points[i][1]))        
            }
        } else {
            for (let i = 0; i <= Math.floor(points.length/2); i++) {
                vec2s.push(new THREE.Vector2(points[i][0], points[i][1]))        
            }
        }

    }

    //addCutoffPoint(vec2s, isUp)

    const geometry = new THREE.LatheGeometry(vec2s, latheSegments);
    //Util.printThreeVertices(geometry)
    if (isBaseCutUp !== undefined) {
        let cutoffPoints = getCutoffPoints(geometry, isBaseCutUp, vec2s.length)
        if (!isBaseCutUp) {
            // make counter clock-wise
            cutoffPoints.reverse()
        }
        let triGuys = Util.triangulateSortedFace(cutoffPoints)
        
        let positions = baseCutoffMesh.geometry.getAttribute('position').array
        let normals = baseCutoffMesh.geometry.getAttribute('normal').array
        for (let i = 0; i < positions.length; i+=3) {
            positions[i] = triGuys[i]
            positions[i+1] = triGuys[i+1]
            positions[i+2] = triGuys[i+2]

            if (isBaseCutUp) {
                normals[i+1] = 1
            } else {
                normals[i+1] = -1
            }
        }
        baseCutoffMesh.geometry.getAttribute('position').needsUpdate = true
        baseCutoffMesh.geometry.getAttribute('normal').needsUpdate = true
        baseCutoffMesh.visible = true
    } else {
        baseCutoffMesh.visible = false
    }
    
    
    // let newP = new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('position').array), 3)
    // let newN = new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('normal').array), 3)

    // latheMesh.geometry.setAttribute('position', newP)
    // latheMesh.geometry.setAttribute('normal', newN)
    // newP.needsUpdate = true
    // newN.needsUpdate = true

    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)
    const mesh = new THREE.Mesh(geometry, material)

    scene.remove(latheMesh)
    scene.add(mesh)

    latheMesh = mesh
}

function getCutoffPoints(geometry, isBaseCutUp, curvePointCount) {
    let lathePoints = geometry.getAttribute('position').array
    let points = []
    //for both skip the first point in the base because it's duplicated at the end of the mesh
    if (isBaseCutUp) {
        for (let i = 3*(2*curvePointCount-1); i < lathePoints.length; i+=(3*curvePointCount)) {
            points.push([lathePoints[i], lathePoints[i+1], lathePoints[i+2]])
        }
    } else {
        for (let i = (3*curvePointCount); i < lathePoints.length; i+=(3*curvePointCount)) {
            points.push([lathePoints[i], lathePoints[i+1], lathePoints[i+2]])
        }
    }
    return points
}

function addCutoffPoint(vec2s, isUp) {
    if (isUp && vec2s[vec2s.length-1].x !== 0) {
        vec2s.push(new THREE.Vector2(0, vec2s[vec2s.length-1].y))
    }
    else if (!isUp && vec2s[0].x !== 0) {
        vec2s.unshift(new THREE.Vector2(0, vec2s[0].y))
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