function rehighlight() {
    let sphericalPseudocode = document.getElementById('sphericalPseudocode')
    let sphericalCode = document.getElementById('sphericalCode')
    let projectionPseudocode = document.getElementById('delaunayPseudocode')
    let projectionCode = document.getElementById('delaunayCode')

    if (step == 0) {
        sphericalPseudocode.setAttribute('data-line', '1-3')
        projectionPseudocode.removeAttribute('data-line')
    } else if (step == firstSteps[phases['rotatedPoints']]) {
        sphericalPseudocode.setAttribute('data-line', '5, 7-8')
        projectionPseudocode.removeAttribute('data-line')
    } else if (step > firstSteps[phases['rotatedPoints']] && step <= lastSteps[phases['rotatedPoints']]) {
        sphericalPseudocode.setAttribute('data-line', '7-12')
    } else if (step >= firstSteps[phases['delaunay']] && step <= lastSteps[phases['delaunay']]) {
        if (iterator.baseCase[step - firstSteps[phases['delaunay']]]) {
            projectionPseudocode.setAttribute('data-line', '1-3')
        } else {
            projectionPseudocode.setAttribute('data-line', '5-6, 8-9, 11-12, 14')
        }
    } else if (step >= firstSteps[phases['voronoi']] && step <= lastSteps[phases['voronoi']]) {
    // console.log(sphericalPseudocode)
    }

    console.log('here')

    Prism.highlightElement(sphericalCode)
    Prism.highlightElement(projectionCode)
}