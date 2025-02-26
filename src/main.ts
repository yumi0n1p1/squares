import './style.css'
import { Line, Rect, SVG } from '@svgdotjs/svg.js'

const TASKS_LENGTH = 10

const INACTIVE_COLOR = '#ccc'
const ACTIVE_COLOR = '#0f4'
const SECONDARY_COLOR = '#bdc'
const GUIDE_COLOR = '#f88'

const controlBorderEl = document.getElementById('control-border')! as HTMLInputElement
const controlGuidelineEl = document.getElementById('control-guideline')! as HTMLInputElement
const controlCursorEl = document.getElementById('control-cursor')! as HTMLInputElement
const controlNextSquareEl = document.getElementById('control-nextsquare')! as HTMLInputElement

let squareBorder = false
let showGuideLine = controlGuidelineEl.checked
let biggerCursor = controlCursorEl.checked
let nextSquareLightsUp = controlNextSquareEl.checked

function updateBorder() {
  squareBorder = controlBorderEl.checked
  Array.from(document.getElementsByClassName('active-square')).map(el => {
    el.setAttribute('stroke', squareBorder ? GUIDE_COLOR : 'none')
    el.setAttribute('stroke-width', squareBorder ? '3' : '0')
  })
}

updateBorder()
controlBorderEl.addEventListener('change', updateBorder)

function updateGuideLine() {
  showGuideLine = controlGuidelineEl.checked
  Array.from(document.getElementsByClassName('legend-guideline')).map(el => {
    ;(el as HTMLElement).style.display = showGuideLine ? 'block' : 'none'
  })
}

updateGuideLine()
controlGuidelineEl.addEventListener('change', updateGuideLine)

controlCursorEl.addEventListener('change', () => {
  biggerCursor = controlCursorEl.checked
})

function updateNextSquare() {
  nextSquareLightsUp = controlNextSquareEl.checked
  ;(document.getElementsByClassName('legend-nextsquare')[0] as HTMLElement).style.display = nextSquareLightsUp
    ? 'block'
    : 'none'
}

updateNextSquare()
controlNextSquareEl.addEventListener('change', updateNextSquare)

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
