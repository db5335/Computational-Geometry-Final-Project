const scale = 200
const translation = [250, 200]

const svg = d3.select('#sphereSvg')
const proj = d3.select('#projectionSvg')
proj.append("g")

console.log(svg)
console.log(proj)

// let max = Math.max(maxX, maxY)

let xScale = null
//     d3.scaleLinear()
//   .domain([-max, max])
//   .range([10, 490]) // 600 is our chart width
 
let yScale = null
//     d3.scaleLinear()
//   .domain([-max, max])
//   .range([10, 490]) // 400 is our chart height

function rescale() {
    max = Math.max(maxX, maxY)

    xScale = d3.scaleLinear()
        .domain([-max, max])
        .range([60, 440]) // 600 is our chart width
 
    yScale = d3.scaleLinear()
        .domain([-max, max])
        .range([10, 390]) // 400 is our chart height
}

function renderProjection() {
    d3.selectAll('#projectionSvg > g > *').remove()

    proj.select('g').append('line').attr('x1', 60).attr('x2', 440).attr('y1', 200).attr('y2', 200).style('stroke', '#d54f67')
    proj.select('g').append('line').attr('x1', 250).attr('x2', 250).attr('y1', 10).attr('y2', 390).style('stroke', '#a71c5f')

    if (step <= 1) {
        return
    } else if (step > firstSteps[phases['rotatedPoints']] && step <= lastSteps[phases['sort']]) {
        let stop = (step - firstSteps[phases['rotatedPoints']]) / 2
        proj.select('g').selectAll('.projectedPoint').data(unsortedProjectedPoints.slice(0, stop)).enter().append('circle')
            .attr('r', 4.5).attr('cx', p => xScale(p.x)).attr('cy', p => yScale(p.y)).style('fill', p => p.rgb).attr('class', 'projectedPoint')
    } else if (step >= firstSteps[phases['delaunay']]) {
        let stop = Math.min(step - firstSteps[phases['delaunay']], lastSteps[phases['delaunay']] - firstSteps[phases['delaunay']])
        proj.select('g').selectAll('.addedLine').data(addedLines[stop]).enter().append('line')
            .attr('x1', l => xScale(l.x1)).attr('x2', l => xScale(l.x2)).attr('y1', l => yScale(l.y1)).attr('y2', l => yScale(l.y2)).style('stroke', '#2198c9')
        proj.select('g').selectAll('.deletedLine').data(deletedLines[stop]).enter().append('line')
            .attr('x1', l => xScale(l.x1)).attr('x2', l => xScale(l.x2)).attr('y1', l => yScale(l.y1)).attr('y2', l => yScale(l.y2)).style('stroke', '#999999')
        proj.select('g').selectAll('.remainingLine').data(remainingLines[stop]).enter().append('line')
            .attr('x1', l => xScale(l.x1)).attr('x2', l => xScale(l.x2)).attr('y1', l => yScale(l.y1)).attr('y2', l => yScale(l.y2)).style('stroke', 'black')
        proj.select('g').selectAll('.projectedPoint').data(projectedPoints).enter().append('circle')
            .attr('r', 4.5).attr('cx', p => xScale(p.x)).attr('cy', p => yScale(p.y)).style('fill', p => p.rgb).attr('class', 'projectedPoint')
    }
    return
    
    proj.select('g').selectAll('.newLine').data(newLines[0])
    // proj.select('g').selectAll("circle").data(projectedPoints).enter().append("circle").attr("r", 4.5)
    // .attr("cx", function(p) {return xScale(p.x)}).attr('cy', function(p) {return yScale(p.y)}).style('stroke', 'black').style('fill', 'red')
}


const projection = d3.geoOrthographic().scale(scale).translate(translation);
const path = d3.geoPath(projection);
// const path = d3.geoPath(projection, context).pointRadius(20);

const circle = d3.geoCircle()

const sphere = { type: "Sphere" }

function renderSphere() {
    console.log(step)
    d3.selectAll('#sphereSvg > *').remove()
    
    svg.append('path').attr('d', path(sphere)).attr('cx', '50%').attr('cy', '50%').attr('r', 20).style('fill', 'rgb(236, 230, 227)')
    // svg.append('path').datum({type: 'Feature', geometry: {type: 'Point', coordinates: [0, 90]}}).attr('d', path).style('stroke', 'black').style('fill', 'white')

    if (step == 0) {
        null
    } else if (step >= firstSteps[phases['rotatedPoints']] && step <= lastSteps[phases['sort']]) {
        let stop = step - firstSteps[phases['rotatedPoints']] + 1
        
        svg.selectAll('.rotatedCircle').data(rotatedCircleFeatures.slice(0, stop)).enter().append('path')
            .attr('d', path).style('stroke', c => c.rgb).style("fill", 'rgba(0, 0, 0, 0)').attr('class', 'rotatedCircle')
        svg.selectAll('.rotatedPoint').data(rotatedPointFeatures.slice(0, stop)).enter().append('path')
            .attr('d', path).style('fill', p => p.rgb).attr('class', 'rotatedPoint')
    } else if (step >= firstSteps[phases['delaunay']] && step <= lastSteps[phases['delaunay']]) {
        let stop = step - firstSteps[phases['delaunay']]
        console.log(addedLines[stop])
        svg.selectAll('.addedLine').data(addedLineFeatures[stop]).enter().append('path')
            .attr('d', path).style('stroke', '#2198c9').style('fill', 'rgba(0, 0, 0, 0)')    
        svg.selectAll('.deletedLine').data(deletedLineFeatures[stop]).enter().append('path')
            .attr('d', path).style('stroke', '#999999').style('fill', 'rgba(0, 0, 0, 0)')
        svg.selectAll('.remainingLine').data(remainingLineFeatures[stop]).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', 'rgba(0, 0, 0, 0)')
    } else if (step >= firstSteps[phases['hull']] && step <= lastSteps[phases['hull']]) {
        console.log("HERE")
        let stop = step - firstSteps[phases['hull']]
        svg.selectAll('.remainingLine').data(remainingLineFeatures[remainingLineFeatures.length - 1]).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', 'rgba(0, 0, 0, 0)')
        svg.selectAll('.hullLine').data(hullLineFeatures).enter().append('path')
            .attr('d', path).style('stroke', '#d54f67').style('fill', 'rgba(0, 0, 0, 0)')
        svg.selectAll('.connectLine').data(connectLineFeatures.slice(0, stop)).enter().append('path')
            .attr('d', path).style('stroke', '#2198c9').style('fill', 'rgba(0, 0, 0, 0)')
    } else if (step >= firstSteps[phases['voronoi']] && step <= lastSteps[phases['voronoi']]){
        let stop = step - firstSteps[phases['voronoi']]
        svg.selectAll('.voronoiCell').data(voronoiCellFeatures.slice(0, neighborFeatures[stop].nextId)).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', v => v.rgb)
        if (neighborFeatures[stop].id == neighborFeatures[stop].nextId) {
            svg.selectAll('.triangle').data(triangleFeatures[neighborFeatures[stop].id]).enter().append('path')
                .attr('d', path).style('stroke', '#d54f67').style('fill', 'rgba(0, 0, 0, 0)')
        }
        svg.append('path').datum(neighborFeatures[stop])
            .attr('d', path).style('stroke', '#2198c9').style('fill', 'rgba(0, 0, 0, 0)')
        svg.append('path').datum(circumcircleFeatures[stop])
            .attr('d', path).style('stroke', p => p.rgb).style('fill', p => p.rgba)
        svg.selectAll('.voronoiEdge').data(voronoiEdgeFeatures[neighborFeatures[stop].id].slice(0, neighborFeatures[stop].n)).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', 'rgba(0, 0, 0, 0)')
        svg.selectAll('.voronoiPoint').data(voronoiPointFeatures[neighborFeatures[stop].id].slice(0, neighborFeatures[stop].n + 1)).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', 'black')
    } else {
        svg.selectAll('.voronoiCell').data(voronoiCellFeatures).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', v => v.rgb)
    }

    svg.selectAll('.originalPoint').data(originalPointFeatures).enter().append('path')
        .attr('d', path).style('stroke', 'black').style('fill', p => p.rgb).attr('class', 'originalPoint')

    return

    for (let i = 0; i < /*n*/step; i++) {
        let p = originalPoints[i]
        let coordinates = [[]]

        let cs = []

        let q = rotatedPoints[i]
        console.log(q)
        let m = q.point2d.neighborCount
        let neighbor = q.point2d.neighbors
        for (let j = 0; j <= m + 1; j++) {
            let c1 = p.findCenter(originalPoints[neighbor.point.id], originalPoints[neighbor.successor.point.id])
            // let c2 = rotatedPoint.findCenter(neighbor.predecessor.point.point3d, neighbor.point.point3d)
        

            coordinates[0].push([c1.long, c1.lat])
            cs.push(c1)


            svg.append("path").datum({
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [[p.long, p.lat], [c1.long, c1.lat]]
                }
            }).attr("d", path).attr('stroke', 'red').style('fill', 'rgba(0, 0, 0, 0)')
            neighbor = neighbor.successor
        }

        // context.beginPath()
        // path({type: "Feature", 
        //     geometry: {
        //         type: "Polygon",
        //         coordinates
        //     }
        // })
        // context.strokeStyle = "black"
        // context.stroke()
        // context.fillStyle = "green"
        // context.fill()

        svg.append("path").datum({type: "Feature", 
            geometry: {
                type: "Polygon",
                coordinates
            }
        }).attr("d", path).attr('stroke', 'black').style('fill', p.rgb)

        svg.append("path").datum({type:"Feature",
            geometry: {
                type:"Point",
                coordinates: [p.long, p.lat]
            }}).attr("d", path)

        let c1 = p.findCenter(originalPoints[neighbor.point.id], originalPoints[neighbor.successor.point.id])

        svg.append("path").datum({type:"Feature",
        geometry: {
            type:"Point",
            coordinates: [c1.long, c1.lat]
        }}).attr("d", path)

        let phi1 = Math.PI * p.lat / 180
        let phi2 = Math.PI * c1.lat / 180
        let lambda = Math.PI * Math.abs(c1.long - p.long) / 180
        let rad = 180 * Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(lambda)) / Math.PI
        svg.append("path").datum(circle.radius(rad).center([c1.long, c1.lat])).attr("d", path).attr('stroke', 'black').attr("fill", 'rgba(0, 0, 0,0)')
    }

}

// renderProjection()


svg.call(zoom(projection)
        .on("zoom.render", () => renderSphere())
        .on("end.render", () => renderSphere()))
    // .call(() => renderSphere())
    .node();



function zoom(projection, {
    // Capture the projection’s original scale, before any zooming.
    scale = projection._scale === undefined
        ? (projection._scale = projection.scale()) 
        : projection._scale,
    scaleExtent = [0.8, 8]
    } = {}) {
    let v0, q0, r0, a0, tl;
    
    const zoom = d3.zoom()
        .scaleExtent(scaleExtent.map(x => x * scale))
        .on("start", zoomstarted)
        .on("zoom", zoomed);
    
    function point(event, that) {
        const t = d3.pointers(event, that);
    
        if (t.length !== tl) {
        tl = t.length;
        if (tl > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
        zoomstarted.call(that, event);
        }
    
        return tl > 1
        ? [
            d3.mean(t, p => p[0]),
            d3.mean(t, p => p[1]),
            Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0])
            ]
        : t[0];
    }
    
    function zoomstarted(event) {
        v0 = versor.cartesian(projection.invert(point(event, this)));
        q0 = versor((r0 = projection.rotate()));
    }
    
    function zoomed(event) {
        projection.scale(event.transform.k);
        const pt = point(event, this);
        const v1 = versor.cartesian(projection.rotate(r0).invert(pt));
        const delta = versor.delta(v0, v1);
        let q1 = versor.multiply(q0, delta);
    
        // For multitouch, compose with a rotation around the axis.
        if (pt[2]) {
        const d = (pt[2] - a0) / 2;
        const s = -Math.sin(d);
        const c = Math.sign(Math.cos(d));
        q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
        }
    
        projection.rotate(versor.rotation(q1));
        
        // In vicinity of the antipode (unstable) of q0, restart.
        if (delta[0] < 0.7) zoomstarted.call(this, event);
    }
    
    return Object.assign(selection => selection
        .property("__zoom", d3.zoomIdentity.scale(projection.scale()))
        .call(zoom), {
        on(type, ...options) {
        return options.length
            ? (zoom.on(type, ...options), this)
            : zoom.on(type);
        }
    })
}

function rerender() {
    renderSphere()
    renderProjection()
}

addEventListener('keypress', (event) => {console.log(event)});