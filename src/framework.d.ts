declare const numberOfSquaresWide: number
declare const numberOfSquaresTall: number
declare const margin: number
declare const padding: number
declare const buttonSize: number
declare const canvasSize: string

declare class Judge {
  constructor(numberOfTasks: number, targets: EventTarget[], teamName: string)
  on(event: 'newTask', handler: () => void): void
  on(event: 'correctSquare', handler: () => void): void
  on(event: 'wrongSquare', handler: () => void): void
  on(event: 'testOver', handler: () => void): void
  on(event: 'reset', handler: () => void): void
  on(event: 'start', handler: () => void): void
  on(event: 'stop', handler: () => void): void
  getNextTwoTasks(): [number | undefined, number | undefined]
}
