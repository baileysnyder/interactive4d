import { Vector3 } from "three"

export function subtractVectors(vDommy, vSub){
    if (vDommy.length !== vSub.length) {
        throw new Error('Vector dimensions must match')
    }

    let vNew = []
    for (let i = 0; i < vDommy.length; i++) {
        vNew.push(vDommy[i] - vSub[i])
    }
    return vNew
}

export function getVectorMagnitude(v) {
    let mag = 0
    for (let i = 0; i < v.length; i++) {
        mag += v[i] * v[i]
    }
    return Math.sqrt(mag)
}

export function distanceBetweenPoints(p1, p2) {
    let v = subtractVectors(p1, p2)
    return getVectorMagnitude(v)
}

export function normalizeVector(v) {
    let mag = getVectorMagnitude(v)

    if (mag > 0) {
        for (let i = 0; i < v.length; i++) {
            v[i] = v[i] / mag
        }
    }
}

export function getNormalizedVector(v) {
    let u = []
    let mag = getVectorMagnitude(v)

    if (mag > 0) {
        for (let i = 0; i < v.length; i++) {
            u.push(v[i] / mag)
        }
    }
    return u
}

export function getArbitraryPerpendicularVector3D([x, y, z]) {
  let result = [0,0,0]

  if (x == 0 || y == 0 || z == 0) {
    if (x == 0)
      result[0] = 1;
    else if (y == 0)
      result[1] = 1;
    else
      result[2] = 1;
  }
  else {
    // If xyz is all set, we set the z coordinate as first and second argument .
    // As the dot product must be zero, we add the negated sum of x and y as third argument
    result[0] = z;      // z*x
    result[1] = z;      // z*x + z*y
    result[2] = -(x+y); // z*x + z*y - z(x+y) = z*(x+y) - z*(x+y) = 0
  }
  return result;
}

export function crossProduct(v, u) {
    let p = [];
    p.push((v[1]*u[2]) - (v[2]*u[1]))
    p.push((v[2]*u[0]) - (v[0]*u[2]))
    p.push((v[0]*u[1]) - (v[1]*u[0]))
    return p
}

export function addVectorInplace(u, v) {
    for (let i = 0; i < u.length; i++) {
        u[i] += v[i]   
    }
}

export function scaleVectorInplace(u, scalar) {
    for (let i = 0; i < u.length; i++) {
        u[i] = u[i]*scalar
    }
}

export function dotProduct(u, v) {
    if (u.length !== v.length) {
        throw new Error('Dot product vectors must be the same length')
    }
    let dot = 0
    for (let i = 0; i < u.length; i++) {
        dot += u[i] * v[i]
    }
    return dot;
}

export function getSphereIntersectionRadius(parentRadius, distance) {
    if (distance >= parentRadius) {
        return 0
    }

    return Math.sqrt((parentRadius*parentRadius) - (distance*distance))
}

export function lerp(a, b, t) {
    if (t == 0)
        return a;
    else if (t == 1)
        return b;

    return a * (1 - t) + b * t;
}

export function multiplyMatrices(a, b) {
   if (!Array.isArray(a) || !Array.isArray(b)) {
      throw new Error('arguments should be arrays');
   }
   let x = a.length,
   z = a[0].length,
   y = b[0].length;
   if (b.length !== z) {
      // XxZ & ZxY => XxY
      throw new Error('number of columns in the first matrix should be the same as the number of rows in the second');
   }
   let productRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
   let product = new Array(x);
   for (let p = 0; p < x; p++) {
      product[p] = productRow.slice();
   }
   for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
         for (let k = 0; k < z; k++) {
            product[i][j] += a[i][k] * b[k][j];
         }
      }
   }
   return product;
}

export function multiplyMatrixVector(m, v) {
    if (!Array.isArray(m) || !Array.isArray(v)) {
      throw new Error('arguments should be arrays')
    }
    if (m[0].length !== v.length) {
        throw new Error('number of columns in the matrix should be the same as the number values in the vector')
    }

    let newV = []
    for (let i = 0; i < m.length; i++) {
        let val = 0
        for (let j = 0; j < v.length; j++) {
            val += m[i][j]*v[j]
        }
        newV.push(val)
    }
    return newV
}

export function vectorToMatrix(vec){
    let m = [];
    for (let i = 0; i < vec.length; i++) {
        m[i] = [vec[i]];
    }
    return m;
}

export function addVectors(u, v) {
    let w = []
    for (let i = 0; i < u.length; i++) {
        w.push(u[i] + v[i])   
    }
    return w
}

export function scaleVector(u, scalar) {
    let v = []
    for (let i = 0; i < u.length; i++) {
        v.push(u[i]*scalar)
    }
    return v
}

export function get360AngleBetween(v1, v2) {
    let dot = dotProduct(v1, v2)
    let det = determinant2D(v1, v2)

    return Math.atan2(det, dot)
}

export function determinant2D(v, u) {
    return v[0]*u[1] - v[1]*u[0]
}

export function getAngleBetween(v1, v2) {
    let dot = dotProduct(v1, v2)
    return Math.acos(dot / (getVectorMagnitude(v1)*getVectorMagnitude(v2)))
}

export function clamp(num, min, max){
    return Math.min(Math.max(num, min), max);
}

export function printThreeVertices(geometry) {
    let arr = geometry.getAttribute('position').array
    let vectors = []
    for (let i = 0; i < arr.length; i+=3) {
        let v = new Vector3(arr[i], arr[i+1], arr[i+2])
        vectors.push(v)
    }
    console.log(vectors)
}

export function getCenterOfPoints(points) {
    if (points[0] == null) {
        return []
    }
    
    let centerPoint = []
    for (let i = 0; i < points[0].length; i++) {
        centerPoint.push(0)
    }
    
    for (let i = 0; i < points.length; i++) {
        addVectorInplace(centerPoint, points[i])
    }
    scaleVectorInplace(centerPoint, 1/points.length)
    return centerPoint
}

export function bubbleSortParallel(compareArray, ...otherArrays) {
    for (const arr of otherArrays) {
        if (arr.length !== compareArray.length) {
            throw new Error('Compare and other array must be same length')
        }
    }

    for (let i = 0; i < compareArray.length-1; i++) {
        for (let j = 0; j < compareArray.length-i-1; j++) {
            if (compareArray[j] > compareArray[j+1]) {
                swap(compareArray,j,j+1);
                for (const arr of otherArrays) {
                    swap(arr,j,j+1);
                }               
            }
        }
    }
}

function swap(arr, x, y) {
    let temp = arr[x];
    arr[x] = arr[y];
    arr[y] = temp;
}

// posAngleVector should be perpendicular to u
export function calcAngleBetweenVectors(u, v, posAngleVector) {
    let dot = dotProduct(u, v)
    let uMag = getVectorMagnitude(u)
    let vMag = getVectorMagnitude(v)

    let cosTheta = dot / (uMag * vMag)
    let angle = Math.acos(cosTheta)

    if (dotProduct(v, posAngleVector) < 0) {
        angle = (2*Math.PI) - angle
    }
    return angle
}

function removeThreejsMesh(scene, mesh) {
    if (!mesh || mesh === []) {
        return
    }

    scene.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
}

export function removeThreeJsObjects(scene, ...arr) {
    for (const o of arr) {
        if (Object.prototype.toString.call(o) === '[object Array]') {
            for (const m of o) {
                removeThreejsMesh(scene, m)
            }
        } else {
            removeThreejsMesh(scene, o)
        }
    }
}

export function triangulateSortedFace(sortedPoints) {
    let  trianglePoints = []
    for (let i = 1; i < sortedPoints.length-1; i++) {
        trianglePoints.push(...sortedPoints[0])
        trianglePoints.push(...sortedPoints[i])
        trianglePoints.push(...sortedPoints[i+1])
    }

    return trianglePoints
}


// 4D transformations //

function get4DRotationMatrix(angleXW, angleYW, angleZW) {
    const rotationXW = [
        [Math.cos(angleXW), 0, 0, Math.sin(angleXW)],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [-Math.sin(angleXW), 0, 0, Math.cos(angleXW)]
    ];

    const rotationYW = [
        [1, 0, 0, 0],
        [0, Math.cos(angleYW), 0, -1*Math.sin(angleYW)],
        [0, 0, 1, 0],
        [0, Math.sin(angleYW), 0, Math.cos(angleYW)]
    ];

    const rotationZW = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, Math.cos(angleZW), -1*Math.sin(angleZW)],
        [0, 0, Math.sin(angleZW), Math.cos(angleZW)]
    ];

    let m = multiplyMatrices(rotationXW, rotationYW)
    return multiplyMatrices(m, rotationZW)
}

export function rotate4D(points, angleXW, angleYW, angleZW) {
    let m = get4DRotationMatrix(angleXW, angleYW, angleZW)    

    let rotated = []
    for (let i = 0; i < points.length; i++){
        let v = vectorToMatrix(points[i]);
        v = multiplyMatrices(m, v);

        // Turn matrices back to numbers
        rotated.push([v[0][0], v[1][0], v[2][0], v[3][0]])
    }

    return rotated
}

export function project4DTo3D(rotatedPoints, projectionDistance, scaleFactor) {
    const scale = [
        [scaleFactor, 0, 0, 0],
        [0, scaleFactor, 0, 0],
        [0, 0, scaleFactor, 0],
        [0, 0, 0, scaleFactor]
    ];

    let finalPoints = []
    for (let i = 0; i < rotatedPoints.length; i++){
        let workingVector = vectorToMatrix(rotatedPoints[i]);

        let w = 1 / (projectionDistance - workingVector[3][0]);
        const projectionMatrix = [
            [w, 0, 0, 0],
            [0, w, 0, 0],
            [0, 0, w, 0]
        ];

        workingVector = multiplyMatrices(scale, workingVector)

        // From 4D to 3D
        let projected3d = multiplyMatrices(projectionMatrix, workingVector)

        // Turn matrices back to numbers
        finalPoints[i] = [projected3d[0][0], projected3d[1][0], projected3d[2][0]]
    }
    return finalPoints
}


// drawing ThreeJS objects //

export function drawSpherePoints(points, sphereMeshes) {
    for (let i = 0; i < sphereMeshes.length; i++){
        if (i < points.length) {
            sphereMeshes[i].visible = true
            sphereMeshes[i].position.set(points[i][0], points[i][1], points[i][2])
        } else {
            sphereMeshes[i].visible = false
        }
    }
}

// pre-calculated from unit circle
// Needs to be defined on the two axes orthogonal to the cylinder height
const baseCirclePoints = [
    [0, 0, 1],
    [0, 0.3826834323650898, 0.9238795325112867],
    [0, 0.7071067811865476, 0.7071067811865476],
    [0, 0.9238795325112867, 0.38268343236508984],
    [0, 1, 0],
    [0, 0.9238795325112867, -0.3826834323650897],
    [0, 0.7071067811865476, -0.7071067811865475],
    [0, 0.3826834323650899, -0.9238795325112867],
    [0, 0, -1],
    [0, -0.38268343236508967, -0.9238795325112868],
    [0, -0.7071067811865475, -0.7071067811865477],
    [0, -0.9238795325112865, -0.38268343236509034],
    [0, -1, 0],
    [0, -0.9238795325112866, 0.38268343236509],
    [0, -0.7071067811865477, 0.7071067811865474],
    [0, -0.3826834323650904, 0.9238795325112865],
    [0, 0, 1],
]

export function drawCylinders(points, meshes, edgeIndices, scaleFactor) {
    for (let i = 0; i < edgeIndices.length; i++) {
        let endpoint1 = points[edgeIndices[i][0]]
        let endpoint2 = points[edgeIndices[i][1]]

        // This axis used for cylinder height
        let xAxis = subtractVectors(endpoint2, endpoint1)
        normalizeVector(xAxis)

        let yAxis = getArbitraryPerpendicularVector3D(xAxis)
        normalizeVector(yAxis)

        let zAxis = crossProduct(xAxis, yAxis)
        normalizeVector(zAxis)

        let rotation = [
            [xAxis[0], yAxis[0], zAxis[0], 0],
            [xAxis[1], yAxis[1], zAxis[1], 0],
            [xAxis[2], yAxis[2], zAxis[2], 0],
            [0, 0, 0, 1]
        ]

        let translation1 = [
            [1, 0, 0, endpoint1[0]],
            [0, 1, 0, endpoint1[1]],
            [0, 0, 1, endpoint1[2]],
            [0, 0, 0, 1],
        ]

        let translation2 = [
            [1, 0, 0, endpoint2[0]],
            [0, 1, 0, endpoint2[1]],
            [0, 0, 1, endpoint2[2]],
            [0, 0, 0, 1],
        ]

        let scale = [
            [scaleFactor, 0, 0, 0],
            [0, scaleFactor, 0, 0],
            [0, 0, scaleFactor, 0],
            [0, 0, 0, 1],
        ]

        let m1 = multiplyMatrices(translation1, scale)        
        let m2 = multiplyMatrices(translation2, scale)

        let vArray = meshes[i].geometry.getAttribute('position').array
        let nArray = meshes[i].geometry.getAttribute('normal').array

        let rotatedPoints = []
        for (let j = 0; j < baseCirclePoints.length; j++) {
            let r = vectorToMatrix([...baseCirclePoints[j], 1])
            r = multiplyMatrices(rotation, r)
            rotatedPoints.push(r)

            let v = multiplyMatrices(m1, r)
            vArray[j*3] = v[0][0]
            vArray[j*3 + 1] = v[1][0]
            vArray[j*3 + 2] = v[2][0]

            let n = [r[0][0], r[1][0], r[2][0]]
            normalizeVector(n)
            nArray[j*3] = n[0]
            nArray[j*3 + 1] = n[1]
            nArray[j*3 + 2] = n[2]
        }

        let startIndex =  (vArray.length / 2)
        for (let j = 0; j < baseCirclePoints.length; j++) {
            let v = multiplyMatrices(m2, rotatedPoints[j])
            vArray[startIndex + (j*3)] = v[0][0]
            vArray[startIndex + (j*3) + 1] = v[1][0]
            vArray[startIndex + (j*3) + 2] = v[2][0]

            nArray[startIndex + (j*3)] = nArray[j*3]
            nArray[startIndex + (j*3) + 1] = nArray[j*3 + 1]
            nArray[startIndex + (j*3) + 2] = nArray[j*3 + 2]
        }

        meshes[i].geometry.attributes.normal.needsUpdate = true
        meshes[i].geometry.attributes.position.needsUpdate = true
    }
}