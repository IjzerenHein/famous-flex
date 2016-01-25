import Transitionable from 'famous/transitions/Transitionable';

// A famo.us component
export default class Animation {
  constructor() {
    this._transitionable = new Transitionable(1);
  }

  start(node, curve, duration, callback) {
    this._node = node;
    this._update = node.registerUpdate(() => {
      const value = this._transitionable.get();
      if (this._transitionable.isActive()) {
        this.onUpdate(value);
        this._update.request();
      }
    });
    this._update.request();
    this._transitionable.reset(0);
    this._transitionable.set(1, {curve: curve, duration: duration}, callback);
  }

  stop() {
    this._transitionable.halt();
    this._node.unregisterUpdate(this._update);
  }
}
