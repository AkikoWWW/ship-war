import React from "react";
import "./App.css";
import { useGameState } from "./hooks/useGameState";
import GameBoard from "./components/GameBoard";
import PlacementControls from "./components/PlacementControls";
import TransitionScreen from "./components/TransitionScreen";

const App = () => {
  const {
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
  } = useGameState();

  const onCellClick = (r, c) => {
    if (phase === PHASE.PLACEMENT) {
      handlePlacementClick(r, c);
    } else if (phase === PHASE.BATTLE) {
      handleBattleClick(r, c);
    }
  };

  return (
    <div className="App">
      <h1>Морський Бій 🚢</h1>

      {(phase === PHASE.TRANSITION || phase === PHASE.GAMEOVER) && (
        <TransitionScreen
          message={transitionMessage}
          timer={timer}
          isGameOver={phase === PHASE.GAMEOVER}
          winner={winner}
        />
      )}

      {(phase === PHASE.PLACEMENT || phase === PHASE.BATTLE) && (
        <div>
          <h3>Хід Гравця {currentPlayer}</h3>

          {phase === PHASE.PLACEMENT && (
            <PlacementControls
              shipsToPlace={shipsToPlace}
              orientation={orientation}
              toggleOrientation={toggleOrientation}
            />
          )}

          {phase === PHASE.BATTLE && <p>Стріляйте по полю супротивника! 👇</p>}

          <GameBoard
            board={getBoardToDisplay()}
            phase={phase}
            onCellClick={onCellClick}
            currentPlayer={currentPlayer}
            isEnemyBoard={phase === PHASE.BATTLE}
          />
        </div>
      )}
    </div>
  );
};

export default App;
