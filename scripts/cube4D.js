import * as Util from './util'
import * as THREE from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'

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

const lineColor = '#62DDE5'
const pointColor = '#D2F3F5'

let sphereMeshes = []
let cylinderMeshes = []
let linePointArrays = []
let lineMeshes = []
let convexGeometry = undefined
let convexMesh = undefined

export function undoInits(scene) {
    Util.removeThreeJsObjects(scene, sphereMeshes, cylinderMeshes, lineMeshes, convexMesh)

    sphereMeshes = []
    cylinderMeshes = []
    linePointArrays = []
    lineMeshes = []
    convexGeometry = undefined
    convexMesh = undefined
}

function initSpheres(scene, count) {
    for (let i = 0; i < count; i++){
        const geometry = new THREE.SphereGeometry(projectionSphereRadius, 24, 12)
        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(pointColor)

        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        sphereMeshes.push(mesh)
    }
}

function initCylinders(scene) {
    for (let i = 0; i < edgeIndices.length; i++){
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16, 1, true)
        geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)

        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(lineColor)
        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        cylinderMeshes.push(mesh)
    }
}

export function initProjHypercube(scene) {
    initSpheres(scene, cubePoints.length)
    initCylinders(scene)
}

export function initSliceHypercube(scene, width, height) {
    initConvexShape(scene)
    initConvexEdges(scene, width, height)
}

function initConvexShape(scene) {
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

function initConvexEdges(scene, canvasWidth, canvasHeight) {
    for (let i = 0; i < 20; i++) {
        const geoPoints = new Float32Array(6)
        for (let j = 0; j < geoPoints.length; j++) {
            geoPoints[j] = 0
        }
        linePointArrays.push(geoPoints)

        const geometry = new LineGeometry();
		geometry.setPositions( geoPoints );

        const material = new LineMaterial({
            linewidth: 5,
            color: 0xffffff,
        })
        material.resolution.set(canvasWidth, canvasHeight)

        let line = new Line2( geometry, material );
        scene.add( line );

        lineMeshes.push(line)
    }
}

export function updateLineResolution(width, height) {
    if (lineMeshes && lineMeshes.length > 0) {
        for (let i = 0; i < lineMeshes.length; i++) {
            lineMeshes[i].material.resolution.set(width, height)                   
        }
    }
}

export function updateHypercubeProjection(angleXW, angleYW, angleZW, translateW) {
    let rotatedPoints = Util.rotate4D(cubePoints, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)
    Util.drawSpherePoints(finalPoints, sphereMeshes)
    Util.drawCylinders(finalPoints, cylinderMeshes, edgeIndices, cylinderScaleFactor)
}

function drawEdges(points) {
    for (let i = 0; i < lineMeshes.length; i++) {
        const startIndex = edgeIndices[i][0]
        const endIndex = edgeIndices[i][1]

        for (let j = 0; j < 3; j++) {
            linePointArrays[i][j] = points[startIndex][j]
            linePointArrays[i][j+3] = points[endIndex][j]
        }

        lineMeshes[i].geometry.attributes.position.needsUpdate = true
    }
}

export function updateHypercubeSlice(angleXW, angleYW, angleZW, translateW){
    let rotatedPoints = Util.rotate4D(cubePoints,angleXW, angleYW, angleZW)
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
            lineMeshes[edgeIndex].geometry.setPositions(linePointArrays[edgeIndex])
            lineMeshes[edgeIndex].geometry.attributes.position.needsUpdate = true
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
        let points = pointsByFace[i].map(ip => ip.point)
        let normal = Util.getFaceNormal(points, faceGeometry.origin)        
        Util.sortFacePoints(points, normal, pointsByFace[i])

        drawEdgesForFace(pointsByFace[i])
        let faceVertices = Util.triangulateSortedFace(pointsByFace[i].map(ip => ip.point))

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