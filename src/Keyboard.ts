import * as keycode from 'keycode';

const normaliseControls = (controls): Object => {
  const out = {};
  let val;

  for (var key in controls) {
    val = controls[key];

    if (typeof val === 'object') {
      out[key] = val;
    } else {
      out[key] = [ val ];
    }
  }

  return out;
}

export default class Keyboard {
  private pressed: Object;
  private controls: Object;

  constructor (controls) {
    this.pressed = {};
    this.controls = {};
    this.addControls(controls);

    document.addEventListener('keydown', (e) => {
      this.setKeyState(keycode(e.keyCode), true);
    }, false);

    document.addEventListener('keyup', (e) => {
      this.setKeyState(keycode(e.keyCode), false);
    }, false);
  }

  private addControls(controls): void {
    let hasControl;
    let key;

    controls = normaliseControls(controls);

    for (key in controls) {
      if (this.controls.hasOwnProperty(key) && this.controls[key]) {
        this.controls[key] = this.controls[key].concat(controls[key]);
      } else {
        this.controls[key] = controls[key];
      }
    }

    for (key in this.controls) {
      hasControl = this.pressed.hasOwnProperty(key);
      if (this.controls.hasOwnProperty(key) && !hasControl) {
        this.pressed[key] = false;
      }
    }
  };

  private setKeyState(keyName, state) {
    let found;

    for (let key in this.controls) {
      if (this.controls.hasOwnProperty(key) && this.controls[key]) {
        found = false;

        for (let i = 0; i < this.controls[key].length; i += 1) {
          if (this.controls[key][i] === keyName) {
            found = true;
          }
        }

        if (found) {
          this.pressed[key] = state;
        }
      }
    }
  };
};
