import Config from './config';
import extend from 'deep-extend';
import pixi from 'pixi.js';

export default class MessageScreen {
  private message: string;
  private game: any;
  private visible: boolean;
  private startMsg: any;

  constructor(game) {
    this.message = this.message || '';
    this.game = game;
    this.drawMessage();

    this.game.on('setTextStyle', function (color) {
      this.setTextStyle(color);
    });

    this.game.on('resize', function () {
      this.resize();
    });
  }

  private drawMessage(): void {
    this.startMsg = new pixi.Text(this.message, Config.TEXT_STYLE);

    this.hide();
    this.game.stage.addChild(this.startMsg);
  };

  public setMessage(message): void {
    this.startMsg.text = message;
  };

  public setTextStyle(style): void {
    style = extend(Config.TEXT_STYLE, style);
    this.startMsg.style = style;
  };

  private resize(): void {
    this.startMsg.position = {
      x: this.game.renderer.width / 2,
      y: this.game.renderer.height / 2
    };
    this.startMsg.anchor = { x: 0.5, y: 0.5 };
  };

  public hide(): void {
    this.visible = false;
    this.startMsg.visible = false;
    this.game.refresh();
  };

  public show(): void {
    this.visible = true;
    this.startMsg.visible = true;
    this.game.refresh();
  };
};
