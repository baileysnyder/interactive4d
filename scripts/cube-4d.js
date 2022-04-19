import * as Util from './util'
import * as THREE from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import * as Constants from './constants'
import * as Cube from './cube'

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
    // outer cube
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
 
    // inner cube
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

const oppositeCubes = [
    [0, 7],
    [1, 4],
    [2, 5],
    [3, 6]
]

const cylinderScaleFactor = 0.06
const projectionDistance4D = 3
const scaleFactor = 2

const cubeColors = [
    new THREE.Color(Constants.cubeColors[0]),
    new THREE.Color(Constants.cubeColors[1]),
    new THREE.Color(Constants.cubeColors[2]),
    new THREE.Color(Constants.cubeColors[3]),
    new THREE.Color(Constants.cubeColors[4]),
    new THREE.Color(Constants.cubeColors[5]),
    new THREE.Color(Constants.cubeColors[6]),
    new THREE.Color(Constants.cubeColors[7]),
]

const cubeMainColor = new THREE.Color('#FFEE56')
const projCylUncolored = new THREE.Color('#191919')
const projCylColor = new THREE.Color(Constants.projCylColor)

export function initProjHypercube(scene) {
    let state = {
        sphereMeshes: undefined,
        cylinderMeshes: undefined
    }
    state.sphereMeshes = Util.initProjSpheres(scene, Constants.projectionSphereRadius, cubePoints.length, 24, 12, Constants.projPointColor)
    state.cylinderMeshes = Util.initProjCylinders(scene, edgeIndices.length, Constants.projCylColor)

    return state
}

export function initSliceHypercube(scene, width, height) {
    let state = {
        convexMeshes: [],
        lineMeshes: undefined
    }
    for (let i = 0; i < 8; i++) {
        state.convexMeshes.push(initConvexShape(scene))       
    }
    
    state.lineMeshes = initConvexEdges(scene, width, height)

    return state
}

function initConvexShape(scene) {
    const geometry = new THREE.BufferGeometry()
    //const positionAttribute = new THREE.BufferAttribute(new Float32Array(0), 3)
    //positionAttribute.setUsage(THREE.DynamicDrawUsage)
    //geometry.setAttribute('position', positionAttribute)

    const material = new THREE.MeshStandardMaterial()
    material.transparent = true
    material.opacity = 0.97
    material.color = cubeMainColor
    //material.side = THREE.DoubleSide
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}

function initConvexEdges(scene, canvasWidth, canvasHeight) {
    let meshes = []
    for (let i = 0; i < 20; i++) {
        const geoPoints = new Float32Array(6)
        for (let j = 0; j < geoPoints.length; j++) {
            geoPoints[j] = 0
        }

        const geometry = new LineGeometry();
		geometry.setPositions( geoPoints );

        const material = new LineMaterial({
            linewidth: 5,
            color: 0xffffff,
        })
        material.resolution.set(canvasWidth, canvasHeight)

        let line = new Line2( geometry, material );
        scene.add( line );

        meshes.push(line)
    }
    return meshes
}

function setConvexColors(convexMeshes, colorCubes) {
    for (let i = 0; i < convexMeshes.length; i++) {
        if (colorCubes) {
            convexMeshes[i].material.color = cubeColors[i]
        } else {
            convexMeshes[i].material.color = cubeMainColor
        }        
    }
}

export function highlightSliceFace(state, index, color) {
    for (let i = 0; i < state.convexMeshes.length; i++) {       
        if (i === index) {
            let m = new THREE.MeshBasicMaterial()
            m.color = new THREE.Color(color)
            m.side = THREE.DoubleSide
            state.convexMeshes[i].material = m
            state.convexMeshes[i].visible = true
        } else {
            state.convexMeshes[i].visible = false
        }       
    }
}
export function updateHypercubeProjection(state, angleXW, angleYW, angleZW, colorCubes, oppositeCubeIndex) {
    let rotatedPoints = Util.rotate4D(cubePoints, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)
    Util.drawSpherePoints(finalPoints, state.sphereMeshes)
    Util.drawCylinders(finalPoints, state.cylinderMeshes, edgeIndices, cylinderScaleFactor)

    if (colorCubes) {
        colorHypercubeProj(state, oppositeCubeIndex)
    } else {
        resetColorsHypercubeProj(state)
        //colorSingleCubeHypProj(state, 7, Constants.projCylColor)
    }
}

function colorHypercubeProj(state, oppositeCubeIndex) {
    let cubes = oppositeCubes[oppositeCubeIndex]

    for (let i = 0; i < state.cylinderMeshes.length; i++) {
        state.cylinderMeshes[i].material.color = projCylUncolored       
    }
    
    for (let i = 0; i < cubes.length; i++) {
        let color = cubeColors[cubes[i]]
        let edges = edgeIndicesByCube[cubes[i]]
        for (let j = 0; j < edges.length; j++) {
            state.cylinderMeshes[edges[j]].material.color = color            
        }       
    }
}

function resetColorsHypercubeProj(state) {
    for (let i = 0; i < state.cylinderMeshes.length; i++) {
        state.cylinderMeshes[i].material.color = projCylColor 
    }
}

export function colorSingleCubeHypProj(state, cIndex, color) {
    for (let i = 0; i < state.cylinderMeshes.length; i++) {
        state.cylinderMeshes[i].material.color = projCylUncolored       
    }
    
    let col3 = new THREE.Color(color)
    let edges = edgeIndicesByCube[cIndex]
    for (let j = 0; j < edges.length; j++) {
        state.cylinderMeshes[edges[j]].material.color = col3        
    }
}

export function updateHypercubeSlice(state, angleXW, angleYW, angleZW, translateW, colorCubes){
    let rotatedPoints = Util.rotate4D(cubePoints, angleXW, angleYW, angleZW)
    const decimalPlaces = 15
    for (let i = 0; i < rotatedPoints.length; i++){
        for (let j = 0; j < rotatedPoints[i].length; j++) {
            rotatedPoints[i][j] = Util.round(rotatedPoints[i][j], decimalPlaces) // removes floating point errors   
        }

        // Translate
        rotatedPoints[i][3] += translateW
    }
    let intersectionPoints = get3DIntersectionPoints(rotatedPoints, edgeIndices)
    let faceGeometry = separatePointsByCube(intersectionPoints)

    setConvexColors(state.convexMeshes, colorCubes)
    drawFaces(state.convexMeshes, state.lineMeshes, faceGeometry)
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

function get3DIntersectionPoints(points4D, edgeIndices) {
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
                pointsThisCube.push(new Util.IntersectionPoint(edgeIndex, intersectionPoints[edgeIndex]))
            }
        }

        pointsByCube.push(pointsThisCube)
    }

    return new FaceGeometry(centerPoint, pointsByCube)
}


function drawFaces(convexMeshes, lineMeshes, faceGeometry) {
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

            let arr = new Float32Array(6)
            for (let j = 0; j < 3; j++) {
                arr[j] = sortedFacePoints[i].point[j] * scale
                arr[j+3] = sortedFacePoints[endIndex].point[j] * scale
            }
            lineMeshes[edgeIndex].visible = true
            lineMeshes[edgeIndex].geometry.setPositions(arr)
            edgeIndex++
        }
    }

    let pointsByFace = faceGeometry.pointsByFace
    for (let i = 0; i < pointsByFace.length; i++) {
        if (pointsByFace[i].length < 3) {
            // Cannot make a face with less than 3 points
            convexMeshes[i].visible = false
            continue
        }
        convexMeshes[i].visible = true
        let points = pointsByFace[i].map(ip => ip.point)
        let normal = Util.getFaceNormal(points, faceGeometry.origin)        
       
        Util.sortFacePointsFromNormal(points, normal, pointsByFace[i])

        drawEdgesForFace(pointsByFace[i])
        let faceVertices = Util.triangulateSortedFace(pointsByFace[i].map(ip => ip.point))

        let normals = []
        for (let k = 0; k < faceVertices.length/3; k++) {
            normals.push(...normal)            
        }

        const positionAttribute = new THREE.BufferAttribute(new Float32Array(faceVertices), 3)
        const normalAttribute = new THREE.BufferAttribute(new Float32Array(normals), 3)

        // number of positions and normals is changing so have to replace entire attribute on update
        convexMeshes[i].geometry.setAttribute('position', positionAttribute)
        convexMeshes[i].geometry.setAttribute('normal', normalAttribute)
    }

    // const positionAttribute = new THREE.BufferAttribute(new Float32Array(positions), 3)
    // const normalAttribute = new THREE.BufferAttribute(new Float32Array(normals), 3)

    // // number of positions and normals is changing so have to replace entire attribute on update
    // convexMesh.geometry.setAttribute('position', positionAttribute)
    // convexMesh.geometry.setAttribute('normal', normalAttribute)

    for (let i = edgeIndex; i < lineMeshes.length; i++) {
        lineMeshes[i].visible = false        
    }
}

function initSliceMesh(scene, color) {
    const geometry = new THREE.BufferGeometry()
    //const positionAttribute = new THREE.BufferAttribute(new Float32Array(0), 3)
    //positionAttribute.setUsage(THREE.DynamicDrawUsage)
    // geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3))
    // geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(0), 3))

    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(color)
    material.side = THREE.DoubleSide
    const mesh = new THREE.Mesh(geometry, material)
    mesh.visible = false
    scene.add(mesh)
    return mesh
}

function initTexturedCube(scene, cubeLength, tUrls) {
    const geometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)
    const loader = new THREE.TextureLoader()
    
    let materials = []

    for (let i = 0; i < 6; i++) {
        let mat = new THREE.MeshStandardMaterial()
        let tex = loader.load(tUrls[i])
        tex.anisotropy = 4
        mat.map = tex

        materials.push(mat)       
    }

    const mesh = new THREE.Mesh(geometry, materials)
    mesh.visible = false
    scene.add(mesh)
    return mesh
}

export function initRotateCubeIn4D(scene) {
    let state = {
        cubeMeshNormal: undefined,
        cubeMeshFlipped: undefined,
        sliceMesh: undefined,
        points: undefined
    }

    const cubeColor = '#006f76'
    const cubeLength = 2

    const axes3D = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ]
    state.points = Cube.calcCube(axes3D, cubeLength, [-0.5, -0.5, -0.5])
    for (const point of state.points) {
        point.push(0)
    }

    state.sliceMesh = initSliceMesh(scene, cubeColor)

    state.cubeMeshNormal = initTexturedCube(scene, cubeLength, [
        '/textures/cube_r.png',
        '/textures/cube_l.png',
        '/textures/cube_u.png',
        '/textures/cube_d.png',
        '/textures/cube_f.png',
        '/textures/cube_b.png',
    ])

    state.cubeMeshFlipped = initTexturedCube(scene, cubeLength, [
        '/textures/mcube_r.png',
        '/textures/mcube_l.png',
        '/textures/mcube_u.png',
        '/textures/mcube_d.png',
        '/textures/mcube_b.png',
        '/textures/mcube_f.png',
    ])

    return state
}

export function updateRotateCubeIn4D(state, angleZW) {
    state.cubeMeshNormal.visible = false
    state.cubeMeshFlipped.visible = false
    state.sliceMesh.visible = false

    if (Math.cos(angleZW) === 1) {
        state.cubeMeshNormal.visible = true
        return
    }

    if (Math.cos(angleZW) === -1) {
        state.cubeMeshFlipped.visible = true
        return
    }

    let rotatedPoints = Util.rotate4D(state.points, 0, 0, angleZW)
    let iPoints = get3DIntersectionPoints(rotatedPoints, Cube.edgeI)
    
    if (iPoints.length < 3) {
        return
    }

    let points = Object.values(iPoints)
    let normal = Util.getFaceNormal(points, [0, 0, 0])        
    
    Util.sortFacePointsFromNormal(points, normal, points)
    let faceVertices = Util.triangulateSortedFace(points)

    let normals = []
    for (let k = 0; k < faceVertices.length/3; k++) {
        normals.push(...normal)            
    }

    const positionAttribute = new THREE.BufferAttribute(new Float32Array(faceVertices), 3)
    const normalAttribute = new THREE.BufferAttribute(new Float32Array(normals), 3)

    state.sliceMesh.geometry.setAttribute('position', positionAttribute)
    state.sliceMesh.geometry.setAttribute('normal', normalAttribute)

    state.sliceMesh.visible = true
}