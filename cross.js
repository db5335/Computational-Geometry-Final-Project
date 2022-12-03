/*
 * Functions for cross products.
 *
 * Dominick Banasik
*/

function crossZ(u, v) {
    return u.x * v.y - v.x * u.y
}

function isLeftTurn(p, q, r) {
    let pq = {
        x: q.x - p.x,
        y: q.y - p.y
    }
    let qr = {
        x: r.x - q.x,
        y: r.y - q.y
    }

    return pq.x * qr.y > qr.x * pq.y
}

function isRightTurn(p, q, r) {
    let pq = {
        x: q.x - p.x,
        y: q.y - p.y
    }
    let qr = {
        x: r.x - q.x,
        y: r.y - q.y
    }

    return pq.x * qr.y < qr.x * pq.y
}