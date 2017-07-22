import pixi from 'pixi.js';
import geometry from 'geometry';
import Config from './config';
import { parseOctal } from './utils';

const defaultOptions = {
  color: Config.BALL_COLOR,
  image: '',
  size: Config.BALL_SIZE,
  speed: Config.BALL_SPEED,
  velocity: [Config.BALL_SPEED, Config.BALL_SPEED],
};

export default class Ball {
  private color: string|number;
  private game: any;
  private graphics: any;
  private image: any;
  private lastUpdate: number;
  private removed: boolean;
  private size: number;
  private speed: number;
  private sprite: any;
  private velocity: {x: number, y: number};
  private x: number;
  private y: number;

  constructor(game, options = defaultOptions) {
    options = Object.assign(defaultOptions, options);

    this.game =  game;
    this.x = options.x;
    this.y = options.y;
    this.size = options.size;
    this.setSpeed(options.speed);
    this.setVelocity(options.velocity);
    this.lastUpdate = new Date().getTime();
    this.removed = false;
    this.color = parseOctal(options.color.toString());

    this.graphics = new pixi.Graphics();

    if (options.image) {
      this.setImage(options.image);
    }

    this.render();

    this.game.on('update', function () {
      if (!this.removed) {
        this.update();
      }
    });

    this.game.on('resize', function () {
      if (!this.removed) {
        this.updatePosition();
      }
    });

    this.game.on('setBallColor', function (color) {
      if (!this.removed) {
        this.setColor(color);
      }
    });

    this.game.on('setBallImage', function (image) {
      if (!this.removed) {
        this.setImage(image);
      }
    });

    this.game.on('setBallSize', function (size) {
      if (!this.removed) {
        this.setSize(size);
      }
    });

    this.game.on('setBallSpeed', function (speed) {
      if (!this.removed) {
        this.setSpeed(speed);
      }
    });

    this.game.on('setBallVelocity', function (velocity) {
      if(!this.removed) {
        this.setVelocity(velocity);
      }
    });

    this.game.on('resume', function () {
      if (!this.removed) {
        this.lastUpdate = new Date().getTime();
      }
    });
  }

  private render(): void {
    if (this.sprite) {
      this.graphics.removeChild(this.sprite);
    }

    if (this.image) {
      this.sprite = pixi.Sprite.fromImage(this.image);
      this.graphics.addChild(this.sprite);
      this.sprite.width = this.size * 2;
      this.sprite.position.x = - this.size;
      this.sprite.position.y = - this.size;
      this.sprite.height = this.size * 2;
    } else {
      this.graphics = new pixi.Graphics();
      this.graphics.beginFill(this.color, 1);
      this.graphics.drawCircle(0, 0, this.size);
      this.graphics.endFill();
    }

    this.game.stage.addChild(this.graphics);

    this.updatePosition();
  }

  public refresh(): void {
    this.render();
  }

  private updatePosition(): void {
    var elapsed = new Date().getTime() - this.lastUpdate;

    this.x += (elapsed / 50) * this.velocity.x;
    this.y += (elapsed / 50) * this.velocity.y;

    this.graphics.position.x = this.game.renderer.width / 2 + this.x;
    this.graphics.position.y = this.game.renderer.height / 2 + this.y;
  };

  private function (): void {
    if (!this.removed) {
      this.updatePosition();
      this.lastUpdate = new Date().getTime();
      this.checkCollisions();
    }
  };

  private getBoundingBox() {
    return new geometry.Rect(
      {
        x: this.game.renderer.width / 2 + this.x - this.size,
        y: this.game.renderer.height / 2 + this.y - this.size
      },
      {
        width: this.size * 2,
        height: this.size * 2
      }
    );
  };

  private checkCollisions(): boolean {
    if (this.checkWallsCollision()) {
      return true;
    }

    for (var key in this.game.players) {
      if (this.game.players.hasOwnProperty(key)) {
        if (this.checkPlayerCollision(this.game.players[key])) {
          return true;
        }
      }
    }

    return false;
  };

  private checkWallsCollision(): boolean {
    var BB = this.getBoundingBox();

    if (BB.origin.y < 0) {
      this.bounce(0, 1);
    } else if (BB.getMax().y > this.game.renderer.height) {
      this.bounce(0, -1);
    } else if (BB.origin.x < Config.LINES_DISTANCE) {
      this.game.players.b.addPoint();
      this.game.restart(true, 1);
    } else if (BB.origin.x > this.game.renderer.width - Config.LINES_DISTANCE) {
      this.game.players.a.addPoint();
      this.game.restart(true, 0);
    } else {
      return false;
    }

    return true;
  };

  private checkPlayerCollision(player): boolean {
    const BB = this.getBoundingBox();
    const targetBB = player.getBoundingBox();

    if (BB.intersectsRect(targetBB)) {

      player.emit('bounce', [ this ]);
      this.game.emit('hit', this);

      if (player.side === 'left') {
        this.bounce(1, 0);
        // Move ball away from paddle so in the incidence that the ball changes size,
        // the ball doesn't stay in contact with the paddle
        this.x += this.size;
      } else {
        this.bounce(-1, 0);
        // Move ball away from paddle so in the incidence that the ball changes size,
        // the ball doesn't stay in contact with the paddle
        this.x -= (this.size / 2 + 1);
      }

      return true;
    }

    return false;
  };

  public remove(): void {
    if (this.sprite) {
      this.graphics.removeChild(this.sprite);
    }

    this.graphics.clear();
    this.removed = true;
  };

  private bounce(multiplyX, multiplyY): void {
    this.game.emit('bounce', this, multiplyX, multiplyY);

    if (multiplyX) {
      this.velocity.x = Math.abs(this.velocity.x) * multiplyX;
    }
    if (multiplyY) {
      this.velocity.y = Math.abs(this.velocity.y) * multiplyY;
    }
  };

  private setColor(color): void {
    this.color = parseOctal(color);
    this.refresh();
  };

  private setImage(image): void {
    this.image = image;
    this.refresh();
  };

  private setSize(size): void {
    this.size = size;
    this.refresh();
  };

  private setVelocity(velocity): void {
    this.velocity = {
      x: velocity[0],
      y: velocity[1]
    };
  };

  private setSpeed(speed): void {
    this.speed = speed;

    this.velocity = {
      x: speed,
      y: speed
    };
  };

  private rebound(dir) {
    this.x = 0;
    this.velocity.x = -this.velocity.x * (dir ? 1 : -1);
  };
};
