import './style.css'
import { Line, Rect, SVG } from '@svgdotjs/svg.js'

const TASKS_LENGTH = 10

const INACTIVE_COLOR = '#ccc'
const ACTIVE_COLOR = '#0f4'
const SECONDARY_COLOR = '#bdc'
const GUIDE_COLOR = '#f88'

const controlGuidelineColorEl = document.getElementById('control-guideline-color')! as HTMLInputElement
const controlGuidelineDashEl = document.getElementById('control-guideline-dash')! as HTMLInputElement

let guidelineSameColorAsSquares = true
let secondaryGuidelineDashed = true
const biggerCursor = true
const showGuideLine = true
const nextSquareLightsUp = true
const squareBorder = true

let svg = SVG().addTo('#canvas').size(canvasSize, canvasSize)
let targets: Rect[] = []
let currentTarget: number | undefined
let nextTarget: number | undefined

let lineToCurrentTarget: Line = svg.line(0, 0, 0, 0).stroke({
  color: GUIDE_COLOR,
  width: 5,
})
let lineToNextTarget: Line = svg.line(0, 0, 0, 0).stroke({
  color: GUIDE_COLOR,
  width: 2,
  dasharray: '4',
})

function updateGuidelineColor() {
  guidelineSameColorAsSquares = controlGuidelineColorEl.checked
  if (guidelineSameColorAsSquares) {
    document.getElementsByClassName('primary-guideline')[0].setAttribute('stroke', ACTIVE_COLOR)
    document.getElementsByClassName('secondary-guideline')[0].setAttribute('stroke', SECONDARY_COLOR)
    lineToCurrentTarget.stroke({ color: ACTIVE_COLOR })
    lineToNextTarget.stroke({ color: SECONDARY_COLOR })
  } else {
    document.getElementsByClassName('primary-guideline')[0].setAttribute('stroke', GUIDE_COLOR)
    document.getElementsByClassName('secondary-guideline')[0].setAttribute('stroke', GUIDE_COLOR)
    lineToCurrentTarget.stroke({ color: GUIDE_COLOR })
    lineToNextTarget.stroke({ color: GUIDE_COLOR })
  }
}

updateGuidelineColor()
controlGuidelineColorEl.addEventListener('change', updateGuidelineColor)

function updateGuidelineDash() {
  secondaryGuidelineDashed = controlGuidelineDashEl.checked
  if (secondaryGuidelineDashed) {
    document.getElementsByClassName('secondary-guideline')[0].setAttribute('stroke-dasharray', '4')
    lineToNextTarget.stroke({ dasharray: '4' })
  } else {
    document.getElementsByClassName('secondary-guideline')[0].removeAttribute('stroke-dasharray')
    lineToNextTarget.stroke({ dasharray: '0' })
  }
}

updateGuidelineDash()
controlGuidelineDashEl.addEventListener('change', updateGuidelineDash)

function toCenter(x: number): number {
  return x + buttonSize / 2
}

// Initialize the squares.
for (let i = 0; i < numberOfSquaresTall * numberOfSquaresWide; i++) {
  // Calculate where this square should be:
  let x = (i % numberOfSquaresWide) * (padding + buttonSize) + margin
  let y = Math.floor(i / numberOfSquaresTall) * (padding + buttonSize) + margin

  let square = svg.rect(buttonSize, buttonSize).move(x, y).fill(INACTIVE_COLOR)
  targets[i] = square
}

const judge = new Judge(TASKS_LENGTH, targets, 'teamName')

judge.on('start', () => {
  if (biggerCursor) {
    document.body.classList.add('bigger-cursor')
  } else {
    document.body.classList.remove('bigger-cursor')
  }

  if (showGuideLine) {
    lineToCurrentTarget.show()
    lineToNextTarget.show()
  } else {
    lineToCurrentTarget.hide()
    lineToNextTarget.hide()
  }

  ;(document.getElementsByClassName('legend')[0] as HTMLElement).style.opacity = '0.1'
})

judge.on('stop', () => {
  for (let i = 0; i < numberOfSquaresTall * numberOfSquaresWide; i++) {
    targets[i].fill(INACTIVE_COLOR).stroke({ width: 0 })
  }
  ;(document.getElementsByClassName('legend')[0] as HTMLElement).style.opacity = '1'
})

judge.on('newTask', () => {
  const lastTarget = currentTarget

  ;[currentTarget, nextTarget] = judge.getNextTwoTasks()

  for (let i = 0; i < numberOfSquaresTall * numberOfSquaresWide; i++) {
    targets[i].fill(INACTIVE_COLOR).stroke({ width: 0 })
  }

  if (currentTarget === undefined) return

  console.log('Next: ' + currentTarget)
  targets[currentTarget].fill(ACTIVE_COLOR)
  if (squareBorder) {
    targets[currentTarget].stroke({ color: GUIDE_COLOR, width: 3 })
  }

  if (nextSquareLightsUp && nextTarget !== undefined) {
    targets[nextTarget].fill(SECONDARY_COLOR)
  }

  if (lastTarget !== undefined) {
    lineToCurrentTarget.plot(
      toCenter(Number(targets[lastTarget].x())),
      toCenter(Number(targets[lastTarget].y())),
      toCenter(Number(targets[currentTarget].x())),
      toCenter(Number(targets[currentTarget].y()))
    )
  }

  if (nextTarget !== undefined) {
    lineToNextTarget.plot(
      toCenter(Number(targets[currentTarget].x())),
      toCenter(Number(targets[currentTarget].y())),
      toCenter(Number(targets[nextTarget].x())),
      toCenter(Number(targets[nextTarget].y()))
    )
  }
})

svg.mousemove(e => {
  if (currentTarget === undefined) return

  lineToCurrentTarget.plot(
    e.offsetX,
    e.offsetY,
    toCenter(Number(targets[currentTarget].x())),
    toCenter(Number(targets[currentTarget].y()))
  )
})
