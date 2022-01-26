<template>
    <div id="fp-container">
        <canvas ref="canvas"></canvas>
        <!-- <p>To control with keyboard, move with WASD, rotate camera with Q and E keys.</p>
        <p>Otherwise you can move by interacting with these control sticks:</p>
        <p>Toggle Overhead View</p> -->
        <canvas ref="overheadCanvas"></canvas>
    </div>
</template>

<script>

let previousTimestamp = 0;
let interval = 1000/60;

export default {
    data() {
        return {
            canvasPercentH: 0.5,
            overheadCanvasPercentH: 0.3
        }
    },
    props: {
        canvasSize: Object,
    },
    watch: {
        canvasSize: function(newD, oldD) {
            let width = newD.width
            let height = newD.height

            this.updateCanvases(width, height)
            const canvas = this.$refs.canvas
            const overheadCanvas = this.$refs.overheadCanvas
            drawCanvas(canvas)
            drawOverheadCanvas(overheadCanvas)
        },
        angleXW: function() {
            this.objectNeedsUpdate = true
        },
        angleYW: function() {
            this.objectNeedsUpdate = true
        },
        angleZW: function() {
            this.objectNeedsUpdate = true
        },
        translateW: function() {
            this.objectNeedsUpdate = true
        },
    },
    methods: {
        animate(timestamp) {
            let delta = timestamp - previousTimestamp
            if (delta >= interval) {
                const canvas = this.$refs.canvas
                const overheadCanvas = this.$refs.overheadCanvas

                updatePlayerPosition()
                drawCanvas(canvas)
                drawOverheadCanvas(overheadCanvas)

                previousTimestamp = timestamp
            }
            requestAnimationFrame(this.animate);
        },
        updateCanvases(width, height) {
            const canvas = this.$refs.canvas
            canvas.width = width
            canvas.height = height*this.canvasPercentH

            const overheadCanvas = this.$refs.overheadCanvas
            overheadCanvas.width = 2*height*this.overheadCanvasPercentH
            overheadCanvas.height = height*this.overheadCanvasPercentH
        }
    },
    mounted() {
        this.updateCanvases(this.canvasSize.width, this.canvasSize.height)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        this.animate(0)
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.p1 = [x1, y1]
        this.p2 = [x2, y2]
    }

    setColors(maxColor, minColor) {
        this.maxColor = maxColor
        this.minColor = minColor
    }

    getAngle() {
        if (!this.angle) {
            let v = this.getVector()
            this.angle = Math.atan2(v[1], v[0])
        }
        return this.angle
    }

    getMagnitude() {
        if (!this.magnitude) {
            let v = this.getVector()
            this.magnitude = getVectorMagnitude(v)
        }
        return this.magnitude
    }

    // arbitrarily using p2-p1 instead of p1-p2. Need to keep in mind when using.
    getVector() {
        if (!this.vector) {
            this.vector = subtractVectors(this.p2, this.p1)
        }
        return this.vector
    }

    getPerpendicularVector() {
        if (!this.perpendicularVector) {
            this.perpendicularVector = [this.getVector()[1], -this.getVector()[0]]
        }
        return this.perpendicularVector
    }
}

let pressedUp = false
let pressedLeft = false
let pressedDown = false
let pressedRight = false

let pressedRotateL = false
let pressedRotateR = false

// 0 is facing in positive x direction
// Positive rotation is clockwise
let playerAngle = 5.4
let playerPosition = [32.3, 86.7]

const moveSpeed = 1
const rotateSpeed = 0.05
const gameWidth = 200
const gameHeight = 100

const viewingAngle = Math.PI/2
const viewDistance = 50
const projDistance = 0.5

function createLines(points, maxColor, minColor) {
    let lines = []
    for (let i = 0; i < points.length; i++) {
        let j = i < points.length-1 ? i+1 : 0
        let line = new Line(points[i][0], points[i][1], points[j][0], points[j][1])
        line.setColors(maxColor, minColor)
        lines.push(line)
    }
    return lines
}

function createColor(r, g, b) {
    return {r, g, b}
}

const minColorRatio = 13
function calcMinColor(color, ratio) {
    return createColor(color.r/ratio, color.g/ratio, color.b/ratio)
}

let squareLines
let lineObject
let triangleLines
let circleLines
let wallLines

const circleRadius = 17
const circleCenter = [120, 33]
const collisionWidth = 2
const circleColliderR = circleRadius+collisionWidth
let squareCollider
let triangleCollider
let lineColliderR // storing it rotated to do less math on collision check

initShapes()
const allLines = squareLines.concat(triangleLines).concat(lineObject).concat(circleLines).concat(wallLines)

function initShapes() {
    const squarePoints = [
        [20, 22],
        [50, 22],
        [50, 52],
        [20, 52],
    ]
    const sqaureColor = createColor(255, 238, 86)
    squareLines = createLines(squarePoints, sqaureColor, calcMinColor(sqaureColor, minColorRatio))
    squareCollider = {
        minX: squarePoints[0][0]-collisionWidth,
        maxX: squarePoints[1][0]+collisionWidth,
        minY: squarePoints[0][1]-collisionWidth,
        maxY: squarePoints[2][1]+collisionWidth
    }

    lineObject = new Line(60, 74, 90, 66)
    const lineColor = createColor(20, 228, 243)
    lineObject.setColors(lineColor, calcMinColor(lineColor, minColorRatio))
    const lineCollisionWidth = 1.5
    lineColliderR = {
        minX: 0,
        maxX: lineObject.getMagnitude(),
        minY: -lineCollisionWidth/2,
        maxY: lineCollisionWidth/2
    }

    const tLineLen = 30
    const tLineHalfLen = tLineLen/2
    const tStart = [150, 82]
    const trianglePoints = [
        [tStart[0], tStart[1]],
        [tStart[0]+tLineHalfLen, tStart[1] - Math.sqrt(tLineLen*tLineLen - tLineHalfLen*tLineHalfLen)], //pythagorean
        [tStart[0]+tLineLen, tStart[1]],
    ]
    const triangleColor = createColor(243, 20, 20)
    triangleLines = createLines(trianglePoints, triangleColor, calcMinColor(triangleColor, 10))
    triangleCollider = {
        minX: trianglePoints[0][0]-collisionWidth,
        maxX: trianglePoints[2][0]+collisionWidth,
        minY: trianglePoints[1][1]-collisionWidth,
        maxY: trianglePoints[0][1]+collisionWidth
    }

    // points calculated from unit circle
    let circlePoints = [
        [1.0, 0.0],
        [0.9807852804032304, 0.19509032201612825],
        [0.9238795325112867, 0.3826834323650898],
        [0.8314696123025452, 0.5555702330196022],
        [0.7071067811865476, 0.7071067811865476],
        [0.5555702330196023, 0.8314696123025452],
        [0.38268343236508984, 0.9238795325112867],
        [0.19509032201612833, 0.9807852804032304],
        [0, 1.0],
        [-0.1950903220161282, 0.9807852804032304],
        [-0.3826834323650897, 0.9238795325112867],
        [-0.555570233019602, 0.8314696123025453],
        [-0.7071067811865475, 0.7071067811865476],
        [-0.8314696123025453, 0.5555702330196022],
        [-0.9238795325112867, 0.3826834323650899],
        [-0.9807852804032304, 0.1950903220161286],
        [-1.0, 0],
        [-0.9807852804032304, -0.19509032201612836],
        [-0.9238795325112868, -0.38268343236508967],
        [-0.8314696123025455, -0.555570233019602],
        [-0.7071067811865477, -0.7071067811865475],
        [-0.5555702330196022, -0.8314696123025452],
        [-0.38268343236509034, -0.9238795325112865],
        [-0.19509032201612866, -0.9807852804032303],
        [0, -1.0],
        [0.1950903220161283, -0.9807852804032304],
        [0.38268343236509, -0.9238795325112866],
        [0.5555702330196018, -0.8314696123025455],
        [0.7071067811865474, -0.7071067811865477],
        [0.8314696123025452, -0.5555702330196022],
        [0.9238795325112865, -0.3826834323650904],
        [0.9807852804032303, -0.19509032201612872],
    ]
    for (let i = 0; i < circlePoints.length; i++) {
        circlePoints[i][0] = circlePoints[i][0]*circleRadius + circleCenter[0]
        circlePoints[i][1] = circlePoints[i][1]*circleRadius + circleCenter[1]
    }
    const circleColor = createColor(20, 243, 20)
    circleLines = createLines(circlePoints, circleColor, calcMinColor(circleColor, minColorRatio))

    const wallPoints = [
        [0, 0],
        [gameWidth-1, 0],
        [gameWidth-1, gameHeight-1],
        [0, gameHeight-1]
    ]
    const wallColor = createColor(100, 100, 100)
    wallLines = createLines(wallPoints, wallColor, calcMinColor(wallColor, minColorRatio))
}


function onKeyDown(e) {
    setKeyVariable(e.keyCode, true)
}

function onKeyUp(e) {
    setKeyVariable(e.keyCode, false)
}

function setKeyVariable(code, isPressing) {
    if (code === 87) {
        pressedUp = isPressing
    } else if (code === 65) {
        pressedLeft = isPressing
    } else if (code === 83) {
        pressedDown = isPressing
    } else if (code === 68) {
        pressedRight = isPressing
    } else if (code === 81) {
        pressedRotateL = isPressing
    } else if (code === 69) {
        pressedRotateR = isPressing
    }
}

function updatePlayerPosition() {
    let deltaR = 0
    if (pressedRotateL) {
        deltaR -= rotateSpeed
    }
    if (pressedRotateR) {
        deltaR += rotateSpeed
    }
    playerAngle += deltaR

    if (playerAngle > 2*Math.PI) {
        playerAngle -= 2*Math.PI
    } else if (playerAngle < 0) {
        playerAngle += 2*Math.PI
    }

    let ySign = 0
    if (pressedUp && !pressedDown) {
        ySign = 1
    } else if (!pressedUp && pressedDown) {
        ySign = -1
    }

    let xSign = 0
    if (pressedRight && !pressedLeft) {
        xSign = 1
    } else if (!pressedRight && pressedLeft) {
        xSign = -1
    }

    if (ySign === 0 && xSign === 0) {
        return
    }

    let angle = playerAngle
    if (ySign === 1 && xSign === 0) {
        angle += 0
    } else if (ySign === 1 && xSign === 1) {
        angle += Math.PI/4
    } else if (ySign === 0 && xSign === 1) {
        angle += Math.PI/2
    } else if (ySign === -1 && xSign === 1) {
        angle += (3*Math.PI)/4
    } else if (ySign === -1 && xSign === 0) {
        angle += Math.PI
    } else if (ySign === -1 && xSign === -1) {
        angle += (5*Math.PI)/4
    } else if (ySign === 0 && xSign === -1) {
        angle += (3*Math.PI)/2
    } else if (ySign === 1 && xSign === -1) {
        angle += (7*Math.PI)/4
    }

    let deltaP = [moveSpeed * Math.cos(angle), moveSpeed * Math.sin(angle)]
    let newP = addVectors(deltaP, playerPosition)

    let moveLine = new Line(playerPosition[0], playerPosition[1], newP[0], newP[1])
    let collisionFunctions = [checkSquareCollision, checkTriangleCollision, checkCircleCollision, checkLineBoxCollision]
    for (const cf of collisionFunctions) {
        let adjustedEndpoint = cf(moveLine)
        if (adjustedEndpoint) {
            newP = adjustedEndpoint
            break
        }
    }

    if (newP[0] >= collisionWidth && newP[0] < gameWidth-1-collisionWidth) {
        playerPosition[0] = newP[0]
    }
    if (newP[1] >= collisionWidth && newP[1] < gameHeight-1-collisionWidth) {
        playerPosition[1] = newP[1]
    }
}

function checkSquareCollision(moveLine) {
    if (moveLine.p2[0] <= squareCollider.minX || moveLine.p2[0] >= squareCollider.maxX ||
        moveLine.p2[1] <= squareCollider.minY || moveLine.p2[1] >= squareCollider.maxY) {
        return undefined
    }

    let p = moveLine.p2

    if (moveLine.p1[0] <= squareCollider.minX) {
        p[0] = squareCollider.minX
    } else if (moveLine.p1[0] >= squareCollider.maxX) {
        p[0] = squareCollider.maxX
    } else if (moveLine.p1[1] <= squareCollider.minY) {
        p[1] = squareCollider.minY
    } else if (moveLine.p1[1] >= squareCollider.maxY) {
        p[1] = squareCollider.maxY
    }

    return p
}

function checkTriangleCollision(moveLine) {
    // check if in square surrounding triangle
    if (moveLine.p2[0] <= triangleCollider.minX || moveLine.p2[0] >= triangleCollider.maxX ||
        moveLine.p2[1] <= triangleCollider.minY || moveLine.p2[1] >= triangleCollider.maxY) {
        return undefined
    }

    // bottom line
    if (moveLine.p1[1] >= triangleCollider.maxY) {
        return [moveLine.p2[0], triangleCollider.maxY]
    }

    // assuming equilateral triangle
    let deltaY = triangleCollider.maxY - moveLine.p2[1]
    let deltaX = deltaY*Math.tan(Math.PI/6)

    let minX = triangleCollider.minX + deltaX
    let maxX = triangleCollider.maxX - deltaX

    if (moveLine.p2[0] <= minX || moveLine.p2[0] >= maxX) {
        return undefined
    }

    let midPoint = minX + ((maxX-minX)/2)
    let edgeVector
    if (moveLine.p1[0] <= midPoint) {
        edgeVector = triangleLines[0].getVector()
    } else if (moveLine.p1[0] > midPoint) {
        edgeVector = triangleLines[1].getVector()
    }

    let v = calcMovementAlongLine(moveLine.getVector(), edgeVector)
    return addVectors(moveLine.p1, v)
}

function checkCircleCollision(moveLine) {
    let endV = subtractVectors(moveLine.p2, circleCenter)
    if (getVectorMagnitude(endV) >= circleColliderR) {
        return undefined
    }

    let startV = subtractVectors(moveLine.p1, circleCenter)
    let perpendicularV = [startV[1], -startV[0]]

    let v = calcMovementAlongLine(moveLine.getVector(), perpendicularV)
    return addVectors(moveLine.p1, v)
}

function checkLineBoxCollision(moveLine) {
    let angle = lineObject.getAngle()
    let endRelative = subtractVectors(moveLine.p2, lineObject.p1)

    let y = getYAfterRotate(endRelative, -angle)
    if (y < lineColliderR.minY || y > lineColliderR.maxY) {
        return
    }

    let x = getXAfterRotate(endRelative, -angle)   
    if (x < lineColliderR.minX || x > lineColliderR.maxX) {
        return
    }

    let startRelative = subtractVectors(moveLine.p1, lineObject.p1)
    let startX = getXAfterRotate(startRelative, -angle)    

    let v
    if (startX <= lineColliderR.minX || startX >= lineColliderR.maxX) {
        v = calcMovementAlongLine(moveLine.getVector(), lineObject.getPerpendicularVector())
    } else {
        v = calcMovementAlongLine(moveLine.getVector(), lineObject.getVector())
    }

    return addVectors(moveLine.p1, v)
}

function calcMovementAlongLine(moveVector, lineVector) {
    let a = getAngleBetween(moveVector, lineVector)

    let sign = 1
    if (a > Math.PI/2) {
        a = Math.PI - a
        sign = -1
    }

    let magnitude = getVectorMagnitude(moveVector) * Math.cos(a) * sign
    let direction = normalizedVector(lineVector)
    let v = scaleVector(direction, magnitude)
    return v
}

function normalizedVector(v) {
    let mag = getVectorMagnitude(v)
    let u = []

    if (mag > 0) {
        for (let i = 0; i < v.length; i++) {
            u.push(v[i] / mag)
        }
    }
    return u
}

function getPointAtAngle(startingPosition, lineLength, angle) {
    let x = startingPosition[0] + (lineLength * Math.cos(angle))
    let y = startingPosition[1] + (lineLength * Math.sin(angle))
    return [x, y]
}

function clamp(num, min, max){
    return Math.min(Math.max(num, min), max);
}

function drawCanvas(canvas) {
    let ctx = canvas.getContext("2d")

    let ccwAngle = playerAngle - (viewingAngle/2)
    let cwAngle = playerAngle + (viewingAngle/2)

    let edgeLength = viewDistance / Math.cos(viewingAngle/2)
    let ccwPoint = getPointAtAngle(playerPosition, edgeLength, ccwAngle)
    let cwPoint = getPointAtAngle(playerPosition, edgeLength, cwAngle)

    let farCenterPoint = [(ccwPoint[0]+cwPoint[0])/2, (ccwPoint[1]+cwPoint[1])/2]
    let theta0Vector = subtractVectors(farCenterPoint, playerPosition)
    let ccwVector = subtractVectors(ccwPoint, playerPosition)
    let cwVector = subtractVectors(cwPoint, playerPosition)

    let projPlaneEdgeDistance = projDistance / Math.cos(viewingAngle/2)
    let projCcwPoint = getPointAtAngle([0, 0], projPlaneEdgeDistance, ccwAngle)
    let projCwPoint = getPointAtAngle([0, 0], projPlaneEdgeDistance, cwAngle)

    let projPlaneLength = projDistance * Math.tan(viewingAngle/2) * 2

    let image = ctx.createImageData(canvas.width, canvas.height)
    for (let i = 3; i < image.data.length; i+=4) {
        image.data[i] = 255     
    }

    let canvasDistances = []

    //let line = lineObject
    allLines.forEach(line => {
        let relativeLine = new Line(line.p1[0]-playerPosition[0], line.p1[1]-playerPosition[1], line.p2[0]-playerPosition[0], line.p2[1]-playerPosition[1])
        let projDistances = []
        let angle = getAngleBetween(relativeLine.p1, theta0Vector)
        if (angle <= viewingAngle/2) {
            let d = project2Dto1D(relativeLine.p1, angle, projPlaneLength/2, canvas.width)
            if (d) {
                projDistances.push(d)
            }
        }

        angle = getAngleBetween(relativeLine.p2, theta0Vector)
        if (angle <= viewingAngle/2) {
            let d = project2Dto1D(relativeLine.p2, angle, projPlaneLength/2, canvas.width)
            if (d) {
                projDistances.push(d)
            }
        }

        // There should be 2 points to project for every line
        if (projDistances.length < 2) do {
            let projLine = new Line(projCcwPoint[0], projCcwPoint[1], projCwPoint[0], projCwPoint[1])
            let projIntersect = getIntersectionProjPlane(playerAngle, relativeLine, projPlaneLength)
            if (projIntersect) {
                let ratio = projIntersect / projPlaneLength
                let proj = {canvasX: Math.round(ratio*canvas.width), distance: 0}
                projDistances.push(proj)
            }

            if (projDistances.length === 2) {
                break;
            }

            let ccwLine = new Line(projCcwPoint[0], projCcwPoint[1], ccwVector[0], ccwVector[1])
            let ccwIntersect = getIntersectionEdgeLine(ccwLine, ccwAngle, relativeLine)
            if (ccwIntersect) {
                let proj = {canvasX: 0, distance: ccwIntersect}
                projDistances.push(proj)
            }           

            if (projDistances.length === 2) {
                break;
            }

            let cwLine = new Line(projCwPoint[0], projCwPoint[1], cwVector[0], cwVector[1])
            let cwIntersect = getIntersectionEdgeLine(cwLine, cwAngle, relativeLine)
            if (cwIntersect) {
                let proj = {canvasX: canvas.width-1, distance: cwIntersect}
                projDistances.push(proj)
            }
        } while (false)

        if (projDistances.length === 2) {
            drawGradient(projDistances[0], projDistances[1], line.maxColor, line.minColor, canvas, image.data, canvasDistances)
        }
    });

    ctx.putImageData(image, 0, 0)
}

function checkLineCollision(minX, maxX, angle, lineToCheck) {
    let y1 = getYAfterRotate(lineToCheck.p1, angle)
    let y2 = getYAfterRotate(lineToCheck.p2, angle)

    if (!(y1 >= 0 && y2 <= 0) && !(y2 >= 0 && y1 <= 0)) {
        return undefined
    }

    let d1 = getXAfterRotate(lineToCheck.p1, angle)
    //let d2 = getXAfterRotate(lineToCheck.p2, angle)
    //let intersect = (d1+d2)/2

    if (d1 < minX || d1 > maxX) {
        return undefined
    }

    let distance = Math.abs(y1)
    return distance
}

// assumes lineToRotate has shorter point before longer
function getIntersectionEdgeLine(lineToRotate, angle, lineToCheck) {
    let y1 = getYAfterRotate(lineToCheck.p1, -angle)
    let y2 = getYAfterRotate(lineToCheck.p2, -angle)

    if (!(y1 >= 0 && y2 <= 0) && !(y2 >= 0 && y1 <= 0)) {
        return undefined
    }

    let d1 = getXAfterRotate(lineToCheck.p1, -angle)
    let d2 = getXAfterRotate(lineToCheck.p2, -angle)

    let ratio = y1/(y1-y2)
    let intersect = lerp(d1, d2, ratio)

    let min = getXAfterRotate(lineToRotate.p1, -angle)
    let max = getXAfterRotate(lineToRotate.p2, -angle)

    if (intersect < min) {
        return undefined
    }

    return intersect
}

function getIntersectionProjPlane(angle, lineToCheck, projPlaneLength) {
    let x1 = getXAfterRotate(lineToCheck.p1, -angle)
    let x2 = getXAfterRotate(lineToCheck.p2, -angle)

    if (!(x1 >= projDistance && x2 <= projDistance) && !(x2 >= projDistance && x1 <= projDistance)) {
        return undefined
    }

    let y1 = getYAfterRotate(lineToCheck.p1, -angle)
    let y2 = getYAfterRotate(lineToCheck.p2, -angle)

    let ratio = (projDistance-x1)/(x2-x1)
    let intersect = lerp(y1, y2, ratio)

    let min = -projPlaneLength/2
    let max = projPlaneLength/2

    if (intersect < min || intersect > max) {
        return undefined
    }

    return intersect - min
}

function getXAfterRotate(point, angle) {
    return point[0]*Math.cos(angle) - point[1]*Math.sin(angle)
}

function getYAfterRotate(point, angle) {
    return point[0]*Math.sin(angle) + point[1]*Math.cos(angle)
}

function project2Dto1D(vectorFromPlayer, angle, projPlaneHalfLength, canvasWidth) {
    let distance = getVectorMagnitude(vectorFromPlayer)
    let dProj = projDistance / Math.cos(angle)
    if (distance < dProj) {
        return undefined
    }
    let s = dProj / distance
    let scaled = scaleVector(vectorFromPlayer, s)

    // rotate projection plane to be in line with y axis
    let proj1D = getYAfterRotate(scaled, -playerAngle)
    proj1D = clamp(proj1D, -projPlaneHalfLength, projPlaneHalfLength)
    let t = (proj1D + projPlaneHalfLength) / (projPlaneHalfLength*2)

    let canvasX = Math.round(t*(canvasWidth-1))
    distance -= dProj
    return {canvasX, distance}
}

function lerp(a, b, t) {
    if (t == 0)
        return a;
    else if (t == 1)
        return b;

    return a * (1 - t) + b * t;
}

function lerpColor(c1, c2, t) {
    let r = lerp(c1.r, c2.r, t)
    let g = lerp(c1.g, c2.g, t)
    let b = lerp(c1.b, c2.b, t)

    return createColor(r, g, b)
}

function distanceToColor(distance, maxColor, minColor) {
    let clampD = clamp(distance, 0, viewDistance-projDistance)
    let t = clampD / (viewDistance-projDistance)

    return lerpColor(maxColor, minColor, t)
}

function drawGradient(p1, p2, maxColor, minColor, canvas, imageData, canvasDistances) {
    let start = p1.canvasX < p2.canvasX ? p1 : p2
    let end = p1.canvasX > p2.canvasX ? p1 : p2
    let totalDistance = 1 + end.canvasX - start.canvasX

    let gradientStart = distanceToColor(start.distance, maxColor, minColor)
    let gradientEnd = distanceToColor(end.distance, maxColor, minColor)
    for (let x = start.canvasX; x <= end.canvasX; x++) {
        let t = (x - start.canvasX)/totalDistance

        let distance = lerp(start.distance, end.distance, t)
        if (canvasDistances[x] < distance){
            continue;
        }

        canvasDistances[x] = distance

        let c = lerpColor(gradientStart, gradientEnd, t)
        
        for (let y = 0; y < canvas.height; y++) {
            let index = 4*(canvas.width*y + x)
            imageData[index] = c.r
            imageData[index+1] = c.g
            imageData[index+2] = c.b      
        }
    }
}

function dotProduct(u, v) {
    if (u.length !== v.length) {
        throw new Error('Dot product vectors must be the same length')
    }
    let dot = 0
    for (let i = 0; i < u.length; i++) {
        dot += u[i] * v[i]
    }
    return dot;
}

function getVectorMagnitude(v) {
    let mag = 0
    for (let i = 0; i < v.length; i++) {
        mag += v[i] * v[i]
    }
    return Math.sqrt(mag)
}

function getAngleBetween(v1, v2) {
    let dot = dotProduct(v1, v2)
    return Math.acos(dot / (getVectorMagnitude(v1)*getVectorMagnitude(v2)))
}

function get360AngleBetween(v1, v2) {
    let dot = dotProduct(v1, v2)
    let det = determinant2D(v1, v2)

    return Math.atan2(det, dot)
}

function determinant2D(v, u) {
    return v[0]*u[1] - v[1]*u[0]
}

function scaleVector(u, scalar) {
    let v = []
    for (let i = 0; i < u.length; i++) {
        v.push(u[i]*scalar)
    }
    return v
}

function scaleVectorInplace(u, scalar) {
    for (let i = 0; i < u.length; i++) {
        u[i] = u[i]*scalar
    }
}

function addVectorInplace(u, v) {
    for (let i = 0; i < u.length; i++) {
        u[i] += v[i]   
    }
}

function addVectors(u, v) {
    let w = []
    for (let i = 0; i < u.length; i++) {
        w.push(u[i] + v[i])   
    }
    return w
}

function subtractVectors(vDommy, vSub){
    if (vDommy.length !== vSub.length) {
        throw new Error('Vector dimensions must match')
    }

    let vNew = []
    for (let i = 0; i < vDommy.length; i++) {
        vNew.push(vDommy[i] - vSub[i])
    }
    return vNew
}

function drawOverheadCanvas(canvas) {
    let ctx = canvas.getContext("2d")
    ctx.fillStyle='black';
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let scaleX = canvas.width/(gameWidth-1)
    let scaleY = canvas.height/(gameHeight-1)

    let canvasX = playerPosition[0] * scaleX
    let canvasY = playerPosition[1] * scaleY

    ctx.beginPath()
    const playerRadius = 3
    ctx.arc(canvasX, canvasY, playerRadius, 0, 2*Math.PI)
    ctx.fillStyle='white';
    ctx.fill()

    let ccwAngle = playerAngle - (viewingAngle/2)
    let cwAngle = playerAngle + (viewingAngle/2)

    let lineLength = viewDistance / Math.cos(viewingAngle/2)
    let x1 = canvasX + (lineLength * Math.cos(ccwAngle)*scaleX)
    let y1 = canvasY + (lineLength * Math.sin(ccwAngle)*scaleY)

    let x2 = canvasX + (lineLength * Math.cos(cwAngle)*scaleX)
    let y2 = canvasY + (lineLength * Math.sin(cwAngle)*scaleY)

    // The gradient angle can differ from the playerAngle when moving from game space to canvas space
    // Find projection of the character vector onto hypotenuse to get the angle for the gradient
    let vectorHyp = [x2-x1,y2-y1]
    let vectorPlayer = [canvasX-x1, canvasY-y1]

    let scaleAmount = dotProduct(vectorHyp, vectorPlayer)/dotProduct(vectorHyp, vectorHyp)
    scaleVectorInplace(vectorHyp, scaleAmount)
    addVectorInplace(vectorHyp, [x1, y1])

    //ctx.beginPath()
    //ctx.arc(vectorHyp[0], vectorHyp[1], 5, 0, 2*Math.PI)
    //ctx.fillStyle='white';
    //ctx.fill()

    let grd = ctx.createLinearGradient(canvasX, canvasY, vectorHyp[0], vectorHyp[1]);

    grd.addColorStop(0, 'rgb(255, 255, 255)');
    grd.addColorStop(1, 'rgb(0, 0, 0)');
    ctx.fillStyle = grd;

    ctx.beginPath()
    ctx.moveTo(canvasX, canvasY)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(canvasX, canvasY)
    ctx.fill()

    allLines.forEach(line => {
        drawGameLine(ctx, line, scaleX, scaleY)
    })
}

function drawGameLine(context, line, scaleX, scaleY) {
    context.strokeStyle = "rgb(" + line.maxColor.r + ", " + line.maxColor.g + ", " + line.maxColor.b + ")"
    context.beginPath()
    context.moveTo(line.p1[0]*scaleX, line.p1[1]*scaleY)
    context.lineTo(line.p2[0]*scaleX, line.p2[1]*scaleY)
    context.stroke()
}
</script>

<style>

#fp-container {
    text-align: center;
}

</style>