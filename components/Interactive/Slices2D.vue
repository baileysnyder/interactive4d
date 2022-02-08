<template>
    <div class="top-container">
        <div class="three-container">
            <canvas class="main-canvas" ref="canvas"></canvas>
            <div class="three-overlay">
                <div class="top-right sticky-box">
                    <button @click="initSphere">Sphere</button>
                    <button @click="initCone">Cone</button>
                    <button @click="initSolidCube">Solid Cube</button>
                    <button @click="initEdgeCube">Edge Cube</button>
                </div>
                <div class="bottom-right sticky-box">
                    <div class="slider-row">
                        <button class="slider-button" @click="resetUI">Reset</button>
                    </div>                    
                    <div class="slider-row">
                        <label for="angleXZ">XZ</label>
                        <input id="angleXZ" v-model="angleDegXZ" type="range" min="-360" max="360" value="0" step="1">
                        <!-- <input v-model="angleDegXZ" class="slider-text" type="text" size="4">
                        <span class="unit-text">°</span> -->
                    </div>
                    <div class="slider-row">
                        <label for="angleYZ">YZ</label>
                        <input id="angleYZ" v-model="angleDegYZ" type="range" min="-360" max="360" value="0" step="1">
                        <!-- <input v-model="angleDegYZ" class="slider-text" type="text" size="4">
                        <span class="unit-text">°</span> -->
                    </div>
                    <div class="slider-row">
                        <label for="translateZ">Z</label>
                        <input id="translateZ" v-model="translateZ" type="range" min="-1.5" max="1.5" value="0" step="0.01">
                        <!-- <input v-model="translateZ" class="slider-text" type="text" size="4">
                        <span class="unit-text invisible">°</span> -->
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
            angleDegXZ: 0,
            angleDegYZ: 0,
            translateZ: 0.0,
            canvas: undefined,
            sliceCanvas: undefined,
            objectNeedsUpdate: false,
            displayObject: undefined,
            displayObjects: {
                sphere: 0,
                solidCube: 1,
                edgeCube: 2,
                cone: 3,
                projCube: 4,
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
            this.updateDisplay()
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
            switch (this.displayObject) {
                case (this.displayObjects.sphere):
                    updateSphere(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (this.displayObjects.solidCube):
                    updateSolidCube(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                    break
                case (this.displayObjects.edgeCube):
                    updateEdgeCube(this.sliceCanvas, parseFloat(this.angleXZ), parseFloat(this.angleYZ), parseFloat(this.translateZ))
                case (this.displayObjects.projCube):
                    break
                case (this.displayObjects.cone):
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
            requestAnimationFrame(this.animate);
        },
        updateSliceCanvas(width, totalHeight) {
            this.sliceCanvas.width = width
            this.sliceCanvas.height = totalHeight*sliceCanvasPercentH
        },
        initShape(initFunction, displayObjectId) {
            undoAllInits()
            initFunction()

            this.displayObject = displayObjectId
            this.objectNeedsUpdate = true
        },
        initSphere() {
            this.initShape(initSphere, this.displayObjects.sphere)
        },
        initSolidCube() {
            this.initShape(initSolidCube, this.displayObjects.solidCube)
        },
        initEdgeCube() {
            this.initShape(initEdgeCube, this.displayObjects.edgeCube)
        },
        initCone() {
            this.initShape(initCone, this.displayObjects.cone)
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
        this.initSphere()
        this.animate(0)
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

const coneNegZBase = [0, -coneHeight/2, -sphereRadius]
const conePosZBase = [0, -coneHeight/2, sphereRadius]

const parabolaThreshold = 0.001

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
    //coneMesh.rotation.y = angleXZ
    coneMesh.rotation.x = angleYZ
    coneMesh.updateMatrix()
    updateConicalSlice(canvas, angleYZ, translateZ)
}

function updateConicalSlice(canvas, angleYZ, translateZ) {
    drawSliceCanvas(canvas)

    // the threejs cone positions array is split into 4 sections each having length coneSegments+1:
    // tip positions > base positions > base center positions > base positions
    let tip = new THREE.Vector3()
    tip.fromBufferAttribute(coneMesh.geometry.attributes.position, 0)
    tip.applyMatrix4(coneMesh.matrix)

    let baseNeg = new THREE.Vector3(coneNegZBase[0], coneNegZBase[1], coneNegZBase[2])
    baseNeg.applyMatrix4(coneMesh.matrix)

    let basePos = new THREE.Vector3(conePosZBase[0], conePosZBase[1], conePosZBase[2])
    basePos.applyMatrix4(coneMesh.matrix)

    let hyperbolaMin = (-2*Math.PI)-(Math.PI/6)
    const hyperbolaRange = Math.PI/3
    const maxAngle = 2*Math.PI

    while (hyperbolaMin < maxAngle) {
        let hyperbolaMax = hyperbolaMin + hyperbolaRange

        if (inThreshold(angleYZ, hyperbolaMin, parabolaThreshold) || inThreshold(angleYZ, hyperbolaMax, parabolaThreshold)) {
            updateParabola(canvas, angleYZ, tip, baseNeg, basePos)
            return
        } else if (angleYZ > hyperbolaMin && angleYZ < hyperbolaMax) {
            updateHyperbola(canvas, angleYZ, tip, baseNeg, basePos)
            return
        } else {
            hyperbolaMin += Math.PI
        }
    }

    updateEllipse(canvas, angleYZ, tip, baseNeg, basePos)
}

function inThreshold(val, checkVal, threshold) {
    let min = checkVal - threshold
    let max = checkVal + threshold
    return val > min && val < max
}

function updateParabola(canvas, angleYZ, tip, baseNeg, basePos) {
    if (basePos.z === 0 || baseNeg.z === 0) {
        // slice is a straight line, which would be invisible in 2D
        return
    }

    let yInt = undefined
    if (tip.z > 0 && baseNeg.z < 0 || tip.z < 0 && baseNeg.z > 0) {
        yInt = yInterceptOnPlane(tip, baseNeg)
    } else if (tip.z > 0 && basePos.z < 0 || tip.z < 0 && basePos.z > 0) {
        yInt = yInterceptOnPlane(tip, basePos)
    }

    if (!yInt) {
        return
    }

    let baseCutY = yInterceptOnPlane(basePos, baseNeg)
    let x = getXOfBaseIntersect(baseCutY)
    let y = Math.abs(yInt-baseCutY)
    let a = x*x/(4*y)
    let points = getParabola(a, y)

    let isUp = Math.cos(angleYZ) < 0
    translateGraph(points, yInt, isUp)
    drawPoints(canvas, points)
}

function getParabola(a, maxY) {
    let points1 = []
    let points2 = []
    const minY = 0.0001

    for (let y = maxY; y > minY ; y/=1.5) {
        let x = Math.sqrt(4*a*y)
        points1.push([-x, y])
        points2.push([x, y])
    }

    points1.push([0, 0])
    // store points left to right so it's easier to draw
    return points1.concat(points2.reverse())
}

function updateHyperbola(canvas, angleYZ, tip, baseNeg, basePos) {
    // degenerative
    if (tip.z === 0) {
        let points = getDegenerativeHyperbola(tip, basePos, baseNeg)
        drawPoints(canvas, points)
        return
    }

    let y1 = undefined
    let y2 = undefined
    if (tip.z > 0 && baseNeg.z < 0 || tip.z < 0 && baseNeg.z > 0) {
        y1 = yInterceptOnPlane(tip, baseNeg)
        y2 = projectedYInterceptOnPlane(basePos, tip)
    } else if (tip.z > 0 && basePos.z < 0 || tip.z < 0 && basePos.z > 0) {
        y1 = yInterceptOnPlane(tip, basePos)
        y2 = projectedYInterceptOnPlane(baseNeg, tip)
    }

    if (!y1 || !y2) {
        return
    }

    let a = Math.abs((y2-y1)/2)
    let eccentricity = Math.abs(Math.cos(angleYZ)/Math.cos(Math.PI/6))
    let c = a*eccentricity
    let b = Math.sqrt(Math.abs(c*c-a*a))

    let baseCutY = yInterceptOnPlane(basePos, baseNeg)

    let yOrigin = y1 + ((y2-y1)/2)
    let points = getHyperbola(a, b, Math.abs(yOrigin - baseCutY))
    let isUp = Math.cos(angleYZ) < 0
    translateGraph(points, yOrigin, isUp)
    drawPoints(canvas, points)
}

function getDegenerativeHyperbola(tip, basePos, baseNeg) {
    if (basePos.y === baseNeg.y) {
        return [
            [-sphereRadius, basePos.y],
            [0, tip.y],
            [sphereRadius, basePos.y]
        ]
    }
    // assuming base circle is intersecting
    let baseCutY = yInterceptOnPlane(basePos, baseNeg)
    let xDist = getXOfBaseIntersect(baseCutY)

    return [
        [-xDist, baseCutY],
        [0, tip.y],
        [xDist, baseCutY]
    ]
}

function getXOfBaseIntersect(baseCutY) {
    let baseCenter = new THREE.Vector3()
    baseCenter.fromBufferAttribute(coneMesh.geometry.attributes.position, (coneSegments*2)+2)
    baseCenter.applyMatrix4(coneMesh.matrix)

    let yDiff = baseCutY-baseCenter.y
    let zDistAlongBase2 = yDiff*yDiff + baseCenter.z*baseCenter.z
    return Math.sqrt(sphereRadius*sphereRadius - zDistAlongBase2)
}

function getHyperbola(a, b, maxY) {
    let a2 = a*a
    let b2 = b*b

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
    // store points left to right so it's easier to draw
    return points1.concat(points2.reverse())
}

function translateGraph(points, y0, isUp) {
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

function updateEllipse(canvas, angleYZ, tip, baseNeg, basePos) {
    let y1 = undefined
    if (tip.z > 0 && baseNeg.z < 0 || tip.z < 0 && baseNeg.z > 0) {
        y1 = yInterceptOnPlane(tip, baseNeg)
    }

    let y2 = undefined
    if (tip.z > 0 && basePos.z < 0 || tip.z < 0 && basePos.z > 0) {
        y2 = yInterceptOnPlane(tip, basePos)
    }

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