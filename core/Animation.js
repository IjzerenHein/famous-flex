// jscs:disable requireSpaceAfterKeywords
import {assert} from '../utilities';
import Transitionable from 'famous/transitions/Transitionable';

let collected;
let transitionablesPool = [];
let runningAnimations = [];
let famousEngine;
let requestingUpdate;

/**
 * A promise extended with a cancel method which resolves
 * the promise and thus cancels the animation.
 */
class AnimationPromise {
  constructor(fn) {
    this._promise = new Promise((resolve) => {
      this._resolve = resolve;
      fn(resolve);
    });
  }
  then() {
    return this._promise.then.apply(this._promise, arguments);
  }
  catch() {
    return this._promise.catch.apply(this._promise, arguments);
  }
  cancel() {
    if (!this._isDone) {
      this._isDone = true;
      this._resolve(false);
    }
  }
  done() {
    this._isDone = true;
    this._resolve(true);
  }
  get isActive() {
    return !this._isDone;
  }
}

export default class Animation {

  static init(engine) {
    famousEngine = engine;
  }

  static requestUpdate(comp) {
    // TODO HANDLE COMP
    if (!requestingUpdate) {
      famousEngine.requestUpdate(Animation);
      requestingUpdate = true;
    }
  }

  static onUpdate() {
    for (var i = 0; i < runningAnimations.length; i++) {
      const animation = runningAnimations[i];
      const value = animation.transitionable.get();
      for (var j = 0; j < animation.items.length; j++) {
        const item = animation.items[j];
        if (Array.isArray(item.newValue)) {
          const propValue = [];
          for (var k = 0; k < item.newValue.length; k++) {
            const newValue = item.newValue[k];
            const curValue = item.curValue[k];
            if (Array.isArray(newValue)) {
              const subPropValue = [];
              for (var n = 0; n < newValue.length; n++) {
                subPropValue.push(((newValue[n] - curValue[n]) * value) + curValue[n]);
              }
              propValue.push(subPropValue);
            } else {
              propValue.push(((newValue - curValue) * value) + curValue);
            }
          }
          item.node[item.property] = propValue;
        } else {
          item.node[item.property] = ((item.newValue - item.curValue) * value) + item.curValue;
        }
      }
    }
    if (runningAnimations.length) {
      famousEngine.requestUpdateOnNextTick(Animation);
    } else {
      requestingUpdate = false;
    }
  }

  static collect(node, property, curValue, newValue) {
    if (curValue !== newValue) {
      collected.push({node, property, curValue, newValue});
    }
  }

  static start(curve, duration, collectFn) {
    assert(!Animation.isCollecting, 'Cannot start an animation while an other is still collecting');
    Animation.isCollecting = true;
    collected = [];
    let animation = {
      transitionable: transitionablesPool.pop() || new Transitionable(1),
      items: collected
    };
    collectFn();
    collected = undefined;
    Animation.isCollecting = false;
    runningAnimations.push(animation);
    Animation.requestUpdate();
    const promise = new AnimationPromise((resolve) => {
      animation.transitionable.from(0).to(1, curve, duration, () => {
        transitionablesPool.push(animation.transitionable);
        runningAnimations.splice(runningAnimations.indexOf(animation), 1);
        for (var j = 0; j < animation.items.length; j++) {
          const item = animation.items[j];
          item.node[item.property] = item.newValue;
        }
        resolve(true);
      });
    });
    promise.then((done) => {
      if (!done) {
        animation.transitionable.halt();
        transitionablesPool.push(animation.transitionable);
        runningAnimations.splice(runningAnimations.indexOf(animation), 1);
      }
    });
    return promise;
  }
}

//FamousEngine.requestUpdate(Animation);*/
