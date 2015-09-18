import ControlBase from './ControlBase';
import {Animation, Particle, DOMNode} from '../core';

const defaults = {
  progress: 0.5,
  intrinsicSize: ['90%', 80],
  animated: true,
  padding: 1,
  borderRadius: 'auto'
};

export default class ProgressBar extends ControlBase {

  /**
   * @param {Object} options Configuration options.
   * @param {Number} [options.progress] Progress state (0..1).
   */
  constructor(options) {
    super();
    options = options || {};
    this._particle = new Particle(options.particle || defaults.particle, this);
    this._particle.onChange = () => this.requestLayout();
    this._inside = this.addChild(new DOMNode({classes: ['progressbar', 'inside']}));
    this._background = this.addChild(new DOMNode({classes: ['progressbar', 'background']}));
    this.setOptions(options, defaults);
  }

  static layout(rect) {
    this._background.rect = rect;
    rect.inFront();
    if (this._borderRadius === 'auto') this._background.borderRadius = Math.min(rect.width, rect.height) / 2;
    if (this._borderRadius === 'auto') this._inside.borderRadius = Math.min(rect.width, rect.height) / 2;
    rect.subtract(this._padding);
    rect.width = rect.width * Math.min(Math.max(this._particle.value.x, 0), 1);
    this._inside.rect = rect;
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

  get borderRadius() {
    return this._borderRadius;
  }

  set borderRadius(value) {
    if (this._borderRadius !== value) {
      this._borderRadius = value;
      if (value !== 'auto') {
        this._inner.borderRadius = value;
        this._background.borderRadius = value;
      }
    }
  }
}
ProgressBar.defaults = defaults;
ProgressBar.defaults.layout = ProgressBar.layout;
