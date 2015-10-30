import {PhysicsEngine, Spring, Drag} from 'famous/physics';
import FamousParticle from 'famous/physics/bodies/Particle';
import Vec from './Vec';
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
    this._curVec = new Vec(this._particle.getPosition());
    this._curVec.onSet = () => this._onSet();
    this._velVec = new Vec(this._particle.getVelocity());
    this._velVec.onSet = () => this._onSet(false);
    this._endVec = new Vec();
    this._endVec.onSet = () => this._onSet(true);
    this._spring.anchor = this._endVec._vec3;
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
      if ((!this._springActive ||
          ((Math.abs(this._curVec.x - this._endVec.x) < this._options.settleValue) &&
           (Math.abs(this._curVec.y - this._endVec.y) < this._options.settleValue))) &&
          (Math.abs(this._velVec.x) < this._options.settleVelocity) &&
          (Math.abs(this._velVec.y) < this._options.settleVelocity)) {
        console.log('sleeping');
        this._isActive = false;
      }
      if (this._isActive) this.requestUpdate();
    }
    this.onChange();
  }

  onChange() {
    // override to implement
  }

  _onSet(endState) {
    if (this._options.enabled) {
      if (endState) {
        if ((this._endVec.x === undefined) || (this._endVec.y === undefined)) {
          if (this._springActive) {
            this._springActive = false;
            this._pe.removeForce(this._spring);
          }
        } else if (!this._springActive) {
          this._springActive = true;
          this._pe.addForce(this._spring);
        }
      } else if (endState === false) {
        this._particle.setVelocity(this._velVec.x, this._velVec.y, this._velVec.z);
      }
      this.requestUpdate();
    } else if (endState) {
      this._curVec.set(this._endVec);
    }
  }

  get options() {
    return this._options;
  }

  set options(options) {
    this._options.setOptions(options);
  }

  get endValue() {
    return this._endVec;
  }

  set endValue(value) {
    this._endVec.set(value);
  }

  get value() {
    return this._curVec;
  }

  set value(value) {
    this._curVec.set(value);
  }

  get velocity() {
    return this._velVec;
  }

  set velocity(value) {
    this._velVec.set(value);
  }
}
