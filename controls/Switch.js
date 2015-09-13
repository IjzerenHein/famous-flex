import ControlBase from './ControlBase';
import {Animation} from '../core';
import {Color} from '../utilities';

const defaults = {
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
    this._handle = this._createDOMNode(['switch', 'handle']);
    this._background = this._createDOMNode(['switch', 'background']);
    this._handle.on('tap', () => this.checked = !this.checked);
    this._background.on('tap', () => this.checked = !this.checked);
    this._setProperties(options, defaults);
    this._updateColor();
  }

  static layout(spec) {
    this._background.setSpec(spec, true);
    this._applyPadding(spec);
    const handleWidth = Math.min(spec.width, spec.height);
    spec.x += ((spec.width - handleWidth) * this._checkedRatio);
    spec.width = handleWidth;
    this._handle.setSpec(spec);
  }

  _updateColor() {
    if (this._background) {
      this._background.backgroundColor = this.checked ? this.color : this.backgroundColor;
      this._background.borderColor = this.checked ? this.color : this.borderColor;
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
        this.reflowLayout();
      }
    }
  }
}
Switch.defaults = defaults;
Switch.defaults.layout = Switch.layout;
