import * as Util from './util'
import * as THREE from 'three'
import * as Constants from './constants'

function generate4DSphere(radius, maxSpherePoints, wSteps) {
    const maxAngle = Math.PI*2
    minPointColor = Util.createColor(250, 255, 255)
    //maxPointColor = Util.createColor(16, 110, 120)
    maxPointColor = Util.createColor(10, 136, 144)
    
    function addSphere(pointCount, innerRadius, w, rotationMatrix) {
        let points = Util.generateSpreadSpherePoints(pointCount, innerRadius, w)
        for (let i = 0; i < points.length; i++) {
            let p = Util.multiplyMatrixVector(rotationMatrix, points[i])
            hyperspherePoints.push(p)
        }
    }

    for (let i = 0; i < wSteps; i++) {
        let w = (i/wSteps) * radius
        let angle = (i/wSteps)*maxAngle
        let rotationMatrix = [
            [Math.cos(angle), 0, Math.sin(angle), 0],
            [0, 1, 0, 0],
            [-Math.sin(angle), 0, Math.cos(angle), 0],
            [0, 0, 0, 1]
        ]
        let innerRadius = Util.getSphereIntersectionRadius(radius, w)
        const pointCount = Math.floor((innerRadius/radius)*maxSpherePoints)

        addSphere(pointCount, innerRadius, w, rotationMatrix)
        if (w !== 0) {
            addSphere(pointCount, innerRadius, -w, rotationMatrix)
        }
    }
    hyperspherePoints.push([0, 0, 0, -radius])
    hyperspherePoints.push([0, 0, 0, radius])
}

let hyperspherePoints = []
let minPointColor
let maxPointColor
generate4DSphere(1, 13, 7)

const projectionDistance4D = 2
const scaleFactor = 2.5
const hypersphereRadius = 1.25

const sphereColor = '#00aa19'

let sphereMeshes = []
let hypersphereMesh = undefined


export function initProjHypersphere(scene) {
    return {
        sphereMeshes: Util.initProjSpheres(scene, Constants.projectionSphereRadius, hyperspherePoints.length, 20, 10, maxPointColor),
        //cylinderMeshes: Util.initProjCylinders(scene, 1, '#fc2e2e')
    }
}


export function initSliceHypersphere(scene) {
    const geometry = new THREE.SphereGeometry(hypersphereRadius, 48, 24)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(sphereColor)

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    return {
        hypersphereMesh: mesh
    }
}

export function updateSliceHypersphere(state, translateW) {
    let radius = Util.getSphereIntersectionRadius(hypersphereRadius, Math.abs(translateW))
    let scale = radius / hypersphereRadius

    state.hypersphereMesh.scale.x = scale;
    state.hypersphereMesh.scale.y = scale;
    state.hypersphereMesh.scale.z = scale;
}

export function updateProjHypersphere(state, angleXW, angleYW, angleZW) {
    let rotatedPoints = Util.rotate4D(hyperspherePoints, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)
    drawSpherePoints(state, finalPoints, state.sphereMeshes)
}

function drawSpherePoints(state, points, sphereMeshes) {
    for (let i = 0; i < sphereMeshes.length; i++){
        if (i < points.length) {
            let t = Util.getVectorMagnitude(points[i]) / 2
            let color = Util.lerpColor(minPointColor, maxPointColor, t)
            sphereMeshes[i].visible = true
            sphereMeshes[i].position.set(points[i][0], points[i][1], points[i][2])
            sphereMeshes[i].material.color = new THREE.Color(`rgb(${Math.floor(color.r)}, ${Math.floor(color.g)}, ${Math.floor(color.b)})`)

            // highlight for pic
            // if (i === 40) {
            //     sphereMeshes[0].position.set(0, 0, 0)
            //     sphereMeshes[0].material.color = new THREE.Color("rgb(252, 30, 30)")
            //     sphereMeshes[i].material.color = new THREE.Color("rgb(252, 30, 30)")
            //     let cylinderPoints = [
            //         [0, 0, 0],
            //         points[i]
            //     ]
            //     Util.drawCylinders(cylinderPoints, state.cylinderMeshes, [[0, 1]], 0.03)
            // }
        } else {
            sphereMeshes[i].visible = false
        }
    }
}