import ControlBase from './ControlBase';
import {Animation} from '../core';
import {Margins, Color} from '../utilities';

const NEUTRAL_COLOR = Color.parse('#FFFFFF');
const BORDER_COLOR = Color.parse('#E8E8E8');

export default class Switch extends ControlBase {

  /**
   * @param {Object} options Configuration options.
   * @param {Bool} [options.checked] Checked state of the switch.
   */
  constructor(options) {
    super(options);
    this._setLayout(Switch.layout.bind(this));
    this.intrinsicSize = (options && (options.intrinsicSize !== undefined)) ? options.intrinsicSize : [60, 35];
    this.animationDuration = (options && options.animationDuration) ? options.animationDuration : 300;
    this.animationCurve = (options && options.animationDuration) ? options.animationDuration : 'inOutQuad';
    this.padding = 1;
    this.color = '#3d59fd';
    this._checked = false;
    this._checkedRatio = 0;
    this._handle = this._createDOMNode(['classes']);
    this._handle.addClass('handle');
    this._background = this._createDOMNode(['classes']);
    this._background.addClass('background');
    if (options) {
      if (options.checked) this.checked = options.checked;
    }
    this.addClass('switch');
    this.animated = (options && (options.animated !== undefined)) ? options.animated : true;
    this._handle.on('tap', () => this.checked = !this.checked);
    this._background.on('tap', () => this.checked = !this.checked);
    this._updateColor();
  }

  /**
   * @private
   */
  static layout(left, top, width, height) {
    let zIndex = 0;
    this._background.setRect(left, top, width, height);
    zIndex += 2;
    left += Margins.getLeft(this.padding, width);
    top += Margins.getTop(this.padding, height);
    width = Margins.getWidth(this.padding, width);
    height = Margins.getHeight(this.padding, height);
    const handleWidth = Math.min(width, height);
    const handleLeft = left + ((width - handleWidth) * this._checkedRatio);
    this._handle.setRect(handleLeft, top, handleWidth, height);
    this._handle.zIndex = zIndex;
  }

  _updateColor() {
    this._background.backgroundColor = this._checked ? this._color : NEUTRAL_COLOR;
    this._background.borderColor = this._checked ? this._color : BORDER_COLOR;
  }

  get checked() {
    return this._checked;
  }

  set checked(checked) {
    if (this._checked !== checked) {
      this._checked = checked;
      if (this.animated) {
        this._animate(() => {
          this.checkedRatio = this._checked ? 1 : 0;
          this._updateColor();
        });
      } else {
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
    if (this._background) {
      this._updateColor();
    }
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
