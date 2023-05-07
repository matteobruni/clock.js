import type {
  ArmOptions,
  ClockOptions,
  Coordinates,
  TickOptions,
} from "./types";

export class Clock {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  private _center!: Coordinates;
  private _options!: ClockOptions;

  get center(): Coordinates {
    return this._center;
  }

  get options(): ClockOptions {
    return this._options;
  }

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.canvas = canvas;

      const rect = this.canvas.getBoundingClientRect();

      this.setRadius(Math.min(rect.width / 2, rect.height / 2));
    } else {
      this.canvas = document.createElement("canvas");

      this.setRadius(200);
    }

    const ctx = this.canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context not found");
    }

    this.ctx = ctx;
  }

  setRadius(radius: number): void {
    const factor = radius / 100;

    this._options = {
      radius,
      frame: {
        offset: 2.5 * factor,
        width: 3 * factor,
        colors: {
          background: "#fff",
          border: "#000",
        },
      },
      ticks: {
        show: true,
        offset: 2.5 * factor,
        minute: {
          color: "#000",
          width: 0.5 * factor,
          length: 3 * factor,
        },
        hour: {
          color: "#000",
          width: 1 * factor,
          length: 6 * factor,
        },
      },
      numbers: {
        show: true,
        color: "#000",
        radius: 92.5 * factor,
        size: 20 * factor,
      },
      arms: {
        cover: {
          show: true,
          width: 5 * factor,
          color: "#000",
        },
        hours: {
          length: 80 * factor,
          width: 1 * factor,
          color: "#000",
        },
        minutes: {
          length: 83.5 * factor,
          width: 0.75 * factor,
          color: "#000",
        },
        seconds: {
          show: true,
          continuous: true,
          length: 92.5 * factor,
          width: 0.5 * factor,
          color: "#f00",
        },
      },
    };

    this._prepareCanvas();
  }

  private _prepareCanvas() {
    const radius = this.options.radius + this.options.frame.width,
      diameter = radius * 2,
      fixedRadius = radius * devicePixelRatio,
      fixedDiameter = diameter * devicePixelRatio;

    this.canvas.style.width = `${diameter}px`;
    this.canvas.style.height = `${diameter}px`;

    this.canvas.width = fixedDiameter;
    this.canvas.height = fixedDiameter;

    this._center = { x: fixedRadius, y: fixedRadius };
  }

  private _drawSingleTick(angle: number, tickOptions: TickOptions) {
    const options = this.options,
      canvas = this.canvas,
      radius = canvas.width / 2,
      fixedAngle = angle * Math.PI * 2 - Math.PI / 2,
      fixedOffset = options.ticks.offset * devicePixelRatio,
      ctx = this.ctx,
      center = this.center,
      fixedWidth = tickOptions.width * devicePixelRatio,
      fixedLength = tickOptions.length * devicePixelRatio;

    ctx.beginPath();
    ctx.moveTo(
      center.x + Math.sin(fixedAngle) * (radius - (fixedLength + fixedOffset)),
      center.y + Math.cos(fixedAngle) * (radius - (fixedLength + fixedOffset))
    );
    ctx.lineTo(
      center.x + Math.sin(fixedAngle) * (radius - fixedOffset),
      center.y + Math.cos(fixedAngle) * (radius - fixedOffset)
    );
    ctx.lineWidth = fixedWidth;
    ctx.strokeStyle = tickOptions.color;
    ctx.stroke();
  }

  private _drawTick(angle: number, isHour: boolean) {
    const ticksOptions = this.options.ticks,
      tickOptions = isHour ? ticksOptions.hour : ticksOptions.minute;

    this._drawSingleTick(angle, tickOptions);
  }

  private _drawNumber(number: number, angle: number) {
    const options = this.options,
      ctx = this.ctx,
      center = this.center,
      width = options.numbers.size,
      fixedAngle = angle * Math.PI * 2 - Math.PI / 2,
      fixedWidth = width * devicePixelRatio,
      fixedRadius = options.numbers.radius * devicePixelRatio;

    const text = number.toString(),
      font = `${width}px Verdana`;

    ctx.font = font;

    const metrics = ctx.measureText(text),
      actualHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    ctx.font = font;
    ctx.textAlign = "center";
    ctx.fillStyle = options.numbers.color;
    ctx.fillText(
      text,
      Math.cos(fixedAngle) * (fixedRadius - fixedWidth / 4) + center.x,
      Math.sin(fixedAngle) * (fixedRadius - actualHeight) +
        center.y +
        actualHeight / 2,
      fixedWidth
    );
  }

  private _drawFrame() {
    const options = this.options,
      ctx = this.ctx,
      center = this.center,
      canvas = this.canvas,
      fixedOffset = options.frame.offset * devicePixelRatio,
      fixedWidth = options.frame.width * devicePixelRatio;

    ctx.beginPath();
    ctx.arc(center.x, center.y, canvas.width / 2 - fixedOffset, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.lineWidth = fixedWidth;
    ctx.strokeStyle = options.frame.colors.border;
    ctx.stroke();

    ctx.fillStyle = options.frame.colors.background;
    ctx.fill();

    if (options.numbers.show) {
      for (let i = 1; i <= 12; i++) {
        this._drawNumber(i, i / 12);
      }
    }

    if (options.ticks.show) {
      for (let i = 1; i <= 60; i++) {
        const isHour = i % 5 === 0;

        this._drawTick(i / 60, isHour);
      }
    }
  }

  private _drawArm(angle: number, options: ArmOptions): void {
    const ctx = this.ctx,
      center = this.center,
      fixedAngle = angle * Math.PI * 2 - Math.PI / 2,
      fixedLength = options.length * devicePixelRatio,
      fixedWidth = options.width * devicePixelRatio;

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(
      center.x + Math.cos(fixedAngle) * fixedLength,
      center.y + Math.sin(fixedAngle) * fixedLength
    );

    ctx.lineWidth = fixedWidth;
    ctx.strokeStyle = options.color;
    ctx.stroke();
  }

  private _drawArmCover() {
    const options = this.options,
      ctx = this.ctx,
      center = this.center,
      fixedWidth = options.arms.cover.width * devicePixelRatio;

    ctx.beginPath();
    ctx.arc(center.x, center.y, fixedWidth, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fillStyle = options.arms.cover.color;
    ctx.fill();
  }

  draw(date: Date): void {
    const canvas = this.canvas,
      options = this.options,
      ctx = this.ctx,
      hours = date.getHours(),
      minutes = date.getMinutes(),
      seconds = date.getSeconds(),
      milliseconds = options.arms.seconds.continuous
        ? date.getMilliseconds()
        : 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this._drawFrame();

    const fixedSeconds = seconds + milliseconds / 1000,
      fixedMinutes = minutes + fixedSeconds / 60,
      fixedHours = hours + fixedMinutes / 60;

    this._drawArm(fixedHours / 12, options.arms.hours);

    this._drawArm(fixedMinutes / 60, options.arms.minutes);

    if (options.arms.seconds.show) {
      this._drawArm(fixedSeconds / 60, options.arms.seconds);
    }

    if (options.arms.cover.show) {
      this._drawArmCover();
    }
  }
}
