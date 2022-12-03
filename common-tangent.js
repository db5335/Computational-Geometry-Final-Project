/*
 * Functions for finding the upper and lower common tangents
 * for divide-and-conquer convex hulls.
 * 
 * Dominick Banasik
*/

function upperCommonTangent(left, right) {
    let l = left.length
    let r = right.length
    
    let i = 0
    let p = left[0]
    for (let k = 1; k < l; k++) {
        if (left[k].x > p.x) {
            i = k
            p = left[k]
        }
    }

    let j = 0
    let q = right[0]
    for (let k = 1; k < r; k++) {
        if (right[k].x < q.x) {
            j = k
            q = right[k]
        }
    }


    while (isLeftTurn(left[(i + 1) % l], p, q) || isLeftTurn(p, q, right[(j - 1 + r) % r])) {
        if (isLeftTurn(left[(i + 1) % l], p, q)) {
            i = (i + 1) % l
            p = left[i]
        } else {
            j = (j - 1 + r) % r
            q = right[j]
        }
    }

    return {start: j, end: i}
}

function lowerCommonTangent(left, right) {
    let l = left.length
    let r = right.length
    
    let i = 0
    let p = left[0]
    for (let k = 1; k < l; k++) {
        if (left[k].x > p.x) {
            i = k
            p = left[k]
        }
    }

    let j = 0
    let q = right[0]
    for (let k = 1; k < r; k++) {
        if (right[k].x < q.x) {
            j = k
            q = right[k]
        }
    }


    while (isRightTurn(left[(i - 1 + l) % l], p, q) || isRightTurn(p, q, right[(j + 1) % r])) {
        if (isRightTurn(left[(i - 1 + l) % l], p, q)) {
            i = (i - 1 + l) % l
            p = left[i]
        } else {
            j = (j + 1) % r
            q = right[j]
        }
    }

    return {start: i, end: j}
}