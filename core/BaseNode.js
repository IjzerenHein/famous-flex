import EngineBaseNode from '../engine/BaseNode';
import EngineNodeRect from '../engine/NodeRect';
import EngineNodeRotation from '../engine/NodeRotation';
import EngineNodeScale from '../engine/NodeScale';
import EngineNodeOrigin from '../engine/NodeOrigin';
import GestureRecognizer from '../gestures/GestureRecognizer';
import Animation from '../animation/Animation';

export default class BaseNode extends EngineBaseNode {
  constructor(options) {
    super();
    this._rect = new EngineNodeRect(this);
    this.setOptions(options);
  }

  identity() {
    return BaseNode.identity;
  }

  on(event, callback) {
    this._gestureRecognizer = this._gestureRecognizer || new GestureRecognizer(this);
    return this._gestureRecognizer.on(event, callback);
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
    if (!Animation.collect(this, 'opacity', value)) {
      this.setOpacity(value);
    }
  }

  get rotation() {
    this._rotation = this._rotation || new EngineNodeRotation(this);
    return this._rotation;
  }

  set rotation(values) {
    if (this._rotation || values) {
      this._rotation = this._rotation || new EngineNodeRotation(this);
      this._rotation.set(values || EngineNodeRotation.identity);
    }
  }

  get scale() {
    this._scale = this._scale || new EngineNodeScale(this);
    return this._scale;
  }

  set scale(values) {
    if (this._scale || values) {
      this._scale = this._scale || new EngineNodeScale(this);
      this._scale.set(values || EngineNodeScale.identity);
    }
  }

  get origin() {
    this._origin = this._origin || new EngineNodeOrigin(this);
    return this._origin;
  }

  set origin(values) {
    if (this._origin || values) {
      this._origin = this._origin || new EngineNodeOrigin(this);
      this._origin.set(values || EngineNodeOrigin.identity);
    }
  }

  setOptions(options) {
    for (var i = 0; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        //if (!Object.getOwnPropertyDescriptor(this, key)) {
        //console.warn('option "' + key + '" specified, but not supported by class: ');
        //}
        this[key] = arguments[i][key];
      }
    }
  }

  animate(curve, duration, collectFn) {
    return Animation.start(this, curve, duration, collectFn).promise;
  }

  debounce(callback, frameCount) {
    frameCount = frameCount || 1;
    const update = this.registerUpdate(() => {
      frameCount--;
      if (!frameCount) {
        callback();
        this.unregisterUpdate(update);
      } else {
        update.request();
      }
    });
    update.request();
  }
}
BaseNode.identity = {opacity: 1};

