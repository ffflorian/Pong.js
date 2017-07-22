import MessageScreen from './MessageScreen';

export default class PauseScreen {
  private message: string;
  private game: any;

  constructor(game) {
    this.message = 'PAUSED';
    var self = this;

    this.game.on('pause', function () {
      this.show();
    });

    this.game.on('resume', function () {
      this.hide();
    });

    this.game.on('reset', function () {
      this.hide();
    });
  }
};
