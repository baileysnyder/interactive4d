import * as Util from './util'
import * as Cone from './cone'
import * as THREE from 'three'

function getConeEdges(n) {
    let edges = []
    for (let i = 1; i <= n; i++) {
        edges.push([0, i])        
    }
    return edges
}

const projectionPointRadius = 0.09
const cylinderScaleFactor = 0.04
const projectionDistance4D = 2
const scaleFactor = 2.5
const sphereRadius = 1
const sphereSegmentsW = 8
const sphereSegmentsH = 6
const coneColor = '#F31414'
const lineColor = '#62DDE5'
const pointColor = '#D2F3F5'

const coneRadius = 1.1
const coneHeight = coneRadius*Math.tan(Math.PI/3)
const latheSegments = 32

//const spherePointCount = 32
let conePoints = [[0, 0, 0, 1.1]]
let spherePoints = Util.generate3DSphereIn4D(sphereRadius, sphereSegmentsW, sphereSegmentsH, 0)
conePoints = conePoints.concat(spherePoints)

const edgeIndices = getConeEdges(spherePoints.length)

export function initProjCone(scene) {
    let state = {
        sphereMeshes: undefined,
        cylinderMeshes: undefined
    }
    state.sphereMeshes = initSpheres(scene)
    state.cylinderMeshes = Util.initProjCylinders(scene, edgeIndices.length, lineColor)

    return state
}

function initSpheres(scene) {
    let meshes = []
    for (let i = 0; i < conePoints.length; i++){
        let radius = projectionPointRadius/1.5
        let color = pointColor
        if (i === 0) {
            radius = projectionPointRadius
            //color = lineColor
        }

        const geometry = new THREE.SphereGeometry(radius, 24, 12)
        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(color)

        const mesh = new THREE.Mesh(geometry, material)

        scene.add(mesh)
        meshes.push(mesh)
    }
    return meshes
}

function initProjectionSphere(state, scene) {
    const geometry = new THREE.SphereGeometry(sphereRadius, sphereSegmentsW, sphereSegmentsH)
    geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)
    const material = new THREE.MeshBasicMaterial()
    material.side = THREE.DoubleSide
    //material.wireframe = true
    material.depthWrite = false
    material.transparent = true
    material.opacity = 0.1

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    state.projectionSphereMesh = mesh
    let points = geometry.getAttribute("position").array
    for (let i = 0; i < points.length; i+=3) {
        state.projSpherePoints4D.push([points[i], points[i+1], points[i+2], 0])
    }
}

export function initSliceCone(scene) {
    let state = {
        baseCutoffMesh: undefined,
        latheMesh: undefined
    }
    state.baseCutoffMesh = initBaseCutFace(scene)

    return state
}

function initLathe(scene) {
    
}

function initBaseCutFace(scene) {
    const geometry = new THREE.BufferGeometry()
    let bufferSize = (latheSegments-2)*9
    const positionAttribute = new THREE.BufferAttribute(new Float32Array(bufferSize), 3)

    const normals = new Float32Array(bufferSize)
    for (let i = 0; i < normals.length; i+=3) {
        normals[i+1] = 1 // pointing up in y direction
    }
    const normalAttribute = new THREE.BufferAttribute(normals, 3)

    positionAttribute.setUsage(THREE.DynamicDrawUsage)
    normalAttribute.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('normal', normalAttribute)

    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}

export function updateProjectionCone(state, angleXW, angleYW, angleZW, translateW) {
    let rotatedPoints = Util.rotate4D(conePoints, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)
    Util.drawSpherePoints(finalPoints, state.sphereMeshes)
    Util.drawCylinders(finalPoints, state.cylinderMeshes, edgeIndices, cylinderScaleFactor)
}

function drawProjectionSphere(state, angleXW, angleYW, angleZW) {
    let rotatedPoints = Util.rotate4D(state.projSpherePoints4D, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)

    let a = state.projectionSphereMesh.geometry.getAttribute("position")
    let meshPoints = a.array
    for (let i = 0; i < meshPoints.length; i++) {
        meshPoints[i] = finalPoints[Math.floor(i/3)][i%3]
    }
    a.needsUpdate = true
}

export function updateSliceCone(state, scene, angleIN, translateW){
    let transformedCone = new Cone.Cone(coneHeight, coneRadius, angleIN, translateW)
    switch(Cone.getSliceType(angleIN)) {
        case (Cone.sliceType.parabola):
            drawLatheSolid(state, scene, Cone.coneToParabola(angleIN, transformedCone), false)
            break
        case (Cone.sliceType.hyperbola):
            drawLatheSolid(state, scene, Cone.coneToHyperbola(angleIN, transformedCone), false)
            break
        case (Cone.sliceType.ellipse):
            drawLatheSolid(state, scene, Cone.coneToEllipsePoints(angleIN, transformedCone), true)
            break
    }
}

function drawLatheSolid(state, scene, {points, isBaseCutUp}, isHalf) {
    if (points === undefined || points.length === 0) {
        state.baseCutoffMesh.visible = false
        scene.remove(state.latheMesh)
        return
    }
    
    let vec2s = []
    if (isHalf) {
        for (let i = 0; i < points.length; i++) {
            vec2s.push(new THREE.Vector2(points[i][0], points[i][1]))          
        }
    } else {
        if (isBaseCutUp) {
            for (let i = Math.floor(points.length/2); i < points.length; i++) {
                vec2s.push(new THREE.Vector2(points[i][0], points[i][1]))        
            }
        } else {
            for (let i = 0; i <= Math.floor(points.length/2); i++) {
                vec2s.push(new THREE.Vector2(points[i][0], points[i][1]))        
            }
        }

    }

    //addCutoffPoint(vec2s, isUp)

    const geometry = new THREE.LatheGeometry(vec2s, latheSegments);
    // will spacing of vertices in base be constant? Just need to scale?
    if (isBaseCutUp !== undefined) {
        let cutoffPoints = getCutoffPoints(geometry, isBaseCutUp, vec2s.length)
        if (!isBaseCutUp) {
            // make counter clock-wise
            cutoffPoints.reverse()
        }
        let triGuys = Util.triangulateSortedFace(cutoffPoints)
        
        let positions = state.baseCutoffMesh.geometry.getAttribute('position').array
        let normals = state.baseCutoffMesh.geometry.getAttribute('normal').array
        for (let i = 0; i < positions.length; i+=3) {
            positions[i] = triGuys[i]
            positions[i+1] = triGuys[i+1]
            positions[i+2] = triGuys[i+2]

            if (isBaseCutUp) {
                normals[i+1] = 1
            } else {
                normals[i+1] = -1
            }
        }
        state.baseCutoffMesh.geometry.getAttribute('position').needsUpdate = true
        state.baseCutoffMesh.geometry.getAttribute('normal').needsUpdate = true
        state.baseCutoffMesh.visible = true
    } else {
        state.baseCutoffMesh.visible = false
    }
    
    
    // let newP = new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('position').array), 3)
    // let newN = new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('normal').array), 3)

    // latheMesh.geometry.setAttribute('position', newP)
    // latheMesh.geometry.setAttribute('normal', newN)
    // newP.needsUpdate = true
    // newN.needsUpdate = true

    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(coneColor)
    const mesh = new THREE.Mesh(geometry, material)

    scene.remove(state.latheMesh)
    scene.add(mesh)
    state.latheMesh = mesh
}

function getCutoffPoints(geometry, isBaseCutUp, curvePointCount) {
    let lathePoints = geometry.getAttribute('position').array
    let points = []
    //for both skip the first point in the base because it's duplicated at the end of the mesh
    if (isBaseCutUp) {
        for (let i = 3*(2*curvePointCount-1); i < lathePoints.length; i+=(3*curvePointCount)) {
            points.push([lathePoints[i], lathePoints[i+1], lathePoints[i+2]])
        }
    } else {
        for (let i = (3*curvePointCount); i < lathePoints.length; i+=(3*curvePointCount)) {
            points.push([lathePoints[i], lathePoints[i+1], lathePoints[i+2]])
        }
    }
    return points
}

function addCutoffPoint(vec2s, isUp) {
    if (isUp && vec2s[vec2s.length-1].x !== 0) {
        vec2s.push(new THREE.Vector2(0, vec2s[vec2s.length-1].y))
    }
    else if (!isUp && vec2s[0].x !== 0) {
        vec2s.unshift(new THREE.Vector2(0, vec2s[0].y))
    }
}