import { useState, useEffect, useRef } from "react";
import {
  SHIPS_CONFIG,
  CELL_STATE,
  PHASE,
  TRANSITION_DURATION_MS,
  TIMER_INTERVAL_MS,
} from "../constants";
import {
  createEmptyBoard,
  canPlaceShip,
  placeShipOnBoard,
  hasShipsAlive,
  checkIfShipSunk,
  getRandomPlayer,
} from "../utils/gameLogic";

export const useGameState = () => {
  const [phase, setPhase] = useState(PHASE.PLACEMENT);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);

  const [p1Board, setP1Board] = useState(createEmptyBoard());
  const [p2Board, setP2Board] = useState(createEmptyBoard());

  const [shipsToPlace, setShipsToPlace] = useState([...SHIPS_CONFIG]);
  const [orientation, setOrientation] = useState("H");

  const [transitionMessage, setTransitionMessage] = useState("");
  const [timer, setTimer] = useState(0);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startTransition = (msg, callback, nextPhase = PHASE.BATTLE) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setPhase(PHASE.TRANSITION);
    setTransitionMessage(msg);
    setTimer(Math.ceil(TRANSITION_DURATION_MS / TIMER_INTERVAL_MS));

    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, TIMER_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      callback();
      setPhase(nextPhase);
    }, TRANSITION_DURATION_MS);
  };

  const handlePlayerTransition = () => {
    const remainingShips = shipsToPlace.slice(1);
    setShipsToPlace(remainingShips);

    if (remainingShips.length === 0) {
      if (currentPlayer === 1) {
        startTransition(
          "Гравець 2, готуйтеся розставляти кораблі!",
          () => {
            setCurrentPlayer(2);
            setShipsToPlace([...SHIPS_CONFIG]);
          },
          PHASE.PLACEMENT
        );
      } else {
        const first = getRandomPlayer();
        startTransition(
          `Всі кораблі розставлені! Починає Гравець ${first}`,
          () => {
            setCurrentPlayer(first);
          },
          PHASE.BATTLE
        );
      }
    }
  };

  const handlePlacementClick = (r, c) => {
    if (shipsToPlace.length === 0) return;

    const currentSize = shipsToPlace[0];
    const board = currentPlayer === 1 ? p1Board : p2Board;

    if (!canPlaceShip(board, r, c, currentSize, orientation)) {
      console.warn("Не можна поставити тут корабель!");
      return;
    }

    const newBoard = placeShipOnBoard(board, r, c, currentSize, orientation);

    if (currentPlayer === 1) setP1Board(newBoard);
    else setP2Board(newBoard);

    handlePlayerTransition();
  };

  const handleBattleClick = (r, c) => {
    const [enemyBoard, setEnemyBoard] =
      currentPlayer === 1 ? [p2Board, setP2Board] : [p1Board, setP1Board];

    if (
      enemyBoard[r][c] === CELL_STATE.HIT ||
      enemyBoard[r][c] === CELL_STATE.MISS
    ) {
      return;
    }

    const newBoard = enemyBoard.map((row) => [...row]);
    let hit = false;
    let sunk = false;
    let transitionMsg = "";

    if (newBoard[r][c] === CELL_STATE.SHIP) {
      newBoard[r][c] = CELL_STATE.HIT;
      hit = true;

      if (!hasShipsAlive(newBoard)) {
        setEnemyBoard(newBoard);
        setWinner(currentPlayer);
        setPhase(PHASE.GAMEOVER);
        return;
      }

      sunk = checkIfShipSunk(newBoard, r, c);

      if (sunk) {
        transitionMsg =
          "🔥 ЗНИЩЕНО! Корабель противника затонув. Хід переходить до Гравця " +
          (currentPlayer === 1 ? 2 : 1);
      }
    } else {
      newBoard[r][c] = CELL_STATE.MISS;
      transitionMsg = `Промах! Хід переходить до Гравця ${
        currentPlayer === 1 ? 2 : 1
      }`;
    }

    setEnemyBoard(newBoard);

    if (!hit || sunk) {
      if (!hit) {
        startTransition(transitionMsg, () => {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        });
      } else if (sunk) {
        startTransition(transitionMsg, () => {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        });
      }
    } else {
      console.log("Влучив! Стріляйте ще раз!");
    }
  };

  const getBoardToDisplay = () => {
    if (phase === PHASE.PLACEMENT) {
      return currentPlayer === 1 ? p1Board : p2Board;
    }
    return currentPlayer === 1 ? p2Board : p1Board;
  };

  const toggleOrientation = () =>
    setOrientation((prev) => (prev === "H" ? "V" : "H"));

  return {
    phase,
    currentPlayer,
    winner,
    shipsToPlace,
    orientation,
    transitionMessage,
    timer,
    handlePlacementClick,
    handleBattleClick,
    getBoardToDisplay,
    toggleOrientation,
    PHASE,
    CELL_STATE,
  };
};
