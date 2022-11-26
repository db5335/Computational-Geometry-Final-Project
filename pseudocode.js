function rehighlight() {
    let sphericalPseudocode = document.getElementById('sphericalPseudocode')
    let sphericalCode = document.getElementById('sphericalCode')
    let projectionPseudocode = document.getElementById('delaunayPseudocode')
    let projectionCode = document.getElementById('delaunayCode')

    if (step == 0) {
        sphericalPseudocode.setAttribute('data-line', '1-3')
        projectionPseudocode.setAttribute('data-line', 1)
    } else if (step == firstSteps[phases['rotatedPoints']]) {
        sphericalPseudocode.setAttribute('data-line', '5, 7-8')
        projectionPseudocode.setAttribute('data-line', 1)
    } else if (step > firstSteps[phases['rotatedPoints']] && step <= lastSteps[phases['rotatedPoints']]) {
        if (step % 2 == 0) {
            sphericalPseudocode.setAttribute('data-line', '7-9')
        } else {
            sphericalPseudocode.setAttribute('data-line', '10-12')
        }
        projectionPseudocode.setAttribute('data-line', 1)
    } else if (step == firstSteps[phases['sort']]) {
        sphericalPseudocode.setAttribute('data-line', 14)
        projectionPseudocode.setAttribute('data-line', 1)
    } else if (step >= firstSteps[phases['delaunay']] && step <= lastSteps[phases['delaunay']]) {
        sphericalPseudocode.setAttribute('data-line', 15)
        if (step == lastSteps[phases['delaunay']]) {
            projectionPseudocode.setAttribute('data-line', 1)
        } else if (iterator.baseCase[step - firstSteps[phases['delaunay']]]) {
            projectionPseudocode.setAttribute('data-line', '1-3')
        } else if (iterator.tangents[step - firstSteps[phases['delaunay']]]) {
            projectionPseudocode.setAttribute('data-line', '5-6, 8-9')
        } else {
            projectionPseudocode.setAttribute('data-line', '11-12, 14')
        }
    } else if (step >= firstSteps[phases['hull']] && step <= lastSteps[phases['hull']]) {
        if (step == firstSteps[phases['hull']]) {
            sphericalPseudocode.setAttribute('data-line', 16)
        } else {
            sphericalPseudocode.setAttribute('data-line', '18-20')
        }
        projectionPseudocode.setAttribute('data-line', 1)
    } else if (step >= firstSteps[phases['voronoi']] && step <= lastSteps[phases['voronoi']]) {
        let stop = step - firstSteps[phases['voronoi']]
        if (neighborFeatures[stop].id == neighborFeatures[stop].nextId) {
            sphericalPseudocode.setAttribute('data-line', '22-25')
        } else {
            sphericalPseudocode.setAttribute('data-line', 26)
        }
        projectionPseudocode.setAttribute('data-line', 1)
    } else {
        sphericalPseudocode.setAttribute('data-line', 1)
        projectionPseudocode.setAttribute('data-line', 1)
    }

    console.log('here')

    Prism.highlightElement(sphericalCode)
    Prism.highlightElement(projectionCode)
}