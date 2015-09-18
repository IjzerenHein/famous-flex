import EngineBaseNode from '../engine/BaseNode';
import EngineNodeRect from '../engine/NodeRect';
import Animation from '../animation/Animation';

export default class BaseNode extends EngineBaseNode {
  constructor(options) {
    super();
    this._rect = new EngineNodeRect(this);
    this.setOptions(options);
  }

  get rect() {
    return this._rect;
  }

  set rect(rect) {
    this._rect.set(rect);
  }

  get opacity() {
    return this.getOpacity();
  }

  set opacity(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'opacity', this.getOpacity(), value);
    } else {
      this.setOpacity(value);
    }
  }

  setOptions(options, defaults) {
    if (defaults) {
      for (var key in defaults) {
        this[key] = defaults[key];
      }
    }
    if (options) {
      for (var key in options) {
        //if (!Object.getOwnPropertyDescriptor(this, key)) {
        //console.warn('option "' + key + '" specified, but not supported by class: ');
        //}
        this[key] = options[key];
      }
    }
  }

  animate(curve, duration, collectFn) {
    return Animation.start(this, curve, duration, collectFn);
  }
}
