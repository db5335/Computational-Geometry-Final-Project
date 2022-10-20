function delaunay(points) {
    let n = points.length

    let triangulation = []
    
    if (n <= 3) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i == j) continue
                points[i].addNeighbor(points[j])
            }
            triangulation.push(points[i])
        }
        return {
            triangulation,
            hull: convexHull(points)
        }
    }

    let d1 = delaunay(points.slice(0, Math.floor(n / 2)))
    let d2 = delaunay(points.slice(Math.floor(n / 2), n))

    let hull1 = d1.hull
    let hull2 = d2.hull

    let ut = upperCommonTangent(hull1, hull2)
    let lt = lowerCommonTangent(hull1, hull2)

    let ltl = hull1[lt.start]
    let ltr = hull2[lt.end]

    let utl = hull1[ut.end]
    let utr = hull2[ut.start]

    while (ltr.x != utr.x || ltr.y != utr.y || ltl.x != utl.x || ltl.y != utl.y) {
        let a = false
        let b = false

        let r = ltl.addNeighbor(ltr)
        let l = ltr.addNeighbor(ltl)

        let r1 = l.predecessor
        if (isLeftTurn(l, r, r1)) {
            let r2 = r1.predecessor
            while (!qtest(r1, l, r, r2)) {
                if (ltr.neighborCount < 3) break

                ltr.deleteNeighbor(r1)
                r1.point.deleteNeighbor(ltr)
                r1 = r2
                r2 = r2.predecessor
            }
        } else a = true

        let l1 = r.successor
        if (isRightTurn(r, l, l1)) {
            let l2 = l1.successor
            while (!qtest(l, r, l1, l2)) {
                if (ltl.neighborCount < 3) break

                ltl.deleteNeighbor(l1)
                l1.point.deleteNeighbor(ltl)
                l1 = l2
                l2 = l2.successor
            }
        } else b = true

        if (a) ltl = l1.point
        else if (b) ltr = r1.point
        else if (qtest(l, r, r1, l1)) ltr = r1.point
        else ltl = l1.point
    }

    utl.addNeighbor(utr)
    utr.addNeighbor(utl)

    let hull = []

    let i = ut.end
    let j = ut.start
    let m = lt.start
    n = lt.end

    if (m < i) m += hull1.length
    if (j < n) j += hull2.length

    for (let k = i; k <= m; k++) hull.push(hull1[k % hull1.length])
    for (let k = n; k <= j; k++) hull.push(hull2[k % hull2.length])

    triangulation = d1.triangulation.concat(d2.triangulation)

    return {triangulation, hull}
}