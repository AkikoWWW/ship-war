import React from "react";

const TransitionScreen = ({ message, timer, isGameOver, winner }) => {
  if (isGameOver) {
    return (
      <div className="transition-screen" style={{ background: "black" }}>
        <h1>ГРУ ЗАКІНЧЕНО</h1>
        <h2>Переміг Гравець {winner}!</h2>
        <button onClick={() => window.location.reload()}>Нова гра</button>
      </div>
    );
  }

  return (
    <div className="transition-screen">
      <h2>Увага! Зміна ходу</h2>
      <p>{message}</p>
      <h1>{timer}</h1>
      <p>Не підглядайте!</p>
    </div>
  );
};

export default TransitionScreen;
