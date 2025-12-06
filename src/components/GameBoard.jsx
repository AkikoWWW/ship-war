import React from "react";
import Cell from "./Cell";
import { PHASE } from "../constants";
import "./GameBoard.css";

const GameBoard = ({
  board,
  phase,
  onCellClick,
  currentPlayer,
  isEnemyBoard,
}) => {
  const displayEnemyState = phase === PHASE.BATTLE;

  return (
    <div className="board">
      <h3>
        {phase === PHASE.PLACEMENT
          ? `Гравець ${currentPlayer} (Ваша дошка)`
          : `Гравець ${currentPlayer === 1 ? 2 : 1} (Поле супротивника)`}
      </h3>
      <div className="board-grid">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              value={cell}
              onClick={() => onCellClick(r, c)}
              isEnemyBoard={displayEnemyState}
              isBattlePhase={phase === PHASE.BATTLE}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;
