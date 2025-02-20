import './style.css'
import { Line, Rect, SVG } from '@svgdotjs/svg.js'

const tasksLength = 10

const inactiveColor = '#ccc'
const activeColor = '#0f4'
const secondaryColor = '#bdc'
const guideColor = '#f88'

let controlBorderEl = document.getElementById('control-border')! as HTMLInputElement
let controlGuidelineEl = document.getElementById('control-guideline')! as HTMLInputElement
let controlCursorEl = document.getElementById('control-cursor')! as HTMLInputElement
let controlNextSquareEl = document.getElementById('control-nextsquare')! as HTMLInputElement

let squareBorder = controlBorderEl.checked
let showGuideLine = controlGuidelineEl.checked
let biggerCursor = controlCursorEl.checked
let nextSquareLightsUp = controlNextSquareEl.checked

controlBorderEl.addEventListener('change', e => {
  squareBorder = (e.target! as HTMLInputElement).checked
})

controlGuidelineEl.addEventListener('change', e => {
  showGuideLine = (e.target! as HTMLInputElement).checked
})

controlCursorEl.addEventListener('change', e => {
  biggerCursor = (e.target! as HTMLInputElement).checked
})

controlNextSquareEl.addEventListener('change', e => {
  nextSquareLightsUp = (e.target! as HTMLInputElement).checked
})

let svg = SVG().addTo('#canvas').size(canvasSize, canvasSize)
let targets: Rect[] = []
let currentTarget: number | undefined
let nextTarget: number | undefined

let lineToCurrentTarget: Line = svg.line(0, 0, 0, 0).stroke({
  color: guideColor,
  width: 5,
})
let lineToNextTarget: Line = svg.line(0, 0, 0, 0).stroke({
  color: guideColor,
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

  let square = svg.rect(buttonSize, buttonSize).move(x, y).fill(inactiveColor)
  targets[i] = square
}

const judge = new Judge(tasksLength, targets, 'teamName')

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
})

judge.on('stop', () => {
  for (let i = 0; i < numberOfSquaresTall * numberOfSquaresWide; i++) {
    targets[i].fill(inactiveColor).stroke({ width: 0 })
  }
})

judge.on('newTask', () => {
  const lastTarget = currentTarget

  ;[currentTarget, nextTarget] = judge.getNextTwoTasks()

  for (let i = 0; i < numberOfSquaresTall * numberOfSquaresWide; i++) {
    targets[i].fill(inactiveColor).stroke({ width: 0 })
  }

  if (currentTarget === undefined) return

  console.log('Next: ' + currentTarget)
  targets[currentTarget].fill(activeColor)
  if (squareBorder) {
    targets[currentTarget].stroke({ color: guideColor, width: 3 })
  }

  if (nextSquareLightsUp && nextTarget !== undefined) {
    targets[nextTarget].fill(secondaryColor)
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
