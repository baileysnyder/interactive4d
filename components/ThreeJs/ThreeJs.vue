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

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight)
        }
    },
    mounted() {
        this.initThree();
        initSpheres();
        updateTesseract();
        animate();
    }
}

function animate() {
    renderer.render(scene, camera)
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

const sphereRadius = 0.1
let sphereMeshes = []

let angle = 0

function initSpheres() {
    for (let i = 0; i < cubePoints.length; i++){
        const geometry = new THREE.SphereGeometry(sphereRadius)
        const material = new THREE.MeshStandardMaterial()
        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        sphereMeshes.push(mesh)
    }
}

function updateTesseract() {
    let projected3d = []
    for (let i = 0; i < cubePoints.length; i++){
        const v = cubePoints[i];

        let distance = 2;
        let w = 1 / (distance - v[3]);

        const projectionMatrix = [
            [w, 0, 0, 0],
            [0, w, 0, 0],
            [0, 0, w, 0]
        ];

        let projected = multiplyMatrices(projectionMatrix, vectorToMatrix(v))
        projected3d[i] = projected
    }
    drawPoints(projected3d)
}

function drawPoints(points) {
    for (let i = 0; i < sphereMeshes.length; i++){
        sphereMeshes[i].position.set(points[i][0], points[i][1], points[i][2])
    }
}

</script>

<style>

</style>