import { BOARD_SIZE, CELL_STATE } from '../constants'

const ORIENTATION_H = 'H'
const ORIENTATION_V = 'V'

export const createEmptyBoard = () =>
  Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY))

export const canPlaceShip = (board, startR, startC, size, orient) => {
  if (startR < 0 || startC < 0 || startR >= BOARD_SIZE || startC >= BOARD_SIZE) return false

  if (orient === ORIENTATION_H && startC + size > BOARD_SIZE) return false
  if (orient === ORIENTATION_V && startR + size > BOARD_SIZE) return false

  const startRow = Math.max(0, startR - 1)
  const endRow = Math.min(
    BOARD_SIZE - 1,
    (orient === ORIENTATION_V ? startR + size - 1 : startR) + 1,
  ) 

  const startCol = Math.max(0, startC - 1)
  const endCol = Math.min(
    BOARD_SIZE - 1,
    (orient === ORIENTATION_H ? startC + size - 1 : startC) + 1,
  ) 

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (board[r][c] === CELL_STATE.SHIP) {
        return false 
      }
    }
  }
  return true
}

export const placeShipOnBoard = (board, r, c, size, orientation) => {
  const newBoard = board.map((row) => [...row])
  for (let i = 0; i < size; i++) {
    if (orientation === ORIENTATION_H) newBoard[r][c + i] = CELL_STATE.SHIP
    else newBoard[r + i][c] = CELL_STATE.SHIP
  }
  return newBoard
}

export const hasShipsAlive = (board) => {
  return board.some((row) => row.some((cell) => cell === CELL_STATE.SHIP))
}

export const checkIfShipSunk = (board, hitR, hitC) => {
  const stack = [[hitR, hitC]]
  const visited = new Set()
  const shipCells = []
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]

  while (stack.length > 0) {
    const [r, c] = stack.pop()
    const key = `${r},${c}`

    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || visited.has(key)) continue
    
    if (board[r][c] !== CELL_STATE.HIT && board[r][c] !== CELL_STATE.SHIP) continue

    visited.add(key)
    shipCells.push(board[r][c])

    for (const [dr, dc] of directions) {
      stack.push([r + dr, c + dc])
    }
  }

  return shipCells.every((state) => state === CELL_STATE.HIT)
}

export const getRandomPlayer = () => (Math.random() < 0.5 ? 1 : 2)