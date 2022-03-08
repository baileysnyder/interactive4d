import * as Util from './util'
import * as Constants from './constants'
import * as THREE from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function calcCube(axes, scale, translate) {
    function addArr(...arrs) {
        let ret = []
        for (let i = 0; i < arrs[0].length; i++) {
            let val = 0
            for (let j = 0; j < arrs.length; j++) {
                val += arrs[j][i]            
            }
            ret.push(val)            
        }
        return ret
    }

    let cube = []
    cube.push([0, 0, 0]) //0
    for (let i = 0; i < 3; i++) {
        cube.push([])
        for (let j = 0; j < 3; j++) {
            cube[i+1].push(axes[i][j]) //1,2,3        
        }    
    }
    
    cube.push(addArr(axes[0], axes[1])) //4
    cube.push(addArr(axes[1], axes[2])) //5
    cube.push(addArr(axes[2], axes[0])) //6
    cube.push(addArr(axes[0], axes[1], axes[2])) //7

    for (let i = 0; i < cube.length; i++) {
        for (let j = 0; j < 3; j++) {
            cube[i][j] = cube[i][j] + translate[j]
        }       
    }

    for (let i = 0; i < cube.length; i++) {
        for (let j = 0; j < 3; j++) {
            cube[i][j] = cube[i][j]*scale
        }        
    }

    return cube
}

const cubeEdgeI = [
    [0, 1], //0
    [1, 4], //1
    [4, 2], //2
    [2, 0], //3
    [3, 6], //4
    [6, 7], //5
    [7, 5], //6
    [5, 3], //7
    [0, 3], //8
    [2, 5], //9
    [4, 7], //10
    [1, 6] //11
]

const cubeFaceI = [
    [0, 1, 6, 3],
    [1, 6, 7, 4],
    [2, 4, 7, 5],
    [0, 2, 5, 3],
    [0, 1, 4, 2],
    [3, 5, 7, 6]
]

const axes4D = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
]
const translate4D = [0, 0, 0]

const axes4DTransformed = Util.applyMatXYZ4D(axes4D, Util.getTransformMatXYZ4D(1, translate4D, 0, -Math.PI/4, -Math.PI/5))
const skewCube = calcCube(axes4DTransformed, 0.5, [0.5, 0, 0])

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

let lineMeshes = []
let meshes = []
let sprites = []

export function undoInits(scene) {
    Util.removeThreeJsObjects(scene, lineMeshes, meshes, sprites)

    lineMeshes = []
    sprites = []
}

function createLine(scene, startAndEnd, color, canvasW, canvasH, lineWidth) {
    const points = new Float32Array(startAndEnd)
    const geometry = new LineGeometry();

    geometry.setPositions(points);

    const material = new LineMaterial({
        linewidth: lineWidth,
        color: color,
    })
    material.resolution.set(canvasW, canvasH)

    let line = new Line2( geometry, material );
    scene.add( line );

    lineMeshes.push(line)
}

function getCubePointsNormals(cube) {
    let facePoints = cubeFacePoints(cube)
    let origin = Util.getCenterOfPoints(cube)
    let points = []
    let normals = []
    for (let i = 0; i < facePoints.length; i++) {
        let normal = Util.getFaceNormal(facePoints[i], origin)
        Util.sortFacePoints(facePoints[i], normal, facePoints[i])
        let verts = Util.triangulateSortedFace(facePoints[i])
        points.push(...verts)
        for (let k = 0; k < verts.length/3; k++) {
            normals.push(...normal)            
        }
    }
    return {points, normals}
}

function cubeFacePoints(cube) {
    let points = []
    for (let i = 0; i < cubeFaceI.length; i++) {
        points.push([])
        for (let j = 0; j < cubeFaceI[i].length; j++) {
            let pIndex = cubeFaceI[i][j]
            let p = cube[pIndex]
            points[i].push([p[0], p[1], p[2]])
        }        
    }
    return points
}

function initAxisCube(scene, cube) {
    let pn = getCubePointsNormals(cube)
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
    meshes.push(mesh)
}

function createLabel(scene, text, position, scale, color) {
    let canvas = document.createElement('canvas')
    canvas.width = 28
    canvas.height = 22
    let ctx = canvas.getContext('2d')

    ctx.textAlign = 'center'
    ctx.fillStyle = color
    ctx.font = '30px Karla'
    ctx.fillText(text, 14, 20)

    let t = new THREE.Texture(canvas)
    t.needsUpdate = true

    let mat = new THREE.SpriteMaterial({
        map: t,
        transparent: true,
        color: 0xffffff
    })

    let sp = new THREE.Sprite(mat)
    sp.position.set(position[0], position[1], position[2])
    sp.scale.set(scale, scale, 1)
    scene.add(sp)
    sprites.push(sp)
}

function initImage(scene, url, position, width, height) {
    const loader = new THREE.TextureLoader()
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.transparent = true
    material.map = loader.load(url)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position[0], position[1], 0)
    scene.add(mesh)
    meshes.push(mesh)
}

// "Low Poly Male Base" (https://skfb.ly/KVAp) by wh_nerevar is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
function initMan(scene) {
    const loader = new GLTFLoader()
    loader.load('/man.glb', function(gltf) {
        let mesh = gltf.scene.children[0]
        // basic material is used to get 2D image of man
        //mesh.material = new THREE.MeshBasicMaterial()
        mesh.material.color = new THREE.Color(Constants.projCylColor)
        mesh.position.set(1.1, -0.2, 0.5)
        mesh.scale.set(0.3, 0.3, 0.3)
        mesh.rotateX(-Math.PI/6)
        mesh.rotateY(Math.PI/6)
        scene.add(mesh)
        meshes.push(mesh)
    }, undefined, function(error) {
        console.log(error)
    })
}

function initTrapezoidal(scene) {
    const loader = new GLTFLoader()
    loader.load('/trapezoidal.glb', function(gltf) {
        let mesh = gltf.scene.children[0]
        mesh.material.color = new THREE.Color(trapezoidColor)
        mesh.position.set(-1, -1, -0.5)
        mesh.scale.set(0.6, 0.6, 0.6)
        mesh.rotateZ(0.1)
        scene.add(mesh)
        meshes.push(mesh)
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
    meshes.push(mesh)
}

function initSphere(scene) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 16)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(sphereColor)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(-1.2, 1.3, 0.9)

    scene.add(mesh)
    meshes.push(mesh)
}

function createLabeledLine(scene, startAndEnd, color, canvasW, canvasH, lineWidth, label) {
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

    createLine(scene, leftStartEnd, labelColor, canvasW, canvasH, labelWidth)
    createLine(scene, rightStartEnd, labelColor, canvasW, canvasH, labelWidth)
    createLine(scene, middleStartEnd, labelColor, canvasW, canvasH, labelWidth)

    //createLabel(scene, label, [(middleStartEnd[0]+middleStartEnd[3])/2, middleStartEnd[1] + textDistance, middleStartEnd[2]], 0.18, textColor)

    createLine(scene, startAndEnd, color, canvasW, canvasH, lineWidth)

    return [(middleStartEnd[0]+middleStartEnd[3])/2, middleStartEnd[1], middleStartEnd[2]]
}

function createLineObjectLabel(scene, midpoints, canvasW, canvasH) {
    const labelHeight = 0.5
    const labelScale = 0.24
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
        createLine(scene, [...midpoints[i], ...lineEnd], lineColor, canvasW, canvasH, lineWidth)       
    }
    
    let canvas = document.createElement('canvas')
    let spriteW = 200
    let spriteH = 30
    canvas.width = spriteW
    canvas.height = spriteH
    let ctx = canvas.getContext('2d')

    ctx.textAlign = 'center'
    ctx.fillStyle = '#8c8c8c'
    ctx.font = '30px Karla'
    ctx.fillText('1D objects', spriteW/2, 22)

    let t = new THREE.Texture(canvas)
    t.needsUpdate = true

    let mat = new THREE.SpriteMaterial({
        map: t,
        transparent: true,
        color: 0xffffff
    })

    let sp = new THREE.Sprite(mat)
    sp.position.set(position[0], position[1], position[2])
    sp.scale.set((spriteW/spriteH)*labelScale, labelScale, 1)
    scene.add(sp)
    sprites.push(sp)
}

export function init1D(scene, canvasW, canvasH) {
    let midpoints = []
    createLine(scene, [-2, 0, 0, -1.7, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)
    midpoints.push(createLabeledLine(scene, [-1.7, 0, 0, -1.2, 0, 0], sphereColor, canvasW, canvasH, axisWidth, '1'))
    createLine(scene, [-1.2, 0, 0, -0.6, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)
    midpoints.push(createLabeledLine(scene, [-0.6, 0, 0, -0.4, 0, 0], trapezoidColor, canvasW, canvasH, axisWidth, '2'))
    createLine(scene, [-0.4, 0, 0, -0.1, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)
    midpoints.push(createLabeledLine(scene, [-0.1, 0, 0, 0.6, 0, 0], cubeColor, canvasW, canvasH, axisWidth, '3'))
    createLine(scene, [0.6, 0, 0, 1, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)
    midpoints.push(createLabeledLine(scene, [1, 0, 0, 1.3, 0, 0], manColor, canvasW, canvasH, axisWidth, '4'))
    createLine(scene, [1.3, 0, 0, 2, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)

    createLineObjectLabel(scene, midpoints, canvasW, canvasH)
}

export function init2D(scene, canvasW, canvasH) {
    createLine(scene, [-2, 0, 0, 2, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)
    createLine(scene, [0, -2, 0, 0, 2, 0], axisColors[1], canvasW, canvasH, axisWidth)

    initImage(scene, '/textures/blueman.png', [1.2, -0.2], 1.4, 1.4)
    initImage(scene, '/textures/circle.png', [-1.2, 1.3], 1, 1)
    initImage(scene, '/textures/square.png', [0.1, 0.8], 0.8, 0.8)
    initImage(scene, '/textures/trapezoid.png', [-0.75, -1], 1.3, 1.3)
}

export function init3D(scene, canvasW, canvasH) {
    createLine(scene, [-2, 0, 0, 2, 0, 0], axisColors[0], canvasW, canvasH, axisWidth)
    createLine(scene, [0, -2, 0, 0, 2, 0], axisColors[1], canvasW, canvasH, axisWidth)
    createLine(scene, [0, 0, -2, 0, 0, 2], axisColors[2], canvasW, canvasH, axisWidth)

    initMan(scene)
    initTrapezoidal(scene)
    initCube(scene)
    initSphere(scene)

    //init3DForImage(scene, canvasW, canvasH)
}

export function initAxesWithCube(scene, canvasW, canvasH) {
    for (let i = 0; i < axes4DTransformed.length; i++) {
        createLine(scene, axes4DTransformed[i].concat(translate4D), axisColors[i], canvasW, canvasH, axisWidth)
    }    
    
    const labelScalar = 1.09
    const spriteScale = 0.19
    createLabel(scene, "X", Util.scaleVector(axes4DTransformed[0], labelScalar), spriteScale, cubeLineColor)
    createLabel(scene, "Y", Util.scaleVector(axes4DTransformed[1], labelScalar), spriteScale, cubeLineColor)
    createLabel(scene, "Z", Util.scaleVector(axes4DTransformed[2], labelScalar), spriteScale, cubeLineColor)
    createLabel(scene, "W", Util.scaleVector(axes4DTransformed[3], labelScalar), spriteScale, cubeLineColor)

    initAxisCube(scene, skewCube)
    for (let i = 0; i < cubeEdgeI.length; i++) {
        createLine(scene, skewCube[cubeEdgeI[i][0]].concat(skewCube[cubeEdgeI[i][1]]), cubeLineColor, canvasW, canvasH, cubeLineWidth)
    }
}

export function updateLineResolution(width, height) {
    if (lineMeshes && lineMeshes.length > 0) {
        for (let i = 0; i < lineMeshes.length; i++) {
            lineMeshes[i].material.resolution.set(width, height)                   
        }
    }
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
    let cube = calcCube(axes, 0.3, [1.4, d, -d])
    initAxisCube(scene, cube)
    for (let i = 0; i < cubeEdgeI.length; i++) {
        createLine(scene, cube[cubeEdgeI[i][0]].concat(cube[cubeEdgeI[i][1]]), cubeLineColor, canvasW, canvasH, 3)
    }
}