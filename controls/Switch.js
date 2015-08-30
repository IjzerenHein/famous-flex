import {View, Surface} from 'Famous';
import {LayoutController} from 'FamousFlex';

export default class Switch extends View {
  constructor(options) {
    super(options);
    this._createLayout();
    this._createRenderables();
    this._setupListeners();
  }

  _createLayout() {
    this.layout = new LayoutController({
      layout: (context) => {
        const position = this.checked ? 1 : 0;
        const buttonSize = [context.size[1], context.size[1]];
        const x = position * (context.size[0] - buttonSize[0]);
        context.set('button', {
          size: buttonSize,
          translate: [x, 0, 10],
        });
        context.set('on-edge', {
          size: buttonSize,
          translate: [0, 0, 0],
        });
        context.set('on-middle', {
          size: [x, context[1]],
          translate: [buttonSize[0] / 2, 0, 5],
        });
        context.set('off-edge', {
          size: buttonSize,
          translate: [context.size[0] - buttonSize[0], 0, 0],
        });
        context.set('off-middle', {
          size: [context.size[0] - x - buttonSize[0], context[1]],
          translate: [x + (buttonSize[0] / 2), 0, 5],
        });
      },
    });
    this.add(this.layout);
  }

  _createRenderables() {
    this._renderables = {
      button: new Surface({
        classes: this.options.classes.concat(['switch', 'button']),
      }),
      'on-middle': new Surface({
        classes: this.options.classes.concat(['switch', 'on', 'middle']),
      }),
      'on-edge': new Surface({
        classes: this.options.classes.concat(['switch', 'on', 'edge']),
      }),
      'off-middle': new Surface({
        classes: this.options.classes.concat(['switch', 'off', 'middle']),
      }),
      'off-edge': new Surface({
        classes: this.options.classes.concat(['switch', 'off', 'edge']),
      }),
    };
    this.layout.setDataSource(this._renderables);
  }

  _setupListeners() {
    const onClick = () => {
      this.checked = !this.checked;
    };

    for (var key in this._renderables) {
      this._renderables[key].on('click', onClick);
    }
  }

  get checked() {
    return this.options.checked;
  }

  set checked(value) { //eslint-disable-line no-unused-vars
    if (this.options.checked !== value) {
      this.options.checked = value;
      this.layout.reflowLayout();
      this._eventOutput.emit('checkedChanged', this);
    }
  }
}

Switch.DEFAULT_OPTIONS = {
  classes: [],
  checked: false,
  size: [60, 35],
};
