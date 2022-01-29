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
   if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) {
      throw new Error('arguments should be in 2-dimensional array format');
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