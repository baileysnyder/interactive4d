<template>
<div>
    <input v-model="angleXW" type="range" min="-3.14" max="3.14" value="0" step="0.01">
    <input v-model="angleYW" type="range" min="-3.14" max="3.14" value="0" step="0.01">
    <input v-model="angleZW" type="range" min="-3.14" max="3.14" value="0" step="0.01">
    <input v-model="translateW" type="range" min="-2" max="2" value="0" step="0.01">
    <canvas ref="canvas"></canvas>
</div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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
            translateW: 0.0,
        }
    },
    methods: {
        initThree() {
            const height = 800
            const width = 600

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
            if (delta  > interval) {
                //updateTesseractProjection(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                updateTesseractIso(parseFloat(this.angleXW), parseFloat(this.angleYW), parseFloat(this.angleZW), parseFloat(this.translateW))
                renderer.render(scene, camera)

                delta = delta % interval;
            }
            requestAnimationFrame(this.animate);
        }
    },
    mounted() {
        this.initThree()
        initSpheres()
        initCylinders()
        //initEdges()
        this.animate()
    }
}

const multiplyMatrices = (a, b) => {
   if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) {
      throw new Error('arguments should be in 2-dimensional array format');
   }
   let x = a.length,
   z = a[0].length,
   y = b[0].length;
   if (b.length !== z) {
      // XxZ & ZxY => XxY
      throw new Error('number of columns in the first matrix should be the same as the number of rows in the second');
   }
   let productRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
   let product = new Array(x);
   for (let p = 0; p < x; p++) {
      product[p] = productRow.slice();
   }
   for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
         for (let k = 0; k < z; k++) {
            product[i][j] += a[i][k] * b[k][j];
         }
      }
   }
   return product;
}

function vectorToMatrix(vec){
    let m = [];
    for (let i = 0; i < vec.length; i++) {
        m[i] = [vec[i]];
    }
    return m;
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

const cubeEdgeIndices = [
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
    [2, 8, 6, 10, 14, 15, 19, 18, 22, 28, 26, 20], //top
    [20, 21, 22, 23, 29, 31, 30, 28, 24, 25, 26, 27], //inner
]

const sphereRadius = 0.09
const cylinderScaleFactor = 0.06
const projectionDistance4D = 3
const scaleFactor = 2
let sphereMeshes = []
let lineGeometries = []
let linePointArrays = []
let cylinderGeometries = []

function initSpheres() {
    for (let i = 0; i < cubePoints.length; i++){
        const geometry = new THREE.SphereGeometry(sphereRadius)
        const material = new THREE.MeshStandardMaterial()

        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        sphereMeshes.push(mesh)
    }
}

function initEdges() {
    for (let i = 0; i < cubeEdgeIndices.length; i++) {
        const startIndex = cubeEdgeIndices[i][0]
        const endIndex = cubeEdgeIndices[i][1]

        const material = new THREE.LineBasicMaterial( { color: 0xffffff})

        const geoPoints = new Float32Array(6)
        for (let j = 0; j < 3; j++) {
            geoPoints[j] = cubePoints[startIndex][j]
            geoPoints[j+3] = cubePoints[endIndex][j]
        }
        linePointArrays.push(geoPoints)


        const geometry = new THREE.BufferGeometry()
        const positionAttribute = new THREE.BufferAttribute(geoPoints, 3)
        positionAttribute.setUsage(THREE.DynamicDrawUsage)
        geometry.setAttribute('position', positionAttribute)

        const line = new THREE.Line(geometry, material)

        scene.add(line)
        lineGeometries.push(geometry)
    }
}

function initCylinders() {
    for (let i = 0; i < cubeEdgeIndices.length; i++){
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16, 1, true)
        geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)
        cylinderGeometries.push(geometry)

        const material = new THREE.MeshStandardMaterial()
        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)

        // let vecarray = []
        // let arr = geometry.getAttribute('position').array
        // for (let i = 0; i < arr.length; i+= 3) {
        //     vecarray.push(new THREE.Vector3(arr[i], arr[i+1], arr[i+2]))
            
        // }
        // console.log(vecarray)
    }
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

    let m = multiplyMatrices(rotationXW, rotationYW)
    m = multiplyMatrices(m, rotationZW)
    
    let points4d = []
    for (let i = 0; i < cubePoints.length; i++){
        let v = vectorToMatrix(cubePoints[i]);
        v = multiplyMatrices(m, v);

        // Turn matrices back to numbers
        points4d.push([v[0][0], v[1][0], v[2][0], v[3][0]])
    }

    return points4d
}


function updateTesseractProjection(angleXW, angleYW, angleZW, translateW) {
    let rotatedPoints = rotateCube4D(angleXW, angleYW, angleZW)
    let finalPoints = []
    for (let i = 0; i < rotatedPoints.length; i++){
        let workingVector = vectorToMatrix(rotatedPoints[i]);

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

        workingVector = multiplyMatrices(scale, workingVector)

        // From 4D to 3D
        let projected3d = multiplyMatrices(projectionMatrix, workingVector)

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

function subtractVectors(vDommy, vSub){
    if (vDommy.length !== vSub.length) {
        throw new Error('Vector dimensions must match')
    }

    let vNew = []
    for (let i = 0; i < vDommy.length; i++) {
        vNew.push(vDommy[i] - vSub[i])
    }
    return vNew
}

function normalizeVector(v) {
    let distance = 0
    for (let i = 0; i < v.length; i++) {
        distance += v[i] * v[i]
    }
    distance = Math.sqrt(distance)

    if (distance > 0) {
        for (let i = 0; i < v.length; i++) {
            v[i] = v[i] / distance        
        }
    }
}

function getArbitraryPerpendicularVector([x, y, z]) {
  let result = [0,0,0]

  if (x == 0 || y == 0 || z == 0) {
    if (x == 0)
      result[0] = 1;
    else if (y == 0)
      result[1] = 1;
    else
      result[2] = 1;
  }
  else {
    // If xyz is all set, we set the z coordinate as first and second argument .
    // As the dot product must be zero, we add the negated sum of x and y as third argument
    result[0] = z;      // z*x
    result[1] = z;      // z*x + z*y
    result[2] = -(x+y); // z*x + z*y - z(x+y) = z*(x+y) - z*(x+y) = 0
  }
  return result;
}

function crossProduct(v, u) {
    let p = [];
    p.push((v[1]*u[2]) - (v[2]*u[1]))
    p.push((v[2]*u[0]) - (v[0]*u[2]))
    p.push((v[0]*u[1]) - (v[1]*u[0]))
    return p
}

function drawCylinders(points) {
    for (let i = 0; i < cubeEdgeIndices.length; i++) {
        let endpoint1 = points[cubeEdgeIndices[i][0]]
        let endpoint2 = points[cubeEdgeIndices[i][1]]

        // This axis used for cylinder height
        let xAxis = subtractVectors(endpoint2, endpoint1)
        normalizeVector(xAxis)

        let yAxis = getArbitraryPerpendicularVector(xAxis)
        normalizeVector(yAxis)

        let zAxis = crossProduct(xAxis, yAxis)
        normalizeVector(zAxis)

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

        let m1 = multiplyMatrices(translation1, rotation)
        m1 = multiplyMatrices(m1, scale)
        
        let m2 = multiplyMatrices(translation2, rotation)
        m2 = multiplyMatrices(m2, scale)

        let vArray = cylinderGeometries[i].getAttribute('position').array
        for (let j = 0; j < baseCirclePoints.length; j++) {          
            let v = vectorToMatrix([...baseCirclePoints[j], 1])
            v = multiplyMatrices(m1, v)
            vArray[j*3] = v[0][0]
            vArray[j*3 + 1] = v[1][0]
            vArray[j*3 + 2] = v[2][0]
        }

        let startIndex =  (vArray.length / 2)
        for (let j = 0; j < baseCirclePoints.length; j++) {
            let v = vectorToMatrix([...baseCirclePoints[j], 1])
            v = multiplyMatrices(m2, v)
            vArray[startIndex + (j*3)] = v[0][0]
            vArray[startIndex + (j*3) + 1] = v[1][0]
            vArray[startIndex + (j*3) + 2] = v[2][0]
        }
        cylinderGeometries[i].computeVertexNormals()
        cylinderGeometries[i].attributes.position.needsUpdate = true
    }
}

function drawEdges(points) {
    for (let i = 0; i < lineGeometries.length; i++) {
        const startIndex = cubeEdgeIndices[i][0]
        const endIndex = cubeEdgeIndices[i][1]

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
        let workingVector = vectorToMatrix(rotatedPoints[i]);

        // Turn matrices back to numbers
        points4d.push([workingVector[0][0], workingVector[1][0], workingVector[2][0], workingVector[3][0] + translateW])
    }
    let points3d = getIntersectionPoints(points4d)
    drawPoints(points3d)
}

function lerp(a, b, t) {
    if (t == 0)
        return a;
    else if (t == 1)
        return b;

    return a * (1 - t) + b * t;
}

function getIntersectionPoint3D(greaterPoint, lesserPoint, wClip) {
    let wDistance = greaterPoint[3] - lesserPoint[3]
    let t = (greaterPoint[3] - wClip) / wDistance

    return [lerp(greaterPoint[0], lesserPoint[0], t),
            lerp(greaterPoint[1], lesserPoint[1], t),
            lerp(greaterPoint[2], lesserPoint[2], t)]
}

function getIntersectionPoints(points4d) {
    //get intersecting points for all edges
    let wClip = 0.0
    let intersectionPoints = []
    for (let i = 0; i < cubeEdgeIndices.length; i++) {
        let p1 = points4d[cubeEdgeIndices[i][0]]
        let p2 = points4d[cubeEdgeIndices[i][1]]
        
        if (p1[3] >= wClip && p2[3] < wClip) {
            intersectionPoints.push(getIntersectionPoint3D(p1, p2, wClip))
        } else if (p2[3] >= wClip && p1[3] < wClip){
            intersectionPoints.push(getIntersectionPoint3D(p2, p1, wClip))
        }
    }
    return intersectionPoints
    // go through faces and create duplicates of vertices
}

</script>

<style>

</style>