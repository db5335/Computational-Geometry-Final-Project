const canvasWidth = 720
const canvasHeight = 720

const red = (255, 0, 0)
const green = (0, 255, 0)
const blue = (0, 0, 255)
const black = (0, 0, 0)

const pointSize = 10
const lineSize = 2
const radius = /*200*/ 1

const phases = {
    'originalPoints': 0,
    'rotatedPoints': 1,
    'projectedPoints': 2,
    'delaunay': 3,
    'hull': 4,
    'voronoi': 5
}

let n = 25

let originalPoints = []
let originalPointFeatures = []

let rotatedPoints = []
let rotatedPointFeatures = []
let rotatedCircleFeatures = []
let rotatedLineFeatures = []

let rotationPoint = null

let projectedPoints = []
let unsortedProjectedPoints = []

let iterator = {
    iteration: 0,
    baseCase: [],
    actions: []
}
let from = []
let to = []

let addedLines = []
let addedLineFeatures = []
let remainingLines = []
let remainingLineFeatures = []
let deletedLines = []
let deletedLineFeatures = []

let hullLineFeatures = []
let connectLineFeatures = []

let neighborFeatures = []
let circumcircleFeatures = []
let voronoiPointFeatures = []
let voronoiEdgeFeatures = []
let voronoiCellFeatures = []

let maxX = 0
let maxY = 0

let angleX = 0
let angleY = 0
let angleZ = 0

let shell = false

let step = 0

let firstSteps = [0, 1, n + 1]
let lastSteps = [0, n, 2 * n - 1]

function first() {
    if (step != 0) {
        step = 0
        rerender()
        rehighlight()
    }
}

function previousStage() {
    if (step > 0) {
        for (let i = firstSteps.length - 1; i >= 0; i--) {
            if (firstSteps[i] < step) {
                step = firstSteps[i]
                rerender()
                rehighlight()
                break
            }
        }
    }
}

function previous() {
    if (step > 0) {
        step -= 1
        rerender()
        rehighlight()
    }
}

function next() {
    console.log('here')
    if (step < lastSteps[lastSteps.length - 1]) {
        step += 1
        rerender()
        rehighlight()
    }
}

function nextStage() {
    if (step < lastSteps[lastSteps.length - 1]) {
        for (let i = 0; i < lastSteps.length; i++) {
            if (firstSteps[i] > step) {
                step = firstSteps[i]
                rerender()
                rehighlight()
                break
            }
        }
    }
}

function last() {
    if (step < lastSteps[lastSteps.length - 1]) {
        step = lastSteps[lastSteps.length - 1]
        rerender()
        rehighlight()
    }
}

function generate(m) {
    n = m

    originalPoints = []
    originalPointFeatures = []

    rotatedPoints = []
    rotatedPointFeatures = []
    rotatedCircleFeatures = []
    rotatedLineFeatures = []

    projectedPoints = []
    unsortedProjectedPoints = []

    iterator = {
        iteration: 0,
        baseCase: [],
        actions: []
    }

    addedLines = []
    addedLineFeatures = []
    remainingLines = []
    remainingLineFeatures = []
    deletedLines = []
    deletedLineFeatures = []

    hullLineFeatures = []
    connectLineFeatures = []

    neighborFeatures = []
    circumcircleFeatures = []
    voronoiPointFeatures = []
    voronoiCellFeatures = []

    maxX = 0
    maxY = 0

    for (let i = 0; i < n; i++) {
        let color = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]
    
        let x = Math.random() - 0.5
        let y = Math.random() - 0.5
        let z = Math.random() - 0.5
        let dist = Math.sqrt(x * x + y * y + z * z)

        while (dist > 0.5) {
            x = Math.random() - 0.5
            y = Math.random() - 0.5
            z = Math.random() - 0.5
            dist = Math.sqrt(x * x + y * y + z * z)
        }

        let point = new Point3d(i, radius * x / dist, radius * y / dist, radius * z / dist, color)
        
        originalPoints.push(point)
        originalPointFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [point.long, point.lat]
            },
            rgb: point.rgb
        })
    }

    sphericalVoronoi()

    p2.redraw()
    p1.redraw()
}

function sphericalVoronoi() {
    let {theta, phi} = anglesToNorthPole(originalPoints[0])

    let temp = originalPoints[1].rotate(theta, phi)
    console.log(temp)

    let a = {
        x: originalPoints[0].x - 0,
        y: originalPoints[0].y - 0,
        z: originalPoints[0].z - 1
    }
    let b = {
        x: originalPoints[1].x - temp.x,
        y: originalPoints[1].y - temp.y,
        z: originalPoints[1].z - temp.z
    }
    let c = {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    }
    let dist = Math.sqrt(c.x * c.x + c.y * c.y + c.z * c.z)

    rotationPoint = new Point3d(-1, c.x / dist, c.y / dist, c.z / dist, null)

    for (let i = 0; i < n; i++) {
        let original = originalPoints[i]
        let point = original.rotate(theta, phi)

        rotatedPoints.push(point)
        point.original = originalPoints[i]

        rotatedPointFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [point.long, point.lat]
            },
            rgb: point.rgb
        })

        let long = rotationPoint.long
        let lat = rotationPoint.lat

        let phi1 = Math.PI * point.lat / 180
        let phi2 = Math.PI * lat / 180
        let lambda = Math.PI * Math.abs(long - point.long) / 180
        let rad = 180 * Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(lambda)) / Math.PI

        if (rad > 90) {
            rad = 180 - rad
            long = -Math.sign(long) * (180 - Math.abs(long))
            lat = -lat
        }

        rotatedCircleFeatures.push({
            type: 'Feature',
            geometry: circle.center([long, lat]).radius(rad)([long, lat], rad),
            rgb: point.rgb
        })
        console.log(rotatedCircleFeatures[i].geometry.coordinates[0])

        rotatedLineFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[point.long, point.lat], [original.long, original.lat]]
            },
            rgb: point.rgb
        })
    }

    for (let i = 1; i < n; i++) {
        projectedPoint = rotatedPoints[i].project()
        if (Math.abs(projectedPoint.x) > maxX) maxX = Math.abs(projectedPoint.x)
        if (Math.abs(projectedPoint.y) > maxY) maxY = Math.abs(projectedPoint.y)
        unsortedProjectedPoints.push(projectedPoint)
        projectedPoints.push(projectedPoint)
    }

    if (maxX > maxY) maxY = maxX
    else maxX = maxY

    rescale()

    projectedPoints.sort((p1, p2) => {
        if (p1.x == p2.x) return p1.y - p2.y
        return p1.x - p2.x
    })

    let del = delaunay(projectedPoints, iterator)

    let inf = new Point2d(0, Infinity, Infinity, originalPoints[0].color, rotatedPoints[0])
    rotatedPoints[0].point2d = inf
    
    inf.neighbors = new PointNode(del[0])
    inf.neighborCount = del.length
    
    for (let i = 0; i < del.length; i++) {
        let point = del[i]
        let next = del[(i + 1) % del.length]
        let neighbor = point.neighbors
        while (neighbor.id != next.id) {
            neighbor = neighbor.successor
        }
        neighbor.insertBefore(new PointNode(inf))
        if (i > 0) inf.neighbors.insertAfter(new PointNode(del[i]))

        hullLineFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[originalPoints[point.id].long, originalPoints[point.id].lat], [originalPoints[next.id].long, originalPoints[next.id].lat]]
            }
        })

        connectLineFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[originalPoints[0].long, originalPoints[0].lat], [originalPoints[point.id].long, originalPoints[point.id].lat]]
            }
        })
    }

    from = []
    to = []
    for (let i = 0; i < n - 1; i++) {
        from.push([])
        to.push([])
        for (let j = 0; j < n - 1; j++) {
            from[i].push(-1)
            to[i].push(-1)
        }
    }

    let i = 0;
    for (let i = 0; i <= iterator.iteration; i++) {
        newAddedLines = []
        newAddedLineFeatures = []
        newRemainingLines = []
        newRemainingLineFeatures = []
        newDeletedLines = []
        newDeletedLineFeatures = []
        
        if (i < iterator.iteration){
            for (let action of iterator.actions[i]) {
                let from = unsortedProjectedPoints[action.from - 1]
                let to = unsortedProjectedPoints[action.to - 1]
                let from3d = originalPoints[action.from]
                let to3d = originalPoints[action.to]
    
                let newLine = {
                    x1: to.x,
                    x2: from.x,
                    y1: to.y,
                    y2: from.y,
                    from,
                    to
                }

                let newLineFeature = {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[from3d.long, from3d.lat], [to3d.long, to3d.lat]]
                    }
                }

                if (action.add == 1) {
                    newAddedLines.push(newLine)
                    newAddedLineFeatures.push(newLineFeature)
                } else {
                    newDeletedLines.push(newLine)
                    newDeletedLineFeatures.push(newLineFeature)
                }
            }
        }

        if (i > 0) {
            let lines = remainingLines[i - 1].concat(addedLines[i - 1])
            let lineFeatures = remainingLineFeatures[i - 1].concat(addedLineFeatures[i - 1])
            for (let j = 0; j < lines.length; j++) {
                let remainingLine = lines[j]
                let remains = true
                for (let deletedLine of newDeletedLines) {
                    if ((remainingLine.from == deletedLine.from && remainingLine.to == deletedLine.to)
                            || (remainingLine.from == deletedLine.to && remainingLine.to == deletedLine.from)) {
                        remains = false
                        break
                    }
                }
                if (remains) {
                    newRemainingLines.push(remainingLine)
                    newRemainingLineFeatures.push(lineFeatures[j])
                }
            }
        }

        addedLines.push(newAddedLines)
        addedLineFeatures.push(newAddedLineFeatures)
        remainingLines.push(newRemainingLines)
        remainingLineFeatures.push(newRemainingLineFeatures)
        deletedLines.push(newDeletedLines)
        deletedLineFeatures.push(newDeletedLineFeatures)
    }

    for (let i = 0; i < iterator.iteration; i++) {
        let actions = iterator.actions[i]
        for (let action of actions) {
            if (action.add == 1) {
                from[action.from - 1][action.to - 1] = i
                from[action.to - 1][action.from - 1] = i
            } else {
                to[action.from - 1][action.to - 1] = i
                to[action.to - 1][action.from - 1] = i
            }
        }
    }

    let vertices = 0

    for (let i = 0; i < n; i++) {
        // let originalPoint = originalPoints[i]
        let rotatedPoint = rotatedPoints[i]
        let o = originalPoints[i]

        let neighborCount = rotatedPoint.point2d.neighborCount
        let neighbor = rotatedPoint.point2d.neighbors

        let voronoiPoints = []
        voronoiPointFeatures.push([])
        voronoiEdgeFeatures.push([])

        for (let j = 0; j <= neighborCount; j++) {
            let next = neighbor.successor
            let p = neighbor.point.point3d.original
            let q = next.point.point3d.original

            let circumcenter = o.findCenter(p, q)
            o.vertices.push(circumcenter)

            voronoiPoints.push([circumcenter.long, circumcenter.lat])
            voronoiPointFeatures[i].push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [circumcenter.long, circumcenter.lat]
                }
            })
            
            if (j > 0) {
                voronoiEdgeFeatures[i].push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [voronoiPoints[j - 1], [circumcenter.long, circumcenter.lat]]
                    }
                })
            }

            if (o.id < p.id && o.id < q.id && j != neighborCount) {
                vertices += 1

                neighborFeatures.push({
                    type: 'Feature',
                    geometry: {
                        type: 'MultiLineString',
                        coordinates: [
                            [[o.long, o.lat], [p.long, p.lat]],
                            [[p.long, p.lat], [q.long, q.lat]],
                            [[q.long, q.lat], [o.long, o.lat]]
                        ]
                    },
                    id: o.id,
                    n: j
                })

                let phi1 = Math.PI * o.lat / 180
                let phi2 = Math.PI * circumcenter.lat / 180
                let lambda = Math.PI * Math.abs(circumcenter.long - o.long) / 180
                let rad = 180 * Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(lambda)) / Math.PI

                circumcircleFeatures.push({
                    type: 'Feature',
                    geometry: circle.center([circumcenter.long, circumcenter.lat]).radius(rad)([circumcenter.long, circumcenter.lat], rad),
                    rgba: o.rgba
                })
            }
            neighbor = next
        }

        voronoiPoints.push(voronoiPoints[0])
        console.log(voronoiPoints.length)
        voronoiCellFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [voronoiPoints]
            },
            rgb: o.rgb
        })
    }

    let startPhase = {from: 0, to: 0}
    let rotatedPhase = {from: 1, to: n}
    let projectedPhase = rotatedPhase/*{
        from: rotatedPhase.to + 1,
        to: rotatedPhase.to + n - 1
    }*/
    let delaunayPhase = {
        from: projectedPhase.to + 1,
        to: projectedPhase.to + iterator.iteration + 1
    }
    let hullPhase = {
        from: delaunayPhase.to + 1,
        to: delaunayPhase.to + del.length + 1
    }
    let voronoiPhase = {
        from: hullPhase.to + 1,
        to: hullPhase.to + vertices + 1
    }

    firstSteps = [startPhase.from, rotatedPhase.from, projectedPhase.from, delaunayPhase.from, hullPhase.from, voronoiPhase.from]
    lastSteps = [startPhase.to, rotatedPhase.to, projectedPhase.to, delaunayPhase.to, hullPhase.to, voronoiPhase.to]
    step = lastSteps[lastSteps.length - 1]

    rerender()
    rehighlight()
}