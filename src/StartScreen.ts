import * as keycode from 'keycode';
import MessageScreen from './MessageScreen';

export default class StartScreen extends MessageScreen {
  private message: string;
  private game: any;

  constructor(game) {
    super(game);

    this.message = 'PRESS ENTER';

    this.game.on('start', function () {
      this.hide();
    });

    this.game.on('reset', function () {
      this.show();
    });

    document.addEventListener('keydown', (e) => {
      const key = keycode(e.keyCode);

      if (key === 'enter' && !this.game.loop.playing) {
        this.game.start();
      }
    });
  }
};
