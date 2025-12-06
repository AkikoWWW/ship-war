import React from "react";
import { CELL_STATE } from "../constants";

const Cell = ({ value, onClick, isEnemyBoard, isBattlePhase }) => {
  let className = "cell";
  let displayValue = "";

  if (value === CELL_STATE.HIT) {
    className += " hit";
    displayValue = "X";
  } else if (value === CELL_STATE.MISS) {
    className += " miss";
    displayValue = "•";
  } else if (value === CELL_STATE.SHIP) {
    if (!isEnemyBoard) {
      className += " ship";
    }
  }

  return (
    <div className="cell-wrapper">
      <div className={className} onClick={onClick}>
        {displayValue}
      </div>
    </div>
  );
};

export default Cell;
