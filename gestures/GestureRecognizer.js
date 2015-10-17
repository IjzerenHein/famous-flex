import EngineGestureRecognizer from '../engine/GestureRecognizer';
import TapGesture from './TapGesture';
import DoubleTapGesture from './DoubleTapGesture';
import PanGesture from './PanGesture';
import PointerGesture from './PointerGesture';

const gestures = {
  pointer: PointerGesture,
  tap: TapGesture,
  doubletap: DoubleTapGesture,
  click: TapGesture,
  pan: PanGesture,
  drag: PanGesture
};

export default class GestureRecognizer extends EngineGestureRecognizer{
  constructor(node) {
    super(node);
    this._gestures = {};
  }

  on(type, callback) {
    let gesture = this._gestures[type];
    if (!gesture) {
      if (!gestures[type]) return;
      gesture = new gestures[type](type);
      this._gestures[type] = gesture;
    }
    return gesture.addCallback(callback);
  }

  onReceive(type, event) {
    for (var key in this._gestures) {
      this._gestures[key].onReceive(type, event);
    }
  }
}
