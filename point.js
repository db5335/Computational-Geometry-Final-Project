class PointNode {
    constructor(point) {
        this.id = point.id
        this.x = point.x
        this.y = point.y
        this.color = point.color
        this.point = point
        this.predecessor = this
        this.successor = this
    }

    insertAfter(node) {
        node.predecessor = this
        this.successor.predecessor = node
        node.successor = this.successor
        this.successor = node
        if (this.predecessor == this) this.predecessor = node
    }

    insertBefore(node) {
        node.successor = this
        this.predecessor.successor = node
        node.predecessor = this.predecessor
        this.predecessor = node
        if (this.successor == this) this.successor = node
    }

    toString() {
        let s = '\t-> ' + this.x + ', ' + this.y
        let node = this.successor
        while (node != this) {
            s = s + '\n\t-> ' + node.x + ', ' + node.y
            node = node.successor
        }
        return s
    }
}

class Point3d {
    constructor(id, x, y, z, color) {
        this.id = id
        this.x = x
        this.y = y
        this.z = z
        this.color = color
        this.neighbors = null
        this.neighborCount = 0
        
        let projX = this.x / radius / (1 - this.z / radius)
        let projY = this.y / radius / (1 - this.z / radius)
        this.point2d = new Point2d(this.id, projX, projY, this.color, this)
    }

    rotate(theta, phi) {
        let x = this.x
        let y = this.y
        let z = this.z

        let t = x
        x = Math.cos(theta) * x - Math.sin(theta) * y
        y = Math.sin(theta) * t + Math.cos(theta) * y
        t = z
        z = Math.cos(phi) * z - Math.sin(phi) * x
        x = Math.sin(phi) * t + Math.cos(phi) * x
    
        return new Point3d(this.id, x, y, z, this.color)    
    }

    project() {
        return this.point2d
    }

    
    findCenter(point1, point2) {
        // let x = (this.x + point1.x + point2.x) / 3
        // let y = (this.y + point1.y + point2.y) / 3
        // let z = (this.z + point1.z + point2.z) / 3
        
        // let dist = Math.sqrt(x * x + y * y + z * z)
        // return {
        //     x: x * radius / dist,
        //     y: y * radius / dist,
        //     z: z * radius / dist
        // }

        let x1 = this.x
        let y1 = this.y
        let z1 = this.z

        let x2 = point1.x
        let y2 = point1.y
        let z2 = point1.z

        let x3 = point2.x
        let y3 = point2.y
        let z3 = point2.z

        let a = x1 * (y3 * z2 - y2 * z3) + x2 * (y1 * z3 - y3 * z1) + x3 * (y2 * z1 - y1 * z2)
        let dx = radius * radius * (y3 * z2 - y2 * z3 + y1 * z3 - y3 * z1 + y2 * z1 - y1 * z2)
        let dy = radius * radius * (x2 * z3 - x3 * z2 + x3 * z1 - x1 * z3 + x1 * z2 - x2 * z1)
        let dz = radius * radius * (x3 * y2 - x2 * y3 + x1 * y3 - x3 * y1 + x2 * y1 - x1 * y2)

        let x = dx / 2 / a
        let y = dy / 2 / a
        let z = dz / 2 / a

        let dist = Math.sqrt(x * x + y * y + z * z)
        return {
            x: x * radius / dist,
            y: y * radius / dist,
            z: z * radius / dist
        }
    }
}

class Point2d {
    constructor(id, x, y, color, point3d) {
        this.id = id
        this.x = x
        this.y = y
        this.color = color
        this.neighbors = null
        this.neighborCount = 0
        this.point3d = point3d
    }

    addNeighbor(point) {
        let neighbor = new PointNode(point)
        this.neighborCount += 1

        if (this.neighborCount == 1) {
            this.neighbors = neighbor
            return neighbor
        } else if (this.neighborCount == 2) {
            this.neighbors.insertAfter(neighbor)
            return neighbor
        }

        let angle = this.getAngleTo(neighbor)
        let node = this.neighbors
        let angleToNode = this.getAngleTo(node)
        let previous = angleToNode

        if (angleToNode < angle) {
            while (angleToNode < angle) {
                if (previous > angleToNode) break;
                node = node.successor
                previous = angleToNode
                angleToNode = this.getAngleTo(node)
            }
            node.insertBefore(neighbor)
        } else {
            while (angleToNode > angle) {
                if (previous < angleToNode) break;
                node = node.predecessor
                previous = angleToNode
                angleToNode = this.getAngleTo(node)
            }
            node.insertAfter(neighbor)
        }

        return neighbor
    }

    deleteNeighbor(point) {
        let curr = this.neighbors
        let stop = this.neighbors.predecessor

        while (curr != stop) {
            if (point.x == curr.x && point.y == curr.y) {
                this.neighborCount -= 1
                
                if (curr.predecessor == curr) this.neighbors = null
                else {
                    curr.predecessor.successor = curr.successor
                    curr.successor.predecessor = curr.predecessor
                    if (curr == this.neighbors) this.neighbors = curr.successor
                }

                return curr
            }

            curr = curr.successor
        }

        if (point.x == stop.x && point.y == stop.y) {
            this.neighborCount -= 1
            
            if (stop.predecessor == stop) this.neighbors = null
            else {
                stop.predecessor.successor = stop.successor
                stop.successor.predecessor = stop.predecessor
            }

            return stop
        }
    }

    getAngleTo(point) {
        if (point.x == this.x) {
            if (point.y > this.y) return Math.PI / 2
            return 3 * Math.PI / 2
        }

        let tan = (point.y - this.y) / (point.x - this.x)

        if (point.x > this.x) {
            if (point.y > this.y) return Math.atan(tan)
            return 2 * Math.PI + Math.atan(tan)
        }
        return Math.PI + Math.atan(tan)
    }

    toString() {
        return this.x + ', ' + this.y + '\n' + this.neighbors.toString()
    }
}