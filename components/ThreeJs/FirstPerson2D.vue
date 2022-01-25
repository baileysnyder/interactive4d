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
const projDistance = 1

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
function calcMinColor(color, minColorRatio) {
    return createColor(color.r/minColorRatio, color.g/minColorRatio, color.b/minColorRatio)
}

const squarePoints = [
    [20, 20],
    [50, 20],
    [50, 50],
    [20, 50],
]
const sqaureColor = createColor(255, 238, 86)
const squareLines = createLines(squarePoints, sqaureColor, calcMinColor(sqaureColor, minColorRatio))

const lineObject = new Line(60, 78, 90, 70)
const lineColor = createColor(20, 228, 243)
lineObject.setColors(lineColor, calcMinColor(lineColor, minColorRatio))

const trianglePoints = [
    [145, 80],
    [160, 59],
    [175, 80],
]
const triangleColor = createColor(243, 20, 20)
const triangleLines = createLines(trianglePoints, triangleColor, calcMinColor(triangleColor, 10))

const circleCenterX = 120
const circleCenterY = 30
const circleRadius = 18
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
    circlePoints[i][0] = circlePoints[i][0]*circleRadius + circleCenterX
    circlePoints[i][1] = circlePoints[i][1]*circleRadius + circleCenterY   
}

const circleColor = createColor(20, 243, 20)
const circleLines = createLines(circlePoints, circleColor, calcMinColor(circleColor, minColorRatio))

const wallPoints = [
    [0, 0],
    [gameWidth-1, 0],
    [gameWidth-1, gameHeight-1],
    [0, gameHeight-1]
]
const wallColor = createColor(100, 100, 100)
const wallLines = createLines(wallPoints, wallColor, calcMinColor(wallColor, minColorRatio))

const allLines = squareLines.concat(triangleLines).concat(lineObject).concat(circleLines).concat(wallLines)

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
    let newP2 = addVectors(scaleVector(deltaP, 2), playerPosition)

    let collisionLine = undefined
    let minDistance = gameWidth

    // can use angle with center point to determine which edge it's hitting for square and triangle
    // if collision distance is <= player radius then move along that edge

    for (const line of allLines) {
        let pos1Relative = subtractVectors(playerPosition, line.p1)
        let pos2Relative = subtractVectors(newP2, line.p1)
        let moveLine = new Line(pos1Relative[0], pos1Relative[1], pos2Relative[0], pos2Relative[1])
        let distance = checkCollision(0, line.getMagnitude(), -line.getAngle(), moveLine)
        if (distance < minDistance) {
            collisionLine = line
            minDistance = distance
        }
    }

    if (collisionLine){
        let moveVector = subtractVectors(newP, playerPosition)
        let a = getAngleBetween(moveVector, collisionLine.getVector())

        let sign = 1
        if (a > Math.PI/2) {
            a = Math.PI - a
            sign = -1
        }

        let magnitude = getVectorMagnitude(moveVector) * Math.cos(a) * sign
        let direction = normalizedVector(collisionLine.getVector())
        let v = scaleVector(direction, magnitude)
        newP = addVectors(playerPosition, v)
    }

    // get distance from y1 to line. divide by magnitude of position vector. compare these values between 


    if (newP[0] >= 0 && newP[0] < gameWidth-1) {
        playerPosition[0] = newP[0]
    }
    if (newP[1] >= 0 && newP[1] < gameHeight-1) {
        playerPosition[1] = newP[1]
    }
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

function checkCollision(minX, maxX, angle, lineToCheck) {
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