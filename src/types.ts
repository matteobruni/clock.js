export interface TickOptions {
  color: string;
  width: number;
  length: number;
}

export interface ArmOptions {
  length: number;
  width: number;
  color: string;
}

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
    minute: TickOptions;
    hour: TickOptions;
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
    hours: ArmOptions;
    minutes: ArmOptions;
    seconds: ArmOptions & {
      show: boolean;
      continuous: boolean;
    };
  };
}

export interface Coordinates {
  x: number;
  y: number;
}
