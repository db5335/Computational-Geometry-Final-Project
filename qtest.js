/*
 * Function for performing the incircle test.
 *
 * Dominick Banasik
*/

function intersection(m1, p1, m2, p2) {
    if (m1.x == 0) {
        return {
            x: p1.x,
            y: (m2.y / m2.x) * (p1.x - p2.x) + p2.y
        }
    } else if (m2.x == 0) {
        return {
            x: p2.x,
            y: (m1.y / m1.x) * (p2.x - p1.x) + p1.y
        }
    }

    let s1 = m1.y / m1.x
    let s2 = m2.y / m2.x
    let x = (p2.y - p1.y + s1 * p1.x - s2 * p2.x) / (s1 - s2)
    return {
        x,
        y: s1 * (x - p1.x) + p1.y
    }
}

function qtest(h, i, j, k) {
    let hi = {
        x: i.x - h.x,
        y: i.y - h.y
    }
    let ij = {
        x: j.x - i.x,
        y: j.y - i.y
    }

    let hiBi = {
        x: -hi.y,
        y: hi.x
    }
    let ijBi = {
        x: -ij.y,
        y: ij.x
    }

    let hiMid = {
        x: (h.x + i.x) / 2,
        y: (h.y + i.y) / 2
    }
    let ijMid = {
        x: (i.x + j.x) / 2,
        y: (i.y + j.y) / 2
    }

    let c = intersection(hiBi, hiMid, ijBi, ijMid)
    let r = Math.sqrt((c.x - h.x) * (c.x - h.x) + (c.y - h.y) * (c.y - h.y))

    return Math.sqrt((c.x - k.x) * (c.x - k.x) + (c.y - k.y) * (c.y - k.y)) >= r
}