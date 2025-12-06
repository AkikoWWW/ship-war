import React from "react";

const PlacementControls = ({
  shipsToPlace,
  orientation,
  toggleOrientation,
}) => {
  if (shipsToPlace.length === 0) {
    return <p>Усі кораблі розставлені. Чекаємо іншого гравця...</p>;
  }

  return (
    <div className="controls">
      <p>
        Розставте корабель розміром: <b>{shipsToPlace[0]}</b>
      </p>
      <button onClick={toggleOrientation}>
        Орієнтація: {orientation === "H" ? "Горизонтальна" : "Вертикальна"}
      </button>
    </div>
  );
};

export default PlacementControls;
