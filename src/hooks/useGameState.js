import { useState, useEffect, useRef } from 'react'
import {
  SHIPS_CONFIG,
  CELL_STATE,
  PHASE,
  TRANSITION_DURATION_MS,
  TIMER_INTERVAL_MS,
} from '../constants'
import {
  createEmptyBoard,
  canPlaceShip,
  placeShipOnBoard,
  hasShipsAlive,
  checkIfShipSunk,
  getRandomPlayer,
} from '../utils/gameLogic'

export const useGameState = () => {
  const [phase, setPhase] = useState(PHASE.PLACEMENT)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [winner, setWinner] = useState(null)

  const [p1Board, setP1Board] = useState(createEmptyBoard())
  const [p2Board, setP2Board] = useState(createEmptyBoard())

  const [shipsToPlace, setShipsToPlace] = useState([...SHIPS_CONFIG])
  const [orientation, setOrientation] = useState('H')

  const [transitionMessage, setTransitionMessage] = useState('')
  const [timer, setTimer] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  const clearMessages = () => {
    setTimeout(() => {
      setErrorMessage('')
      setInfoMessage('')
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const startTransition = (msg, callback, nextPhase = PHASE.BATTLE) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    setPhase(PHASE.TRANSITION)
    setTransitionMessage(msg)
    setTimer(Math.ceil(TRANSITION_DURATION_MS / TIMER_INTERVAL_MS))

    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, TIMER_INTERVAL_MS)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      callback()
      setPhase(nextPhase)
    }, TRANSITION_DURATION_MS)
  }

  const handlePlayerTransition = () => {
    const remainingShips = shipsToPlace.slice(1)
    setShipsToPlace(remainingShips)

    if (remainingShips.length === 0) {
      if (currentPlayer === 1) {
        startTransition(
          'Гравець 2, готуйтеся розставляти кораблі!',
          () => {
            setCurrentPlayer(2)
            setShipsToPlace([...SHIPS_CONFIG])
            setErrorMessage('')
            setInfoMessage('')
          },
          PHASE.PLACEMENT,
        )
      } else {
        const first = getRandomPlayer()
        startTransition(
          `Всі кораблі розставлені! Починає Гравець ${first}`,
          () => {
            setCurrentPlayer(first)
            setErrorMessage('')
            setInfoMessage('')
          },
          PHASE.BATTLE,
        )
      }
    }
  }

  const handlePlacementClick = (r, c) => {
    const boardSize = p1Board.length
    if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
      setErrorMessage('Недійсна координата. Спробуйте ще раз.')
      clearMessages()
      return
    }

    if (shipsToPlace.length === 0) return

    const currentSize = shipsToPlace[0]
    const board = currentPlayer === 1 ? p1Board : p2Board

    if (!canPlaceShip(board, r, c, currentSize, orientation)) {
      setErrorMessage('Не можна поставити тут корабель! Перевірте межі та сусідні кораблі.')
      clearMessages()
      return
    }

    const newBoard = placeShipOnBoard(board, r, c, currentSize, orientation)

    if (currentPlayer === 1) setP1Board(newBoard)
    else setP2Board(newBoard)

    setErrorMessage('')
    handlePlayerTransition()
  }

  const handleBattleClick = (r, c) => {
    const [enemyBoard, setEnemyBoard] =
      currentPlayer === 1 ? [p2Board, setP2Board] : [p1Board, setP1Board]

    const boardSize = enemyBoard.length
    if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
      setErrorMessage('Недійсна координата. Спробуйте ще раз.')
      clearMessages()
      return
    }

    if (enemyBoard[r][c] === CELL_STATE.HIT || enemyBoard[r][c] === CELL_STATE.MISS) {
      setErrorMessage('Ви вже стріляли в цю клітинку!')
      clearMessages()
      return
    }

    const newBoard = enemyBoard.map((row) => [...row])
    let hit = false
    let sunk = false
    let transitionMsg = ''
    let nextPlayer = currentPlayer === 1 ? 2 : 1

    if (newBoard[r][c] === CELL_STATE.SHIP) {
      newBoard[r][c] = CELL_STATE.HIT
      hit = true

      if (!hasShipsAlive(newBoard)) {
        setEnemyBoard(newBoard)
        setWinner(currentPlayer)
        setPhase(PHASE.GAMEOVER)
        setErrorMessage('')
        setInfoMessage('')
        return
      }

      sunk = checkIfShipSunk(newBoard, r, c)

      if (sunk) {
        setInfoMessage(`🔥 ЗНИЩЕНО! Корабель противника затонув. Стріляйте ще раз!`)
      } else {
        setInfoMessage('Влучив! Стріляйте ще раз!')
      }
    } else {
      newBoard[r][c] = CELL_STATE.MISS
      hit = false
      transitionMsg = `Промах!\nХід переходить до Гравця ${nextPlayer}`
    }

    setEnemyBoard(newBoard)
    setErrorMessage('')

    if (!hit) {
      startTransition(transitionMsg, () => {
        setCurrentPlayer(nextPlayer)
        setInfoMessage('')
      })
    } else {
      clearMessages()
    }
  }

  const getBoardToDisplay = () => {
    if (phase === PHASE.PLACEMENT) {
      return currentPlayer === 1 ? p1Board : p2Board
    }
    return currentPlayer === 1 ? p2Board : p1Board
  }

  const toggleOrientation = () => setOrientation((prev) => (prev === 'H' ? 'V' : 'H'))

  return {
    phase,
    currentPlayer,
    winner,
    shipsToPlace,
    orientation,
    transitionMessage,
    timer,
    errorMessage,
    infoMessage,
    handlePlacementClick,
    handleBattleClick,
    getBoardToDisplay,
    toggleOrientation,
    PHASE,
    CELL_STATE,
  }
}