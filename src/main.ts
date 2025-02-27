import './style.css'
import { Line, Rect, SVG } from '@svgdotjs/svg.js'

const TASKS_LENGTH = 10

const INACTIVE_COLOR = '#ccc' // light gray
const ACTIVE_COLOR = '#0f4' // bright green
const SECONDARY_COLOR = '#bdc' // grayish green
const GUIDE_COLOR = '#f88' // bright red

const svg = SVG().addTo('#canvas').size(canvasSize, canvasSize)
const targets: Rect[] = [] // array of the 16 square elements

let currentTarget: number | undefined // i.e. the square that the user should click now
let nextTarget: number | undefined // i.e. the square that the user should clock after currentTarget

// Line between the cursor and the current target
const lineToCurrentTarget: Line = svg.line(0, 0, 0, 0).stroke({
  color: ACTIVE_COLOR,
  width: 5,
})
// Line between the current and the next target
const lineToNextTarget: Line = svg.line(0, 0, 0, 0).stroke({
  color: SECONDARY_COLOR,
  width: 2,
  dasharray: '4',
})

// Relocate any coordianate on the upper-left corner of a square to its center.
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
  lineToCurrentTarget.show()
  lineToNextTarget.show()

  document.getElementById('legend')!.style.opacity = '0.1' // Hide the legend
})

judge.on('stop', () => {
  for (let i = 0; i < numberOfSquaresTall * numberOfSquaresWide; i++) {
    targets[i].fill(INACTIVE_COLOR).stroke({ width: 0 })
  }

  lineToCurrentTarget.hide()
  lineToNextTarget.hide()

  document.getElementById('legend')!.style.opacity = '1' // Show the legend
})

judge.on('newTask', () => {
  const lastTarget = currentTarget

  ;[currentTarget, nextTarget] = judge.getNextTwoTasks()

  // Make all squares inactive first
  for (let i = 0; i < numberOfSquaresTall * numberOfSquaresWide; i++) {
    targets[i].fill(INACTIVE_COLOR).stroke({ width: 0 })
  }

  if (currentTarget === undefined) return

  // Mark the active square
  targets[currentTarget].fill(ACTIVE_COLOR)
  targets[currentTarget].stroke({ color: GUIDE_COLOR, width: 3 })

  // Plot a line from the last target to the current target
  if (lastTarget !== undefined) {
    lineToCurrentTarget.plot(
      toCenter(Number(targets[lastTarget].x())),
      toCenter(Number(targets[lastTarget].y())),
      toCenter(Number(targets[currentTarget].x())),
      toCenter(Number(targets[currentTarget].y()))
    )
  }

  // Mark the next target if there is one
  if (nextTarget !== undefined) {
    targets[nextTarget].fill(SECONDARY_COLOR)

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

  // Update the guide line from the cursor to the current target
  lineToCurrentTarget.plot(
    e.offsetX,
    e.offsetY,
    toCenter(Number(targets[currentTarget].x())),
    toCenter(Number(targets[currentTarget].y()))
  )
})
