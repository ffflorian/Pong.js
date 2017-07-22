import pixi from 'pixi.js';
import config from './config';
import { parseOctal } from './utils';

export default class Arena {
  game: any;
  linesColor: string|number;
  lines: Array<any>;

  constructor(game) {
    this.game = game;
    this.linesColor = config.LINES_COLOR;

    this.drawLines();

    this.game.on('resize', () => this.resize());
    this.game.on('setLinesColor', color => this.setLinesColor(color));
  }

  private setLinesColor(color): void {
    this.linesColor = parseOctal(color);
    this.updateLines();
  };

  private get LinePositions(): Array<number> {
    return [
      config.LINES_DISTANCE,
      this.game.renderer.width / 2,
      this.game.renderer.width - config.LINES_DISTANCE
    ];
  };

  private drawLines(): void {
    const positions = this.LinePositions;

    this.lines = [];

    for (var i = 0; i < positions.length; i += 1) {
      this.lines[i] = new pixi.Graphics();
      this.game.stage.addChild(this.lines[i]);
    }
  };

  private updateLines(): void {
    const positions = this.LinePositions;

    for (var i = 0; i < positions.length; i += 1) {
      this.lines[i].clear();
      this.lines[i].beginFill(this.linesColor, 1);
      this.lines[i].drawRect(0, 0, 1, this.game.renderer.height);
      this.lines[i].endFill();
      this.lines[i].position.x = positions[i];
    }
  };

  private resize(): void {
    this.updateLines();
  };
};
