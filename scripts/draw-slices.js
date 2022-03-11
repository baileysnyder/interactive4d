import * as Util from './util'

export function drawCircleSlice(canvas, radius, color, planeWidth) {
    let ctx = canvas.getContext("2d")

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRadius = (radius/planeWidth)*squareLength

    ctx.beginPath()
    ctx.arc(canvas.width/2, canvas.height/2, canvasRadius, 0, 2*Math.PI)
    ctx.fillStyle=color;
    ctx.fill()
}

export function drawSolidCubeSlice(canvas, points, color, planeWidth) {
    if (points.length < 2) {
        return
    }

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=color
    ctx.beginPath();
    let startX = (canvas.width/2) + (points[0].point[0]*canvasRatio)
    let startY = (canvas.height/2) - (points[0].point[1]*canvasRatio)
    ctx.moveTo(startX, startY)
    for (let i = 1; i < points.length; i++) {
        let canvasX = (canvas.width/2) + (points[i].point[0]*canvasRatio)
        let canvasY = (canvas.height/2) - (points[i].point[1]*canvasRatio)
        ctx.lineTo(canvasX, canvasY)       
    }
    ctx.lineTo(startX, startY)
    ctx.fill()
}

export function drawEdgeCubeSlice(canvas, points, color, planeWidth) {
    if (points.length < 2) {
        return
    }

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let wCenter = (canvas.width/2)
    let hCenter = (canvas.height/2)

    let ctx = canvas.getContext("2d")
    ctx.lineWidth = 5
    ctx.lineCap = "round"
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath()

        let startX = wCenter + (points[i].point[0]*canvasRatio)
        let startY = hCenter - (points[i].point[1]*canvasRatio)
        ctx.moveTo(startX, startY)

        let nextIndex = i < points.length-1 ? i+1 : 0
        let endX = wCenter + (points[nextIndex].point[0]*canvasRatio)
        let endY = hCenter - (points[nextIndex].point[1]*canvasRatio)
        ctx.lineTo(endX, endY)

        if (points[i].edgeIndex < 4 && points[nextIndex].edgeIndex < 4) {
            ctx.strokeStyle=color           
        } else {
            ctx.strokeStyle="gray"
        }
        ctx.stroke()
    }
}

export function drawPoints(canvas, points, color, planeWidth) {
    if (points === undefined || points.length === 0) {
        return
    }
    
    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=color
    ctx.beginPath();
    let startX = (canvas.width/2) + (points[0][0]*canvasRatio)
    let startY = (canvas.height/2) - (points[0][1]*canvasRatio)
    ctx.moveTo(startX, startY)
    for (let i = 1; i < points.length; i++) {
        let canvasX = (canvas.width/2) + (points[i][0]*canvasRatio)
        let canvasY = (canvas.height/2) - (points[i][1]*canvasRatio)
        ctx.lineTo(canvasX, canvasY)       
    }
    ctx.lineTo(startX, startY)
    ctx.fill()
}

export function drawSolidEllipse(canvas, ellipse, color, planeWidth) {
    if (ellipse === undefined) {
        return
    }

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let canvasY1 = ellipse.y1*canvasRatio
    let canvasY2 = ellipse.y2*canvasRatio

    let a = Math.abs(canvasY1-canvasY2)/2
    let c = a*ellipse.eccentricity
    let b = Math.sqrt(Math.abs(c*c-a*a))

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=color
    ctx.beginPath();
    ctx.ellipse(canvas.width/2, (canvas.height/2) - ((canvasY1+canvasY2)/2), b, a, 0, 0, 2 * Math.PI);
    ctx.fill();
}

export function drawBaseCutoff(canvas, ellipse, planeColor, planeWidth) {
    if (ellipse === undefined || ellipse.baseCutY === undefined) {
        return
    }

    let squareLength = Math.min(canvas.width, canvas.height)
    let canvasRatio = squareLength/planeWidth
    let canvasCutY = (canvas.height/2) - (ellipse.baseCutY*canvasRatio)

    let ctx = canvas.getContext("2d")
    ctx.fillStyle=planeColor
    if (ellipse.isBaseCutUp) {
        ctx.fillRect(0, 0, canvas.width, canvasCutY)
    } else {
        ctx.fillRect(0, canvasCutY, canvas.width, canvas.height)
    }
}

export function drawSliceCanvas(canvas, color) {
    let ctx = canvas.getContext("2d")
    ctx.fillStyle=color;
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}