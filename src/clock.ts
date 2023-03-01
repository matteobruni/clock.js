import type { ClockOptions, Coordinates } from "./types";

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
        width: 1.5 * factor,
      },
      ticks: {
        show: true,
        offset: 3 * factor,
        minute: {
          width: 0.5 * factor,
          length: 3 * factor,
        },
        hour: {
          width: 1 * factor,
          length: 6 * factor,
        },
      },
      numbers: {
        show: true,
        radius: 92.5 * factor,
        size: 20 * factor,
      },
      arms: {
        cover: {
          show: true,
          width: 5 * factor,
        },
        hours: {
          length: 80 * factor,
          width: 1 * factor,
        },
        minutes: {
          length: 83.5 * factor,
          width: 0.75 * factor,
        },
        seconds: {
          show: true,
          continuous: true,
          length: 92.5 * factor,
          width: 0.5 * factor,
        },
      },
    };

    this.canvas.style.width = `${this.options.radius * 2}px`;
    this.canvas.style.height = `${this.options.radius * 2}px`;

    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;

    this._center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
  }

  private _drawTick(angle: number, isHour: boolean) {
    const canvas = this.canvas,
      options = this.options,
      ctx = this.ctx,
      center = this.center,
      fixedAngle = angle * Math.PI * 2 - Math.PI / 2,
      fixedWidth =
        (isHour ? options.ticks.hour.width : options.ticks.minute.width) *
        devicePixelRatio,
      fixedLength =
        (isHour ? options.ticks.hour.length : options.ticks.minute.length) *
        devicePixelRatio,
      fixedOffset = options.ticks.offset * devicePixelRatio;

    const radius = canvas.width / 2;

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
    ctx.stroke();
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
      fontHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
      actualHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    ctx.font = font;
    ctx.textAlign = "center";
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
    ctx.strokeStyle = "black";
    ctx.stroke();

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

  private _drawArm(
    angle: number,
    options: { length: number; width: number }
  ): void {
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
