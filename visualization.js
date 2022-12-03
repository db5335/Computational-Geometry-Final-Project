/*
 * Script for updating the visualization of the diagram.
 *
 * Dominick Banasik
*/

const scale = 200
const translation = [250, 200]

const svg = d3.select('#sphereSvg')
const proj = d3.select('#projectionSvg')
proj.append("g")

let xScale = null
let yScale = null

function rescale() {
    max = Math.max(maxX, maxY)

    xScale = d3.scaleLinear()
        .domain([-max, max])
        .range([60, 440])
 
    yScale = d3.scaleLinear()
        .domain([-max, max])
        .range([10, 390])
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
}


const projection = d3.geoOrthographic().scale(scale).translate(translation);
const path = d3.geoPath(projection);
const circle = d3.geoCircle()

const sphere = { type: "Sphere" }

function renderSphere() {
    d3.selectAll('#sphereSvg > *').remove()
    
    svg.append('path').attr('d', path(sphere)).attr('cx', '50%').attr('cy', '50%').attr('r', 20).style('fill', 'rgb(236, 230, 227)')

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
        svg.selectAll('.addedLine').data(addedLineFeatures[stop]).enter().append('path')
            .attr('d', path).style('stroke', '#2198c9').style('fill', 'rgba(0, 0, 0, 0)')    
        svg.selectAll('.deletedLine').data(deletedLineFeatures[stop]).enter().append('path')
            .attr('d', path).style('stroke', '#999999').style('fill', 'rgba(0, 0, 0, 0)')
        svg.selectAll('.remainingLine').data(remainingLineFeatures[stop]).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', 'rgba(0, 0, 0, 0)')
    } else if (step >= firstSteps[phases['hull']] && step <= lastSteps[phases['hull']]) {
        let stop = step - firstSteps[phases['hull']]
        svg.selectAll('.remainingLine').data(remainingLineFeatures[remainingLineFeatures.length - 1]).enter().append('path')
            .attr('d', path).style('stroke', 'black').style('fill', 'rgba(0, 0, 0, 0)')
        if (step < lastSteps[phases['hull']]) {
            svg.selectAll('.hullLine').data(hullLineFeatures).enter().append('path')
                .attr('d', path).style('stroke', '#d54f67').style('fill', 'rgba(0, 0, 0, 0)')
            svg.selectAll('.connectLine').data(connectLineFeatures.slice(0, stop)).enter().append('path')
                .attr('d', path).style('stroke', '#2198c9').style('fill', 'rgba(0, 0, 0, 0)')
        } else {
            svg.selectAll('.connectLine').data(connectLineFeatures).enter().append('path')
                .attr('d', path).style('stroke', 'black').style('fill', 'rgba(0, 0, 0, 0)')
        }
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
}

// Credit to https://observablehq.com/@d3/versor-zooming?collection=@d3/d3-zoom for the following code segment

svg.call(zoom(projection)
        .on("zoom.render", () => renderSphere())
        .on("end.render", () => renderSphere()))
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
