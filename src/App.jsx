import React, { useState, useEffect } from "react";
import "./App.css";

const BOARD_SIZE = 10;

const SHIPS_CONFIG = [5, 3, 2, 2, 1, 1, 1];

const CELL_STATE = {
  EMPTY: 0,
  SHIP: 1,
  MISS: 2,
  HIT: 3,
};

const createEmptyBoard = () =>
  Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY));

const App = () => {
  const [phase, setPhase] = useState("placement");
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);

  const [p1Board, setP1Board] = useState(createEmptyBoard());
  const [p2Board, setP2Board] = useState(createEmptyBoard());

  const [shipsToPlace, setShipsToPlace] = useState([...SHIPS_CONFIG]);
  const [orientation, setOrientation] = useState("H");

  const [transitionMessage, setTransitionMessage] = useState("");
  const [timer, setTimer] = useState(3);

  const handlePlacementClick = (r, c) => {
    if (shipsToPlace.length === 0) return;

    const currentSize = shipsToPlace[0];
    const board = currentPlayer === 1 ? [...p1Board] : [...p2Board];

    if (!canPlaceShip(board, r, c, currentSize, orientation)) {
      alert("Не можна поставити тут корабель!");
      return;
    }

    const newBoard = board.map((row) => [...row]);
    for (let i = 0; i < currentSize; i++) {
      if (orientation === "H") newBoard[r][c + i] = CELL_STATE.SHIP;
      else newBoard[r + i][c] = CELL_STATE.SHIP;
    }

    if (currentPlayer === 1) setP1Board(newBoard);
    else setP2Board(newBoard);

    const remainingShips = shipsToPlace.slice(1);
    setShipsToPlace(remainingShips);

    if (remainingShips.length === 0) {
      if (currentPlayer === 1) {
        startTransition("Гравець 2, готуйтеся розставляти кораблі!", () => {
          setCurrentPlayer(2);
          setShipsToPlace([...SHIPS_CONFIG]);
          setPhase("placement");
        });
      } else {
        const first = Math.random() < 0.5 ? 1 : 2;
        startTransition(
          `Всі кораблі розставлені! Починає Гравець ${first}`,
          () => {
            setCurrentPlayer(first);
            setPhase("battle");
          }
        );
      }
    }
  };

  const canPlaceShip = (board, startR, startC, size, orient) => {
    const startRow = Math.max(0, startR - 1);
    const endRow = Math.min(
      BOARD_SIZE - 1,
      (orient === "V" ? startR + size : startR) + 1
    );

    const startCol = Math.max(0, startC - 1);
    const endCol = Math.min(
      BOARD_SIZE - 1,
      (orient === "H" ? startC + size : startC) + 1
    );

    if (orient === "H" && startC + size > BOARD_SIZE) return false;
    if (orient === "V" && startR + size > BOARD_SIZE) return false;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (board[r][c] === CELL_STATE.SHIP) {
          return false;
        }
      }
    }
    return true;
  };

  const handleBattleClick = (r, c) => {
    const enemyBoard = currentPlayer === 1 ? p2Board : p1Board;
    const setEnemyBoard = currentPlayer === 1 ? setP2Board : setP1Board;

    if (
      enemyBoard[r][c] === CELL_STATE.HIT ||
      enemyBoard[r][c] === CELL_STATE.MISS
    )
      return;

    const newBoard = enemyBoard.map((row) => [...row]);
    let hit = false;

    if (newBoard[r][c] === CELL_STATE.SHIP) {
      newBoard[r][c] = CELL_STATE.HIT;
      hit = true;
      if (!hasShipsAlive(newBoard)) {
        setEnemyBoard(newBoard);
        setWinner(currentPlayer);
        setPhase("gameover");
        return;
      }
    } else {
      newBoard[r][c] = CELL_STATE.MISS;
    }

    setEnemyBoard(newBoard);

    if (!hit) {
      startTransition(
        `Промах! Хід переходить до Гравця ${currentPlayer === 1 ? 2 : 1}`,
        () => {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }
      );
    } else {
    }
  };

  const hasShipsAlive = (board) => {
    return board.some((row) => row.some((cell) => cell === CELL_STATE.SHIP));
  };

  const startTransition = (msg, callback) => {
    setPhase("transition");
    setTransitionMessage(msg);
    setTimer(1);

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      callback();
      if (phase !== "gameover")
        setPhase((prev) =>
          prev === "transition"
            ? msg.includes("розставляти")
              ? "placement"
              : "battle"
            : prev
        );
    }, 3000);
  };

  const renderCell = (val, r, c, isEnemyBoard) => {
    let className = "cell";
    if (val === CELL_STATE.SHIP) className += isEnemyBoard ? "" : " ship";
    if (val === CELL_STATE.HIT) className += " hit";
    if (val === CELL_STATE.MISS) className += " miss";

    return (
      <div
        key={`${r}-${c}`}
        className={className}
        onClick={() => {
          if (phase === "placement") handlePlacementClick(r, c);
          if (phase === "battle") handleBattleClick(r, c);
        }}
      >
        {val === CELL_STATE.HIT ? "X" : val === CELL_STATE.MISS ? "•" : ""}
      </div>
    );
  };

  return (
    <div className="App">
      <h1>Морський Бій</h1>

      {phase === "transition" && (
        <div className="transition-screen">
          <h2>Увага! Зміна ходу</h2>
          <p>{transitionMessage}</p>
          <h1>{timer}</h1>
          <p>Не підглядайте!</p>
        </div>
      )}

      {phase === "gameover" && (
        <div className="transition-screen" style={{ background: "black" }}>
          <h1>ГРУ ЗАКІНЧЕНО</h1>
          <h2>Переміг Гравець {winner}!</h2>
          <button onClick={() => window.location.reload()}>Нова гра</button>
        </div>
      )}

      {(phase === "placement" || phase === "battle") && (
        <div>
          <h3>Хід Гравця {currentPlayer}</h3>

          {phase === "placement" && (
            <div className="controls">
              <p>
                Розставте корабель розміром: <b>{shipsToPlace[0]}</b>
              </p>
              <button
                onClick={() => setOrientation(orientation === "H" ? "V" : "H")}
              >
                Орієнтація:{" "}
                {orientation === "H" ? "Горизонтальна" : "Вертикальна"}
              </button>
            </div>
          )}

          {phase === "battle" && <p>Стріляйте по полю супротивника!</p>}

          <div className="board">
            {(phase === "placement"
              ? currentPlayer === 1
                ? p1Board
                : p2Board
              : currentPlayer === 1
              ? p2Board
              : p1Board
            ).map((row, r) =>
              row.map((cell, c) => renderCell(cell, r, c, phase === "battle"))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
