export default class AnimationOptions {
  constructor() {
    this._curve = 'easeIn';
    this._duration = 400;
  }

  setOptions(options) {
    for (let key in options) {
      this[key] = options[key];
    }
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(enabled) {
    this._enabled = enabled;
  }

  get duration() {
    return this._duration;
  }

  set duration(duration) {
    this._duration = duration;
  }

  get curve() {
    return this._curve;
  }

  set curve(curve) {
    this._curve = curve;
  }
}
