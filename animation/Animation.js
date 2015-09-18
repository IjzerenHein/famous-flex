import EngineAnimation from '../engine/Animation';
import {assert} from '../utils';
import AnimationPromise from './AnimationPromise';

let collected;
let animationsPool = [];

export default class Animation extends EngineAnimation {

  onUpdate(value) {
    for (var j = 0; j < this.items.length; j++) {
      const item = this.items[j];
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

  static collect(node, property, curValue, newValue) {
    assert(Animation.isCollecting, 'collect is only allowed during an animation-collection cycle');
    if (curValue !== newValue) {
      collected.push({node, property, curValue, newValue});
    }
  }

  static start(node, curve, duration, collectFn) {

    // collect changed properties, layout changes, etc..
    assert(!Animation.isCollecting, 'Cannot start an animation while an other is still collecting');
    Animation.isCollecting = true;
    collected = [];
    collectFn();
    Animation.isCollecting = false;

    // Re-use/create animation
    const animation = animationsPool.pop() || new Animation();
    animation.items = collected;

    const promise = new AnimationPromise((resolve) => {
      animation.start(node, curve, duration, () => {
        animation.stop();
        for (var j = 0; j < animation.items.length; j++) {
          const item = animation.items[j];
          item.node[item.property] = item.newValue;
        }
        animation.items = undefined;
        animationsPool.push(animation);
        resolve(true);
      });
    });
    promise.then((done) => {
      if (!done) {
        animation.stop();
        animation.items = undefined;
        animationsPool.push(animation);
      }
    });
    return promise;
  }
}

