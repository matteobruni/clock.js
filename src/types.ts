export interface ClockOptions {
  radius: number;
  frame: {
    offset: number;
    width: number;
  };
  ticks: {
    show: boolean;
    offset: number;
    minute: {
      width: number;
      length: number;
    };
    hour: {
      width: number;
      length: number;
    };
  };
  numbers: {
    show: boolean;
    radius: number;
    size: number;
  };
  arms: {
    cover: {
      show: boolean;
      width: number;
    };
    hours: {
      length: number;
      width: number;
    };
    minutes: {
      length: number;
      width: number;
    };
    seconds: {
      show: boolean;
      continuous: boolean;
      length: number;
      width: number;
    };
  };
}

export interface Coordinates {
  x: number;
  y: number;
}
