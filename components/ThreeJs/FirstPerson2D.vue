<template>
    <div>
        <canvas ref="canvas"></canvas>
        <p>To control with keyboard, move with WASD, rotate camera with Q and E keys.</p>
        <p>Otherwise you can move by interacting with these control sticks:</p>
        <p>Show Overhead View</p>
        <canvas ref="overheadCanvas"></canvas>
    </div>
</template>

<script>

let previousTimestamp = 0;
let interval = 1000/60;

export default {
    data() {
        return {
            
        }
    },
    props: {
        canvasSize: Object,
    },
    watch: {
        canvasSize: function(newD, oldD) {
            let width = newD.width
            let height = newD.height

            const canvas = this.$refs.canvas
            canvas.width = width
            canvas.height = height/3
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
        }
    },
    mounted() {
        const canvas = this.$refs.canvas
        canvas.width = this.canvasSize.width
        canvas.height = this.canvasSize.height * 0.4

        const ohCanvas = this.$refs.overheadCanvas
        ohCanvas.width = this.canvasSize.width
        ohCanvas.height = this.canvasSize.height * 0.3

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        this.animate(0)
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
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
let playerAngle = 0
let playerPosition = {x: 0, y: 0}

const moveSpeed = 1
const rotateSpeed = 0.05
const gameWidth = 200
const gameHeight = 100

const viewingAngle = Math.PI/2
const viewDistance = 100
const projDistance = 2

const squarePoints = [
    [20, 20],
    [50, 20],
    [50, 44],
    [20, 44],
]

function getLines(points) {
    let lines = []
    for (let i = 0; i < points.length; i++) {
        let j = i < points.length-1 ? i+1 : 0
        lines.push(new Line(points[i][0], points[i][1], points[j][0], points[j][1]))       
    }
    return lines
}

const squareLines = getLines(squarePoints)

const circleCenterX = 120
const circleCenterY = 30
const circleRadius = 30

const lineObject = new Line(60, 78, 90, 70)

const trianglePoints = [
    [145, 80],
    [160, 59],
    [175, 80],
]

const triangleLines = getLines(trianglePoints)

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
    let deltaAngle = 0
    if (pressedRotateL) {
        deltaAngle -= rotateSpeed
    }
    if (pressedRotateR) {
        deltaAngle += rotateSpeed
    }
    playerAngle += deltaAngle

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

    let deltaX = moveSpeed * Math.cos(angle)
    let deltaY = moveSpeed * Math.sin(angle)

    // check for collisions
    let newX = playerPosition.x + deltaX
    let newY = playerPosition.y + deltaY
    if (newX >= 0 && newX < gameWidth) {
        playerPosition.x = newX
    }
    if (newY >= 0 && newY < gameHeight) {
        playerPosition.y = newY
    }
}

function drawCanvas(canvas) {
    let ctx = canvas.getContext("2d")

    // Create gradient
    let grd = ctx.createLinearGradient(0, 0, 150, 0);

    grd.addColorStop(0, 'rgb(0, 0, 0)');
    grd.addColorStop(1, 'rgb(255, 255, 255)');
    
    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(10, 0, 150, canvas.height);
}

function drawOverheadCanvas(canvas) {
    let ctx = canvas.getContext("2d")
    ctx.fillStyle='black';
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let scaleX = canvas.width/gameWidth
    let scaleY = canvas.height/gameHeight

    let canvasX = playerPosition.x * scaleX
    let canvasY = playerPosition.y * scaleY

    ctx.beginPath()
    const playerRadius = 3
    ctx.arc(canvasX, canvasY, playerRadius, 0, 2*Math.PI)
    ctx.fillStyle='white';
    ctx.fill()

    let ccwAngle = playerAngle - (viewingAngle/2)
    let cwAngle = playerAngle + (viewingAngle/2)

    let lineLength = viewDistance / Math.cos(viewingAngle/2)
    let x1 = canvasX + ((lineLength * Math.cos(ccwAngle))*scaleX)
    let y1 = canvasY + ((lineLength * Math.sin(ccwAngle))*scaleY)

    let x2 = canvasX + ((lineLength * Math.cos(cwAngle))*scaleX)
    let y2 = canvasY + ((lineLength * Math.sin(cwAngle))*scaleY)

    let focalX = (x1+x2)/2
    let focalY = (y1+y2)/2

    let grd = ctx.createLinearGradient(canvasX, canvasY, focalX, focalY);

    grd.addColorStop(0, 'rgb(255, 255, 255)');
    grd.addColorStop(1, 'rgb(0, 0, 0)');
    ctx.fillStyle = grd;

    ctx.beginPath()
    ctx.moveTo(canvasX, canvasY)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(canvasX, canvasY)
    ctx.fill()

    ctx.strokeStyle = "white"

    squareLines.forEach(line => {
        drawGameLine(ctx, line, scaleX, scaleY)
    });

    ctx.beginPath()
    ctx.arc(circleCenterX*scaleX, circleCenterY*scaleY, circleRadius, 0, 2*Math.PI)
    ctx.stroke()

    drawGameLine(ctx, lineObject, scaleX, scaleY)

    triangleLines.forEach(line => {
        drawGameLine(ctx, line, scaleX, scaleY)
    });
}

function drawGameLine(context, line, scaleX, scaleY) {
    context.beginPath()
    context.moveTo(line.x1*scaleX, line.y1*scaleY)
    context.lineTo(line.x2*scaleX, line.y2*scaleY)
    context.stroke()
}
</script>

<style>

</style>