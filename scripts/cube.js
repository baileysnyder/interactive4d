import * as Util from './util'

export const edgeI = [
    [0, 1], //0
    [1, 4], //1
    [4, 2], //2
    [2, 0], //3
    [3, 6], //4
    [6, 7], //5
    [7, 5], //6
    [5, 3], //7
    [0, 3], //8
    [2, 5], //9
    [4, 7], //10
    [1, 6] //11
]

export const faceI = [
    [0, 1, 6, 3],
    [1, 6, 7, 4],
    [2, 4, 7, 5],
    [0, 2, 5, 3],
    [0, 1, 4, 2],
    [3, 5, 7, 6]
]

export const faceByEdgeI = [
    [0, 11, 4, 8],
    [11, 5, 10, 1],
    [2, 10, 6, 9],
    [3, 9, 7, 8],
    [0, 1, 2, 3],
    [7, 6, 5, 4]
]

export function calcCube(axes, scale, translate) {
    function addArr(...arrs) {
        let ret = []
        for (let i = 0; i < arrs[0].length; i++) {
            let val = 0
            for (let j = 0; j < arrs.length; j++) {
                val += arrs[j][i]            
            }
            ret.push(val)            
        }
        return ret
    }

    let cube = []
    cube.push([0, 0, 0]) //0
    for (let i = 0; i < 3; i++) {
        cube.push([])
        for (let j = 0; j < 3; j++) {
            cube[i+1].push(axes[i][j]) //1,2,3        
        }    
    }
    
    cube.push(addArr(axes[0], axes[1])) //4
    cube.push(addArr(axes[1], axes[2])) //5
    cube.push(addArr(axes[2], axes[0])) //6
    cube.push(addArr(axes[0], axes[1], axes[2])) //7

    for (let i = 0; i < cube.length; i++) {
        for (let j = 0; j < 3; j++) {
            cube[i][j] = cube[i][j] + translate[j]
        }       
    }

    for (let i = 0; i < cube.length; i++) {
        for (let j = 0; j < 3; j++) {
            cube[i][j] = cube[i][j]*scale
        }        
    }

    return cube
}

export function getCubePointsNormals(cube) {
    let facePoints = cubeFacePoints(cube)
    let origin = Util.getCenterOfPoints(cube)
    let points = []
    let normals = []
    for (let i = 0; i < facePoints.length; i++) {
        let normal = Util.getFaceNormal(facePoints[i], origin)
        Util.sortFacePointsFromNormal(facePoints[i], normal, facePoints[i])
        let verts = Util.triangulateSortedFace(facePoints[i])
        points.push(...verts)
        for (let k = 0; k < verts.length/3; k++) {
            normals.push(...normal)            
        }
    }
    return {points, normals}
}

export function getFacePointsNormals(cube, facePoints) {
    let origin = Util.getCenterOfPoints(cube)
    let points = []
    let normals = []

    let normal = Util.getFaceNormal(facePoints, origin)
    Util.sortFacePointsFromNormal(facePoints, normal, facePoints)
    let verts = Util.triangulateSortedFace(facePoints)
    points.push(...verts)
    for (let k = 0; k < verts.length/3; k++) {
        normals.push(...normal)            
    }
    return {points, normals}
}

export function cubeFacePoints(cube) {
    let points = []
    for (let i = 0; i < faceI.length; i++) {
        points.push([])
        for (let j = 0; j < faceI[i].length; j++) {
            let pIndex = faceI[i][j]
            let p = cube[pIndex]
            points[i].push([p[0], p[1], p[2]])
        }        
    }
    return points
}