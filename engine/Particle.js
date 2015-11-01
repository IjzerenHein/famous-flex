import {PhysicsEngine, Spring, Drag} from 'famous/physics';
import FamousParticle from 'famous/physics/bodies/Particle';
import {Vec3} from 'famous/math';
import Animation from './Animation';
import ParticleOptions from '../animation/ParticleOptions';

const defaults = {
  particle: {
    mass: 1
  },
  spring: {
    period: 1,
    dampingRatio: 0.8,
    length: 50
  },
  drag: {
    max: Infinity,
    strength: 2,
    type: Drag.LINEAR
  }
};

export default class Particle {
  constructor(node, options) {
    this._node = node;
    this._options = new ParticleOptions(this);
    options = options || {};
    this._pe = new PhysicsEngine();
    this._particle = new FamousParticle(defaults.particle);
    this._pe.addBody(this._particle);
    this._spring = new Spring(null, [this._particle], defaults.spring);
    this._drag = new Drag([this._particle], defaults.drag);
    this._pe.addForce(this._drag);
    this._value = this._particle.getPosition();
    this._velocity = this._particle.getVelocity();
    this._endVec = new Vec3();
    this._spring.anchor = this._endVec;
    if (options.value !== undefined) this.value = options.value;
    if (options.endValue !== undefined) this.endValue = options.endValue;
  }

  requestUpdate() {
    this._update = this._update || this._node.registerUpdate((time) => this.onUpdate(time));
    this._update.request();
  }

  onUpdate(time) {
    if (!this._isActive) {
      this._pe.time = time;
      this._isActive = this._options.enabled;
    }
    if (this._isActive) {
      this._pe.update(time);
      if ((!this._springActive || (Math.abs(this._value.x - this._endVec.x) < this._options.settleValue)) &&
          (Math.abs(this._velocity.x) < this._options.settleVelocity)) {
        //console.log('sleeping');
        this._isActive = false;
      }
      if (this._isActive) this.requestUpdate();
    }
    this.onChange();
  }

  onChange() {
    // override to implement
  }

  get options() {
    return this._options;
  }

  set options(options) {
    this._options.setOptions(options);
  }

  get endValue() {
    return this._endVec.x;
  }

  set endValue(value) {
    if (this._endVec.x !== value) {
      this._endVec.x = value;
      if (this._options.enabled) {
        if ((value === undefined) && this._springActive) {
          this._springActive = false;
          this._pe.removeForce(this._spring);
        } else if ((value !== undefined) && !this._springActive) {
          this._springActive = true;
          this._pe.addForce(this._spring);
        }
        this.requestUpdate();
      } else if (value !== undefined) {
        this._value.x = value;
      }
    }
  }

  get value() {
    return this._value.x;
  }

  set value(value) {
    if (this._value.x !== value) {
      this._value.x = value;
      if (this._options.enabled) {
        this.requestUpdate();
      }
    }
  }

  get velocity() {
    return this._velocity.x;
  }

  set velocity(value) {
    if (this._velocity.x !== value) {
      this._particle.setVelocity(value, 0, 0);
      if (this._options.enabled) {
        this.requestUpdate();
      }
    }
  }
}
