
import pixi from 'pixi.js';
import config from './config';
import Keyboard from './Keyboard';
import ScoreDisplay from './ScoreDisplay';
import geometry from 'geometry';
import EventEmitter from 'event-emitter';
import { parseOctal } from './utils';

const defaults = {
  barHeight: 100,
  controls: {
    'up': null,
    'down': null
  },
  speed: 300
};

export default class Player {
  private color: number|string;
  public game: any;
  private graphics: any;
  private height: number;
  private keyboard: any;
  private lastUpdate: number;
  private lastFramelength: number;
  public score: number;
  private scoreDisplay: ScoreDisplay;
  public side: string;
  private speed: number;
  private width: number;
  private y: number;

  constructor(game, options) {
    EventEmitter.apply(this);

    this.game = game;
    this.side = options.side;
    this.width = config.BARS_WIDTH;
    this.height = options.height || defaults.barHeight;
    this.speed = options.speed || defaults.speed;
    this.lastUpdate = new Date().getTime();
    this.keyboard = new Keyboard(options.controls || defaults.controls);
    this.y = 0;
    this.score = 0;
    this.scoreDisplay = new ScoreDisplay(this);
    this.color = config.PLAYER_COLOR;

    if (options.side !== 'left' && options.side !== 'right') {
      this.side = 'left';
    }

    this.graphics = new pixi.Graphics();
    this.game.stage.addChild(this.graphics);

    this.render();
    this.updatePosition();

    this.game.on('update', function () {
      this.update();
    });

    this.game.on('resize', function () {
      this.resize();
    });

    this.game.on('reset', function () {
      this.reset();
    });

    this.game.on('restart', function () {
      this.restart();
    });
  };

  private addControls(controls): void {
    this.keyboard.addControls(controls);
  };

  private render(): void {
    this.graphics.beginFill(this.color);
    this.graphics.drawRect(0, 0, this.width, this.height);
    this.graphics.endFill();
  };

  private update(): void {
    this.graphics.position.y = this.screenY();

    if (this.keyboard.pressed.up) {
      this.move(-1);
    }

    if (this.keyboard.pressed.down) {
      this.move(1);
    }

    this.lastUpdate = new Date().getTime();
  };

  private move(direction): void {
    const elapsed: number = new Date().getTime() - this.lastUpdate || 1000 / 60;
    const distance: number = (elapsed / 1000) * this.speed;
    const stageHeight: number = this.game.renderer.height;
    let newY: number = this.y + distance * direction;

    if (newY > stageHeight / 2 - this.height / 2) {
      newY = stageHeight / 2 - this.height / 2;
    } else if (newY < -stageHeight / 2 + this.height / 2) {
      newY = -stageHeight / 2 + this.height / 2;
    }

    this.y = newY;
    this.lastFrameLength = elapsed;
  };

  private screenX(): number {
    const stageWidth: number = this.game.renderer.width;
    const spacing: number = config.LINES_DISTANCE + config.PLAYER_MARGIN;

    if (this.side === 'left') {
      return spacing;
    } else {
      return stageWidth - spacing - this.width;
    }
  };

  private screenY(): number {
    return this.y + this.game.renderer.height / 2 - this.height / 2;
  };

  private updatePosition(): void {
    this.graphics.position.x = this.screenX();
    this.graphics.position.y = this.screenY();
    this.scoreDisplay.updatePosition();
  };

  private resize(): void {
    this.updatePosition();
    this.scoreDisplay.resize();
  };

  private getBoundingBox(): any {
    return new geometry.Rect(
      { x: this.screenX(), y: this.screenY() },
      { width: this.width, height: this.height }
    );
  };

  private restart(): void {
    this.y = 0;
    this.update();
  };

  private reset(): void {
    this.score = 0;
    this.restart();
    this.scoreDisplay.update();
  };

  private addPoint(): void {
    this.score += 1;
    this.emit('point', this.score);
    this.game.emit('point', this);
  };

  private refresh(): void {
    this.graphics.clear();
    this.render();
  };

  public setHeight(height): void {
    this.height = height;
    this.refresh();
  };

  public setColor(color): void {
    this.color = parseOctal(color);
    this.refresh();
    this.game.updateIfStill();
  };

  public setSpeed(speed): void {
    this.speed = speed;
  };

  public setY(y): void {
    this.y = y;
  };
}
