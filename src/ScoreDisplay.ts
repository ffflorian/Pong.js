import pixi from 'pixi.js';
import config from './config';
import extend from 'deep-extend';
import Player from './Player';

export default class ScoreDisplay {
  private text: any;
  private player: Player;

  constructor(player) {
    this.player = player;
    this.render();
    this.player.on('point', function () {
      this.update();
    });

    this.player.game.on('setTextStyle', function (color) {
      this.setTextStyle(color);
    });
  }

  private setTextStyle(style): void {
    style = extend(config.TEXT_STYLE, style);
    this.text.style = style;
  };

  private render(): void {
    this.text = new pixi.Text(this.player.score + '', config.TEXT_STYLE);

    if (this.player.side === 'left') {
      this.text.anchor.x = 1;
    } else {
      this.text.anchor.x = 0;
    }

    this.text.position.y = config.SCORES_MARGIN.y;
    this.player.game.stage.addChild(this.text);
  };

  private updatePosition(): void {
    var renderer = this.player.game.renderer;

    if (this.player.side === 'left') {
      this.text.position.x = renderer.width / 2 - config.SCORES_MARGIN.x;
    } else {
      this.text.position.x = renderer.width / 2 + config.SCORES_MARGIN.x;
    }
  };

  public update(): void {
    this.text = this.player.score + '';
  };

  private resize(): void {
    this.updatePosition();
  };
};
