/*
 * Function for rotating a point to the north pole.
 *
 * Dominick Banasik
*/

function anglesToNorthPole(point) {
    let theta = Math.PI / 2
    let x = point.x
    let y = point.y
    let z = point.z

    if (x != 0) {
        theta = -Math.atan(y / x)

        let t = x
        x = Math.cos(theta) * x - Math.sin(theta) * y
        y = Math.sin(theta) * t + Math.cos(theta) * y
    }

    let phi = Math.PI / 2
    if (z != 0) phi = -Math.atan(x / z)
    if (z < 0) {
        phi += Math.PI
    }
    return {theta, phi}
}