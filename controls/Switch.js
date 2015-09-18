import ControlBase from './ControlBase';
import DOMNode from '../core/DOMNode';
import Animation from '../animation/Animation';
import Color from '../core/Color';

const defaults = {
  classes: ['switch'],
  checked: false,
  intrinsicSize: [60, 35],
  animated: true,
  animationDuration: 300,
  animationCurve: 'inOutQuad',
  padding: 1,
  color: '#3d59fd',
  backgroundColor: '#FFFFFF',
  borderColor: '#E8E8E8'
};

export default class Switch extends ControlBase {

  /**
   * @param {Object} options Configuration options.
   * @param {Bool} [options.checked] Checked state of the switch.
   */
  constructor(options) {
    super();
    this._handle = this.addChild(new DOMNode({classes: ['handle']}));
    this._background = this.addChild(new DOMNode({classes: ['background']}));
    this._handle.on('tap', () => this.checked = !this.checked);
    this._background.on('tap', () => this.checked = !this.checked);
    this.setOptions(options, defaults);
    this._updateColor();
  }

  static layout(rect, size) {
    this._background.rect = rect;
    rect.subtract(this._padding).inFront();
    const handleWidth = Math.min(rect.width, rect.height);
    rect.x += ((rect.width - handleWidth) * this._checkedRatio);
    rect.width = handleWidth;
    this._handle.rect = rect;
  }

  _updateColor() {
    if (this._background) {
      this._background.styles.backgroundColor = this.checked ? this.color : this.backgroundColor;
      this._background.styles.borderColor = this.checked ? this.color : this.borderColor;
    }
  }

  get checked() {
    return this._checked;
  }

  set checked(checked) {
    if (this._checked !== checked) {
      if (this.animated && (this._checked !== undefined)) {
        this._checked = checked;
        this._animate(() => {
          this.checkedRatio = checked ? 1 : 0;
          this._updateColor();
        });
      } else {
        this._checked = checked;
        this.checkedRatio = this._checked ? 1 : 0;
        this._updateColor();
      }
    }
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color = Color.parse(color);
    this._updateColor();
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(color) {
    this._backgroundColor = Color.parse(color);
    this._updateColor();
  }

  get checkedRatio() {
    return this._checkedRatio;
  }

  set checkedRatio(perc) {
    if (this._checkedRatio !== perc) {
      if (Animation.isCollecting) {
        Animation.collect(this, 'checkedRatio', this._checkedRatio, perc);
      } else {
        this._checkedRatio = perc;
        this.requestLayout();
      }
    }
  }
}
Switch.defaults = defaults;
Switch.defaults.layout = Switch.layout;
