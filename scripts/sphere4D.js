import * as Util from './util'
import * as THREE from 'three'

function generate4DSphere(radius, segmentsW, segmentsH, wSteps) {
    let points = []
    for (let i = 0; i < wSteps; i++) {
        let w = (i/wSteps) * radius
        let innerRadius = Util.getSphereIntersectionRadius(radius, w)
        points = points.concat(Util.generate3DSphereIn4D(innerRadius, segmentsW, segmentsH, w))
        points = points.concat(Util.generate3DSphereIn4D(innerRadius, segmentsW, segmentsH, -w))
    }
    points.push([0, 0, 0, -radius])
    points.push([0, 0, 0, radius])

    return points
}
const hyperspherePoints = generate4DSphere(1, 6, 4, 3)

const projectionSphereRadius = 0.09
const projectionDistance4D = 3
const scaleFactor = 2
const hypersphereRadius = 1.5

const pointColor = '#D2F3F5'
const sphereColor = '#269E26'

let sphereMeshes = []
let hypersphereMesh = undefined

export function undoInits(scene) {
    Util.removeThreeJsObjects(scene, sphereMeshes, hypersphereMesh)

    sphereMeshes = []
    hypersphereMesh = undefined
}

function initSpheres(scene, count) {
    for (let i = 0; i < count; i++){
        const geometry = new THREE.SphereGeometry(projectionSphereRadius)
        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(pointColor)

        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        sphereMeshes.push(mesh)
    }
}


export function initProjHypersphere(scene) {
    initSpheres(scene, hyperspherePoints.length)
}


export function initSliceHypersphere(scene) {
    const geometry = new THREE.SphereGeometry(hypersphereRadius, 48, 24)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(sphereColor)

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    hypersphereMesh = mesh
}

export function updateSliceHypersphere(translateW) {
    let radius = Util.getSphereIntersectionRadius(hypersphereRadius, Math.abs(translateW))
    let scale = radius / hypersphereRadius

    hypersphereMesh.scale.x = scale;
    hypersphereMesh.scale.y = scale;
    hypersphereMesh.scale.z = scale;
}

export function updateProjHypersphere(angleXW, angleYW, angleZW) {
    let rotatedPoints = Util.rotate4D(hyperspherePoints, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)
    Util.drawSpherePoints(finalPoints, sphereMeshes)
}