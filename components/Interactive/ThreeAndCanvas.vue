<template>
    <div class="top-container">
        <div class="three-container">
            <canvas class="main-canvas" ref="canvas"></canvas>
            <div class="three-overlay">
                <div class="top-right sticky-box">
                </div>
                <div class="bottom-right sticky-box">
                    <div class="slider-row">
                        <button class="slider-button" @click="resetUI">Reset</button>
                    </div>                    
                    <div class="slider-row">
                        <label for="angleXZ">XZ</label>
                        <input id="angleXZ" v-model="angleDegXZ" type="range" min="-360" max="360" value="0" step="1">
                        <input v-model="angleDegXZ" class="slider-text" type="text" size="4">
                        <span class="unit-text">°</span>
                    </div>
                    <div class="slider-row">
                        <label for="angleYZ">YZ</label>
                        <input id="angleYZ" v-model="angleDegYZ" type="range" min="-360" max="360" value="0" step="1">
                        <input v-model="angleDegYZ" class="slider-text" type="text" size="4">
                        <span class="unit-text">°</span>
                    </div>
                    <div class="slider-row">
                        <label for="translateZ">Z</label>
                        <input id="translateZ" v-model="translateZ" type="range" min="-1.5" max="1.5" value="0" step="0.01">
                        <input v-model="translateZ" class="slider-text" type="text" size="4">
                        <span class="unit-text invisible">°</span>
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
import * as Util from '../../scripts/util'
import * as Cone from '../../scripts/cone'

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
            angleDegXZ: 0,
            angleDegYZ: 0,
            translateZ: 0.0,
            canvas: undefined,
            sliceCanvas: undefined,
            objectNeedsUpdate: false,
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
        canvasSize: function(newD, oldD) {
            // This watcher is getting called when the page changes
            // Only want to update the display if we're staying on the same page
            if (newD.width === oldD.width && newD.height === oldD.height) {
                return
            }
            let width = newD.width
            let height = newD.height

            let mainCanvasHeight = height*canvasPercentH
            camera.aspect = width / mainCanvasHeight
            camera.updateProjectionMatrix()
            renderer.setSize(width, mainCanvasHeight)

            this.updateSliceCanvas(width, height)
            this.updateDisplay()
        },
        scene: function(newScene, oldScene) {
            this.undoInits()
            this.initScene(newScene)
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
        initThree() {
            let width = this.canvasSize.width
            let height = this.canvasSize.height*canvasPercentH
            scene = new THREE.Scene()

            renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
            })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            //renderer.sortObjects = false

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
        updateDisplay() {
            switch (this.scene) {
                case (Util.scenes.threeandcanvas.sphere):
                    updateSphere(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Util.scenes.threeandcanvas.solidCube):
                    updateSolidCube(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (Util.scenes.threeandcanvas.edgeCube):
                    updateEdgeCube(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                case (Util.scenes.threeandcanvas.projCube):
                    break
                case (Util.scenes.threeandcanvas.cone):
                    updateCone(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
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
                renderer.render(scene, camera)
                previousTimestamp = timestamp
            }
            if (!this._inactive) {
                requestAnimationFrame(this.animate)
            }
        },
        updateSliceCanvas(width, totalHeight) {
            this.sliceCanvas.width = width
            this.sliceCanvas.height = totalHeight*sliceCanvasPercentH
        },
        undoInits() {
            undoAllInits()
        },
        initScene(sceneID) {
            switch(sceneID) {
                case (Util.scenes.threeandcanvas.sphere):
                    initSphere()
                    break
                case (Util.scenes.threeandcanvas.solidCube):
                    initSolidCube()
                    break
                case (Util.scenes.threeandcanvas.edgeCube):
                    initEdgeCube()
                case (Util.scenes.threeandcanvas.projCube):
                    break
                case (Util.scenes.threeandcanvas.cone):
                    initCone()
                    break
            }
            this.objectNeedsUpdate = true
        },
        resetUI() {
            this.angleXZ = this.angleDegXZ = 0
            this.angleYZ = this.angleDegYZ = 0
            this.translateZ = 0
        }
    },
    mounted() {
        this.canvas = this.$refs.canvas
        this.sliceCanvas = this.$refs.sliceCanvas
        this.updateSliceCanvas(this.canvasSize.width, this.canvasSize.height)

        this.initThree()
        initPlane()
        this.initScene(this.scene)
    },
    activated() {
        requestAnimationFrame(this.animate)
    }
}

const planeColor = '#1B1B1B'
const sphereColor = '#14F314'
const cubeColor = '#FFEE56'
const coneColor = '#F31414'

let sphereMesh = undefined
let planeMesh = undefined
let solidCubeMesh = undefined
let coneMesh = undefined
let edgeCubeMesh = undefined

const sphereRadius = 1
const planeWidth = 4
const coneSegments = 32
const coneHeight = sphereRadius*Math.tan(Math.PI/3)
const cubeLength = sphereRadius*1.5

// based on threeJS cube vertex order
const cubeEdgeIndices = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
    [0, 5],
    [5, 4],
    [4, 1],
    [5, 7],
    [7, 6],
    [6, 4],
    [7, 2],
    [6, 3],
]

// referring to index of edges in array above
const highlightedEdges = [0, 1, 2, 3]

function undoAllInits() {
    removeThreejsMesh(sphereMesh)
    removeThreejsMesh(solidCubeMesh)
    removeThreejsMesh(coneMesh)
    removeThreejsMesh(edgeCubeMesh)

    sphereMesh = undefined
    solidCubeMesh = undefined
    coneMesh = undefined
    edgeCubeMesh = undefined
}

function removeThreejsMesh(mesh) {
    if (mesh) {
        scene.remove(mesh)
        mesh.geometry.dispose()
        if (mesh.material.length) {
            for (const m of mesh.material) {
                m.dispose()
            }
        } else {
            mesh.material.dispose()
        }       
    }
}

function initPlane() {
    const geometry = new THREE.PlaneGeometry(planeWidth, planeWidth)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.color = new THREE.Color(planeColor)
    material.transparent = true
    material.opacity = 0.8

    const mesh = new THREE.Mesh(geometry, material)
    mesh.renderOrder = 2

    scene.add(mesh)
    planeMesh = mesh
}

function initSphere() {
    const geometry = new THREE.SphereGeometry(sphereRadius, 48, 24)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(sphereColor)
    //material.transparent = true
    //material.opacity = 0.6

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    sphereMesh = mesh
}

function initSolidCube() {
    const geometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(cubeColor)

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    solidCubeMesh = mesh
}

function initEdgeCube() {
    const geometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)

    const materials = [
        new THREE.MeshStandardMaterial({color: 0xFFEE56, side: THREE.DoubleSide}),
        new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6}),
        new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6}),
        new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6}),
        new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6}),
        new THREE.MeshStandardMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6}),
    ];

    const mesh = new THREE.Mesh(geometry, materials)
    mesh.renderOrder = 1

    scene.add(mesh)
    edgeCubeMesh = mesh
}

function initCone() {
    // assuming equilateral
    const geometry = new THREE.ConeGeometry(sphereRadius, sphereRadius*Math.tan(Math.PI/3), coneSegments)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)
    //material.wireframe = true
    //material.transparent = true
    //material.opacity = 0.8
    //material.side = THREE.DoubleSide

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    coneMesh = mesh
}

function updateSphere(canvas, angleXZ, angleYZ, translateZ) {
    sphereMesh.position.z = translateZ
    sphereMesh.rotation.y = angleXZ
    sphereMesh.rotation.x = angleYZ
    drawCircleSlice(canvas, translateZ)
}

function drawCircleSlice(canvas, translateZ) {
    let ctx = canvas.getContext("2d")
    drawSliceCanvas(canvas)

    let squareLength = Math.min(canvas.width, canvas.height)

    let radius = Util.getSphereIntersectionRadius(sphereRadius, translateZ)
    let canvasRadius = (radius/planeWidth)*squareLength

    ctx.beginPath()
    ctx.arc(canvas.width/2, canvas.height/2, canvasRadius, 0, 2*Math.PI)
    ctx.fillStyle=sphereColor;
    ctx.fill()
}

function updateSolidCube(canvas, angleXZ, angleYZ, translateZ) {
    solidCubeMesh.position.z = translateZ
    solidCubeMesh.rotation.y = angleXZ
    solidCubeMesh.rotation.x = angleYZ
    solidCubeMesh.updateMatrix()

    drawSliceCanvas(canvas)
    let points2D = getCubeSlice(solidCubeMesh)
    drawSolidCubeSlice(canvas, points2D)
}

function getCubeSlice(cubeMesh) {
    let points3D = []
    for (let i = 0; i < 8; i++) {
        let v = new THREE.Vector3()
        v.fromBufferAttribute(cubeMesh.geometry.attributes.position, i)
        v.applyMatrix4(cubeMesh.matrix)
        points3D.push(v)
    }

    return get2DIntersectionPoints(points3D)
}

function get2DIntersectionPoints(points3D) {
    let zClip = 0.0
    let intersectionPoints = []
    for (let i = 0; i < cubeEdgeIndices.length; i++) {
        let p1 = points3D[cubeEdgeIndices[i][0]]
        let p2 = points3D[cubeEdgeIndices[i][1]]
        
        if (p1.z >= zClip && p2.z < zClip) {
            intersectionPoints.push(new IntersectionPoint(i, get2DIntersectionPoint(p1, p2, zClip)))
        } else if (p2.z >= zClip && p1.z < zClip){
            intersectionPoints.push(new IntersectionPoint(i, get2DIntersectionPoint(p2, p1, zClip)))
        }
    }
    return intersectionPoints
}

function get2DIntersectionPoint(greaterPoint, lesserPoint, zClip) {
    let zDistance = greaterPoint.z - lesserPoint.z
    let t = (greaterPoint.z - zClip) / zDistance

    return [Util.lerp(greaterPoint.x, lesserPoint.x, t),
            Util.lerp(greaterPoint.y, lesserPoint.y, t)]
}

function drawSolidCubeSlice(canvas, points) {
    if (points.length < 2) {
        return
    }
    sortFacePoints(points)

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=cubeColor
    ctx.beginPath();
    let startX = (canvas.width/2) + (points[0].point[0]*canvasRatio)
    let startY = (canvas.height/2) - (points[0].point[1]*canvasRatio)
    ctx.moveTo(startX, startY)
    for (let i = 1; i < points.length; i++) {
        let canvasX = (canvas.width/2) + (points[i].point[0]*canvasRatio)
        let canvasY = (canvas.height/2) - (points[i].point[1]*canvasRatio)
        ctx.lineTo(canvasX, canvasY)       
    }
    ctx.lineTo(startX, startY)
    ctx.fill()
}

function sortFacePoints(points) {
    let theta0Vector = [1, 0]
    let posAngleVector = [0, 1]

    let faceCenter = Util.getCenterOfPoints(points.map(p => p.point))

    for (let i = 0; i < points.length; i++) {
        let v = Util.subtractVectors(points[i].point, faceCenter)
        points[i].setAngle(Util.calcAngleBetweenVectors(theta0Vector, v, posAngleVector))
    }

    points.sort((a, b) => {
        return a.angle - b.angle
    })
}

function updateEdgeCube(canvas, angleXZ, angleYZ, translateZ) {
    edgeCubeMesh.position.z = translateZ
    edgeCubeMesh.rotation.y = angleXZ
    edgeCubeMesh.rotation.x = angleYZ
    edgeCubeMesh.updateMatrix()

    drawSliceCanvas(canvas)
    let points2D = getCubeSlice(edgeCubeMesh)
    drawEdgeCubeSlice(canvas, points2D)
}

class IntersectionPoint {
    constructor(edgeIndex, point) {
        this.edgeIndex = edgeIndex
        this.point = point
    }

    setAngle(angle) {
        this.angle = angle
    }
}

function drawEdgeCubeSlice(canvas, points) {
    if (points.length < 2) {
        return
    }
    sortFacePoints(points)

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let wCenter = (canvas.width/2)
    let hCenter = (canvas.height/2)

    let ctx = canvas.getContext("2d")
    ctx.lineWidth = 5
    ctx.lineCap = "round"
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath()

        let startX = wCenter + (points[i].point[0]*canvasRatio)
        let startY = hCenter - (points[i].point[1]*canvasRatio)
        ctx.moveTo(startX, startY)

        let nextIndex = i < points.length-1 ? i+1 : 0
        let endX = wCenter + (points[nextIndex].point[0]*canvasRatio)
        let endY = hCenter - (points[nextIndex].point[1]*canvasRatio)
        ctx.lineTo(endX, endY)

        if (points[i].edgeIndex < 4 && points[nextIndex].edgeIndex < 4) {
            ctx.strokeStyle=cubeColor           
        } else {
            ctx.strokeStyle="gray"
        }
        ctx.stroke()
    }
}

function updateCone(canvas, angleXZ, angleYZ, translateZ) {
    coneMesh.position.z = translateZ
    coneMesh.rotation.y = angleXZ
    coneMesh.rotation.x = angleYZ
    //coneMesh.updateMatrix()

    drawSliceCanvas(canvas)

    let transformedCone = new Cone.Cone(coneHeight, sphereRadius, angleYZ, translateZ)
    switch (Cone.getSliceType(angleYZ)) {
        case (Cone.sliceType.parabola):
            drawPoints(canvas, Cone.coneToParabola(angleYZ, transformedCone).points)
            break
        case (Cone.sliceType.hyperbola):
            drawPoints(canvas, Cone.coneToHyperbola(angleYZ, transformedCone).points)
            break
        case (Cone.sliceType.ellipse):
            let ellipse = Cone.coneToEllipse(angleYZ, transformedCone)
            drawSolidEllipse(canvas, ellipse)
            drawBaseCutoff(canvas, ellipse)
            break
    }
}

function drawPoints(canvas, points) {
    if (points === undefined || points.length === 0) {
        return
    }
    
    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=coneColor
    ctx.beginPath();
    let startX = (canvas.width/2) + (points[0][0]*canvasRatio)
    let startY = (canvas.height/2) - (points[0][1]*canvasRatio)
    ctx.moveTo(startX, startY)
    for (let i = 1; i < points.length; i++) {
        let canvasX = (canvas.width/2) + (points[i][0]*canvasRatio)
        let canvasY = (canvas.height/2) - (points[i][1]*canvasRatio)
        ctx.lineTo(canvasX, canvasY)       
    }
    ctx.lineTo(startX, startY)
    ctx.fill()
}

function drawSolidEllipse(canvas, ellipse) {
    if (ellipse === undefined) {
        return
    }

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let canvasY1 = ellipse.y1*canvasRatio
    let canvasY2 = ellipse.y2*canvasRatio

    let a = Math.abs(canvasY1-canvasY2)/2
    let c = a*ellipse.eccentricity
    let b = Math.sqrt(Math.abs(c*c-a*a))

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=coneColor
    ctx.beginPath();
    ctx.ellipse(canvas.width/2, (canvas.height/2) - ((canvasY1+canvasY2)/2), b, a, 0, 0, 2 * Math.PI);
    ctx.fill();
}

function drawBaseCutoff(canvas, ellipse) {
    if (ellipse === undefined || ellipse.baseCutY === undefined) {
        return
    }

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let canvasCutY = (canvas.height/2) - (ellipse.baseCutY*canvasRatio)

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=planeColor
    if (ellipse.isBaseCutUp) {
        ctx.fillRect(0, 0, canvas.width, canvasCutY)
    } else {
        ctx.fillRect(0, canvasCutY, canvas.width, canvas.height)
    }
}

function drawSliceCanvas(canvas) {
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
</style>