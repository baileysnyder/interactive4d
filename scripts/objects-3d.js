import * as Cone from './cone'
import * as Util from './util'
import * as Draw from './draw-slices'
import * as THREE from 'three'
import * as Constants from './constants'
import * as Cube from './cube'
import { createLine } from './axes'
import { MaterialLoader } from 'three'

const planeColor = '#1B1B1B'
//const planeColor = '#000000'
const sphereColor = '#00aa19'
const cubeColor = '#FFEE56'
const coneColor = '#F31414'

const sphereRadius = 1
const planeWidth = 4
const coneSegments = 32
const coneHeight = sphereRadius*Math.tan(Math.PI/3)
const cubeLength = sphereRadius*1.5

const axes3D = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
]
const projCube = Cube.calcCube(axes3D, cubeLength, [-0.5, -0.5, -0.5])

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

const planeEdgeIndices = [
    cubeEdgeIndices[0],
    cubeEdgeIndices[1],
    cubeEdgeIndices[2],
    cubeEdgeIndices[3],
]

const projSphereCount = 48

function initPlane(scene, width) {
    const geometry = new THREE.PlaneGeometry(width, width)
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

function makeSphere(scene, radius, wSeg, hSeg, color) {
    const geometry = new THREE.SphereGeometry(radius, wSeg, hSeg)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(color)
    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    return mesh
}

export function initSphere(scene) {
    let state = genericState()
    state.plane = initPlane(scene, planeWidth)
    state.mainMesh = makeSphere(scene, sphereRadius, 48, 24, sphereColor)

    return state
}

export function initSphereRing(scene) {
    let state = {
        pointCount: 10,
        z: 0.4,
        spherePoints: [],
        sphereMeshes: undefined
    }

    let rad = Util.getSphereIntersectionRadius(sphereRadius, state.z)
    for (let i = 0; i < state.pointCount; i++) {
        let theta = (i/state.pointCount)*(2*Math.PI)
        let x = Math.cos(theta)*rad
        let y = Math.sin(theta)*rad
        state.spherePoints.push([x, y, state.z])
        state.spherePoints.push([x, y, -state.z])        
    }

    state.sphereMeshes = Util.initProjSpheres(scene, Constants.projectionSphereRadius, state.pointCount*2, 20, 10, Constants.projCylColor)
    for (let i = 0; i < state.sphereMeshes.length; i++) {
        if (i%2 === 0) {
            state.sphereMeshes[i].material.color = new THREE.Color('#ff1e1e')
        }       
    }

    return state
}

export function initSolidCube(scene, planeZ, cubeZ) {
    let state = genericState()
    state.plane = initPlane(scene, planeWidth)
    state.plane.position.set(0, 0, planeZ)
    state.plane.layers.set(1)

    const geometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(cubeColor)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, cubeZ)

    scene.add(mesh)
    state.mainMesh = mesh
    return state
}

export function initEdgeCube(scene) {
    let state = genericState()
    state.plane = initPlane(scene, planeWidth)

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

export function initSingleSquare(scene) {
    let state = genericState()
    state.plane = initPlane(scene, planeWidth)

    const geometry = new THREE.PlaneGeometry(cubeLength, cubeLength)
    const material = new THREE.MeshStandardMaterial({side: THREE.DoubleSide})
    //material.color = new THREE.Color(0xFFEE56)

    const loader = new THREE.TextureLoader()
    let tex = loader.load('/textures/square_lr.png')
    tex.anisotropy = 4
    material.map = tex

    const mesh = new THREE.Mesh(geometry, material)
    mesh.renderOrder = 1

    scene.add(mesh)
    state.mainMesh = mesh

    return state
}

export function initCone(scene, showObject) {
    let state = genericState()
    state.plane = initPlane(scene, planeWidth)

    // assuming equilateral
    const geometry = new THREE.ConeGeometry(sphereRadius, sphereRadius*Math.tan(Math.PI/3), coneSegments)
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.visible = showObject

    scene.add(mesh)
    state.mainMesh = mesh
    return state
}

function initProjCubeFace(scene) {    
    const cubePositionCount = 18
    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(new Float32Array(cubePositionCount), 3)
    const normalAttribute = new THREE.BufferAttribute(new Float32Array(cubePositionCount), 3)
    positionAttribute.setUsage(THREE.DynamicDrawUsage)
    normalAttribute.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('normal', normalAttribute)

    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.color = new THREE.Color(cubeColor)

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh

}

export function initProjCube(scene, planeZ) {
    let state = {
        sphereMeshes: undefined,
        cylinderMeshes: undefined,
        faceMesh: undefined,
        plane: undefined
    }
    state.sphereMeshes = Util.initProjSpheres(scene, Constants.projectionSphereRadius, projCube.length, 24, 12, Constants.projPointColor)
    state.cylinderMeshes = Util.initProjCylinders(scene, Cube.edgeI.length, Constants.projCylColor)

    for (let i = 0; i < state.cylinderMeshes.length; i++) {
        state.cylinderMeshes[i].material.transparent = true    
    }
    for (let i = 0; i < state.sphereMeshes.length; i++) {
        state.sphereMeshes[i].material.transparent = true 
    }

    state.plane = initPlane(scene, planeWidth)
    state.plane.position.set(0, 0, planeZ)
    state.plane.layers.set(1)

    state.faceMesh = initProjCubeFace(scene)

    return state
}

export function initProjSphere(scene, planeZ, sphereZ) {
    let state = genericState()
    state.plane = initPlane(scene, planeWidth)
    state.plane.position.set(0, 0, planeZ)
    state.plane.layers.set(1)

    state.mainMesh = makeSphere(scene, sphereRadius, 32, 16, sphereColor)
    state.mainMesh.position.set(0, 0, sphereZ)

    return state
}

export function initProjSpherePoints(scene, planeZ) {
    let state = {
        sphereMeshes: undefined,
        plane: undefined,
        spherePoints: undefined
    }

    state.sphereMeshes = Util.initProjSpheres(scene, Constants.projectionSphereRadius, projSphereCount, 20, 10, Constants.projPointColor)

    state.plane = initPlane(scene, planeWidth)
    state.plane.position.set(0, 0, planeZ)
    state.plane.layers.set(1)

    state.spherePoints = Util.generateSpreadSpherePoints(projSphereCount, sphereRadius, 0)
    for (let i = 0; i < state.spherePoints.length; i++) {
        state.spherePoints[i].pop()        
    }

    // for red highlight gif
    // let hSphere = Util.initProjSpheres(scene, Constants.projectionSphereRadius, 1, 20, 10, '#ffffff')
    // hSphere[0].material = new THREE.MeshBasicMaterial({color: '#ff1e1e'})
    // hSphere[0].position.set(0, 0, -planeZ)
    // state.sphereMeshes[2].material = new THREE.MeshBasicMaterial({color: '#ff1e1e'})

    return state
}

export function transformMesh(mesh, angleXZ, angleYZ, translateZ) {
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

function getPlaneSlice(planeMesh) {
    let points3D = meshToVector3s(planeMesh, 4)
    return get2DIntersectionPoints(points3D, planeEdgeIndices)
}

function getCubeSlice(cubeMesh) {
    let points3D = meshToVector3s(cubeMesh, 8)
    return get2DIntersectionPoints(points3D, cubeEdgeIndices)
}

function meshToVector3s(mesh, pointCount) {
    let points3D = []
    const decimalPlaces = 15
    for (let i = 0; i < pointCount; i++) {
        let v = new THREE.Vector3()
        v.fromBufferAttribute(mesh.geometry.attributes.position, i)
        v.applyMatrix4(mesh.matrix)

        v.x = Util.round(v.x, decimalPlaces)
        v.y = Util.round(v.y, decimalPlaces)
        v.z = Util.round(v.z, decimalPlaces)

        points3D.push(v)
    }
    return points3D
}

function get2DIntersectionPoints(points3D, edgeIndices) {
    let zClip = 0.0
    let intersectionPoints = []
    for (let i = 0; i < edgeIndices.length; i++) {
        let p1 = points3D[edgeIndices[i][0]]
        let p2 = points3D[edgeIndices[i][1]]
        
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
    Draw.drawEdgeCubeSlice(canvas, points2D, 'gray', cubeColor, planeWidth)
}

export function updateSingleSquare(state, canvas, angleXZ, angleYZ, translateZ) {
    if (Math.abs(Math.sin(angleXZ)) < 0.00001 && Math.abs(Math.sin(angleYZ)) < 0.00001 && translateZ === 0) {
        transformMesh(state.mainMesh, angleXZ, angleYZ, 0.0001)
        state.mainMesh.updateMatrix()

        Draw.drawSliceCanvas(canvas, planeColor)
        let points2D = [
            new Util.IntersectionPoint(0, [cubeLength/2, cubeLength/2]),
            new Util.IntersectionPoint(1, [-cubeLength/2, cubeLength/2]),
            new Util.IntersectionPoint(2, [-cubeLength/2, -cubeLength/2]),
            new Util.IntersectionPoint(3, [cubeLength/2, -cubeLength/2]),
        ]
        Draw.drawSolidCubeSlice(canvas, points2D, '#006f76', planeWidth)
        return
    }

    transformMesh(state.mainMesh, angleXZ, angleYZ, translateZ)
    state.mainMesh.updateMatrix()

    Draw.drawSliceCanvas(canvas, planeColor)
    let points2D = getPlaneSlice(state.mainMesh)
    if (points2D.length < 2) {
        return
    }

    Util.sortFacePoints2D(points2D.map(p => p.point), points2D)
    Draw.drawEdgeCubeSlice(canvas, points2D, 'transparent', '#006f76', planeWidth)
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

export function initSphereSliceAnim(scene, canvasW, canvasH) {
    let state = {
        circleMeshes: [],
        planeMeshes: [],
        lineMeshes: []
    }
    const stepHalf = 6
    const radius = 2

    for (let i = -stepHalf+0.5; i < stepHalf; i+=1) {
        let z = (i/stepHalf) * radius
        let innerRadius = Util.getSphereIntersectionRadius(radius, z)

        state.circleMeshes.push(addSphereSlice(scene, '/textures/slice_circle.png', [0, 0, z], innerRadius*2, innerRadius*2))

        let plane = initPlane(scene, 6)
        plane.position.set(0, 0, z)
        //plane.material.depthTest = false
        plane.material.transparent = false
        state.planeMeshes.push(plane)
        
        let axisLen = 2.6
        let x = createLine(scene, [-axisLen, 0, z, axisLen, 0, z], Constants.axisColors[0], canvasW, canvasH, 5)
        state.lineMeshes.push(x)

        let y = createLine(scene, [0, -axisLen, z, 0, axisLen, z], Constants.axisColors[1], canvasW, canvasH, 5)
        state.lineMeshes.push(y)
    }
    return state
}

function addSphereSlice(scene, url, position, width, height) {
    const loader = new THREE.TextureLoader()
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.depthTest = false
    material.alphaTest = 0.2
    material.transparent = true
    material.opacity = 0.3
    material.color = new THREE.Color(sphereColor)
    let tex = loader.load(url)
    tex.anisotropy = 4
    material.map = tex

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position[0], position[1], position[2])
    //mesh.renderOrder = 1
    scene.add(mesh)
    return mesh
}

export function initSphereOutlineRadius(scene) {
    let state = {
        lineMeshes: [],
        meshes: []
    }

    let s1 = makeSphere(scene, 1, 44, 22, sphereColor)
    s1.material.wireframe = true
    state.meshes.push(s1)

    let s2 = makeSphere(scene, 0.05, 24, 12, "#FFFFFF")
    state.meshes.push(s2)

    let v = [1, 1, 0]
    Util.normalizeVector(v)

    let s3 = makeSphere(scene, 0.05, 24, 12, "#FFFFFF")
    s3.position.set(v[0], v[1], v[2])
    state.meshes.push(s3)

    let points = [
        [0, 0, 0],
        v
    ]
    let edges = [
        [0, 1]
    ]

    let cylinderMesh = Util.initProjCylinders(scene, 1, "#FFFFFF")
    state.meshes.push(cylinderMesh)

    Util.drawCylinders(points, cylinderMesh, edges, 0.015)

    return state
}

export function initSphereSlicesLined(scene) {
    let state = {
        meshes: []
    }

    let hypColor = "#00aa19"

    let r = 1
    let s1 = makeSphere(scene, r, 32, 16, hypColor)
    s1.material.transparent = true
    //s1.material.opacity = 0.9
    state.meshes.push(s1)

    let offset = 0
    let distance = 0
    for (let i = 0; i < 3; i++) {
        let rNew = r-0.25
        distance = distance+r+rNew+offset
        for (let j = 0; j < 2; j++) {
            distance = -distance
            let s = makeSphere(scene, rNew, 32, 16, hypColor)
            s.material.transparent = true
            //s.material.opacity = 0.9
            s.position.set(distance, 0, 0)
            state.meshes.push(s)
        }
        r = rNew
    }

    return state
}

export function updateSphereSliceAnim(state, count) {
    for (let i = 0; i < state.circleMeshes.length; i++) {
        state.circleMeshes[i].visible = i <= count ? true : false
        state.planeMeshes[i].visible = i <= count ? true : false
        state.lineMeshes[i*2].visible = i <= count ? true : false
        state.lineMeshes[i*2+1].visible = i <= count ? true : false
    }
}

export function updateProjCube(state, angleXZ, angleYZ, cubeZ, highlightFace) {
    if (highlightFace) {
        state.faceMesh.visible = true
        for (let i = 0; i < state.cylinderMeshes.length; i++) {
            state.cylinderMeshes[i].material.opacity = 0.2       
        }

        for (let i = 0; i < state.sphereMeshes.length; i++) {
            state.sphereMeshes[i].material.opacity = 0.4      
        }
    } else {
        state.faceMesh.visible = false
        for (let i = 0; i < state.cylinderMeshes.length; i++) {
            state.cylinderMeshes[i].material.opacity = 1      
        }

        for (let i = 0; i < state.sphereMeshes.length; i++) {
            state.sphereMeshes[i].material.opacity = 1    
        }
    }

    let m = Util.getTransformMatXYZ4D(1, [0, 0, cubeZ], angleYZ, angleXZ, 0)
    let points = Util.applyMatXYZ4D(projCube, m)
    Util.drawSpherePoints(points, state.sphereMeshes)
    Util.drawCylinders(points, state.cylinderMeshes, Cube.edgeI, 0.06)


    let facePoints = []
    let faceIndex = 3
    for (let j = 0; j < Cube.faceI[faceIndex].length; j++) {
        let pIndex = Cube.faceI[faceIndex][j]
        let p = points[pIndex]
        facePoints.push([p[0], p[1], p[2]])
    }
    let pn = Cube.getFacePointsNormals(points, facePoints)

    let positionAtt = state.faceMesh.geometry.getAttribute('position')
    let normalAtt = state.faceMesh.geometry.getAttribute('normal')
    for (let i = 0; i < positionAtt.array.length; i++) {
        positionAtt.array[i] = pn.points[i]
        normalAtt.array[i] = pn.normals[i]
    }

    positionAtt.needsUpdate = true
    normalAtt.needsUpdate = true
}

export function colorProjCubeSquare(state, fIndex, color) {
    const projCylUncolored = new THREE.Color('#191919')
    for (let i = 0; i < state.cylinderMeshes.length; i++) {
        state.cylinderMeshes[i].material.color = projCylUncolored       
    }

    const c3 = new THREE.Color(color)
    let edges = Cube.faceByEdgeI[fIndex]
    for (let i = 0; i < edges.length; i++) {
        state.cylinderMeshes[edges[i]].material.color = c3        
    }
}

export function updateProjSpherePoints(state, scene, angleXZ, angleYZ, sphereZ) {
    let m = Util.getTransformMatXYZ4D(1, [0, 0, sphereZ], angleYZ, angleXZ, 0)
    let points = Util.applyMatXYZ4D(state.spherePoints, m)
    Util.drawSpherePoints(points, state.sphereMeshes)

    // for red highlight gif
    // if (state.loine != null) {
    //     Util.removeThreeJsObjects(scene, state.loine)
    // }
    // state.loine = createLine(scene, [0, 0, sphereZ, state.sphereMeshes[2].position.x, state.sphereMeshes[2].position.y, state.sphereMeshes[2].position.z], '#ff1e1e', 550, 332, 4)
}

export function updateSphereRing(state, angleXZ) {
    let m = Util.getTransformMatXYZ4D(1, [0, 0, state.z], 0, angleXZ, 0)
    let points = Util.applyMatXYZ4D(state.spherePoints, m)
    Util.drawSpherePoints(points, state.sphereMeshes)
}