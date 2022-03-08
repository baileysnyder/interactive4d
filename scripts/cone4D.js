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

let sphereMeshes = []
let cylinderMeshes = []
let projSpherePoints4D = []
let projectionSphereMesh = undefined
let latheMesh = undefined
let baseCutoffMesh = undefined

export function undoInits(scene) {
    Util.removeThreeJsObjects(scene, sphereMeshes, cylinderMeshes, projSpherePoints4D, projectionSphereMesh, latheMesh, baseCutoffMesh)

    sphereMeshes = []
    cylinderMeshes = []
    projSpherePoints4D = []
    projectionSphereMesh = undefined
    latheMesh = undefined
    baseCutoffMesh = undefined
}

export function initProjCone(scene) {
    initSpheres(scene)
    initCylinders(scene)
    //initProjectionSphere()
}

function initSpheres(scene) {
    for (let i = 0; i < conePoints.length; i++){
        let radius = projectionPointRadius
        let color = lineColor
        if (i !== 0) {
            radius = projectionPointRadius/1.5
            color = pointColor
        }

        const geometry = new THREE.SphereGeometry(radius, 24, 12)
        const material = new THREE.MeshStandardMaterial()
        material.color = new THREE.Color(color)

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

export function initSliceCone(scene) {   
    initLathe(scene)
    initBaseCutFace(scene)
}

function initLathe() {
    
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
    baseCutoffMesh = mesh
}


function initProjectionSphere(scene) {
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
    projectionSphereMesh = mesh
    let points = geometry.getAttribute("position").array
    for (let i = 0; i < points.length; i+=3) {
        projSpherePoints4D.push([points[i], points[i+1], points[i+2], 0])
    }
}

export function updateProjectionCone(angleXW, angleYW, angleZW, translateW) {
    let rotatedPoints = Util.rotate4D(conePoints, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)
    Util.drawSpherePoints(finalPoints, sphereMeshes)
    Util.drawCylinders(finalPoints, cylinderMeshes, edgeIndices, cylinderScaleFactor)
    //drawProjectionSphere(angleXW, angleYW, angleZW)
}

function drawProjectionSphere(angleXW, angleYW, angleZW) {
    let rotatedPoints = Util.rotate4D(projSpherePoints4D, angleXW, angleYW, angleZW)
    let finalPoints = Util.project4DTo3D(rotatedPoints, projectionDistance4D, scaleFactor)

    let a = projectionSphereMesh.geometry.getAttribute("position")
    let meshPoints = a.array
    for (let i = 0; i < meshPoints.length; i++) {
        meshPoints[i] = finalPoints[Math.floor(i/3)][i%3]
    }
    a.needsUpdate = true
}

export function updateSliceCone(scene, angleIN, translateW){
    let transformedCone = new Cone.Cone(coneHeight, coneRadius, angleIN, translateW)
    switch(Cone.getSliceType(angleIN)) {
        case (Cone.sliceType.parabola):
            drawLatheSolid(scene, Cone.coneToParabola(angleIN, transformedCone), false)
            break
        case (Cone.sliceType.hyperbola):
            drawLatheSolid(scene, Cone.coneToHyperbola(angleIN, transformedCone), false)
            break
        case (Cone.sliceType.ellipse):
            drawLatheSolid(scene, Cone.coneToEllipsePoints(angleIN, transformedCone), true)
            break
    }
}

function drawLatheSolid(scene, {points, isBaseCutUp}, isHalf) {
    if (points === undefined || points.length === 0) {
        baseCutoffMesh.visible = false
        scene.remove(latheMesh)
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
    // will number of vertices in base be constant? Just need to scale?
    if (isBaseCutUp !== undefined) {
        let cutoffPoints = getCutoffPoints(geometry, isBaseCutUp, vec2s.length)
        if (!isBaseCutUp) {
            // make counter clock-wise
            cutoffPoints.reverse()
        }
        let triGuys = Util.triangulateSortedFace(cutoffPoints)
        
        let positions = baseCutoffMesh.geometry.getAttribute('position').array
        let normals = baseCutoffMesh.geometry.getAttribute('normal').array
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
        baseCutoffMesh.geometry.getAttribute('position').needsUpdate = true
        baseCutoffMesh.geometry.getAttribute('normal').needsUpdate = true
        baseCutoffMesh.visible = true
    } else {
        baseCutoffMesh.visible = false
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

    scene.remove(latheMesh)
    scene.add(mesh)

    latheMesh = mesh
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