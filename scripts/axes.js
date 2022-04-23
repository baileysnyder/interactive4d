import * as Util from './util'
import * as Constants from './constants'
import * as THREE from 'three'
import { LineGeometry } from '../node_modules/three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from '../node_modules/three/examples/jsm/lines/LineMaterial.js'
import { Line2 } from '../node_modules/three/examples/jsm/lines/Line2.js'
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import * as Cube from './cube'

const axes4D = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
]
const translate4D = [0, 0, 0]

export const axes4DTransformed = Util.applyMatXYZ4D(axes4D, Util.getTransformMatXYZ4D(1, translate4D, 0, -Math.PI/4, -Math.PI/5))
const skewCube = Cube.calcCube(axes4DTransformed, 0.5, [0.5, 0, 0])

const cubeColor = "#ffffff"
const sphereColor = "#483d8b"
const trapezoidColor = "#49382d"
const manColor = "#62DDE5"
const axisColors = [
    '#c12020',
    '#31c120',
    '#203bc1',
    '#e8da1b'
]
const cubeLineColor = '#D2F3F5'
const cubeLineWidth = 2
const axisWidth = 3

export function createLine(scene, startAndEnd, color, canvasW, canvasH, lineWidth) {
    const points = new Float32Array(startAndEnd)
    const geometry = new LineGeometry()

    geometry.setPositions(points)

    const material = new LineMaterial({
        linewidth: lineWidth,
        color: color,
    })
    material.resolution.set(canvasW, canvasH)

    let line = new Line2( geometry, material )
    scene.add( line )

    return line
}

function initAxisCube(scene, cube) {
    let pn = Cube.getCubePointsNormals(cube)
    const points = new Float32Array(pn.points)
    const normals = new Float32Array(pn.normals)
    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(points, 3)
    const normalAttribute = new THREE.BufferAttribute(normals, 3)
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('normal', normalAttribute)

    const material = new THREE.MeshStandardMaterial()
    material.transparent = true
    material.opacity = 0.9
    material.color = new THREE.Color(Constants.projCylColor)

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}

function initImage(scene, url, position, width, height) {
    const loader = new THREE.TextureLoader()
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    //material.alphaTest = 0.5
    material.depthTest = false
    material.transparent = true
    let tex = loader.load(url)
    tex.anisotropy = 4
    material.map = tex

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position[0], position[1], 0)
    mesh.renderOrder = 1
    scene.add(mesh)
    return mesh
}

// "Low Poly Male Base" (https://skfb.ly/KVAp) by wh_nerevar is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
function initMan(state, scene) {
    const loader = new GLTFLoader()
    loader.load('/man.glb', function(gltf) {
        if (state.meshes == null) {
            throw new Error('state does not have meshes field to add man.glb')
        }
        let mesh = gltf.scene.children[0]
        // basic material is used to get 2D image of man
        //mesh.material = new THREE.MeshBasicMaterial()
        mesh.material.color = new THREE.Color(Constants.projCylColor)
        mesh.position.set(1.1, -0.2, 0.5)
        mesh.scale.set(0.3, 0.3, 0.3)
        mesh.rotateX(-Math.PI/6)
        mesh.rotateY(Math.PI/6)
        scene.add(mesh)
        state.meshes.push(mesh)
    }, undefined, function(error) {
        console.log(error)
    })
}

function initTrapezoidal(state, scene) {
    const loader = new GLTFLoader()
    loader.load('/trapezoidal.glb', function(gltf) {
        if (state.meshes == null) {
            throw new Error('state does not have meshes field to add trapezoidal.glb')
        }
        let mesh = gltf.scene.children[0]
        mesh.material.color = new THREE.Color(trapezoidColor)
        mesh.position.set(-1, -1, -0.5)
        mesh.scale.set(0.6, 0.6, 0.6)
        mesh.rotateZ(0.1)
        scene.add(mesh)
        state.meshes.push(mesh)
    }, undefined, function(error) {
        console.log(error)
    })
}

function initCube(scene) {
    const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(cubeColor)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0.2, 1, -1.5)
    mesh.rotateY(Math.PI/4)

    scene.add(mesh)
    return mesh
}

function initSphere(scene) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 16)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(sphereColor)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(-1.2, 1.3, 0.9)

    scene.add(mesh)
    return mesh
}

function createLabeledLine(state, scene, startAndEnd, color, canvasW, canvasH, lineWidth, label) {
    const labelDistance = 0.15
    const labelHeight = 0.05
    const textDistance = 0.15
    const labelWidth = 1
    const labelColor = '#545454'
    const textColor = '#8c8c8c'
    let leftStartEnd = [startAndEnd[0], startAndEnd[1]+labelDistance, startAndEnd[2],
                        startAndEnd[0], startAndEnd[1]+labelDistance+labelHeight, startAndEnd[2]]
    let rightStartEnd = [startAndEnd[3], startAndEnd[4]+labelDistance, startAndEnd[5],
                        startAndEnd[3], startAndEnd[4]+labelDistance+labelHeight, startAndEnd[5]]
    let middleStartEnd = [startAndEnd[0], startAndEnd[1]+labelDistance+labelHeight, startAndEnd[2],
                        startAndEnd[3], startAndEnd[4]+labelDistance+labelHeight, startAndEnd[5]]

    state.lineMeshes.push(createLine(scene, leftStartEnd, labelColor, canvasW, canvasH, labelWidth))
    state.lineMeshes.push(createLine(scene, rightStartEnd, labelColor, canvasW, canvasH, labelWidth))
    state.lineMeshes.push(createLine(scene, middleStartEnd, labelColor, canvasW, canvasH, labelWidth))

    state.lineMeshes.push(createLine(scene, startAndEnd, color, canvasW, canvasH, lineWidth))

    return [(middleStartEnd[0]+middleStartEnd[3])/2, middleStartEnd[1], middleStartEnd[2]]
}

export function createLabel(scene, text, position, scale, color) {
    let canvas = document.createElement('canvas')
    let spriteW = 200
    let spriteH = 30
    canvas.width = spriteW
    canvas.height = spriteH
    let ctx = canvas.getContext('2d')

    ctx.textAlign = 'center'
    ctx.fillStyle = color
    ctx.font = '30px Karla'
    ctx.fillText(text, spriteW/2, 22)

    let t = new THREE.Texture(canvas)
    t.needsUpdate = true

    let mat = new THREE.SpriteMaterial({
        map: t,
        transparent: true,
        color: 0xffffff
    })

    let sp = new THREE.Sprite(mat)
    sp.position.set(position[0], position[1], position[2])
    sp.scale.set((spriteW/spriteH)*scale, scale, 1)
    scene.add(sp)
    sp.renderOrder = 3
    return sp
}

function create1DAxisLabels(state, scene, midpoints, canvasW, canvasH) {
    const labelHeight = 0.5
    const lineEndDistance = 0.17
    const lineColor = '#545454'
    const lineWidth = 1

    let labelX = 0
    for (let i = 0; i < midpoints.length; i++) {
        labelX += midpoints[i][0]       
    }
    labelX = labelX/midpoints.length
    let position = [labelX, midpoints[0][1] + labelHeight, midpoints[0][2]]
    let lineEnd = [position[0], position[1]-lineEndDistance, position[2]]

    for (let i = 0; i < midpoints.length; i++) {
        state.lineMeshes.push(createLine(scene, [...midpoints[i], ...lineEnd], lineColor, canvasW, canvasH, lineWidth))
    }
    
    state.meshes.push(createLabel(scene, '1D objects', position, 0.24, '#8c8c8c'))
}

function initCameraSphere(mainCamera) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 16)
    const material = new THREE.MeshStandardMaterial()
    material.transparent = true

    const mesh = new THREE.Mesh(geometry, material)

    mesh.layers.set(2)
    mesh.renderOrder = 2
    mainCamera.add(mesh)
    return mesh
}

function initBackgroundPlane(scene) {
    const geometry = new THREE.PlaneGeometry(30, 30)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.transparent = true
    material.opacity = 0.3
    material.color = new THREE.Color('#4c4c4c')
    material.depthTest = false

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 0)
    scene.add(mesh)
    return mesh
}

function calcZLinePoints(cameraPosition) {
    return [cameraPosition.x, cameraPosition.y, 0, cameraPosition.x, cameraPosition.y, cameraPosition.z]
}

function genericState() {
    return {
        lineMeshes: [],
        meshes: []
    }
}

export function init1D(scene, canvasW, canvasH) {
    let state = genericState()
    let midpoints = []

    state.lineMeshes.push(createLine(scene, [-2, 0, 0, -1.7, 0, 0], axisColors[0], canvasW, canvasH, axisWidth))
    midpoints.push(createLabeledLine(state, scene, [-1.7, 0, 0, -1.2, 0, 0], sphereColor, canvasW, canvasH, axisWidth, '1'))
    state.lineMeshes.push(createLine(scene, [-1.2, 0, 0, -0.6, 0, 0], axisColors[0], canvasW, canvasH, axisWidth))
    midpoints.push(createLabeledLine(state, scene, [-0.6, 0, 0, -0.4, 0, 0], trapezoidColor, canvasW, canvasH, axisWidth, '2'))
    state.lineMeshes.push(createLine(scene, [-0.4, 0, 0, -0.1, 0, 0], axisColors[0], canvasW, canvasH, axisWidth))
    midpoints.push(createLabeledLine(state, scene, [-0.1, 0, 0, 0.6, 0, 0], cubeColor, canvasW, canvasH, axisWidth, '3'))
    state.lineMeshes.push(createLine(scene, [0.6, 0, 0, 1, 0, 0], axisColors[0], canvasW, canvasH, axisWidth))
    midpoints.push(createLabeledLine(state, scene, [1, 0, 0, 1.3, 0, 0], manColor, canvasW, canvasH, axisWidth, '4'))
    state.lineMeshes.push(createLine(scene, [1.3, 0, 0, 2, 0, 0], axisColors[0], canvasW, canvasH, axisWidth))

    create1DAxisLabels(state, scene, midpoints, canvasW, canvasH)
    return state
}

export function init2D(scene, canvasW, canvasH) {
    let state = genericState()
    let x = createLine(scene, [-2, 0, 0, 2, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)
    let y = createLine(scene, [0, -2, 0, 0, 2, 0], axisColors[1], canvasW, canvasH, axisWidth)

    // need layers for sideView2D case
    x.layers.set(1)
    y.layers.set(1)
    state.lineMeshes.push(x, y)

    state.meshes.push(initImage(scene, '/textures/blueman.png', [1.2, -0.2], 1.4, 1.4))
    state.meshes.push(initImage(scene, '/textures/circle.png', [-1.2, 1.3], 1, 1))
    state.meshes.push(initImage(scene, '/textures/square.png', [0.1, 0.8], 0.8, 0.8))
    state.meshes.push(initImage(scene, '/textures/trapezoid.png', [-0.75, -1], 1.3, 1.3))

    return state
}

export function initSideView2D(scene, mainCanvasD, bottomCanvasD, mainCamera) {
    let state = {
        zLine: undefined,
        xLine: undefined,
        yLine: undefined,
        zLabel: undefined,
        cameraSphere: undefined,

        lineMeshes: undefined,
        meshes: undefined,
    }

    let state2D = init2D(scene, mainCanvasD.w, mainCanvasD.h)
    state.lineMeshes = state2D.lineMeshes
    state.meshes = state2D.meshes
    // want an extra x and y line for the bottom canvas so it looks right with different canvas size
    state.xLine = createLine(scene, [-2, 0, 0, 2, 0, 0], axisColors[0], bottomCanvasD.w, bottomCanvasD.h, axisWidth)
    state.yLine = createLine(scene, [0, -2, 0, 0, 2, 0], axisColors[1], bottomCanvasD.w, bottomCanvasD.h, axisWidth)
    state.xLine.layers.set(2)
    state.yLine.layers.set(2)

    const points = calcZLinePoints(mainCamera.position)
    state.zLine = createLine(scene, points, '#FFFFFF', bottomCanvasD.w, bottomCanvasD.h, 1)
    state.zLine.layers.set(2)

    state.cameraSphere = initCameraSphere(mainCamera)
    state.meshes.push(initBackgroundPlane(scene))

    const labelPosition = [mainCamera.position.x, mainCamera.position.y + 1.4, mainCamera.position.z/2]
    state.zLabel = createLabel(scene, 'Z='+mainCamera.position.z.toFixed(2), labelPosition, 2, '#FFFFFF')
    state.zLabel.layers.set(2)

    return state
}

export function init3D(scene, canvasW, canvasH) {
    let state = genericState()
    state.lineMeshes.push(createLine(scene, [-2, 0, 0, 2, 0, 0], axisColors[0], canvasW, canvasH, axisWidth))
    state.lineMeshes.push(createLine(scene, [0, -2, 0, 0, 2, 0], axisColors[1], canvasW, canvasH, axisWidth))
    state.lineMeshes.push(createLine(scene, [0, 0, -2, 0, 0, 2], axisColors[2], canvasW, canvasH, axisWidth))

    state.meshes.push(initMan(state, scene))
    state.meshes.push(initTrapezoidal(state, scene))
    state.meshes.push(initCube(scene))
    state.meshes.push(initSphere(scene))

    //init3DForImage(scene, canvasW, canvasH)
    return state
}

export function initAxesWithCube(scene, canvasW, canvasH) {
    let state = genericState()
    for (let i = 0; i < axes4DTransformed.length; i++) {
        state.lineMeshes.push(createLine(scene, axes4DTransformed[i].concat(translate4D), axisColors[i], canvasW, canvasH, axisWidth))
    }    
    
    const labelScalar = 1.11
    const spriteScale = 0.27
    state.meshes.push(createLabel(scene, "X", Util.scaleVector(axes4DTransformed[0], labelScalar), spriteScale, cubeLineColor))
    state.meshes.push(createLabel(scene, "Y", Util.scaleVector(axes4DTransformed[1], labelScalar), spriteScale, cubeLineColor))
    state.meshes.push(createLabel(scene, "Z", Util.scaleVector(axes4DTransformed[2], labelScalar), spriteScale, cubeLineColor))
    state.meshes.push(createLabel(scene, "W", Util.scaleVector(axes4DTransformed[3], labelScalar), spriteScale, cubeLineColor))

    state.meshes.push(initAxisCube(scene, skewCube))
    for (let i = 0; i < Cube.edgeI.length; i++) {
        state.lineMeshes.push(createLine(scene, skewCube[Cube.edgeI[i][0]].concat(skewCube[Cube.edgeI[i][1]]), cubeLineColor, canvasW, canvasH, cubeLineWidth))
    }
    return state
}

export function updateZLine(state, cameraPosition) {
    const points = new Float32Array(calcZLinePoints(cameraPosition))
    state.zLine.geometry.setPositions(points)
    state.zLabel.position.set(cameraPosition.x, cameraPosition.y+1.4, cameraPosition.z/2)
    let text = 'Z='+cameraPosition.z.toFixed(2)

    let canvas = document.createElement('canvas')
    let spriteW = 200
    let spriteH = 30
    canvas.width = spriteW
    canvas.height = spriteH
    let ctx = canvas.getContext('2d')

    ctx.textAlign = 'center'
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '30px Karla'
    ctx.fillText(text, spriteW/2, 22)

    let t = new THREE.Texture(canvas)
    t.needsUpdate = true
    state.zLabel.material.map = t
}

export function updateSideViewResolutions(state, mainCanvasD, bottomCanvasD) {
    Util.updateLineResolution(state.lineMeshes, mainCanvasD.w, mainCanvasD.h)
    state.zLine.material.resolution.set(bottomCanvasD.w, bottomCanvasD.h)
    state.xLine.material.resolution.set(bottomCanvasD.w, bottomCanvasD.h)
    state.yLine.material.resolution.set(bottomCanvasD.w, bottomCanvasD.h)
}

// For creating an image used in the article
function init3DForImage(scene, canvasW, canvasH){
    createLine(scene, [0, 0, 0, 2, 0, 0], axisColors[0], canvasW, canvasH, 6)
    createLine(scene, [0, 0, 0, 0, 2, 0], axisColors[1], canvasW, canvasH, 6)
    createLine(scene, [0, 0, 0, 0, 0, -2], axisColors[2], canvasW, canvasH, 6)

    let d = 0.8
    let axes = [
        [2, 0, 0],
        [0, 2, 0],
        [0, 0, -2]
    ]
    let cube = Cube.calcCube(axes, 0.3, [1.4, d, -d])
    initAxisCube(scene, cube)
    for (let i = 0; i < Cube.edgeI.length; i++) {
        createLine(scene, cube[Cube.edgeI[i][0]].concat(cube[Cube.edgeI[i][1]]), cubeLineColor, canvasW, canvasH, 3)
    }
}