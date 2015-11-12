import EngineAnimation from '../engine/Animation';
import {assert, cloneArray} from '../utils';
import AnimationPromise from './AnimationPromise';

let animationsPool = [];

export default class Animation extends EngineAnimation {

  onUpdate(value) {
    for (var j = 0; j < this.items.length; j++) {
      const item = this.items[j];
      if (Array.isArray(item.startValue)) {
        for (var k = 0; k < item.endValue.length; k++) {
          const endValue = item.endValue[k];
          const startValue = item.startValue[k];
          if (Array.isArray(endValue)) {
            for (var n = 0; n < endValue.length; n++) {
              item.curValue[k][n] = ((endValue[n] - startValue[n]) * value) + startValue[n];
            }
          } else {
            item.curValue[k] = ((endValue - startValue) * value) + startValue;
          }
        }
        item.object[item.property] = item.curValue;
      } else {
        //console.log('animating ' + item.property + ' = ' + ((item.endValue - item.startValue) * value) + item.startValue);
        item.object[item.property] = ((item.endValue - item.startValue) * value) + item.startValue;
      }
    }
  }

  collect(object, property, newValue, curValue) {
    const collected = this.items;
    for (let i = 0; i < collected.length; i++) {
      const item = collected[i];
      if ((item.object === object) && (item.property === property)) {
        item.curValue = Array.isArray(curValue) ? cloneArray(curValue) : curValue; // allocate array for re-use
        item.startValue = Array.isArray(curValue) ? cloneArray(curValue) : curValue;
        item.endValue = Array.isArray(curValue) ? cloneArray(newValue) : newValue;
        return;
      }
    }
    if (Array.isArray(curValue)) {
      collected.push({
        object: object,
        property: property,
        curValue: cloneArray(curValue), // allocate array for re-use
        startValue: cloneArray(curValue),
        endValue: cloneArray(newValue)
      });
    } else if (curValue !== newValue) {
      collected.push({
        object: object,
        property: property,
        startValue: curValue,
        endValue: newValue
      });
    }
    console.log('animating: ', property, curValue, ' -> ', newValue);
  }

  stop(cancelled) {
    super.stop();
    if (!cancelled) {
      for (var j = 0; j < this.items.length; j++) {
        const item = this.items[j];
        item.object[item.property] = item.endValue;
      }
    }
    this.items = undefined;
    animationsPool.push(this);
  }

  static collect(object, property, newValue, curValue) {
    if (!Animation.intercepting && Animation.interceptFn) {
      Animation.intercepting = true;
      if (Animation.interceptFn(object, property, newValue, curValue)) {
        Animation.intercepting = false;
        return true;
      }
      Animation.intercepting = false;
    }
    if (object.__animCollectors) {
      const collector = object.__animCollectors[property];
      if (collector && collector.active) {
        return collector.collect(object, property, newValue, curValue || object[property]);
      }
    }
    if (Animation.animation) {
      return Animation.animation.collect(object, property, newValue, curValue || object[property]);
    }
    return false;
  }

  static intercept(collectFn, callback) {
    assert(!Animation.interceptFn, 'Cannot intercept while another intercept is still active');
    Animation.interceptFn = callback;
    collectFn();
    Animation.interceptFn = undefined;
  }

  static start(node, curve, duration, collectFn) {

    // collect changed properties, layout changes, etc..
    assert(!Animation.animation, 'Cannot start an animation while an other is still collecting');
    const animation = animationsPool.pop() || new Animation();
    animation.items = [];
    Animation.animation = animation;
    collectFn();
    Animation.animation = undefined;

    animation.promise = new AnimationPromise((resolve) => {
      animation.start(node, curve, duration, () => {
        animation.stop();
        resolve(true);
      });
    });
    animation.promise.then((done) => {
      if (!done) animation.stop(true);
    });
    return animation;
  }
}

