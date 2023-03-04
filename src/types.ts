export interface ClockOptions {
  radius: number;
  frame: {
    offset: number;
    width: number;
    colors: {
      background: string;
      border: string;
    };
  };
  ticks: {
    show: boolean;
    offset: number;
    minute: {
      color: string;
      width: number;
      length: number;
    };
    hour: {
      color: string;
      width: number;
      length: number;
    };
  };
  numbers: {
    show: boolean;
    color: string;
    radius: number;
    size: number;
  };
  arms: {
    cover: {
      show: boolean;
      width: number;
      color: string;
    };
    hours: {
      length: number;
      width: number;
      color: string;
    };
    minutes: {
      length: number;
      width: number;
      color: string;
    };
    seconds: {
      show: boolean;
      continuous: boolean;
      length: number;
      width: number;
      color: string;
    };
  };
}

export interface Coordinates {
  x: number;
  y: number;
}
