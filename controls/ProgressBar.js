import ControlBase from './ControlBase';
import DOMNode from '../core/DOMNode';
import {Animation, Particle} from '../animation';
import Theme from '../theme';
import Color from '../core/Color';

const defaults = {
  classes: ['progressbar'],
  progress: 0.5
};

export default class ProgressBar extends ControlBase {

  /**
   * @param {Object} options Configuration options.
   * @param {Number} [options.progress] Progress state (0..1).
   */
  constructor(options) {
    super();
    options = options || {};
    this._particle = new Particle(this, options.particle || Theme.defaults.progressBar.particle || defaults.particle);
    this._particle.onChange = () => this.requestLayout();
    this._inside = this.addChild(new DOMNode({classes: ['inside']}));
    this._background = this.addChild(new DOMNode({classes: ['background']}));
    this._color = new Color(this);
    this._color.on('changed', () => this.requestLayout());
    this._backgroundColor = new Color(this);
    this._backgroundColor.on('changed', () => this.requestLayout());
    this.setOptions(defaults, Theme.defaults.progressBar, options);
  }

  get animated() {
    return this._particle.animated;
  }

  set animated(value) {
    this._particle.animated = value;
  }

  get progress() {
    return this._particle.endValue.x;
  }

  set progress(value) {
    if (this._particle.endValue.x !== value) {
      if (this.animated) {
        this._particle.endValue.x = value;
      } else {
        if (Animation.isCollecting) {
          Animation.collect(this, 'progress', this._particle.endValue.x, value);
        } else {
          this._particle.endValue.x = value;
        }
      }
    }
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color.set(color);
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(color) {
    this._backgroundColor.set(color);
  }

  get borderRadius() {
    return this._borderRadius;
  }

  set borderRadius(value) {
    if (this._borderRadius !== value) {
      this._borderRadius = value;
      if (value !== 'auto') {
        this._inner.styles.borderRadius = value;
        this._background.styles.borderRadius = value;
      }
    }
  }
}
