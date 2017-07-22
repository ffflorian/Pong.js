import { parseOctal } from './utils';
import * as keycode from 'keycode';
import Arena from './Arena';
import Ball from './Ball';
import config from './config';
import EventEmitter from 'event-emitter';
import extend from 'deep-extend';
import Loop from 'game-loop';
import MessageScreen from './MessageScreen';
import PauseScreen from './PauseScreen';
import pixi from 'pixi.js';
import Player from './Player';
import StartScreen from './StartScreen';

const ballDefaults = {
  color: config.BALL_COLOR,
  image: null,
  size: config.BALL_SIZE,
  speed: config.BALL_SPEED,
  velocity: [ config.BALL_SPEED, config.BALL_SPEED ]
}

export default class Pong {
  private arena: Arena;
  private backgroundImage: any;
  private balls: Array<Ball>;
  private ballSettings: any;
  private bounces: number;
  private endScreen: MessageScreen;
  private emit: Function;
  private hits: number;
  private loop: Loop;
  private on: Function;
  private pauseScreen: PauseScreen;
  private players: {a: Player, b: Player};
  private renderer: any;
  private stage: any;
  private started: boolean;
  private startScreen: StartScreen;
  private totalBounces: number;
  private totalHits: number;
  private won: boolean;
  private wrapper: any;

  constructor(wrapper) {
    EventEmitter.apply(this);

    this.wrapper = wrapper;
    this.stage = new pixi.Application(config.BG_COLOR).stage;
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
    this.arena = new Arena(this);
    this.startScreen = new StartScreen(this);
    this.pauseScreen = new PauseScreen(this);
    this.endScreen = new MessageScreen(this);
    this.hits = 0;
    this.totalHits = 0;
    this.bounces = 0;
    this.totalBounces = 0;
    this.ballSettings = extend({}, ballDefaults);
    this.started = false;

    this.players = {
      a: new Player(this, { side: 'left' }),
      b: new Player(this, { side: 'right' })
    }

    this.resize();
    this.startScreen.show();
    this.endScreen.hide();
    this.update();

    wrapper.appendChild(this.renderer.view);

    this.loop.use(function (): void {
      this.update();
    });

    this.on('bounce', function (): void {
      this.bounces += 1;
      this.totalBounces += 1;
    });

    this.on('hit', function (): void {
      this.hits += 1;
      this.totalHits += 1;
    });

    document.addEventListener('keydown', (e): void => {
      var key = keycode(e.keyCode);

      if (key === 'p') {
        this.togglePause();
      } else if (key === 'esc' || key === 'r') {
        this.reset();
        this.endScreen.hide();
      } else if (key === 'enter' && this.won) {
        this.reset();
        this.won = false;
        this.loop.play();
        this.endScreen.hide();
        this.start();
      }
    });
  }

  private addBall(): Ball {
    var ball = new Ball(this, {
      color: this.ballSettings.color,
      image: this.ballSettings.image,
      size: this.ballSettings.size,
      speed: this.ballSettings.speed,
      velocity: this.ballSettings.velocity,
      x: 0,
      y: 0
    });

    this.balls.push(ball);
    return ball;
  }

  private start(): void {
    this.addBall();
    this.loop.play();
    this.started = true;
    this.emit('start', this);
  }

  private pause(): void {
    if (this.started) {
      this.emit('pause', this);
      this.loop.stop();
    }
  }

  private resume(): void {
    if (this.started) {
      this.emit('resume', this);
      this.loop.play();
    }
  }

  private togglePause(): void {
    if (!this.loop.playing) {
      this.resume();
    } else {
      this.pause();
    }
  }

  private update(): void {
    if (this.started) {
      this.emit('beforeupdate', this);
      this.refresh();
      this.emit('update', this);
    }
  }

  private refresh(): void {
    this.renderer.render(this.stage);
  }

  private updateIfStill(): void {
    if (!this.loop.playing) {
      this.refresh();
    }
  }

  private resize(): void {
    const width = this.wrapper.clientWidth;
    const height = this.wrapper.clientHeight;

    this.updateBackgroundSize();
    this.renderer.resize(width, height);
    this.emit('resize', width, height, this);
    this.renderer.render(this.stage);
  }

  private updateBackgroundSize(): void {
    if (this.backgroundImage) {
      this.backgroundImage.width = this.renderer.width;
      this.backgroundImage.height = this.renderer.height;
    }
  }

  private restart(addBall, dir?): void {
    let ball;

    this.hits = 0;
    this.bounces = 0;

    this.resetBalls();

    if (addBall) {
      ball = this.addBall();
      ball.rebound(dir || 0);
    }

    this.emit('restart', this);
    this.refresh();
  }

  private reset(): void {
    this.totalHits = 0;
    this.totalBounces = 0;
    this.restart(false);
    this.pause();
    this.emit('reset', this);
    this.started = false;
    this.refresh();
  }

  private resetBalls(): void {
    for (var i = 0; i < this.balls.length; i += 1) {
      this.balls[i].remove();
    }

    this.balls = [];
  }

  private setBackgroundColor(color): void {
    if (this.renderer instanceof pixi.CanvasRenderer) {
      color = color.split('#')[1];
    } else {
      color = parseOctal(color);
    }

    this.stage.setBackgroundColor(color);
    this.updateIfStill();
  }

  private setBackgroundImage(image): void {
    if (this.backgroundImage) {
      this.stage.removeChild(this.backgroundImage);
    }

    this.backgroundImage = pixi.Sprite.fromImage(image);
    this.updateBackgroundSize();
    this.stage.addChildAt(this.backgroundImage, 0);
    var self = this;

    var preload = new Image();
    preload.src = image;

    this.backgroundImage.texture.baseTexture.on('loaded', function (): void {
      this.refresh();
    });
  }

  private setLinesColor(color): void {
    this.emit('setLinesColor', color);
    this.updateIfStill();
  }

  private setTextStyle(style): void {
    this.emit('setTextStyle', style);
    this.updateIfStill();
  }

  private setBallColor(color): void {
    this.ballSettings.color = color;
    this.emit('setBallColor', color);
  }

  private setBallImage(image): void {
    this.ballSettings.image = image;
    this.emit('setBallImage', image);
  }

  private setBallSize(size): void {
    this.ballSettings.size = size;
    this.emit('setBallSize', size);
  }

  private setBallSpeed(speed): void {
    this.ballSettings.speed = speed;
    this.emit('setBallSpeed', speed);
  }

  private setBallVelocity(velocity): void {
    this.ballSettings.velocity = velocity;
    this.emit('setBallVelocity', velocity);
  }

  private win(message): void {
    this.loop.stop();
    this.endScreen.setMessage(message);
    this.endScreen.show();
    this.won = true;
  }
};
