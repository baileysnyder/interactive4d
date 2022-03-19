import {createLabel, createLine} from './axes'
import * as Util from './util'
import * as THREE from 'three'
import { axes4DTransformed } from './axes'

const spherePoints = [  
    [-1.6, 0.7, 0.5],
    [-1.2, -0.3, 0.1],
    [-0.8, 0.3, -1.15],
    [-0.4, -0.3, 0.9],
    [0, -0.19, -0.40],
    [0.3, 0.6, -0.3],
    [0.7, 1.3, -0.2],
    [1, 0, 0],
    [1.3, -1, -0.5],
    [1.6, -0.24, 0.36],
]
const axisPoints = [
    [-2, 0, 0],
    [2, 0, 0],
]
const linePositionsAxis = getLinePositions(spherePoints, false)
const linePositionsPlane = getLinePositions(spherePoints, true)

const axisPlaneColor = '#c12020'
const axisFadedColor = '#540f0f'
const sphereColor = '#D2F3F5'
const lineColor = '#FFFFFF'

const axisColors = [
    '#c12020',
    '#31c120',
    '#203bc1',
    '#e8da1b'
]

const planeColor = "#62DDE5"

const axisWidth = 3

function createSpheres(scene, points, color) {
    let spheres = []
    for (let i = 0; i < points.length; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 16, 8)
        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(color)

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(points[i][0], points[i][1], points[i][2])

        scene.add(mesh)
        spheres.push(mesh)
    }
    return spheres
}

function initRotationPlane(scene, position, lookAt, size, color) {
    const geometry = new THREE.PlaneGeometry(size, size)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.transparent = true
    material.opacity = 0.5
    material.color = new THREE.Color(color)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position[0], position[1], position[2])
    mesh.lookAt(lookAt)
    scene.add(mesh)
    return mesh
}

function initAxisPlaneLines(scene, canvasW, canvasH) {
    let meshes = []
    for (let i = 0; i < linePositionsAxis.length; i++) {
        meshes.push(createLine(scene, linePositionsAxis[i], lineColor, canvasW, canvasH, 1))        
    }
    return meshes
}

function getLinePositions(points, showPlane) {
    let lines = []
    let percent = 0.01 // prevent exact overlap of lines with axis because ugly
    for (let i = 0; i < points.length; i++) {
        let l = new Float32Array(6)

        l[0] = points[i][0]
        l[1] = points[i][1]
        l[2] = points[i][2]
        
        l[3] = showPlane ? points[i][0]*percent : points[i][0]
        l[4] = showPlane ? points[i][1] : points[i][1]*percent
        l[5] = showPlane ? points[i][2] : points[i][2]*percent
        lines.push(l)
    }
    return lines
}

function initSkewPlaneMesh(scene, verts, normal) {
    const normals = new Float32Array(verts.length)
    for (let i = 0; i < normals.length; i+=3) {
        normals[i] = normal[0]
        normals[i+1] = normal[1]
        normals[i+2] = normal[2]
    }

    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(new Float32Array(verts), 3)
    const normalAttribute = new THREE.BufferAttribute(normals, 3)
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('normal', normalAttribute)

    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.transparent = true
    material.opacity = 0.5
    material.color = new THREE.Color(planeColor)
    //material.color = new THREE.Color(axisColors[2])
    material.depthTest = false

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}

// probably simpler to use threejs methods for the point rotations
export function initRotateAxisPlane(scene, canvasW, canvasH) {
    let state = {       
        axis: undefined,
        plane: undefined,
        lineMeshes: [],
        pointMeshes: undefined,

        localAxes: undefined,
    }

    //let rot = Util.rotMat3DPlanes4D(0, 0.3, 0.4)  
    let rot = Util.rotMat3DPlanes4D(0, 0, 0)  
    let rotAxisPoints = Util.applyMatXYZ4D(axisPoints, rot)

    let xAxis = Util.subtractVectors(rotAxisPoints[1], rotAxisPoints[0])
    Util.normalizeVector(xAxis)
    let yAxis = Util.getArbitraryPerpendicularVector3D(xAxis)
    Util.normalizeVector(yAxis)
    let zAxis = Util.crossProduct(xAxis, yAxis)
    Util.normalizeVector(zAxis)

    state.localAxes = [
        [xAxis[0], yAxis[0], zAxis[0], 0],
        [xAxis[1], yAxis[1], zAxis[1], 0],
        [xAxis[2], yAxis[2], zAxis[2], 0],
        [0, 0, 0, 1]
    ]

    state.plane = initRotationPlane(scene, [0, 0, 0], new THREE.Vector3(xAxis[0], xAxis[1], xAxis[2]), 3.1, axisPlaneColor)

    rotAxisPoints = [...rotAxisPoints[0], ...rotAxisPoints[1]]

    state.axis = createLine(scene, rotAxisPoints, axisPlaneColor, canvasW, canvasH, axisWidth)
    state.pointMeshes = createSpheres(scene, spherePoints, sphereColor)

    state.lineMeshes = initAxisPlaneLines(scene, canvasW, canvasH)
    state.lineMeshes.push(state.axis)

    return state
}

export function updateRotateAxisPlane(state, angle, showPlane) {
    //state.plane.visible = showPlane
    //state.axis.visible = !showPlane
    if (showPlane) {
        state.plane.material.opacity = 0.7

        state.axis.material.depthTest = false
        state.axis.material.color = new THREE.Color(axisFadedColor)
    } else {
        state.plane.material.opacity = 0.3

        state.axis.material.depthTest = true
        state.axis.material.color = new THREE.Color(axisPlaneColor)       
    }

    state.plane.rotation.z = angle

    let rot = Util.multiplyMatrices(state.localAxes, Util.rotMat3DPlanes4D(angle, 0, 0))
    let rotatedPoints = Util.applyMatXYZ4D(spherePoints, rot)

    //let linePositions = getLinePositions(spherePoints, showPlane)
    let linePositions = showPlane ? linePositionsPlane : linePositionsAxis
    let rotatesLines = []
    for (let i = 0; i < linePositions.length; i++) {
        rotatesLines.push(Util.applyMatXYZFlat4D(linePositions[i], rot))
    }

    for (let i = 0; i < state.pointMeshes.length; i++) {
        state.pointMeshes[i].position.set(rotatedPoints[i][0], rotatedPoints[i][1], rotatedPoints[i][2])
        state.lineMeshes[i].geometry.setPositions(rotatesLines[i])
    }
}

export function initPlanes3D(scene, canvasW, canvasH) {
    let state = {
        lineMeshes: [],       
        meshes: []
    }

    state.lineMeshes.push(createLine(scene, [-1, -1, -1, 1, -1, -1], axisColors[0], canvasW, canvasH, axisWidth))
    state.lineMeshes.push(createLine(scene, [-1, -1, -1, -1, 1, -1], axisColors[1], canvasW, canvasH, axisWidth))
    state.lineMeshes.push(createLine(scene, [-1, -1, -1, -1, -1, 1], axisColors[2], canvasW, canvasH, axisWidth))

    const lookAt = new THREE.Vector3(0, 0, 0)
    const planeSize = 1.3
    state.meshes.push(initRotationPlane(scene, [0, 0, -1], lookAt, planeSize, planeColor))    
    state.meshes.push(initRotationPlane(scene, [0, -1, 0], lookAt, planeSize, planeColor))
    state.meshes.push(initRotationPlane(scene, [-1, 0, 0], lookAt, planeSize, planeColor))

    // planes at origin picture
    // state.meshes.push(initRotationPlane(scene, [-1, -1, -1], new THREE.Vector3(-1, -1, 1), 2, planeColor))    
    // state.meshes.push(initRotationPlane(scene, [-1, -1, -1], new THREE.Vector3(-1, 1, -1), 2, planeColor))
    // state.meshes.push(initRotationPlane(scene, [-1, -1, -1], new THREE.Vector3(1, -1, -1), 2, planeColor))

    const lScale = 0.3
    const lColor = "#FFFFFF"
    let xy = createLabel(scene, "XY", [0, 0, -1], lScale, lColor)
    xy.material.depthTest = false
    state.meshes.push(xy)

    let xz = createLabel(scene, "XZ", [0, -1, 0], lScale, lColor)
    xz.material.depthTest = false
    state.meshes.push(xz)

    let yz = createLabel(scene, "YZ", [-1, 0, 0], lScale, lColor)
    yz.material.depthTest = false
    state.meshes.push(yz)

    // z axis rotation picture
    // state.meshes.push(initRotationPlane(scene, [0, 0, -1], lookAt, planeSize, axisColors[2]))
    // let z = createLabel(scene, "Z", [-1, -1, 1.2], lScale, lColor)
    // z.material.depthTest = false

    return state
}

function initSkewPlane(scene, basePoints, midpoint, axisVector1, axisVector2) {
    let xAxis = Util.getNormalizedVector(midpoint)
    let yAxis = Util.subtractVectors(axisVector1, axisVector2)
    Util.normalizeVector(yAxis)
    let zAxis = Util.crossProduct(xAxis, yAxis)
    Util.normalizeVector(zAxis)

    let rotation = [
        [xAxis[0], yAxis[0], zAxis[0], 0],
        [xAxis[1], yAxis[1], zAxis[1], 0],
        [xAxis[2], yAxis[2], zAxis[2], 0],
        [0, 0, 0, 1]
    ]

    let trans = Util.transMatXYZ4D(midpoint)
    let m = Util.multiplyMatrices(trans, rotation)

    let planePoints = Util.applyMatXYZ4D(basePoints, m)
    let verts = Util.triangulateSortedFace(planePoints)
    return initSkewPlaneMesh(scene, verts, zAxis)
}

function initPlaneLabel(scene, text, midpoint) {
    const lScale = 0.2
    const lColor = "#FFFFFF"
    let label = createLabel(scene, text, midpoint, lScale, lColor)
    label.material.depthTest = false
    return label
}

export function initPlanes4D(scene, canvasW, canvasH) {
    let state = {
        lineMeshes: [],
        meshes: []
    }

    for (let i = 0; i < axes4DTransformed.length; i++) {
        state.lineMeshes.push(createLine(scene, axes4DTransformed[i].concat([0, 0, 0]), axisColors[i], canvasW, canvasH, axisWidth))
    }

    let midXY = Util.midpointBetween(axes4DTransformed[0], axes4DTransformed[1])
    let midXZ = Util.midpointBetween(axes4DTransformed[0], axes4DTransformed[2])
    let midYZ = Util.midpointBetween(axes4DTransformed[1], axes4DTransformed[2])
    let midXW = Util.midpointBetween(axes4DTransformed[0], axes4DTransformed[3])
    let midYW = Util.midpointBetween(axes4DTransformed[1], axes4DTransformed[3])
    let midZW = Util.midpointBetween(axes4DTransformed[2], axes4DTransformed[3])

    // all planes will have same proportions
    let shortLen = Util.getVectorMagnitude(midXY)
    let longLen = Util.getVectorMagnitude(Util.subtractVectors(axes4DTransformed[0], axes4DTransformed[1])) / 2

    let basePoints = []
    basePoints.push([-shortLen, 0, 0])
    basePoints.push([0, -longLen, 0])
    basePoints.push([shortLen, 0, 0])
    basePoints.push([0, longLen, 0])

    const scale = 0.6
    for (let i = 0; i < basePoints.length; i++) {
        for (let j = 0; j < basePoints[i].length; j++) {
            basePoints[i][j] = basePoints[i][j]*scale            
        }               
    }

    state.meshes.push(initSkewPlane(scene, basePoints, midXY, axes4DTransformed[0], axes4DTransformed[1]))
    state.meshes.push(initSkewPlane(scene, basePoints, midXZ, axes4DTransformed[0], axes4DTransformed[2]))
    state.meshes.push(initSkewPlane(scene, basePoints, midYZ, axes4DTransformed[1], axes4DTransformed[2]))
    state.meshes.push(initSkewPlane(scene, basePoints, midXW, axes4DTransformed[0], axes4DTransformed[3]))
    state.meshes.push(initSkewPlane(scene, basePoints, midYW, axes4DTransformed[1], axes4DTransformed[3]))
    state.meshes.push(initSkewPlane(scene, basePoints, midZW, axes4DTransformed[2], axes4DTransformed[3]))

    state.meshes.push(initPlaneLabel(scene, "XY", midXY))
    state.meshes.push(initPlaneLabel(scene, "XZ", midXZ))
    state.meshes.push(initPlaneLabel(scene, "YZ", midYZ))
    state.meshes.push(initPlaneLabel(scene, "XW", midXW))
    state.meshes.push(initPlaneLabel(scene, "YW", midYW))
    state.meshes.push(initPlaneLabel(scene, "ZW", midZW))

    //createLabel(scene, "Z", Util.scaleVector(axes4DTransformed[2], 1.14), 0.3, '#FFFFFF')

    return state
}