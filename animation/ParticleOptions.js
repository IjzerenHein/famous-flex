export default class ParticleOptions {
  constructor(node) {
    this._node = node;
    this._enabled = true;
    this._settleValue = 1e-3;
    this._settleVelocity = 1e-5;
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
    if (this._enabled !== enabled) {
      this._enabled = enabled;
      this._node.onOptionChange('enabled', enabled);
    }
  }

  get settleValue() {
    return this._settleValue;
  }

  set settleValue(value) {
    if (this._settleValue !== value) {
      this._settleValue = value;
      this._node.onOptionChange('enabled', enabled);
    }
  }

  get settleVelocity() {
    return this._settleVelocity;
  }

  set settleVelocity(value) {
    if (this._settleVelocity !== value) {
      this._settleVelocity = value;
      this._node.onOptionChange('enabled', enabled);
    }
  }
}
