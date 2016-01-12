import Control from './Control';
import DOMNode from '../core/DOMNode';
import {Animation, Particle} from '../animation';
import Theme from '../theme';
import Color from '../core/Color';

const defaults = {
  classes: ['progressbar'],
  progress: 0.5
};

export default class ProgressBar extends Control {

  /**
   * @param {Object} options Configuration options.
   * @param {Number} [options.progress] Progress state (0..1).
   */
  constructor(options) {
    super();
    this._particle = new Particle(this);
    this._particle.onChange = () => this.requestLayout();
    this._inside = this.addChild(new DOMNode({classes: ['inside']}));
    this._background = this.addChild(new DOMNode({classes: ['background']}));
    this._color = new Color(this);
    this._color.on('changed', () => this.requestLayout());
    this._backgroundColor = new Color(this);
    this._backgroundColor.on('changed', () => this.requestLayout());
    this.setOptions(defaults, Theme.defaults.progressBar, options);
  }

  get animation() {
    return this._particle.options;
  }

  set animation(options) {
    this._particle.options = options;
  }

  set progress(value) {
    if (this._particle.endValue !== value) {
      if (this._particle.options.enabled) {
        this._particle.endValue = value;
      } else {
        if (!Animation.collect(this, 'progress', value)) {
          this._particle.endValue = value;
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
        this._inner.style.borderRadius = value;
        this._background.style.borderRadius = value;
      }
    }
  }
}
