export const BOARD_SIZE = 10;

export const SHIPS_CONFIG = [5, 3, 2, 2, 1, 1, 1];

export const CELL_STATE = {
  EMPTY: 0,
  SHIP: 1,
  MISS: 2,
  HIT: 3,
};

export const PHASE = {
  PLACEMENT: "placement",
  BATTLE: "battle",
  TRANSITION: "transition",
  GAMEOVER: "gameover",
};

export const TRANSITION_DURATION_MS = 3000;
export const TIMER_INTERVAL_MS = 1000;
