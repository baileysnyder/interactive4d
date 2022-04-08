import * as Util from './util'
import * as Constants from './constants'

const parabolaThreshold = 0.001
const coneAngle = Math.PI/6

function calcCircleYSpread() {
    const minY = 0.001
    const divFactor = 1.3
    let posYs = []

    for (let d = 1/divFactor; d > minY ; d/=divFactor) {
        posYs.push(1-d)
    }
    posYs.push(1)
    
    let mirror = posYs.slice().reverse().map(x => -x)
    mirror.push(0)
    return mirror.concat(posYs)
}

const circleYSpread = calcCircleYSpread()

export const sliceType= {
    ellipse: 0,
    parabola: 1,
    hyperbola: 2
}

export class Cone {
    constructor(coneHeight, baseRadius, angleYZ, translateZ) {
        let m = this.getTransformMatrix(angleYZ, translateZ)

        // the 4th index in these vectors is a placeholder for matrix multiplication
        this.tip = Util.multiplyMatrixVector(m, [0, coneHeight/2, 0, 1])
        this.baseNeg = Util.multiplyMatrixVector(m, [0, -coneHeight/2, -baseRadius, 1])
        this.basePos = Util.multiplyMatrixVector(m, [0, -coneHeight/2, baseRadius, 1])
        this.baseCenter = Util.multiplyMatrixVector(m, [0, -coneHeight/2, 0, 1])
    }

    getTransformMatrix(angleYZ, translateZ) {
        return [
            [1, 0, 0, 0],
            [0, Math.cos(angleYZ), -Math.sin(angleYZ), 0],
            [0, Math.sin(angleYZ), Math.cos(angleYZ), translateZ],
            [0, 0, 0, 1],
        ]
    }
}

// assuming degenerative hyperbolas are at 0, 180, 360, etc
export function getSliceType(angleYZ) {

    let parabolaStart = Math.abs(Math.sin(coneAngle))
    let s = Math.abs(Math.sin(angleYZ))

    if (inThreshold(s, parabolaStart, parabolaThreshold)) {
        return sliceType.parabola 
    } else if (s < parabolaStart) {
        return sliceType.hyperbola
    } else {
        return sliceType.ellipse
    }
}

function inThreshold(val, checkVal, threshold) {
    let min = checkVal - threshold
    let max = checkVal + threshold
    return val > min && val < max
}

export function coneToHyperbola(angleYZ, {tip, baseNeg, basePos, baseCenter}) {
    // degenerative
    if (tip[2] === 0) {
        let points = getDegenerativeHyperbola(tip, basePos, baseNeg, baseCenter)
        let isUp = Math.cos(angleYZ) < 0
        return new SlicePoints(points, basePos[1], isUp)
    }

    let y1 = undefined
    let y2 = undefined
    if (tip[2] > 0 && baseNeg[2] < 0 || tip[2] < 0 && baseNeg[2] > 0) {
        y1 = yInterceptOnPlane(tip, baseNeg)
        y2 = projectedYInterceptOnPlane(basePos, tip)
    } else if (tip[2] > 0 && basePos[2] < 0 || tip[2] < 0 && basePos[2] > 0) {
        y1 = yInterceptOnPlane(tip, basePos)
        y2 = projectedYInterceptOnPlane(baseNeg, tip)
    }

    if (y1 === undefined || y2 === undefined) {
        return new SlicePoints(undefined, undefined, undefined)
    }

    let a = Math.abs((y2-y1)/2)
    let eccentricity = Math.abs(Math.cos(angleYZ)/Math.cos(Math.PI/6))
    let c = a*eccentricity
    let b = Math.sqrt(Math.abs(c*c-a*a))

    let baseCutY = yInterceptOnPlane(basePos, baseNeg)

    let yOrigin = y1 + ((y2-y1)/2)
    let points = getHyperbola(a, b, Math.abs(yOrigin - baseCutY))
    let isUp = Math.cos(angleYZ) < 0
    translateGraph(points, yOrigin, isUp)
    return new SlicePoints(points, baseCutY, isUp)
}

function getDegenerativeHyperbola(tip, basePos, baseNeg, baseCenter) {
    let radius = Util.distanceBetweenPoints(basePos, baseNeg)/2
    if (basePos[1] === baseNeg[1]) {
        return [
            [-radius, basePos[1]],
            [0, tip[1]],
            [radius, basePos[1]]
        ]
    }
    // assuming base circle is intersecting
    let baseCutY = yInterceptOnPlane(basePos, baseNeg)
    let xDist = getXOfBaseIntersect(baseCenter, baseCutY, radius)

    return [
        [-xDist, baseCutY],
        [0, tip[1]],
        [xDist, baseCutY]
    ]
}

function getXOfBaseIntersect(baseCenter, baseCutY, coneRadius) {
    let yDiff = baseCutY-baseCenter[1]
    let zDistAlongBase2 = yDiff*yDiff + baseCenter[2]*baseCenter[2]
    return Math.sqrt(coneRadius*coneRadius - zDistAlongBase2)
}

function getHyperbola(a, b, maxY) {
    let a2 = a*a
    let b2 = b*b

    let points = []
    let distance = maxY-a
    const minY = 0.0001

    // store points left to right so it's easier to draw
    for (let d = distance; d > minY ; d/=1.5) {
        let y = a + d
        let x = Math.sqrt(Math.abs(b2*(1-((y*y)/a2))))
        points.push([-x, y])
    }
    points.push([0, a])
    for (let i = points.length-2; i >= 0; i--) {
        points.push([-points[i][0], points[i][1]])       
    }

    return points
}

function translateGraph(points, y0, isUp) {
    let sign = isUp ? 1 : -1

    for (let i = 0; i < points.length; i++) {
        points[i][1] = y0 + (sign*points[i][1])       
    }
}

export function coneToParabola(angleYZ, {tip, baseNeg, basePos, baseCenter}) {
    if (basePos[2] === 0 || baseNeg[2] === 0) {
        // slice is a straight line, which would be invisible in 2D
        return new SlicePoints(undefined, undefined, undefined)
    }

    let yInt = undefined
    if (tip[2] > 0 && baseNeg[2] < 0 || tip[2] < 0 && baseNeg[2] > 0) {
        yInt = yInterceptOnPlane(tip, baseNeg)
    } else if (tip[2] > 0 && basePos[2] < 0 || tip[2] < 0 && basePos[2] > 0) {
        yInt = yInterceptOnPlane(tip, basePos)
    }

    if (yInt === undefined) {
        return new SlicePoints(undefined, undefined, undefined)
    }

    let radius = Util.distanceBetweenPoints(basePos, baseNeg)/2
    let baseCutY = yInterceptOnPlane(basePos, baseNeg)
    let x = getXOfBaseIntersect(baseCenter, baseCutY, radius)
    let y = Math.abs(yInt-baseCutY)
    let a = x*x/(4*y)
    let points = getParabola(a, y)

    let isUp = Math.cos(angleYZ) < 0
    translateGraph(points, yInt, isUp)
    return new SlicePoints(points, baseCutY, isUp)
}

function getParabola(a, maxY) {
    let points = []
    const minY = 0.0001

    // store points left to right so it's easier to draw
    for (let y = maxY; y > minY ; y/=1.5) {
        let x = Math.sqrt(4*a*y)
        points.push([-x, y])
    }
    points.push([0, 0])
    for (let i = points.length-2; i >= 0; i--) {
        points.push([-points[i][0], points[i][1]])       
    }
    
    return points
}

export class ConeEllipse {
    constructor(y1, y2, eccentricity, baseCutY, isBaseCutUp) {
        // always setting y1 to smaller value makes it easier to draw
        this.y1 = y1 < y2 ? y1 : y2
        this.y2 = y2 > y1 ? y2 : y1
        this.eccentricity = eccentricity
        this.baseCutY = baseCutY
        this.isBaseCutUp = isBaseCutUp

        let a = Math.abs(y1-y2)/2
        let c = a*eccentricity
        let b = Math.sqrt(Math.abs(c*c-a*a))

        this.a = a
        this.b = b
    }
}

export class SlicePoints {
    constructor(points, baseCutY, isBaseCutUp) {
        this.points = points
        this.baseCutY = baseCutY
        this.isBaseCutUp = isBaseCutUp
    }
}

export function coneToEllipse(angleYZ, {tip, baseNeg, basePos}) {
    let y1 = undefined
    if (tip[2] > 0 && baseNeg[2] < 0 || tip[2] < 0 && baseNeg[2] > 0) {
        y1 = yInterceptOnPlane(tip, baseNeg)
    }

    let y2 = undefined
    if (tip[2] > 0 && basePos[2] < 0 || tip[2] < 0 && basePos[2] > 0) {
        y2 = yInterceptOnPlane(tip, basePos)
    }

    if (y1 === undefined && y2 === undefined) {
        return undefined
    }

    let eccentricity = Math.abs(Math.cos(angleYZ)/Math.cos(Math.PI/6))
    if (y1 !== undefined && y2 !== undefined) {
        return new ConeEllipse(y1, y2, eccentricity, undefined, undefined)
    }

    y1 = projectedYInterceptOnPlane(tip, baseNeg)
    y2 = projectedYInterceptOnPlane(tip, basePos)

    let baseCutY = yInterceptOnPlane(basePos, baseNeg)
    let isUp = Math.cos(angleYZ) < 0

    return new ConeEllipse(y1, y2, eccentricity, baseCutY, isUp)
}

export function coneToEllipsePoints(angleYZ, cone) {
    let ellipse = coneToEllipse(angleYZ, cone)
    return getEllipse(ellipse)
}

function getEllipse(ellipse) {
    if (ellipse === undefined) {
        return new SlicePoints(undefined, undefined, undefined)
    }
    let a = Math.abs(ellipse.y2-ellipse.y1)/2
    let c = a*ellipse.eccentricity
    let b = Math.sqrt(Math.abs(c*c-a*a))

    let a2 = a*a
    let b2 = b*b

    let centerY = (ellipse.y1+ellipse.y2)/2

    let points = []
    // scale and translate circle to ellipse
    let ySpread = circleYSpread.map(x => centerY + x*a)

    if (ellipse.isBaseCutUp !== undefined && ellipse.isBaseCutUp) {
        for (let i = 0; i < ySpread.length; i++) {
            if (ySpread[i] > ellipse.baseCutY) {
                ySpread = ySpread.slice(0, i)
                break
            }         
        }
        ySpread.push(ellipse.baseCutY)
    } else if (ellipse.isBaseCutUp !== undefined){
        for (let i = ySpread.length-1; i >= 0; i--) {
            if (ySpread[i] < ellipse.baseCutY) {
                ySpread = ySpread.slice(i+1)
                break
            }         
        }
        ySpread.unshift(ellipse.baseCutY)
    }
    

    for (let i = 0; i < ySpread.length; i++) {
        let y = ySpread[i]
        let x = Math.sqrt(Math.abs(b2*(1-(Math.pow(y-centerY, 2)/a2))))
        points.push([-x, y])
    }
    // for (let i = points.length-1; i >= 0; i--) {
    //     points.push([-points[i][0], points[i][1]])       
    // }

    return new SlicePoints(points, ellipse.baseCutY, ellipse.isBaseCutUp)
}

function yInterceptOnPlane(start, end) {
    let zDistance = Math.abs(start[2] - end[2])
    let t = Math.abs(start[2]) / zDistance
    return Util.lerp(start[1], end[1], t)
}

// If the line between start and end doesn't intersect the plane, see where it would eventually
// intersect if the line continued
function projectedYInterceptOnPlane(start, end) {
    let line = Util.subtractVectors(start, end)
    let t = -(start[2] / line[2])
    return start[1] + (line[1]*t)
}

export function initConeProj3D(scene) {
    const radialPoints = 32
    const coneRadius = 1.1
    
    let state = {
        sphereMeshes: undefined,
        cylinderMeshes: undefined,
        points: [],
        edges: [],
        coneHeight: coneRadius*Math.tan(Math.PI/3)
    }

    state.points.push([0, 0, state.coneHeight])

    for (let i = 0; i < radialPoints; i++) {
        let theta = (i/radialPoints)*(2*Math.PI)
        let x = Math.sin(theta)*coneRadius
        let y = Math.cos(theta)*coneRadius
        state.points.push([x, y, 0])
        state.edges.push([0, i+1])
    }

    state.sphereMeshes = Util.initProjSpheres(scene, Constants.projectionSphereRadius, state.points.length, 20, 10, Constants.projPointColor)
    state.cylinderMeshes = Util.initProjCylinders(scene, state.edges.length, Constants.projCylColor)

    Util.drawSpherePoints(state.points, state.sphereMeshes)
    Util.drawCylinders(state.points, state.cylinderMeshes, state.edges, 0.05)

    return state
}

export function updateConeProj3D(state, angleYZ, angleXZ, angleXY) {
    let m = Util.rotMat3DPlanes4D(angleYZ, angleXZ, angleXY)
    let points = Util.applyMatXYZ4D(state.points, m)
    Util.drawSpherePoints(points, state.sphereMeshes)
    Util.drawCylinders(points, state.cylinderMeshes, state.edges, 0.05)
}

export function animateConeProj3D(state, frameCount) {
    const frameTotal = 310
    const split = 110

    const currentFrame = frameCount%frameTotal

    if (currentFrame < split) {
        let z = Util.lerp(0, state.coneHeight, currentFrame/split)
        state.points[0][2] = z
        Util.drawSpherePoints(state.points, state.sphereMeshes)

        for (let i = 0; i < state.cylinderMeshes.length; i++) {
            state.cylinderMeshes[i].visible = false            
        }
    } else {
        //const localFrame = currentFrame - split
        //const localMax = frameTotal - split
        Util.drawSpherePoints(state.points, state.sphereMeshes)

        if (currentFrame%5 !== 0) {
            return
        }

        for (let i = 0; i < state.cylinderMeshes.length; i++) {
            if (state.cylinderMeshes[i].visible === false) {
                state.cylinderMeshes[i].visible = true
                return
            }                       
        }
    }

}