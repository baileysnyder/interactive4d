<template>
    <div class="top-container">
        <div class="three-container">
            <canvas class="main-canvas" ref="canvas"></canvas>
            <div class="three-overlay">
                <div class="top-right sticky-box">
                    <button @click="initSphere">Sphere</button>
                    <button @click="initCone">Cone</button>
                </div>
                <div class="bottom-right sticky-box">
                    <div class="slider">
                        <label for="angleXZ">XZ</label>
                        <input id="angleXZ" v-model="angleXZ" type="range" min="-6.28" max="6.28" value="0" step="0.001">
                        <input v-model="angleXZ" class="slider-text" type="text" size="4">
                    </div>
                    <div class="slider">
                        <label for="angleYZ">YZ</label>
                        <input id="angleYZ" v-model="angleYZ" type="range" min="-6.28" max="6.28" value="0" step="0.001">
                        <input v-model="angleYZ" class="slider-text" type="text" size="4">
                    </div>
                    <div class="slider">
                        <label for="translateZ">Z</label>
                        <input id="translateZ" v-model="translateZ" type="range" min="-2" max="2" value="0" step="0.01">
                        <input v-model="translateZ" class="slider-text" type="text" size="4">
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
                            updateSphere(this.sliceCanvas, parseFloat(this.translateZ))
                            break
                        case (this.displayObjects.cube):
                            break
                        case (this.displayObjects.projCube):
                            break
                        case (this.displayObjects.cone):
                            updateCone(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
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
        initCone(){
            undoAllInits()
            initCone()

            this.displayObject = this.displayObjects.cone
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
const coneColor = '#F31414'

let sphereMesh = undefined
let planeMesh = undefined
let coneMesh = undefined
let coneGeometry = undefined
const sphereRadius = 1
const planeWidth = 4
const coneSegments = 32
const coneHeight = sphereRadius*Math.tan(Math.PI/3)

const coneNegZBase = [0, -coneHeight/2, -sphereRadius]
const conePosZBase = [0, -coneHeight/2, sphereRadius]

function undoAllInits() {
    removeThreejsMesh(sphereMesh)
    removeThreejsMesh(coneMesh)

    sphereMesh = undefined
    coneMesh = undefined
}

function removeThreejsMesh(mesh) {
    if (mesh) {
        scene.remove(mesh)
        mesh.geometry.dispose()
        mesh.material.dispose()
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

function initCone() {
    // assuming equilateral
    coneGeometry = new THREE.ConeGeometry(sphereRadius, sphereRadius*Math.tan(Math.PI/3), coneSegments)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)
    //material.wireframe = true
    //material.transparent = true
    //material.opacity = 0.8
    //material.side = THREE.DoubleSide

    const mesh = new THREE.Mesh(coneGeometry, material)

    scene.add(mesh)
    coneMesh = mesh
}

function updateSphere(canvas, translateZ) {
    sphereMesh.position.z = translateZ
    updateCircleSlice(canvas, translateZ)
}

function updateCircleSlice(canvas, translateZ) {
    let ctx = canvas.getContext("2d")
    updateSliceCanvas(canvas)

    let squareLength = Math.min(canvas.width, canvas.height)

    let radius = Util.getSphereIntersectionRadius(sphereRadius, translateZ)

    let canvasRadius = (radius/planeWidth)*squareLength

    ctx.beginPath()
    ctx.arc(canvas.width/2, canvas.height/2, canvasRadius, 0, 2*Math.PI)
    ctx.fillStyle=sphereColor;
    ctx.fill()
}

function updateCone(canvas, angleXZ, angleYZ, translateZ) {
    coneMesh.position.z = translateZ
    //coneMesh.rotation.y = angleXZ
    coneMesh.rotation.x = angleYZ
    coneMesh.updateMatrix()
    updateConicalSlice(canvas, angleYZ, translateZ)
}

function updateConicalSlice(canvas, angleYZ, translateZ) {
    updateSliceCanvas(canvas)  

    let hyperbolaMin = (-2*Math.PI)-(Math.PI/6)
    const hyperbolaRange = Math.PI/3
    const maxAngle = 2*Math.PI

    while (hyperbolaMin < maxAngle) {
        let hyperbolaMax = hyperbolaMin + hyperbolaRange

        if (angleYZ === hyperbolaMin || angleYZ === hyperbolaMax) {
            console.log("parabola")
            return
        } else if (angleYZ > hyperbolaMin && angleYZ < hyperbolaMax) {
            drawHyperbola(canvas, angleYZ, translateZ)
            return
        } else {
            hyperbolaMin += Math.PI
        }
    }

    drawEllipse(canvas, angleYZ, translateZ)
}

function drawHyperbola(canvas, angleYZ, translateZ) {
    let tip = new THREE.Vector3()
    tip.fromBufferAttribute(coneMesh.geometry.attributes.position, 0)
    tip.applyMatrix4(coneMesh.matrix)

    if (tip.z === 0) {
        // degenerative
        let points = [

        ]
        return
    }

    let baseNeg = new THREE.Vector3(coneNegZBase[0], coneNegZBase[1], coneNegZBase[2])
    baseNeg.applyMatrix4(coneMesh.matrix)

    let basePos = new THREE.Vector3(conePosZBase[0], conePosZBase[1], conePosZBase[2])
    basePos.applyMatrix4(coneMesh.matrix)

    let y1 = undefined
    let y2 = undefined
    if (tip.z > 0 && baseNeg.z < 0 || tip.z < 0 && baseNeg.z > 0) {
        y1 = yInterceptOnPlane(tip, baseNeg)
        y2 = projectedYInterceptOnPlane(basePos, tip)
    } else if (tip.z > 0 && basePos.z < 0 || tip.z < 0 && basePos.z > 0) {
        y1 = yInterceptOnPlane(tip, basePos)
        y2 = projectedYInterceptOnPlane(baseNeg, tip)
    }

    let a = Math.abs((y2-y1)/2)
    let eccentricity = Math.abs(Math.cos(angleYZ)/Math.cos(Math.PI/6))
    let c = a*eccentricity
    let b = Math.sqrt(Math.abs(c*c-a*a))

    let baseCutY = yInterceptOnPlane(basePos, baseNeg)

    let yOrigin = y1 + ((y2-y1)/2)
    let points = getHyperbola(a, b, Math.abs(yOrigin - baseCutY))
    let isUp = Math.cos(angleYZ) < 0
    translateHyperbola(points, yOrigin, isUp)
    drawPoints(canvas, points)
}

// store points left to right so it's easier to draw
function getHyperbola(a, b, maxY) {
    let a2 = a*a
    let b2 = b*b
    // const ySubdivisions = 32
    // let points = []

    // let deltaY = (maxY-a) / (ySubdivisions-1)

    // // midpoint
    // points[ySubdivisions-1] = [0, a]

    // for (let i = 1; i < ySubdivisions; i++) {
    //     let y = a + (deltaY*i)
    //     let x = Math.sqrt(Math.abs(b2*(1-((y*y)/a2))))
    //     points[ySubdivisions-i-1] = [-x, y]
    //     points[ySubdivisions+i-1] = [x, y]
    // }

    let points1 = []
    let points2 = []
    let distance = maxY-a
    const minY = 0.0001

    for (let d = distance; d > minY ; d/=1.5) {
        let y = a + d
        let x = Math.sqrt(Math.abs(b2*(1-((y*y)/a2))))
        points1.push([-x, y])
        points2.push([x, y])
    }

    points1.push([0, a])
    return points1.concat(points2.reverse())
}

function translateHyperbola(points, y0, isUp) {
    let sign = isUp ? 1 : -1

    for (let i = 0; i < points.length; i++) {
        points[i][1] = y0 + (sign*points[i][1])       
    }
}

function drawPoints(canvas, points) {
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

function drawEllipse(canvas, angleYZ, translateZ) {
    // the threejs cone positions array is split into 4 sections each having length coneSegments+1:
    // tip positions > base positions > base center positions > base positions
    let tip = new THREE.Vector3()
    tip.fromBufferAttribute(coneMesh.geometry.attributes.position, 0)
    tip.applyMatrix4(coneMesh.matrix)

    let baseNeg = new THREE.Vector3(coneNegZBase[0], coneNegZBase[1], coneNegZBase[2])
    baseNeg.applyMatrix4(coneMesh.matrix)

    let basePos = new THREE.Vector3(conePosZBase[0], conePosZBase[1], conePosZBase[2])
    basePos.applyMatrix4(coneMesh.matrix)

    let y1 = undefined
    if (tip.z > 0 && baseNeg.z < 0 || tip.z < 0 && baseNeg.z > 0) {
        y1 = yInterceptOnPlane(tip, baseNeg)
    }

    let y2 = undefined
    if (tip.z > 0 && basePos.z < 0 || tip.z < 0 && basePos.z > 0) {
        y2 = yInterceptOnPlane(tip, basePos)
    }

    // no intersection
    if (!y1 && !y2) {
        return
    }

    let eccentricity = Math.abs(Math.cos(angleYZ)/Math.cos(Math.PI/6))
    if (y1 && y2) {
        drawSolidEllipse(canvas, y1, y2, eccentricity)
        return
    }

    y1 = projectedYInterceptOnPlane(tip, baseNeg)
    y2 = projectedYInterceptOnPlane(tip, basePos)
    drawSolidEllipse(canvas, y1, y2, eccentricity)

    let baseCutY = yInterceptOnPlane(basePos, baseNeg)
    let isUp = Math.cos(angleYZ) < 0
    drawBaseCutoff(canvas, baseCutY, isUp)
}

function yInterceptOnPlane(start, end) {
    let zDistance = Math.abs(start.z - end.z)
    let t = Math.abs(start.z) / zDistance
    return Util.lerp(start.y, end.y, t)
}

// If the line between start and end doesn't intersect the plane, see where it would eventually
// intersect if the line continued
function projectedYInterceptOnPlane(start, end) {
    let line = new THREE.Vector3()
    line.subVectors(start, end)
    let t = -(start.z / line.z)
    return start.y + (line.y*t)
}

function drawSolidEllipse(canvas, y1, y2, eccentricity) {
    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let canvasY1 = y1*canvasRatio
    let canvasY2 = y2*canvasRatio

    let a = Math.abs(canvasY1-canvasY2)/2
    let c = a*eccentricity
    let b = Math.sqrt(Math.abs(c*c-a*a))

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=coneColor
    ctx.beginPath();
    ctx.ellipse(canvas.width/2, (canvas.height/2) - ((canvasY1+canvasY2)/2), b, a, 0, 0, 2 * Math.PI);
    ctx.fill();
}

function drawBaseCutoff(canvas, cutY, isUp) {
    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let canvasCutY = (canvas.height/2) - (cutY*canvasRatio)

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=planeColor
    if (isUp) {
        ctx.fillRect(0, 0, canvas.width, canvasCutY)
    } else {
        ctx.fillRect(0, canvasCutY, canvas.width, canvas.height)
    }
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