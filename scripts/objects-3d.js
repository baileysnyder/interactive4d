import * as Cone from './cone'
import * as Util from './util'
import * as Draw from './draw-slices'
import * as THREE from 'three'

const planeColor = '#1B1B1B'
const sphereColor = '#14F314'
const cubeColor = '#FFEE56'
const coneColor = '#F31414'

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

function initPlane(scene) {
    const geometry = new THREE.PlaneGeometry(planeWidth, planeWidth)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.color = new THREE.Color(planeColor)
    material.transparent = true
    material.opacity = 0.8

    const mesh = new THREE.Mesh(geometry, material)
    mesh.renderOrder = 2

    scene.add(mesh)
    return mesh
}

function genericState() {
    return {
        mainMesh: undefined,
        plane: undefined
    }
}

export function initSphere(scene) {
    let state = genericState()
    state.plane = initPlane(scene)

    const geometry = new THREE.SphereGeometry(sphereRadius, 48, 24)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(sphereColor)
    //material.transparent = true
    //material.opacity = 0.6

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    state.mainMesh = mesh
    return state
}

export function initSolidCube(scene) {
    let state = genericState()
    state.plane = initPlane(scene)

    const geometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(cubeColor)

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    state.mainMesh = mesh
    return state
}

export function initEdgeCube(scene) {
    let state = genericState()
    state.plane = initPlane(scene)

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
    state.mainMesh = mesh
    return state
}

export function initCone(scene) {
    let state = genericState()
    state.plane = initPlane(scene)

    // assuming equilateral
    const geometry = new THREE.ConeGeometry(sphereRadius, sphereRadius*Math.tan(Math.PI/3), coneSegments)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    state.mainMesh = mesh
    return state
}

function transformMesh(mesh, angleXZ, angleYZ, translateZ) {
    mesh.position.z = translateZ
    mesh.rotation.y = angleXZ
    mesh.rotation.x = angleYZ
}

export function updateSphere(state, canvas, angleXZ, angleYZ, translateZ) {
    transformMesh(state.mainMesh, angleXZ, angleYZ, translateZ)
    Draw.drawSliceCanvas(canvas, planeColor)
    let radius = Util.getSphereIntersectionRadius(sphereRadius, translateZ)
    Draw.drawCircleSlice(canvas, radius, sphereColor, planeWidth)
}

export function updateSolidCube(state, canvas, angleXZ, angleYZ, translateZ) {
    transformMesh(state.mainMesh, angleXZ, angleYZ, translateZ)
    state.mainMesh.updateMatrix()

    Draw.drawSliceCanvas(canvas, planeColor)
    let points2D = getCubeSlice(state.mainMesh)
    if (points2D.length < 2) {
        return
    }

    Util.sortFacePoints2D(points2D.map(p => p.point), points2D)
    Draw.drawSolidCubeSlice(canvas, points2D, cubeColor, planeWidth)
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
            intersectionPoints.push(new Util.IntersectionPoint(i, get2DIntersectionPoint(p1, p2, zClip)))
        } else if (p2.z >= zClip && p1.z < zClip){
            intersectionPoints.push(new Util.IntersectionPoint(i, get2DIntersectionPoint(p2, p1, zClip)))
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

export function updateEdgeCube(state, canvas, angleXZ, angleYZ, translateZ) {
    transformMesh(state.mainMesh, angleXZ, angleYZ, translateZ)
    state.mainMesh.updateMatrix()

    Draw.drawSliceCanvas(canvas, planeColor)
    let points2D = getCubeSlice(state.mainMesh)
    if (points2D.length < 2) {
        return
    }

    Util.sortFacePoints2D(points2D.map(p => p.point), points2D)
    Draw.drawEdgeCubeSlice(canvas, points2D, cubeColor, planeWidth)
}

export function updateCone(state, canvas, angleXZ, angleYZ, translateZ) {
    transformMesh(state.mainMesh, angleXZ, angleYZ, translateZ)
    //coneMesh.updateMatrix()

    Draw.drawSliceCanvas(canvas, planeColor)

    let transformedCone = new Cone.Cone(coneHeight, sphereRadius, angleYZ, translateZ)
    switch (Cone.getSliceType(angleYZ)) {
        case (Cone.sliceType.parabola):
            Draw.drawPoints(canvas, Cone.coneToParabola(angleYZ, transformedCone).points, coneColor, planeWidth)
            break
        case (Cone.sliceType.hyperbola):
            Draw.drawPoints(canvas, Cone.coneToHyperbola(angleYZ, transformedCone).points, coneColor, planeWidth)
            break
        case (Cone.sliceType.ellipse):
            let ellipse = Cone.coneToEllipse(angleYZ, transformedCone)
            Draw.drawSolidEllipse(canvas, ellipse, coneColor, planeWidth)
            Draw.drawBaseCutoff(canvas, ellipse, planeColor, planeWidth)
            break
    }
}