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
            undoAllInits()
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
let conePoints = [
    [0, 0, 0, 1]
]
let spherePoints = generateSpherePoints(spherePointCount, sphereRadius)
conePoints = conePoints.concat(spherePoints)

const edgeIndices = getConeEdges(spherePointCount)

let sphereMeshes = []
let cylinderMeshes = []
let projectionSphereMesh = undefined
let coneSliceMesh = undefined

let projSpherePoints4D = []

function removeAllFromScene(arr) {
    arr.forEach(e => {
        removeThreejsMesh(e)
    });
}

function removeThreejsMesh(mesh) {
    if (!mesh || mesh === []) {
        return
    }

    scene.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
}

function undoAllInits() {
    removeAllFromScene(sphereMeshes)
    removeAllFromScene(cylinderMeshes)
    removeThreejsMesh(coneSliceMesh)
    removeThreejsMesh(projectionSphereMesh)

    sphereMeshes = []
    cylinderMeshes = []
    coneSliceMesh = undefined
    projectionSphereMesh = undefined
}

function initProjectionCone() {
    initSpheres()
    initCylinders()
    //initProjectionSphere()
}

function initSpheres() {
    for (let i = 0; i < conePoints.length; i++){
        let radius = projectionPointRadius/1.5
        if (i === 0) {
            radius = projectionPointRadius
        }
        const geometry = new THREE.SphereGeometry(radius)
        const material = new THREE.MeshStandardMaterial()
        if (i === 0) {
            material.color = new THREE.Color(lineColor)
        } else {
            material.color = new THREE.Color(sphereColor)
        }

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
        //material.transparent = true
        //material.opacity = 0.6
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

function get4DRotationMatrix(angleXW, angleYW, angleZW) {
    const rotationXW = [
        [Math.cos(angleXW), 0, 0, Math.sin(angleXW)],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [-Math.sin(angleXW), 0, 0, Math.cos(angleXW)]
    ];

    const rotationYW = [
        [1, 0, 0, 0],
        [0, Math.cos(angleYW), 0, -1*Math.sin(angleYW)],
        [0, 0, 1, 0],
        [0, Math.sin(angleYW), 0, Math.cos(angleYW)]
    ];

    const rotationZW = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, Math.cos(angleZW), -1*Math.sin(angleZW)],
        [0, 0, Math.sin(angleZW), Math.cos(angleZW)]
    ];

    let m = Util.multiplyMatrices(rotationXW, rotationYW)
    return Util.multiplyMatrices(m, rotationZW)
}

function rotate4D(points, angleXW, angleYW, angleZW) {
    let m = get4DRotationMatrix(angleXW, angleYW, angleZW)    

    let rotated = []
    for (let i = 0; i < points.length; i++){
        let v = Util.vectorToMatrix(points[i]);
        v = Util.multiplyMatrices(m, v);

        // Turn matrices back to numbers
        rotated.push([v[0][0], v[1][0], v[2][0], v[3][0]])
    }

    return rotated
}

function projectTo3D(rotatedPoints) {
    let finalPoints = []
    for (let i = 0; i < rotatedPoints.length; i++){
        let workingVector = Util.vectorToMatrix(rotatedPoints[i]);

        let w = 1 / (projectionDistance4D - workingVector[3][0]);
        const projectionMatrix = [
            [w, 0, 0, 0],
            [0, w, 0, 0],
            [0, 0, w, 0]
        ];

        const scale = [
            [scaleFactor, 0, 0, 0],
            [0, scaleFactor, 0, 0],
            [0, 0, scaleFactor, 0],
            [0, 0, 0, scaleFactor]
        ];

        workingVector = Util.multiplyMatrices(scale, workingVector)

        // From 4D to 3D
        let projected3d = Util.multiplyMatrices(projectionMatrix, workingVector)

        // Turn matrices back to numbers
        finalPoints[i] = [projected3d[0][0], projected3d[1][0], projected3d[2][0]]
    }
    return finalPoints
}


function updateProjectionCone(angleXW, angleYW, angleZW, translateW) {
    let rotatedPoints = rotate4D(conePoints, angleXW, angleYW, angleZW)
    let finalPoints = projectTo3D(rotatedPoints)
    //drawProjectionSphere(angleXW, angleYW, angleZW)
    drawPoints(finalPoints)
    drawCylinders(finalPoints)
}

function toMatrix4(m) {
    let m4 = new THREE.Matrix4()
    // m4.set(m[0][0], m[0][1], m[0][2], m[0][3],
    // m[1][0], m[1][1], m[1][2], m[1][3],
    // m[2][0], m[2][1], m[2][2], m[2][3],
    // m[3][0], m[3][1], m[3][2], m[3][3])
    m4.set(m[0][0], m[1][0], m[2][0], m[3][0],
    m[0][1], m[1][1], m[2][1], m[3][1],
    m[0][2], m[1][2], m[2][2], m[3][2],
    m[0][3], m[1][3], m[2][3], m[3][3])
    return m4
}

function drawProjectionSphere(angleXW, angleYW, angleZW) {
    let rotatedPoints = rotate4D(projSpherePoints4D, angleXW, angleYW, angleZW)
    let finalPoints = projectTo3D(rotatedPoints)

    let a = projectionSphereMesh.geometry.getAttribute("position")
    let meshPoints = a.array
    for (let i = 0; i < meshPoints.length; i++) {
        meshPoints[i] = finalPoints[Math.floor(i/3)][i%3]
    }
    a.needsUpdate = true
}

function drawPoints(points) {
    for (let i = 0; i < sphereMeshes.length; i++){
        if (i < points.length) {
            sphereMeshes[i].visible = true
            sphereMeshes[i].position.set(points[i][0], points[i][1], points[i][2])
        } else {
            sphereMeshes[i].visible = false
        }
    }
}

// pre-calculated from unit circle
// Needs to be defined on the two axes orthogonal to the cylinder height
const baseCirclePoints = [
    [0, 0, 1],
    [0, 0.3826834323650898, 0.9238795325112867],
    [0, 0.7071067811865476, 0.7071067811865476],
    [0, 0.9238795325112867, 0.38268343236508984],
    [0, 1, 0],
    [0, 0.9238795325112867, -0.3826834323650897],
    [0, 0.7071067811865476, -0.7071067811865475],
    [0, 0.3826834323650899, -0.9238795325112867],
    [0, 0, -1],
    [0, -0.38268343236508967, -0.9238795325112868],
    [0, -0.7071067811865475, -0.7071067811865477],
    [0, -0.9238795325112865, -0.38268343236509034],
    [0, -1, 0],
    [0, -0.9238795325112866, 0.38268343236509],
    [0, -0.7071067811865477, 0.7071067811865474],
    [0, -0.3826834323650904, 0.9238795325112865],
    [0, 0, 1],
]

function drawCylinders(points) {
    for (let i = 0; i < edgeIndices.length; i++) {
        let endpoint1 = points[edgeIndices[i][0]]
        let endpoint2 = points[edgeIndices[i][1]]

        // This axis used for cylinder height
        let xAxis = Util.subtractVectors(endpoint2, endpoint1)
        Util.normalizeVector(xAxis)

        let yAxis = Util.getArbitraryPerpendicularVector3D(xAxis)
        Util.normalizeVector(yAxis)

        let zAxis = Util.crossProduct(xAxis, yAxis)
        Util.normalizeVector(zAxis)

        let rotation = [
            [xAxis[0], yAxis[0], zAxis[0], 0],
            [xAxis[1], yAxis[1], zAxis[1], 0],
            [xAxis[2], yAxis[2], zAxis[2], 0],
            [0, 0, 0, 1]
        ]

        let translation1 = [
            [1, 0, 0, endpoint1[0]],
            [0, 1, 0, endpoint1[1]],
            [0, 0, 1, endpoint1[2]],
            [0, 0, 0, 1],
        ]

        let translation2 = [
            [1, 0, 0, endpoint2[0]],
            [0, 1, 0, endpoint2[1]],
            [0, 0, 1, endpoint2[2]],
            [0, 0, 0, 1],
        ]

        let scale = [
            [cylinderScaleFactor, 0, 0, 0],
            [0, cylinderScaleFactor, 0, 0],
            [0, 0, cylinderScaleFactor, 0],
            [0, 0, 0, 1],
        ]

        let m1 = Util.multiplyMatrices(translation1, scale)        
        let m2 = Util.multiplyMatrices(translation2, scale)

        let vArray = cylinderMeshes[i].geometry.getAttribute('position').array
        let nArray = cylinderMeshes[i].geometry.getAttribute('normal').array

        let rotatedPoints = []
        for (let j = 0; j < baseCirclePoints.length; j++) {
            let r = Util.vectorToMatrix([...baseCirclePoints[j], 1])
            r = Util.multiplyMatrices(rotation, r)
            rotatedPoints.push(r)

            let v = Util.multiplyMatrices(m1, r)
            vArray[j*3] = v[0][0]
            vArray[j*3 + 1] = v[1][0]
            vArray[j*3 + 2] = v[2][0]

            let n = [r[0][0], r[1][0], r[2][0]]
            Util.normalizeVector(n)
            nArray[j*3] = n[0]
            nArray[j*3 + 1] = n[1]
            nArray[j*3 + 2] = n[2]
        }

        let startIndex =  (vArray.length / 2)
        for (let j = 0; j < baseCirclePoints.length; j++) {
            let v = Util.multiplyMatrices(m2, rotatedPoints[j])
            vArray[startIndex + (j*3)] = v[0][0]
            vArray[startIndex + (j*3) + 1] = v[1][0]
            vArray[startIndex + (j*3) + 2] = v[2][0]

            nArray[startIndex + (j*3)] = nArray[j*3]
            nArray[startIndex + (j*3) + 1] = nArray[j*3 + 1]
            nArray[startIndex + (j*3) + 2] = nArray[j*3 + 2]
        }

        cylinderMeshes[i].geometry.attributes.normal.needsUpdate = true
        cylinderMeshes[i].geometry.attributes.position.needsUpdate = true
    }
}

function updateSliceCone(angleXW, angleYW, angleZW, translateW){
    // let rotatedPoints = rotateCube4D(angleXW, angleYW, angleZW)
    // let points4d = []
    // for (let i = 0; i < rotatedPoints.length; i++){
    //     let workingVector = Util.vectorToMatrix(rotatedPoints[i]);

    //     // Translate and turn matrices back to numbers
    //     points4d.push([workingVector[0][0], workingVector[1][0], workingVector[2][0], workingVector[3][0] + translateW])
    // }
    // let intersectionPoints = get3DIntersectionPoints(points4d)
    // let faceGeometry = separatePointsByCube(intersectionPoints)
    // drawFaces(faceGeometry)
}

function get3DIntersectionPoint(greaterPoint, lesserPoint, wClip) {
    let wDistance = greaterPoint[3] - lesserPoint[3]
    let t = (greaterPoint[3] - wClip) / wDistance

    return [Util.lerp(greaterPoint[0], lesserPoint[0], t),
            Util.lerp(greaterPoint[1], lesserPoint[1], t),
            Util.lerp(greaterPoint[2], lesserPoint[2], t)]
}

class FaceGeometry {
    constructor(origin, pointsByFace) {
        this.origin = origin
        this.pointsByFace = pointsByFace
    }
}

class IntersectionPoint {
    constructor(point, edgeIndex) {
        this.point = point
        this.edgeIndex = edgeIndex
    }
}

function get3DIntersectionPoints(points4D) {
    let wClip = 0.0
    let intersectionPoints = {} // edge index is key, point is value
    for (let i = 0; i < edgeIndices.length; i++) {
        let p1 = points4D[edgeIndices[i][0]]
        let p2 = points4D[edgeIndices[i][1]]
        
        if (p1[3] >= wClip && p2[3] < wClip) {
            intersectionPoints[i] = get3DIntersectionPoint(p1, p2, wClip)
        } else if (p2[3] >= wClip && p1[3] < wClip){
            intersectionPoints[i] = get3DIntersectionPoint(p2, p1, wClip)
        }
    }
    return intersectionPoints
}

function separatePointsByCube(intersectionPoints) {
    let arr = Object.values(intersectionPoints)
    let centerPoint = Util.getCenterOfPoints(arr)

    // Each tesseract cube will make up 0 or 1 faces of the final 3D object
    let pointsByCube = []
    for (let i = 0; i < edgeIndicesByCube.length; i++) {
        let pointsThisCube = []
        for (let j = 0; j < edgeIndicesByCube[i].length; j++) {
            let edgeIndex = edgeIndicesByCube[i][j]

            if (intersectionPoints[edgeIndex]) {
                pointsThisCube.push(new IntersectionPoint(intersectionPoints[edgeIndex], edgeIndex))
            }
        }

        if (pointsThisCube.length > 2) {
            pointsByCube.push(pointsThisCube)
        }
    }

    return new FaceGeometry(centerPoint, pointsByCube)
}



function drawFaces(faceGeometry) {
    function sortFacePoints(facePoints, normal) {
        let theta0Vector = Util.getArbitraryPerpendicularVector3D(normal)
        Util.normalizeVector(theta0Vector)
        let posAngleVector = Util.crossProduct(normal, theta0Vector)
        Util.normalizeVector(posAngleVector)

        let faceCenter = Util.getCenterOfPoints(facePoints.map(ip => ip.point))

        let angles = []
        for (let i = 0; i < facePoints.length; i++) {
            let v = Util.subtractVectors(facePoints[i].point, faceCenter)
            angles.push(Util.calcAngleBetweenVectors(theta0Vector, v, posAngleVector)) 
        }

        Util.bubbleSortParallel(angles, facePoints)
    }

    let edgePointPairs = []
    for (let i = 0; i < edgeIndices.length; i++) {
        edgePointPairs.push([])
        
    }
    let edgeIndex = 0
    function drawEdgesForFace(sortedFacePoints) {
        let scale = 1
        for (let i = 0; i < sortedFacePoints.length; i++) {
            let endIndex = i == sortedFacePoints.length-1 ? 0 : i+1
            // avoid duplicate lines
            // there's only ever 3 lines coming from 1 point so keeping in arrays is fine for performance
            if (edgePointPairs[sortedFacePoints[i].edgeIndex].includes(sortedFacePoints[endIndex].edgeIndex)) {
                continue;
            } else {
                edgePointPairs[sortedFacePoints[i].edgeIndex].push(sortedFacePoints[endIndex].edgeIndex)
                edgePointPairs[sortedFacePoints[endIndex].edgeIndex].push(sortedFacePoints[i].edgeIndex)
            }

            for (let j = 0; j < 3; j++) {
                linePointArrays[edgeIndex][j] = sortedFacePoints[i].point[j] * scale
                linePointArrays[edgeIndex][j+3] = sortedFacePoints[endIndex].point[j] * scale
            }
            lineMeshes[edgeIndex].visible = true
            lineGeometries[edgeIndex].setPositions(linePointArrays[edgeIndex])
            lineGeometries[edgeIndex].attributes.position.needsUpdate = true
            edgeIndex++
        }
    }

    let pointsByFace = faceGeometry.pointsByFace
    let positions = []
    let normals = []

    for (let i = 0; i < pointsByFace.length; i++) {
        if (pointsByFace[i].length < 3) {
            console.error('Cannot make a face with less than 3 points')
            continue
        }
        
        // Choose 3 random points from face to calculate a normal vector direction
        let p1 = pointsByFace[i][0].point
        let p2 = pointsByFace[i][1].point
        let p3 = pointsByFace[i][2].point

        let normal = Util.crossProduct(Util.subtractVectors(p2, p1), Util.subtractVectors(p3, p1))
        Util.normalizeVector(normal)

        // Check if normal is flipped
        let p1FromOrigin = Util.subtractVectors(p1, faceGeometry.origin)
        Util.normalizeVector(p1FromOrigin)

        if (Util.dotProduct(p1FromOrigin, normal) < 0) {
            Util.scaleVectorInplace(normal, -1)
        }

        sortFacePoints(pointsByFace[i], normal)

        drawEdgesForFace(pointsByFace[i])
        let faceVertices = getFaceVertices(pointsByFace[i].map(ip => ip.point))

        positions.push(...faceVertices)
        for (let k = 0; k < faceVertices.length/3; k++) {
            normals.push(...normal)            
        }
    }

    const positionAttribute = new THREE.BufferAttribute(new Float32Array(positions), 3)
    const normalAttribute = new THREE.BufferAttribute(new Float32Array(normals), 3)
    //positionAttribute.setUsage(THREE.DynamicDrawUsage)
    //normalAttribute.setUsage(THREE.DynamicDrawUsage)

    convexGeometry.setAttribute('position', positionAttribute)
    convexGeometry.setAttribute('normal', normalAttribute)

    for (let i = edgeIndex; i < lineMeshes.length; i++) {
        lineMeshes[i].visible = false        
    }
}

function getFaceVertices(sortedPoints) {
    let  trianglePoints = []
    while (sortedPoints.length > 2) {
        trianglePoints.push(...sortedPoints[0])
        trianglePoints.push(...sortedPoints[1])
        trianglePoints.push(...sortedPoints[2])
        
        sortedPoints.splice(1, 1)
    }
    return trianglePoints
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