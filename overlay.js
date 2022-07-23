'use strict'

function initParkingSpaces(overlayEl) {
    let refPoint = {
        x: 20,
        y: 18,
    }
    let unorderedSpaceList = []
    // left column
    unorderedSpaceList = createSpacesColumn(refPoint, 208, unorderedSpaceList)
    // right column
    refPoint = {
        x: 1140,
        y: 18,
    }
    unorderedSpaceList = createSpacesColumn(refPoint, 212, unorderedSpaceList)
    // top-mid row
    refPoint = {
        x: 423,
        y: 28,
    }
    unorderedSpaceList = createSpacesRow(refPoint, 212, unorderedSpaceList)
    // mid-mid row
    refPoint = {
        x: 423,
        y: 395,
    }
    unorderedSpaceList = createSpacesRow(refPoint, 210, unorderedSpaceList)
    refPoint = {
        x: 422,
        y: 786,
    }
    // bot-mid row
    unorderedSpaceList = createSpacesRow(refPoint, 210, unorderedSpaceList)

    let spacesEl = document.getElementById('spaces')
    for (let space of unorderedSpaceList) {
        spacesEl.append(space)
    }
}

function createSpacesColumn(refPoint, length, unorderedSpaceList) {
    for (let i = 0; i < 9; i++) {
        let space = document.createElement('div')
        space.classList.add('space')
        space.style.left = refPoint.x + 'px'
        space.style.top = refPoint.y + 'px'
        space.style.width = length + 'px'
        switch (i) {
            case 1:
                space.style.height = '97px'
                break
            case 3:
            case 7:
                space.style.height = '98px'
                break
            default:
                space.style.height = '100px'
                break
        }
        unorderedSpaceList.push(space)

        refPoint.y += Number(space.style.height.replace('px', '')) + 10
    }
    return unorderedSpaceList
}

function createSpacesRow(refPoint, length, unorderedSpaceList) {
    for (let i = 0; i < 5; i++) {
        let space = document.createElement('div')
        space.classList.add('space')
        space.style.left = refPoint.x + 'px'
        space.style.top = refPoint.y + 'px'
        space.style.height = length + 'px'
        switch (i) {
            case 4:
                space.style.width = '98px'
                break
            default:
                space.style.width = '100px'
                break
        }
        unorderedSpaceList.push(space)

        refPoint.x += Number(space.style.width.replace('px', '')) + 10
    }
    return unorderedSpaceList
}

initParkingSpaces(document.getElementById('lot-overlay'))
