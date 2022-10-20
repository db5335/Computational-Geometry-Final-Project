const canvasWidth = 720
const canvasHeight = 720

const red = (255, 0, 0)
const green = (0, 255, 0)
const blue = (0, 0, 255)
const black = (0, 0, 0)

const pointSize = 10
const lineSize = 2
const radius = 200

let n = 40

let originalPoints = []
let rotatedPoints = []
let projectedPoints = []

let maxX = 0
let maxY = 0

let angleX = 0
let angleY = 0
let angleZ = 0

const sphereSketch = (p) => {
    pointToCoordinates = function(point) {
        return p.createVector(point.x, point.y, point.z)
    }

    p.setup = function() {
        p.createCanvas(canvasWidth, canvasHeight, p.WEBGL)
        p.noLoop()
    }

    p.draw = function() {
        p.background(200, 200, 200)
        p.noFill()

        p.rotateX(angleX)
        p.rotateY(angleY)
        p.rotateZ(angleZ)
     
        p.strokeWeight(lineSize)
        p.stroke(255, 0, 0)
        p.line(-2 * radius, 0, 0, 2 * radius, 0, 0)
        p.stroke(0, 0, 255)
        p.line(0, -2 * radius, 0, 0, 2 * radius, 0)
        p.stroke(0, 255, 0)
        p.line(0, 0, -2 * radius, 0, 0, 2 * radius)

        for (let i = 0; i < n; i++) {
            // let originalPoint = originalPoints[i]
            let rotatedPoint = rotatedPoints[i]

            p.strokeWeight(0)
            let n = rotatedPoint.point2d.neighborCount
            let neighbor = rotatedPoint.point2d.neighbors
            p.fill(rotatedPoint.color)
            for (let j = 0; j <= n; j++) {
                let c1 = rotatedPoint.findCenter(neighbor.point.point3d, neighbor.successor.point.point3d)
                let c2 = rotatedPoint.findCenter(neighbor.point.point3d, neighbor.predecessor.point.point3d)
                p.beginShape()
                p.vertex(c1.x, c1.y, c1.z)
                p.vertex(c2.x, c2.y, c2.z)
                p.vertex(rotatedPoint.x, rotatedPoint.y, rotatedPoint.z)
                p.endShape()
                neighbor = neighbor.successor
            }

            p.stroke(black)
            p.strokeWeight(2 * pointSize)
            p.point(rotatedPoint.x, rotatedPoint.y, rotatedPoint.z)
            p.stroke(rotatedPoint.color)
            p.strokeWeight(pointSize)
            p.point(rotatedPoint.x, rotatedPoint.y, rotatedPoint.z)
        }
    }
}

const projectionSketch = (p) => {
    pointToCoordinates = function(point) {
        return p.createVector(canvasWidth * point.x / maxX / 2.25, canvasHeight * point.y / maxY / 2.25)
    }

    p.setup = function() {
        p.createCanvas(canvasWidth, canvasHeight, p.WEBGL)
        p.background(200, 200, 200)
        p.line(0, canvasHeight / 2, 0, -canvasHeight / 2)
        p.line(canvasWidth / 2, 0, -canvasWidth / 2, 0)

        p.noLoop()
    }

    p.draw = function() {
        p.background(200, 200, 200)
        p.line(0, canvasHeight / 2, 0, -canvasHeight / 2)
        p.line(canvasWidth / 2, 0, -canvasWidth / 2, 0)

        p.stroke(0, 0, 0)
        for (let i = 0; i < n - 1; i++) {
            p.strokeWeight(pointSize)
            let projectedPoint = projectedPoints[i]
            p.stroke(projectedPoint.color)
            p.point(pointToCoordinates(projectedPoint))
            let node = projectedPoint.neighbors
            for (let j = 0; j < projectedPoint.neighborCount; j++) {
                p.strokeWeight(lineSize)
                p.stroke(0, 0, 0)
                let a = pointToCoordinates(projectedPoint)
                let b = pointToCoordinates(node)
                p.line(a.x, a.y, b.x, b.y)
                node = node.successor
            }
        }
    }
}

let p1 = new p5(sphereSketch, 'sphere')
let p2 = new p5(projectionSketch, 'projection')
generate(n)

function rotateX() {
    angleX += 0.1
    p1.redraw()
}

function rotateY() {
    angleY += 0.1
    p1.redraw()
}

function rotateZ() {
    angleZ += 0.1
    p1.redraw()
}

function generate(m) {
    n = m
    originalPoints = []
    rotatedPoints = []
    projectedPoints = []
    maxX = 0
    maxY = 0

    for (let i = 0; i < n; i++) {
        let color = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]
    
        let x = Math.random() - 0.5
        let y = Math.random() - 0.5
        let z = Math.random() - 0.5
        let dist = Math.sqrt(x * x + y * y + z * z)
        let point = new Point3d(i, radius * x / dist, radius * y / dist, radius * z / dist, color)
        
        originalPoints.push(point)
    }

    sphericalVoronoi()

    p2.redraw()
    p1.redraw()
}

function sphericalVoronoi() {
    let {theta, phi} = anglesToNorthPole(originalPoints[0])

    for (let i = 0; i < n; i++) {
        rotatedPoints.push(originalPoints[i].rotate(theta, phi))
    }

    for (let i = 1; i < n; i++) {
        projectedPoint = rotatedPoints[i].project()
        if (Math.abs(projectedPoint.x) > maxX) maxX = Math.abs(projectedPoint.x)
        if (Math.abs(projectedPoint.y) > maxY) maxY = Math.abs(projectedPoint.y)
        projectedPoints.push(projectedPoint)
    }

    if (maxX > maxY) maxY = maxX
    else maxX = maxY

    projectedPoints.sort((p1, p2) => {
        if (p1.x == p2.x) return p1.y - p2.y
        return p1.x - p2.x
    })

    let del = delaunay(projectedPoints)

    let inf = new Point2d(0, Infinity, Infinity, originalPoints[0].color, rotatedPoints[0])
    rotatedPoints[0].point2d = inf
    
    inf.neighbors = new PointNode(del.hull[0])
    inf.neighborCount = del.hull.length
    
    for (let i = 0; i < del.hull.length; i++) {
        let point = del.hull[i]
        let next = del.hull[(i + 1) % del.hull.length]
        let neighbor = point.neighbors
        while (neighbor.id != next.id) {
            neighbor = neighbor.successor
        }
        neighbor.insertBefore(new PointNode(inf))
        if (i > 0) inf.neighbors.insertAfter(new PointNode(del.hull[i]))
    }
}