function convexHull(points) {
    let l = points.length

    hull = []

    if (l == 2) return points
    else if (l == 3) {
        if (isLeftTurn(points[0], points[1], points[2])) return points
        return [points[2], points[1], points[0]]
    }

    let left = convexHull(points.slice(0, Math.floor(l / 2)))
    let right = convexHull(points.slice(Math.floor(l / 2), l))

    let ut = upperCommonTangent(left, right)
    let lt = lowerCommonTangent(left, right)

    let i = ut.end
    let j = ut.start
    let m = lt.start
    let n = lt.end

    if (m < i) m += left.length
    if (j < n) j += right.length

    for (let k = i; k <= m; k++) hull.push(left[k % left.length])
    for (let k = n; k <= j; k++) hull.push(right[k % right.length])

    return hull
}