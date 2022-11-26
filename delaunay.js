function delaunay(points, iterator) {
    let n = points.length

    let actions = []
    
    if (n <= 3) {
        iterator.iteration += 1
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < i; j++) {
                points[i].addNeighbor(points[j])
                points[j].addNeighbor(points[i])
                actions.push({from: points[i].id, to: points[j].id, add: 1})
            }
        }
        iterator.actions.push(actions)
        iterator.baseCase.push(true)
        iterator.tangents.push(false)
        return convexHull(points)
    }

    let hull1 = delaunay(points.slice(0, Math.floor(n / 2)), iterator)
    let hull2 = delaunay(points.slice(Math.floor(n / 2), n), iterator)

    let ut = upperCommonTangent(hull1, hull2)
    let lt = lowerCommonTangent(hull1, hull2)

    let ltl = hull1[lt.start]
    let ltr = hull2[lt.end]

    let utl = hull1[ut.end]
    let utr = hull2[ut.start]

    actions.push({from: ltr.id, to: ltl.id, add: 1})
    actions.push({from: utr.id, to: utl.id, add: 1})  

    iterator.iteration += 1
    iterator.actions.push(actions)
    iterator.baseCase.push(false)
    iterator.tangents.push(true)
  
    actions = []

    let first = true

    while (ltr.x != utr.x || ltr.y != utr.y || ltl.x != utl.x || ltl.y != utl.y) {
        let a = false
        let b = false

        let r = ltl.addNeighbor(ltr)
        let l = ltr.addNeighbor(ltl)

        if (!first) {
            actions.push({from: ltr.id, to: ltl.id, add: 1})
        } else {
            first = false
        }

        let r1 = l.predecessor
        if (isLeftTurn(l, r, r1)) {
            let r2 = r1.predecessor
            while (!qtest(r1, l, r, r2)) {
                if (ltr.neighborCount < 3) break

                ltr.deleteNeighbor(r1)
                r1.point.deleteNeighbor(ltr)
                actions.push({from: ltr.id, to: r1.id, add: -1})
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
                actions.push({from: l1.id, to: ltl.id, add: -1})
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
    actions.push({from: utr.id, to: utl.id, add: 1})

    let hull = []

    let i = ut.end
    let j = ut.start
    let m = lt.start
    n = lt.end

    if (m < i) m += hull1.length
    if (j < n) j += hull2.length

    for (let k = i; k <= m; k++) hull.push(hull1[k % hull1.length])
    for (let k = n; k <= j; k++) hull.push(hull2[k % hull2.length])

    iterator.iteration += 1
    iterator.actions.push(actions)
    iterator.baseCase.push(false)
    iterator.tangents.push(false)

    return hull
}