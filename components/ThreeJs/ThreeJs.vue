<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let camera;
let scene;
let renderer;

export default {
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
        }
    },
    mounted() {
        this.initThree()
        initSpheres()
        initCylinders()
        //initEdges()
        animate()
    }
}

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;

function animate() {
    delta += clock.getDelta();
    if (delta  > interval) {
        updateTesseract()
        renderer.render(scene, camera)

        delta = delta % interval;
    }
    requestAnimationFrame(animate);
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
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [3, 7],
    [0, 4],
    [2, 6],
    [1, 5],

    // cube connectors
    [0, 8],
    [1, 9],
    [2, 10],
    [3, 11],
    [4, 12],
    [5, 13],
    [6, 14],
    [7, 15],
 
    // tessy cube
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 8],
    [12, 13],
    [13, 14],
    [14, 15],
    [15, 12],
    [11, 15],
    [8, 12],
    [10, 14],
    [9, 13],
]

const sphereRadius = 0.09
const cylinderScaleFactor = 0.06
const projectionDistance4D = 3
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

let angle = 0
function updateTesseract() {
    let finalPoints = []
    for (let i = 0; i < cubePoints.length; i++){
        let workingVector = vectorToMatrix(cubePoints[i]);

        const scaleFactor = 2
        const scale = [
            [scaleFactor, 0, 0, 0],
            [0, scaleFactor, 0, 0],
            [0, 0, scaleFactor, 0],
            [0, 0, 0, scaleFactor]
        ];

        const rotationXW = [
            [Math.cos(angle), 0, 0, Math.sin(angle)],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [-Math.sin(angle), 0, 0, Math.cos(angle)]
        ];

        const rotationYW = [
            [1, 0, 0, 0],
            [0, Math.cos(angle), 0, -1*Math.sin(angle)],
            [0, 0, 1, 0],
            [0, Math.sin(angle), 0, Math.cos(angle)]
        ];

        const rotationZW = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, Math.cos(angle), -1*Math.sin(angle)],
            [0, 0, Math.sin(angle), Math.cos(angle)]
        ];

        workingVector = multiplyMatrices(rotationXW, workingVector);
        //workingVector = multiplyMatrices(rotationYW, workingVector)
        //workingVector = multiplyMatrices(rotationZW, workingVector)

        let w = 1 / (projectionDistance4D - workingVector[3][0]);

        const projectionMatrix = [
            [w, 0, 0, 0],
            [0, w, 0, 0],
            [0, 0, w, 0]
        ];

        workingVector = multiplyMatrices(scale, workingVector)

        // From 4D to 3D
        let projected3d = multiplyMatrices(projectionMatrix, workingVector)

        // Turn matrices back to numbers
        finalPoints[i] = [projected3d[0][0], projected3d[1][0], projected3d[2][0]]
    }
    drawPoints(finalPoints)
    //drawEdges(finalPoints)
    drawCylinders(finalPoints)
    angle += 0.01
}

function drawPoints(points) {
    for (let i = 0; i < sphereMeshes.length; i++){
        sphereMeshes[i].position.set(points[i][0], points[i][1], points[i][2])
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

</script>

<style>

</style>