<template>
<div>
    <div class="three-container">
        <canvas ref="canvas"></canvas>
        <div class="three-overlay">
            <div class="top-right sticky-box">
                <button @click="initProjectionHypercube">Projection</button>
                <button @click="initConvexHypercube">Isometric</button>
                <button @click="initSphere">Sphere</button>
            </div>
            <div class="bottom-right sticky-box">
                <div class="slider">
                    <label for="angleXW">XW</label>
                    <input id="angleXW" v-model="angleDegXW" type="range" min="-90" max="90" value="0" step="1">
                    <input v-model="angleDegXW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="angleYW">YW</label>
                    <input id="angleYW" v-model="angleDegYW" type="range" min="-90" max="90" value="0" step="1">
                    <input v-model="angleDegYW" class="slider-text" type="text" size="4">
                    <span class="unit-text">°</span>
                </div>
                <div class="slider">
                    <label for="angleZW">ZW</label>
                    <input id="angleZW" v-model="angleDegZW" type="range" min="-90" max="90" value="0" step="1">
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
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
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
                convexHypercube: 0,
                projectionHypercube: 1,
                hypersphere: 2,
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

            if (lineMaterials && lineMaterials.length > 0) {
                for (let i = 0; i < lineMaterials.length; i++) {
                    lineMaterials[i].resolution.set(width, height)                   
                }
            }
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
                        case (this.displayObjects.convexHypercube):
                            updateTesseractIso(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                        case (this.displayObjects.projectionHypercube):
                            updateTesseractProjection(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                            break
                        case (this.displayObjects.hypersphere):
                            updateHypersphere(parseFloat(this.translateW))
                            break
                    }
                    this.objectNeedsUpdate = false
                }
               
                //renderer.clearDepth()
                renderer.render(scene, camera)

                delta = delta % interval;
            }
            requestAnimationFrame(this.animate);
        },
        initConvexHypercube() {
            undoAllInits()

            initConvexShape()
            initConvexEdges(this.canvasSize.width, this.canvasSize.height)

            this.displayObject = this.displayObjects.convexHypercube
            this.objectNeedsUpdate = true
        },
        initProjectionHypercube() {
            undoAllInits()

            initSpheres()
            initCylinders()

            this.displayObject = this.displayObjects.projectionHypercube
            this.objectNeedsUpdate = true
        },
        initSphere() {
            undoAllInits()

            initHypersphere()
            this.translateW = 0

            this.displayObject = this.displayObjects.hypersphere
            this.objectNeedsUpdate = true
        }
    },
    mounted() {
        this.initThree()
        this.initConvexHypercube()
        this.animate()
    }
}



const cubePoints = [
    [-1, -1, -1, -1], //0
    [-1, -1,  1, -1], //1
    [-1,  1,  1, -1], //2
    [-1,  1, -1, -1], //3
    [ 1, -1, -1, -1], //4
    [ 1, -1,  1, -1], //5
    [ 1,  1,  1, -1], //6
    [ 1,  1, -1, -1], //7
    [-1, -1, -1,  1], //8
    [-1, -1,  1,  1], //9
    [-1,  1,  1,  1], //10
    [-1,  1, -1,  1], //11
    [ 1, -1, -1,  1], //12
    [ 1, -1,  1,  1], //13
    [ 1,  1,  1,  1], //14
    [ 1,  1, -1,  1], //15
]

const edgeIndices = [
    // 3D cube
    [0, 1], //0
    [1, 2], //1
    [2, 3], //2
    [3, 0], //3
    [4, 5], //4
    [5, 6], //5
    [6, 7], //6
    [7, 4], //7
    [3, 7], //8
    [0, 4], //9
    [2, 6], //10
    [1, 5], //11

    // cube connectors
    [0, 8], //12
    [1, 9], //13
    [2, 10], //14
    [3, 11], //15
    [4, 12], //16
    [5, 13], //17
    [6, 14], //18
    [7, 15], //19
 
    // tessy cube
    [8, 9], //20
    [9, 10], //21
    [10, 11], //22
    [11, 8], //23
    [12, 13], //24
    [13, 14], //25
    [14, 15], //26
    [15, 12], //27
    [11, 15], //28
    [8, 12], //29
    [10, 14], //30
    [9, 13], //31
]

const edgeIndicesByCube = [
    [0, 1, 2, 3, 9, 11, 10, 8, 4, 5, 6, 7], //outer
    [0, 1, 2, 3, 12, 13, 14, 15, 20, 21, 22, 23], //left
    [9, 7, 8, 3, 16, 19, 15, 12, 29, 27, 28, 23], //front
    [0, 11, 4, 9, 12, 13, 17, 16, 20, 31, 24, 29], //bottom
    [4, 5, 6, 7, 16, 17, 18, 19, 24, 25, 26, 27], //right
    [11, 5, 10, 1, 13, 17, 18, 14, 31, 25, 30, 21], //back
    [2, 8, 6, 10, 14, 15, 19, 18, 22, 28, 26, 30], //top
    [20, 21, 22, 23, 29, 31, 30, 28, 24, 25, 26, 27], //inner
]

const projectionSphereRadius = 0.09
const cylinderScaleFactor = 0.06
const projectionDistance4D = 3
const scaleFactor = 2
const hypersphereRadius = 1.5

let sphereMeshes = []
let cylinderGeometries = []
let cylinderMeshes = []
let lineGeometries = []
let lineMaterials = []
let linePointArrays = []
let lineMeshes = []
let convexGeometry = undefined
let convexMesh = undefined
let hypersphereMesh = undefined

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
    removeAllFromScene(lineMeshes)
    //removeAllFromScene(lineMaterials)
    removeThreejsMesh(convexMesh)
    removeThreejsMesh(hypersphereMesh)

    sphereMeshes = []
    cylinderGeometries = []
    cylinderMeshes = []
    lineMeshes = []
    lineMaterials = []
    lineGeometries = []
    linePointArrays = []
    convexGeometry = undefined
    convexMesh = undefined
    hypersphereMesh = undefined
}

function initSpheres() {
    for (let i = 0; i < cubePoints.length; i++){
        const geometry = new THREE.SphereGeometry(projectionSphereRadius)
        const material = new THREE.MeshStandardMaterial()

        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        sphereMeshes.push(mesh)
    }
}

function initCylinders() {
    for (let i = 0; i < edgeIndices.length; i++){
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16, 1, true)
        geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)
        cylinderGeometries.push(geometry)

        const material = new THREE.MeshStandardMaterial()
        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        cylinderMeshes.push(mesh)

        // let vecarray = []
        // let arr = geometry.getAttribute('position').array
        // for (let i = 0; i < arr.length; i+= 3) {
        //     vecarray.push(new THREE.Vector3(arr[i], arr[i+1], arr[i+2]))
            
        // }
        // console.log(vecarray)
    }
}

function initConvexShape() {
    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(new Float32Array(0), 3)
    positionAttribute.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', positionAttribute)

    convexGeometry = geometry

    const material = new THREE.MeshStandardMaterial()
    material.transparent = true
    material.opacity = 0.97
    material.color = new THREE.Color(0xFFEE56)
    //material.side = THREE.DoubleSide
    //material.blending = THREE.CustomBlending
    //material.blendEquation = THREE.SubtractEquation
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    convexMesh = mesh
}

function initConvexEdges(canvasWidth, canvasHeight) {
    for (let i = 0; i < 20; i++) {
        const geoPoints = new Float32Array(6)
        for (let j = 0; j < geoPoints.length; j++) {
            geoPoints[j] = 0
        }
        linePointArrays.push(geoPoints)

        const geometry = new LineGeometry();
		geometry.setPositions( geoPoints );

        const material = new LineMaterial({
            linewidth: 5.5,
            color: 0xffffff,
        })
        material.resolution.set(canvasWidth, canvasHeight)

        let line = new Line2( geometry, material );
        scene.add( line );

        lineGeometries.push(geometry)
        lineMaterials.push(material)
        lineMeshes.push(line)
    }
}

function initHypersphere() {
    const geometry = new THREE.SphereGeometry(hypersphereRadius, 48, 24)
    const material = new THREE.MeshStandardMaterial()

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    hypersphereMesh = mesh
}

function rotateCube4D(angleXW, angleYW, angleZW) {
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
    m = Util.multiplyMatrices(m, rotationZW)
    
    let points4d = []
    for (let i = 0; i < cubePoints.length; i++){
        let v = Util.vectorToMatrix(cubePoints[i]);
        v = Util.multiplyMatrices(m, v);

        // Turn matrices back to numbers
        points4d.push([v[0][0], v[1][0], v[2][0], v[3][0]])
    }

    return points4d
}


function updateTesseractProjection(angleXW, angleYW, angleZW, translateW) {
    let rotatedPoints = rotateCube4D(angleXW, angleYW, angleZW)
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
    drawPoints(finalPoints)
    drawCylinders(finalPoints)
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

        let vArray = cylinderGeometries[i].getAttribute('position').array
        let nArray = cylinderGeometries[i].getAttribute('normal').array

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

        cylinderGeometries[i].attributes.normal.needsUpdate = true
        cylinderGeometries[i].attributes.position.needsUpdate = true
    }
}

function drawEdges(points) {
    for (let i = 0; i < lineGeometries.length; i++) {
        const startIndex = edgeIndices[i][0]
        const endIndex = edgeIndices[i][1]

        for (let j = 0; j < 3; j++) {
            linePointArrays[i][j] = points[startIndex][j]
            linePointArrays[i][j+3] = points[endIndex][j]
        }

        lineGeometries[i].attributes.position.needsUpdate = true
    }
}

function updateTesseractIso(angleXW, angleYW, angleZW, translateW){
    let rotatedPoints = rotateCube4D(angleXW, angleYW, angleZW)
    let points4d = []
    for (let i = 0; i < rotatedPoints.length; i++){
        let workingVector = Util.vectorToMatrix(rotatedPoints[i]);

        // Translate and turn matrices back to numbers
        points4d.push([workingVector[0][0], workingVector[1][0], workingVector[2][0], workingVector[3][0] + translateW])
    }
    let intersectionPoints = get3DIntersectionPoints(points4d)
    let faceGeometry = separatePointsByCube(intersectionPoints)
    drawFaces(faceGeometry)
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

function updateHypersphere(translateW) {
    let radius = Util.getSphereIntersectionRadius(hypersphereRadius, Math.abs(translateW))
    let scale = radius / hypersphereRadius

    hypersphereMesh.scale.x = scale;
    hypersphereMesh.scale.y = scale;
    hypersphereMesh.scale.z = scale;
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