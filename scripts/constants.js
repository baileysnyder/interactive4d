export const scenes = {
    three: {
        sliceHypercube: 0,
        projHypercube: 1,
        sliceHypersphere: 2,
        projHypersphere: 3,
        sliceCone: 4,
        projCone: 5,
        axesWithCube: 6,
        axis1D: 7,
        axis2D: 8,
        axis3D: 9,
        rotateAxisPlane: 10,
        rotate3D: 11,
        rotate4D: 12,
        sphereSliceAnim: 13,
        sphereOutlineRadius: 14,
        sphereSlicesLined: 15
    },
    firstperson2d: {
        firstperson2d: 100
    },
    threeandcanvas: {
        sphere: 200,
        solidCube: 201,
        edgeCube: 202,
        cone: 203,
        sideView2D: 204,
        projCube: 205,
        projEdgeCube: 206,
        projSphere: 207,
        projSpherePoints: 208
    }
}

export const navPages = [
    {title: 'INTRODUCTION', path: '/'},
    {title: 'THINKING IN DIMENSIONS', path: '/dimensions'},
    {title: '2D UNIVERSE', path: '/2d-universe'},
    {title: 'PLANES OF ROTATION', path: '/rotations'},
    {title: '3D SLICES', path: '/3d-slices'},
    {title: '3D PROJECTION', path: '/3d-projection'},
    {title: '4D SPHERES', path: '/4d-spheres'},
    {title: '4D CONES AND MORE', path: '/4d-cones'},
]

export const coneColor = '#F31414'
export const projCylColor = '#62DDE5'
export const projPointColor = '#D2F3F5'
export const axisColors = [
    '#c12020',
    '#31c120',
    '#203bc1',
    '#e8da1b'
]

export const navigationWidth = 250
export const headerFooterHeight = 150

export const projectionSphereRadius = 0.09