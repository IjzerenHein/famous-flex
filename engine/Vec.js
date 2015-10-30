import {Vec3} from 'famous/math';

export default class Vec {
  constructor(x, y, z) {
    this._vec3 = (x instanceof Vec3) ? x : new Vec3(x, y, z);
  }

  onSet() {
    // override to implement
  }

  set(value) {
    let changed;
    if ((value.x !== undefined) && (this._vec3.x !== value.x)) {
      changed = true;
      this._vec3.x = x;
    }
    if ((value.y !== undefined) && (this._vec3.y !== value.y)) {
      changed = true;
      this._vec3.y = value.y;
    }
    if ((value.z !== undefined) && (this._vec3.z !== value.z)) {
      changed = true;
      this._vec3.z = value.z;
    }
    if (changed) this.onSet();
  }

  get x() {
    return this._vec3.x;
  }

  set x(value) {
    if (this._vec3.x !== value) {
      this._vec3.x = value;
      this.onSet();
    }
  }

  get y() {
    return this._vec3.y;
  }

  set y(value) {
    if (this._vec3.y !== value) {
      this._vec3.y = value;
      this.onSet();
    }
  }

  get z() {
    return this._vec3.z;
  }

  set z(value) {
    if (this._vec3.z !== value) {
      this._vec3.z = value;
      this.onSet();
    }
  }
}
